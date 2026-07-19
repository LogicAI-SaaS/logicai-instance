/**
 * NodeValidator - Validation de schéma pour inputs/outputs de nœuds
 *
 * Valide que les données respectent les schémas attendus
 */

import { ExecutionContext, NodeExecutionResult } from '../../types';

export interface SchemaDefinition {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  properties?: Record<string, SchemaDefinition>;
  items?: SchemaDefinition;
  required?: string[];
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  expected: string;
  actual: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
}

export class NodeValidator {
  /**
   * Valider l'input d'un nœud
   */
  static validateInput(
    context: ExecutionContext,
    schema: SchemaDefinition
  ): ValidationResult {
    return this.validate(context.$json, schema, '$json');
  }

  /**
   * Valider l'output d'un nœud
   */
  static validateOutput(
    result: NodeExecutionResult,
    schema: SchemaDefinition
  ): ValidationResult {
    if (!result.success) {
      return {
        valid: false,
        errors: [
          {
            path: 'result',
            message: 'Node execution failed',
            expected: 'success: true',
            actual: `success: false, error: ${result.error}`,
          },
        ],
        warnings: [],
      };
    }

    return this.validate(result.data, schema, 'data');
  }

  /**
   * Valider une valeur contre un schéma
   */
  private static validate(
    value: any,
    schema: SchemaDefinition,
    path: string
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Vérifier le type
    if (!this.checkType(value, schema.type)) {
      errors.push({
        path,
        message: `Type mismatch`,
        expected: schema.type,
        actual: value === null ? 'null' : typeof value,
      });
    }

    // Validation spécifique par type
    if (schema.type === 'object' && value && typeof value === 'object') {
      this.validateObject(value, schema, path, errors, warnings);
    } else if (schema.type === 'array' && Array.isArray(value)) {
      this.validateArray(value, schema, path, errors, warnings);
    } else if (schema.type === 'string' && typeof value === 'string') {
      this.validateString(value, schema, path, errors, warnings);
    } else if (schema.type === 'number' && typeof value === 'number') {
      this.validateNumber(value, schema, path, errors, warnings);
    } else if (schema.enum && !schema.enum.includes(value)) {
      errors.push({
        path,
        message: `Value not in enum`,
        expected: schema.enum.join(' | '),
        actual: String(value),
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Vérifier le type d'une valeur
   */
  private static checkType(value: any, type: SchemaDefinition['type']): boolean {
    switch (type) {
      case 'object':
        return value !== null && typeof value === 'object' && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'null':
        return value === null;
      default:
        return true;
    }
  }

  /**
   * Valider un objet
   */
  private static validateObject(
    obj: any,
    schema: SchemaDefinition,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    // Vérifier les propriétés requises
    if (schema.required) {
      for (const prop of schema.required) {
        if (!(prop in obj)) {
          errors.push({
            path: `${path}.${prop}`,
            message: 'Required property missing',
            expected: 'property',
            actual: 'undefined',
          });
        }
      }
    }

    // Valider chaque propriété
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          const result = this.validate(obj[key], propSchema, `${path}.${key}`);
          errors.push(...result.errors);
          warnings.push(...result.warnings);
        } else if (!schema.required?.includes(key)) {
          warnings.push({
            path: `${path}.${key}`,
            message: 'Optional property not provided',
          });
        }
      }
    }
  }

  /**
   * Valider un tableau
   */
  private static validateArray(
    arr: any[],
    schema: SchemaDefinition,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (schema.items) {
      arr.forEach((item, index) => {
        const result = this.validate(item, schema.items!, `${path}[${index}]`);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      });
    }
  }

  /**
   * Valider une chaîne
   */
  private static validateString(
    str: string,
    schema: SchemaDefinition,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (schema.minLength !== undefined && str.length < schema.minLength) {
      errors.push({
        path,
        message: 'String too short',
        expected: `length >= ${schema.minLength}`,
        actual: `length = ${str.length}`,
      });
    }

    if (schema.maxLength !== undefined && str.length > schema.maxLength) {
      errors.push({
        path,
        message: 'String too long',
        expected: `length <= ${schema.maxLength}`,
        actual: `length = ${str.length}`,
      });
    }

    if (schema.pattern && !schema.pattern.test(str)) {
      errors.push({
        path,
        message: 'String does not match pattern',
        expected: schema.pattern.toString(),
        actual: str,
      });
    }
  }

  /**
   * Valider un nombre
   */
  private static validateNumber(
    num: number,
    schema: SchemaDefinition,
    path: string,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    if (schema.minimum !== undefined && num < schema.minimum) {
      errors.push({
        path,
        message: 'Number too small',
        expected: `>= ${schema.minimum}`,
        actual: String(num),
      });
    }

    if (schema.maximum !== undefined && num > schema.maximum) {
      errors.push({
        path,
        message: 'Number too large',
        expected: `<= ${schema.maximum}`,
        actual: String(num),
      });
    }
  }

  /**
   * Afficher le résultat de validation
   */
  static printValidationResult(result: ValidationResult, nodeName: string): void {
    console.log(`\n🔍 Validation Results for ${nodeName}\n`);

    if (result.valid) {
      console.log('✅ Validation PASSED');
      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach((w) => {
          console.log(`   ${w.path}: ${w.message}`);
        });
      }
    } else {
      console.log('❌ Validation FAILED\n');
      console.log('Errors:');
      result.errors.forEach((e) => {
        console.log(`   ❌ ${e.path}: ${e.message}`);
        console.log(`      Expected: ${e.expected}`);
        console.log(`      Actual: ${e.actual}`);
      });
    }
    console.log('');
  }
}

/**
 * Schémas prédéfinis pour les validations courantes
 */
export const CommonSchemas = {
  // Schéma pour output HTTP
  httpResponse: {
    type: 'object' as const,
    properties: {
      status: { type: 'number' as const },
      data: { type: 'object' as const },
      headers: { type: 'object' as const },
    },
    required: ['status', 'data'],
  },

  // Schéma pour output email
  emailOutput: {
    type: 'object' as const,
    properties: {
      success: { type: 'boolean' as const },
      messageId: { type: 'string' as const },
    },
    required: ['success'],
  },

  // Schéma pour output transformation
  transformOutput: {
    type: 'object' as const,
  },

  // Schéma pour webhook input
  webhookInput: {
    type: 'object' as const,
    properties: {
      body: { type: 'object' as const },
      headers: { type: 'object' as const },
      query: { type: 'object' as const },
      method: { type: 'string' as const },
    },
  },
};
