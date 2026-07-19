import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Form Trigger Node - Trigger workflow from a built-in form
 * n8n-compatible: Start workflow with user-submitted form data
 */
export class FormTriggerNode extends BaseNode {
  private static forms = new Map<string, {
    fields: Array<{
      name: string;
      label: string;
      type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio';
      required: boolean;
      options?: string[];
      defaultValue?: any;
    }>;
    responses: any[];
    createdAt: Date;
  }>();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const fields = this.config.fields || [];
      const formTitle = this.config.formTitle || 'Form';
      const formDescription = this.config.formDescription || '';
      const submitButtonText = this.config.submitButtonText || 'Submit';
      const responseMessage = this.config.responseMessage || 'Thank you for your submission!';

      // Store form definition
      FormTriggerNode.forms.set(this.id, {
        fields,
        responses: [],
        createdAt: new Date(),
      });

      const formUrl = this.generateFormUrl(this.id);

      return {
        success: true,
        data: {
          ...context.$json,
          _form: {
            formId: this.id,
            title: formTitle,
            description: formDescription,
            fields,
            submitButtonText,
            responseMessage,
            formUrl,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Form trigger failed',
      };
    }
  }

  getType(): string {
    return 'formTrigger';
  }

  getIcon(): string {
    return 'FileInput';
  }

  private generateFormUrl(formId: string): string {
    const baseUrl = this.config.baseUrl || 'http://localhost:5173';
    return `${baseUrl}/form/${formId}`;
  }

  /**
   * Submit form data
   */
  static submitForm(formId: string, data: Record<string, any>): any {
    const form = FormTriggerNode.forms.get(formId);

    if (!form) {
      throw new Error('Form not found');
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !data[field.name]) {
        throw new Error(`Field "${field.label}" is required`);
      }
    }

    // Store response
    const response = {
      id: crypto.randomUUID(),
      formId,
      data,
      submittedAt: new Date().toISOString(),
    };

    form.responses.push(response);

    return response;
  }

  /**
   * Get form definition
   */
  static getForm(formId: string): any {
    const form = FormTriggerNode.forms.get(formId);

    if (!form) {
      return null;
    }

    return {
      formId,
      fields: form.fields,
      responseCount: form.responses.length,
      createdAt: form.createdAt,
    };
  }

  /**
   * Get form responses
   */
  static getFormResponses(formId: string): any[] {
    const form = FormTriggerNode.forms.get(formId);

    if (!form) {
      return [];
    }

    return form.responses;
  }

  /**
   * Get all forms
   */
  static getAllForms(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [formId, form] of FormTriggerNode.forms.entries()) {
      result[formId] = {
        formId,
        fields: form.fields,
        responseCount: form.responses.length,
        createdAt: form.createdAt,
      };
    }

    return result;
  }
}
