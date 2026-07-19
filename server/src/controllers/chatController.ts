import { Request, Response } from 'express';
import { WorkflowEngine, WorkflowDef } from '../engine/WorkflowEngine';
import databaseService from '../services/databaseService';

const prisma = databaseService.getPrisma();

/**
 * Send a chat message to trigger workflow execution
 */
export async function sendChatMessage(req: Request, res: Response) {
  try {
    const workflowId = req.params.workflowId as string;
    const { message, userId, userName } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    // Find the workflow
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found',
      });
    }

    // Find the chat trigger node in the workflow
    const nodes = workflow.nodes as any[];
    
    console.log('🔍 Searching for chatTrigger in workflow:', workflowId);
    console.log('📊 Total nodes:', nodes.length);
    
    const chatTriggerNode = nodes.find((node: any) => {
      // React Flow nodes have type='custom' with actual type in data.type
      const nodeType = node.data?.type || node.type;
      const platform = node.data?.config?.platform || node.config?.platform;
      
      console.log(`Checking node ${node.id}: type=${nodeType}, platform=${platform}`);
      return nodeType === 'chatTrigger' && platform === 'textual';
    });

    if (!chatTriggerNode) {
      console.log('❌ No textual chat trigger found');
      return res.status(400).json({
        success: false,
        error: 'No textual chat trigger found in this workflow. Please ensure you have a Chat Trigger node with platform set to "Textual (Test Chat)" and save the workflow.',
      });
    }
    
    console.log('✅ Found chat trigger node:', chatTriggerNode.id);

    // Prepare chat message data for the trigger
    const chatData = {
      userId: userId || 'user-' + Date.now(),
      userName: userName || 'Test User',
      username: userName || 'testuser',
      chatId: 'textual-chat',
      chatName: 'Textual Chat',
      chatType: 'textual',
      text: message,
      content: message,
      message: message,
      timestamp: new Date().toISOString(),
      platform: 'textual',
    };

    // Prepare workflow definition for execution
    const workflowDef: WorkflowDef = {
      id: workflow.id,
      name: workflow.name,
      nodes: workflow.nodes as any[],
      edges: workflow.edges as any[],
    };

    // Execute the workflow with the chat message data
    const result = await WorkflowEngine.executeWorkflow(workflowDef, chatData);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.errors.length > 0 ? result.errors[0].error : 'Workflow execution failed',
      });
    }

    // Extract response from the workflow execution results
    // Look for the last node's output or a specific response field
    let responseMessage = 'Workflow executed successfully';
    
    // Get the last node's result (usually the output node)
    const resultsArray = Array.from(result.results.values());
    if (resultsArray.length > 0) {
      const lastResult = resultsArray[resultsArray.length - 1];
      
      if (lastResult.data) {
        // Try to find a text response in the output
        if (lastResult.data.response) {
          responseMessage = lastResult.data.response;
        } else if (lastResult.data.text) {
          responseMessage = lastResult.data.text;
        } else if (lastResult.data.message) {
          responseMessage = lastResult.data.message;
        } else if (typeof lastResult.data === 'string') {
          responseMessage = lastResult.data;
        } else if (lastResult.data.output) {
          responseMessage = lastResult.data.output;
        } else {
          // If no specific field, stringify the entire data
          responseMessage = JSON.stringify(lastResult.data, null, 2);
        }
      }
    }

    return res.json({
      success: true,
      data: {
        response: responseMessage,
        executionTime: result.executionTime,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Chat message error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat message',
    });
  }
}
