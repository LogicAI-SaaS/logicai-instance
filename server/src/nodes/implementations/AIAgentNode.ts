import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import OpenAI from 'openai';

/**
 * AI Agent Node - Orchestrate LLM chains and agents
 * n8n-compatible: AI agent with reasoning and tools
 *
 * Configuration:
 * - agentType: 'conversational' | 'react' | 'function-calling'
 * - provider: 'openai' | 'anthropic' | 'cohere' (default: 'openai')
 * - model: Model name (e.g., 'gpt-4o', 'gpt-4o-mini', 'claude-3-opus')
 * - apiKey: API key for the provider
 * - systemPrompt: System prompt for the agent
 * - tools: Array of tool definitions for function calling
 * - maxIterations: Maximum reasoning iterations (default: 10)
 * - temperature: Temperature for generation (0-1, default: 0.7)
 * - input: User input or query
 */
export class AIAgentNode extends BaseNode {
  private openaiClient?: OpenAI;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializeClient();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const agentType = this.config.agentType || 'conversational';
    if (!['conversational', 'react', 'function-calling'].includes(agentType)) {
      throw new Error(`Invalid agentType: ${agentType}. Valid: conversational, react, function-calling`);
    }

    const provider = this.config.provider || 'openai';
    if (!['openai', 'anthropic', 'cohere'].includes(provider)) {
      throw new Error(`Invalid provider: ${provider}. Valid: openai, anthropic, cohere`);
    }

    if (this.config.temperature !== undefined) {
      const temp = parseFloat(this.config.temperature);
      if (isNaN(temp) || temp < 0 || temp > 2) {
        throw new Error(`Invalid temperature: ${this.config.temperature}. Must be between 0 and 2`);
      }
    }

