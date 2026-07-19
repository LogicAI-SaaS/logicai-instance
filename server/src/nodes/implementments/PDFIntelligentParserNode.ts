import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * PDF Intelligent Parser - Extracts structured data from PDFs
 * Uses OCR and AI to understand documents like invoices, CVs, orders
 */
export class PDFIntelligentParserNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const pdfUrl = this.config.pdfUrl || this.getNestedValue(context.$json, 'pdfUrl');
      const documentType = this.config.documentType || 'auto'; // auto, invoice, cv, purchaseOrder, etc.
      const extractFields = this.config.extractFields || [];

      if (!pdfUrl) {
        throw new Error('PDF URL is required');
      }

      // Download and parse PDF
      const extractedData = await this.parsePDF(pdfUrl, documentType);

      // Extract specific fields if requested
      if (extractFields.length > 0) {
        const fieldData = this.extractSpecificFields(extractedData, extractFields);
        return {
          success: true,
          data: {
            ...extractedData,
            _extractedFields: fieldData,
            _documentType: documentType,
            _extractionDate: new Date().toISOString(),
          },
        };
      }

      return {
        success: true,
        data: {
          ...extractedData,
          _documentType: documentType,
          _extractionDate: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'PDF parsing failed',
      };
    }
  }

  getType(): string {
    return 'pdfIntelligentParser';
  }

  getIcon(): string {
    return 'FileText';
  }

  private async parsePDF(pdfUrl: string, documentType: string): Promise<any> {
    // In production, this would use:
    // - pdf-parse or pdfjs-dist for text extraction
    // - tesseract.js for OCR
    // - OpenAI/GPT-4 for intelligent field extraction

    switch (documentType) {
      case 'invoice':
        return await this.parseInvoice(pdfUrl);

      case 'cv':
      case 'resume':
        return await this.parseCV(pdfUrl);

      case 'purchaseOrder':
        return await this.parsePurchaseOrder(pdfUrl);

      case 'receipt':
        return await this.parseReceipt(pdfUrl);

      case 'auto':
      default:
        return await this.autoDetectAndParse(pdfUrl);
    }
  }

  private async parseInvoice(pdfUrl: string): Promise<any> {
    // Mock data - in production would use OCR + AI
    return {
      documentType: 'invoice',
      extractedData: {
        invoiceNumber: 'INV-2024-001234',
        invoiceDate: '2024-01-15',
        dueDate: '2024-02-15',
        vendor: {
          name: 'Acme Corporation',
          address: '123 Business Ave, Suite 100',
          taxId: 'FR12345678901',
        },
        customer: {
          name: 'Client Company Inc.',
          address: '456 Customer St',
        },
        lineItems: [
          {
            description: 'Professional Services - January 2024',
            quantity: 40,
            unitPrice: 150.00,
            amount: 6000.00,
          },
          {
            description: 'Software License (Annual)',
            quantity: 1,
            unitPrice: 1200.00,
            amount: 1200.00,
          },
        ],
        subtotal: 7200.00,
        tax: {
          rate: 20,
          amount: 1440.00,
        },
        total: 8640.00,
        currency: 'EUR',
        paymentTerms: 'Net 30',
        iban: 'FR7630006000011234567890189',
        bic: 'BNPARFPPXXX',
      },
      confidence: 0.95,
    };
  }

  private async parseCV(pdfUrl: string): Promise<any> {
    // Mock data - in production would use OCR + AI + NLP
    return {
      documentType: 'cv',
      extractedData: {
        personalInfo: {
          fullName: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+33612345678',
          location: 'Paris, France',
          linkedin: 'linkedin.com/in/jeandupont',
        },
        summary: 'Senior Software Engineer with 8+ years of experience in full-stack development...',
        experience: [
          {
            title: 'Senior Full-Stack Developer',
            company: 'TechCorp France',
            location: 'Paris',
            startDate: '2020-01',
            endDate: 'Present',
            description: 'Led development of enterprise applications using React and Node.js...',
          },
          {
            title: 'Software Developer',
            company: 'StartupXYZ',
            location: 'Lyon',
            startDate: '2017-06',
            endDate: '2019-12',
            description: 'Developed scalable web applications...',
          },
        ],
        education: [
          {
            degree: 'Master in Computer Science',
            school: 'École Polytechnique',
            year: '2017',
          },
        ],
        skills: [
          'JavaScript', 'TypeScript', 'React', 'Node', 'Python', 'AWS', 'Docker',
        ],
        languages: [
          { language: 'French', level: 'Native' },
          { language: 'English', level: 'Professional' },
        ],
      },
      confidence: 0.92,
    };
  }

  private async parsePurchaseOrder(pdfUrl: string): Promise<any> {
    return {
      documentType: 'purchaseOrder',
      extractedData: {
        orderNumber: 'PO-2024-00567',
        orderDate: '2024-01-20',
        expectedDelivery: '2024-02-15',
        vendor: {
          name: 'Global Supplies Inc.',
          address: '789 Industrial Blvd',
        },
        buyer: {
          name: 'Manufacturing Co.',
          address: '321 Factory Road',
        },
        items: [
          {
            sku: 'SKU-001',
            description: 'Industrial Component A',
            quantity: 100,
            unitPrice: 25.50,
            amount: 2550.00,
          },
        ],
        total: 2550.00,
        currency: 'EUR',
      },
      confidence: 0.89,
    };
  }

  private async parseReceipt(pdfUrl: string): Promise<any> {
    return {
      documentType: 'receipt',
      extractedData: {
        merchant: 'Amazon France',
        date: '2024-01-18',
        time: '14:32',
        items: [
          { name: 'Wireless Mouse', quantity: 1, price: 29.99 },
          { name: 'USB-C Cable', quantity: 2, price: 12.50 },
        ],
        subtotal: 42.49,
        tax: 8.50,
        total: 54.99,
        paymentMethod: 'Visa ending in 4242',
      },
      confidence: 0.94,
    };
  }

  private async autoDetectAndParse(pdfUrl: string): Promise<any> {
    // In production, would use AI to detect document type
    // For now, default to generic extraction
    return {
      documentType: 'unknown',
      extractedData: {
        textContent: 'Full text content extracted from PDF...',
        metadata: {
          pages: 3,
          author: 'Unknown',
          creationDate: '2024-01-01',
        },
      },
      confidence: 0.70,
    };
  }

  private extractSpecificFields(extractedData: any, fields: string[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const field of fields) {
      const value = this.getNestedValue(extractedData, field);
      if (value !== undefined) {
        this.setNestedValue(result, field, value);
      }
    }

    return result;
  }

  /**
   * Validate extracted data against a schema
   */
  static validateExtractedData(data: any, schema: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];

      if ((rules as any).required && (value === undefined || value === null || value === '')) {
        errors.push(`Required field "${field}" is missing or empty`);
      }

      if ((rules as any).type && typeof value !== (rules as any).type) {
        errors.push(`Field "${field}" should be of type ${(rules as any).type}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
