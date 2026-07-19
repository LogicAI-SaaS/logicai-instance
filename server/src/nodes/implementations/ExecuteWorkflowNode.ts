import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { WorkflowEngine, WorkflowDef } from '../../engine/WorkflowEngine';
import { PrismaClient } from '@prisma/client';

/**
 * Execute Workflow Node - Call another workflow as a sub-workflow
 * n8n-compatible: Execute workflow from workflow
 *
 * Configuration:
 * - workflowId: ID of the workflow to execute
 * - data: Data to pass to the sub-workflow (optional, defaults to current $json)
 * - waitForResult: Wait for execution to complete (default: true)
 * - timeout: Maximum execution time in ms (default: 300000 = 5 min)
 */
export class ExecuteWorkflowNode extends BaseNode {
  private prisma: PrismaClient;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.prisma = new PrismaClient();
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Validate configuration
      const workflowId = this.config.workflowId;
      if (!workflowId) {
        throw new Error('Target workflow ID is required. Please provide workflowId in config.');
      }

      // Get input data
      const inputData = this.config.data !== undefined ? this.config.data : context.$json;

      // Fetch workflow from database
      const workflow = await this.fetchWorkflow(workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      // Parse workflow definition
      const workflowDef: WorkflowDef = JSON.parse(workflow.workflowJson);

      // Execute the sub-workflow
      const waitForResult = this.config.waitForResult !== false;
      const timeout = this.config.timeout || 300000; // 5 minutes default

      let executionResult;
      if (waitForResult) {
        executionResult = await this.executeSubWorkflowSync(workflowDef, inputData, timeout);
      } else {
        // Execute asynchronously (fire and forget)
        this.executeSubWorkflowAsync(workflowDef, inputData);
        executionResult = {
          success: true,
          async: true,
          message: 'Sub-workflow started asynchronously',
        };
      }

      return {
        success: true,
        data: {
          ...context.$json,
          _subWorkflow: {
            workflowId,
            workflowName: workflow.name,
            executionId: executionResult.executionId,
            result: executionResult.data,
            success: executionResult.success,
            executionTime: executionResult.executionTime,
            async: !waitForResult,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Fetch workflow from database
   */
  private async fetchWorkflow(workflowId: string): Promise<any> {
    try {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      return workflow;
    } catch (error) {
      throw new Error(`Failed to fetch workflow: ${error.message}`);
    }
  }

  /**
   * Execute sub-workflow synchronously
   */
  private async executeSubWorkflowSync(
    workflowDef: WorkflowDef,
    inputData: any,
    timeout: number
  ): Promise<any> {
    const engine = new WorkflowEngine(workflowDef, inputData);
    const executionId = this.generateExecutionId();

    try {
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sub-workflow execution timeout')), timeout);
      });

      // Execute workflow with timeout
      const result = await Promise.race([
        engine.execute(),
        timeoutPromise,
      ]) as any;

      // Store execution record
      await this.storeExecutionRecord(executionId, workflowDef.id, result);

      return {
        executionId,
        data: this.extractFinalResult(result),
        success: result.success,
        executionTime: result.executionTime,
        errors: result.errors,
      };
    } catch (error: any) {
      throw new Error(`Sub-workflow execution failed: ${error.message}`);
    }
  }

  /**
   * Execute sub-workflow asynchronously
   */
  private async executeSubWorkflowAsync(
    workflowDef: WorkflowDef,
    inputData: any
  ): Promise<void> {
    const executionId = this.generateExecutionId();

    // Execute in background
    setImmediate(async () => {
      try {
        const engine = new WorkflowEngine(workflowDef, inputData);
        const result = await engine.execute();
        await this.storeExecutionRecord(executionId, workflowDef.id, result);
      } catch (error) {
        console.error(`Async sub-workflow ${executionId} failed:`, error);
      }
    });
  }

  /**
   * Extract final result from workflow execution
   */
  private extractFinalResult(result: any): any {
    if (!result.results || result.results.size === 0) {
      return null;
    }

    // Get the last executed node's result
    const keys = Array.from(result.results.keys());
    const lastKey = keys[keys.length - 1];
    return result.results.get(lastKey)?.data;
  }

  /**
   * Generate unique execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store execution record in database
   */
  private async storeExecutionRecord(
    executionId: string,
    workflowId: string,
    result: any
  ): Promise<void> {
    try {
      // Store execution record (optional - can be disabled)
      await this.prisma.nodeExecution.create({
        data: {
          nodeId: executionId,
          workflowId,
          status: result.success ? 'success' : 'failed',
          inputData: JSON.stringify(result),
          outputData: JSON.stringify(result),
          executionTime: result.executionTime,
          startedAt: new Date(),
          completedAt: new Date(),
        },
      });
    } catch (error) {
      // Non-blocking error - log but don't fail the execution
      console.warn('Failed to store execution record:', error);
    }
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message.includes('Workflow not found')) {
      return error.message;
    }
    if (error.message.includes('Sub-workflow execution failed')) {
      return error.message;
    }
    if (error.message.includes('execution timeout')) {
      return 'Sub-workflow execution timed out. Consider increasing the timeout value.';
    }
    return `Execute workflow error: ${error.message}`;
  }

  getType(): string {
    return 'executeWorkflow';
  }

  getIcon(): string {
    return 'PlaySquare';
  }

  /**
   * Static method to execute a workflow by ID (utility function)
   */
  static async executeWorkflowById(workflowId: string, inputData?: any): Promise<any> {
    const prisma = new PrismaClient();

    try {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        throw new Error(`Workflow not found: ${workflowId}`);
      }

      const workflowDef: WorkflowDef = JSON.parse(workflow.workflowJson);
      const engine = new WorkflowEngine(workflowDef, inputData || {});

      return await engine.execute();
    } finally {
      await prisma.$disconnect();
    }
  }
}