    if (this.config.maxIterations !== undefined) {
      const maxIter = parseInt(this.config.maxIterations);
      if (isNaN(maxIter) || maxIter < 1 || maxIter > 100) {
        throw new Error(`Invalid maxIterations: ${this.config.maxIterations}. Must be between 1 and 100`);
      }
    }
  }

  /**
   * Initialize AI client
   */
  private initializeClient(): void {
    const provider = this.config.provider || 'openai';

    if (provider === 'openai' && this.config.apiKey) {
      this.openaiClient = new OpenAI({
        apiKey: this.config.apiKey,
      });
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const agentType = this.config.agentType || 'conversational';
      const provider = this.config.provider || 'openai';
      const tools = this.config.tools || [];
      const systemPrompt = this.config.systemPrompt || 'You are a helpful AI assistant.';
      const maxIterations = this.config.maxIterations || 10;
      const temperature = this.config.temperature ?? 0.7;
      const model = this.config.model || this.getDefaultModel(provider);
      const input = this.resolveValue(this.config.input, context) || context.$json;

      switch (agentType) {
        case 'conversational':
          return await this.conversationalAgent(systemPrompt, input, model, temperature);
        case 'react':
          return await this.reactAgent(systemPrompt, tools, input, maxIterations, model, temperature);
        case 'function-calling':
          return await this.functionCallingAgent(systemPrompt, tools, input, model, temperature);
        default:
          throw new Error(`Unknown agent type: ${agentType}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: string): string {
    const defaults: Record<string, string> = {
      openai: 'gpt-4o-mini',
      anthropic: 'claude-3-5-sonnet-20241022',
      cohere: 'command-r-plus',
    };
    return defaults[provider] || 'gpt-4o-mini';
  }

  /**
   * Conversational Agent - Simple chat interaction
   */
  private async conversationalAgent(
    systemPrompt: string,
    input: any,
    model: string,
    temperature: number
  ): Promise<NodeExecutionResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Please provide an API key.');
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Handle different input formats
    let userMessage = '';
    if (typeof input === 'string') {
      userMessage = input;
    } else if (input.message) {
      userMessage = input.message;
    } else if (input.query) {
      userMessage = input.query;
    } else if (input.prompt) {
      userMessage = input.prompt;
    } else {
      userMessage = JSON.stringify(input);
    }

    messages.push({ role: 'user', content: userMessage });

    // Handle conversation history
    if (this.config.history && Array.isArray(this.config.history)) {
      const historyMessages = this.config.history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));
      messages.splice(1, 0, ...historyMessages);
    }

    const response = await this.openaiClient.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: this.config.maxTokens || 4096,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    return {
      success: true,
      data: {
        response: assistantMessage,
        model,
        usage: response.usage,
        finishReason: response.choices[0]?.finish_reason,
        reasoning: [],
        toolCalls: [],
      },
    };
  }

  /**
   * ReAct Agent - Reasoning + Acting loop
   * Pattern: Thought → Action → Observation → Thought → ... → Final Answer
   */
  private async reactAgent(
    systemPrompt: string,
    tools: any[],
    input: any,
    maxIterations: number,
    model: string,
    temperature: number
  ): Promise<NodeExecutionResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Please provide an API key.');
    }

    const reasoning: any[] = [];
    const toolCalls: any[] = [];

    const reactPrompt = `${systemPrompt}

You are a ReAct agent. Follow this pattern:
1. Thought: Analyze the current situation
2. Action: Choose a tool to use (or "answer" to give final response)
3. Observation: Review the tool result
4. Repeat until you can answer the user's question

Available tools:
${tools.map((t: any) => `- ${t.name}: ${t.description}`).join('\n')}

Format your responses as:
Thought: [your reasoning]
Action: [tool_name or "answer"]
Action Input: [JSON input for tool or your final answer]`;

    let currentInput = typeof input === 'string' ? input : JSON.stringify(input);
    let finalAnswer = '';

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: reactPrompt },
        { role: 'user', content: currentInput },
        ...reasoning.flatMap(r => [
          { role: 'assistant', content: `Thought: ${r.thought}\nAction: ${r.action}` },
          { role: 'user', content: `Observation: ${r.observation}` },
        ] as OpenAI.Chat.ChatCompletionMessageParam[]),
      ];

      const response = await this.openaiClient.chat.completions.create({
        model,
        messages,
        temperature: temperature * 0.5, // Lower temperature for reasoning
        max_tokens: 1024,
      });

      const assistantMessage = response.choices[0]?.message?.content || '';
      reasoning.push({
        iteration: iteration + 1,
        raw: assistantMessage,
      });

      // Parse the response
      const thoughtMatch = assistantMessage.match(/Thought:\s*(.+)/i);
      const actionMatch = assistantMessage.match(/Action:\s*(.+)/i);
      // Use [\s\S]* instead of dotAll flag for better compatibility
      const inputMatch = assistantMessage.match(/Action Input:\s*([\s\S]+)/i);

      const thought = thoughtMatch?.[1]?.trim() || 'Thinking...';
      const action = actionMatch?.[1]?.trim() || 'answer';
      const actionInput = inputMatch?.[1]?.trim() || '';

      if (action.toLowerCase() === 'answer' || action.toLowerCase() === 'final') {
        finalAnswer = actionInput || assistantMessage;
        break;
      }

      // Execute the action/tool
      let observation = 'Tool not found';
      const tool = tools.find((t: any) => t.name.toLowerCase() === action.toLowerCase());

      if (tool) {
        try {
          const toolResult = await this.executeTool(tool, actionInput);
          observation = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
          toolCalls.push({
            tool: tool.name,
            input: actionInput,
            result: observation,
            iteration: iteration + 1,
          });
        } catch (error: any) {
          observation = `Error executing ${tool.name}: ${error.message}`;
        }
      }

      reasoning[reasoning.length - 1] = {
        iteration: iteration + 1,
        thought,
        action,
        observation,
      };

      currentInput = `Continue from this observation: ${observation}`;
    }

    return {
      success: true,
      data: {
        response: finalAnswer || 'Max iterations reached',
        reasoning,
        toolCalls,
        iterations: reasoning.length,
      },
    };
  }

  /**
   * Function Calling Agent - Use OpenAI's function calling API
   */
  private async functionCallingAgent(
    systemPrompt: string,
    tools: any[],
    input: any,
    model: string,
    temperature: number
  ): Promise<NodeExecutionResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Please provide an API key.');
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    let userMessage = '';
    if (typeof input === 'string') {
      userMessage = input;
    } else if (input.message) {
      userMessage = input.message;
    } else if (input.query) {
      userMessage = input.query;
    } else {
      userMessage = JSON.stringify(input);
    }

    messages.push({ role: 'user', content: userMessage });

    // Convert tools to OpenAI format
    const openaiTools: OpenAI.Chat.ChatCompletionTool[] = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters || {
          type: 'object',
          properties: {},
        },
      },
    }));

    const toolCalls: any[] = [];
    let finalResponse = '';

    // Loop to handle multiple function calls
    while (true) {
      const response = await this.openaiClient.chat.completions.create({
        model,
        messages,
        tools: openaiTools.length > 0 ? openaiTools : undefined,
        tool_choice: openaiTools.length > 0 ? 'auto' : undefined,
        temperature,
      });

      const assistantMessage = response.choices[0]?.message;

      if (!assistantMessage) {
        break;
      }

      messages.push(assistantMessage);

      // Check if the model wants to call a function
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          // Access function call data safely
          const functionCall = toolCall as any;
          const functionName = functionCall.function?.name;
          const functionArgs = functionCall.function?.arguments;

          const tool = tools.find((t: any) => t.name === functionName);

          if (tool) {
            try {
              const args = JSON.parse(functionArgs);
              const result = await this.executeTool(tool, args);
              const resultStr = typeof result === 'string' ? result : JSON.stringify(result);

              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: resultStr,
              });

              toolCalls.push({
                tool: functionName,
                parameters: args,
                result: resultStr,
              });
            } catch (error: any) {
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: error.message }),
              });
            }
          }
        }
      } else {
        // No more tool calls, we have the final response
        finalResponse = assistantMessage.content || '';
        break;
      }
    }

    return {
      success: true,
      data: {
        response: finalResponse,
        reasoning: [],
        toolCalls,
        usage: tools.length > 0 ? undefined : { mock: true },
      },
    };
  }

  /**
   * Execute a tool (mock implementation - should be overridden in production)
   */
  private async executeTool(tool: any, input: string | any): Promise<any> {
    let params: any;

    if (typeof input === 'string') {
      try {
        params = JSON.parse(input);
      } catch {
        params = { query: input };
      }
    } else {
      params = input;
    }

    // Built-in tools
    switch (tool.name.toLowerCase()) {
      case 'search':
        return await this.toolSearch(params);
      case 'calculate':
        return this.toolCalculate(params);
      case 'datetime':
        return this.toolDateTime(params);
      case 'weather':
        return await this.toolWeather(params);
      case 'code_interpreter':
        return await this.toolCodeInterpreter(params);
      default:
        // Custom tool - execute via HTTP if URL provided
        if (tool.url) {
          return await this.executeHTTPTool(tool, params);
        }
        return { error: `Tool ${tool.name} not implemented`, params };
    }
  }

  /**
   * Tool: Search
   */
  private async toolSearch(params: any): Promise<any> {
    // In production, would use real search API
    return {
      results: [
        {
          title: `Mock search result for "${params.query}"`,
          url: `https://example.com/search?q=${encodeURIComponent(params.query)}`,
          snippet: 'This is a mock search result. In production, integrate with Google Custom Search or Bing Search API.',
        },
      ],
      query: params.query,
      count: 1,
    };
  }

  /**
   * Tool: Calculate
   */
  private toolCalculate(params: any): any {
    try {
      const { expression } = params;
      // Safe calculation using Function
      const result = new Function('return ' + expression)();
      return { expression, result };
    } catch {
      return { error: 'Invalid expression', params };
    }
  }

  /**
   * Tool: DateTime
   */
  private toolDateTime(params: any): any {
    const now = new Date();
    const format = params.format || 'iso';

    let result: string;
    switch (format.toLowerCase()) {
      case 'iso':
        result = now.toISOString();
        break;
      case 'unix':
        result = Math.floor(now.getTime() / 1000).toString();
        break;
      case 'date':
        result = now.toLocaleDateString();
        break;
      case 'time':
        result = now.toLocaleTimeString();
        break;
      default:
        result = now.toString();
    }

    return { datetime: result, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  }

  /**
   * Tool: Weather
   */
  private async toolWeather(params: any): Promise<any> {
    // In production, integrate with OpenWeatherMap or similar API
    return {
      location: params.location || 'Unknown',
      condition: 'Mock data - integrate with weather API',
      temperature: '--',
      note: 'Configure OpenWeatherMap API key for real weather data',
    };
  }

  /**
   * Tool: Code Interpreter
   */
  private async toolCodeInterpreter(params: any): Promise<any> {
    // In production, would use a sandboxed code execution environment
    return {
      error: 'Code interpreter not implemented',
      note: 'Integrate with dockerized code execution or similar service',
      code: params.code,
    };
  }

  /**
   * Execute HTTP tool
   */
  private async executeHTTPTool(tool: any, params: any): Promise<any> {
    try {
      const url = this.resolveTemplate(tool.url, params);
      const method = tool.method || 'POST';
      const headers = tool.headers || {};

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: method !== 'GET' ? JSON.stringify(params) : undefined,
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return { error: error.message, params };
    }
  }

  /**
   * Resolve template variables
   */
  private resolveTemplate(template: string, data: any): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return data[key] !== undefined ? String(data[key]) : `{{${key}}}`;
    });
  }

  /**
   * Resolve value with variable substitution
   */
  private resolveValue(value: any, context: ExecutionContext): any {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      return value.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
        const sourceData = source === 'json' ? context.$json
          : source === 'workflow' ? context.$workflow
          : context.$node;
        const found = this.getNestedValue(sourceData, path);
        return found !== undefined ? String(found) : match;
      });
    }

    return value;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('API key')) {
      return 'Invalid or missing API key';
    }
    if (error.message?.includes('rate limit')) {
      return 'Rate limit exceeded. Please try again later.';
    }
    if (error.message?.includes('insufficient_quota')) {
      return 'Insufficient API quota. Please check your billing.';
    }
    if (error.code === 'ENOTFOUND') {
      return 'Network error: Unable to reach AI API';
    }
    return `AI Agent error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'aiAgent';
  }

  getIcon(): string {
    return 'Robot';
  }

  /**
   * Get available models for a provider
   */
  static getAvailableModels(provider: string): string[] {
    const models: Record<string, string[]> = {
      openai: [
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
      ],
      anthropic: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229',
      ],
      cohere: [
        'command-r-plus',
        'command-r',
        'command',
      ],
    };

    return models[provider] || [];
  }
}
