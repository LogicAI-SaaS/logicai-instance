/**
 * Variable Parser - Parses and validates {{ $json.* }} expressions
 */

export interface VariableMatch {
  fullMatch: string;
  source: 'json' | 'workflow' | 'node';
  path: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract all variable expressions from a template string
 * @param template - The template string to parse
 * @returns Array of variable matches
 */
export function extractVariables(template: string): VariableMatch[] {
  const regex = /\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g;
  const matches: VariableMatch[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    matches.push({
      fullMatch: match[0],
      source: match[1] as 'json' | 'workflow' | 'node',
      path: match[2],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return matches;
}

/**
 * Check if a string contains variable expressions
 * @param template - The template string to check
 * @returns True if the string contains variables
 */
export function hasVariables(template: string): boolean {
  return /\{\{\s*\$(json|workflow|node)\./.test(template);
}

/**
 * Get a nested value from an object using a dot-notation path
 * @param obj - The source object
 * @param path - Dot-notation path (e.g., 'user.profile.name')
 * @returns The value at the path, or undefined if not found
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Replace variable expressions in a template with actual values
 * @param template - The template string
 * @param context - The context object containing $json, $workflow, $node
 * @returns The resolved string
 */
export function replaceVariables(
  template: string,
  context: {
    $json: any;
    $workflow: { id: string; name: string };
    $node: { id: string; name: string; type: string };
  }
): string {
  return template.replace(
    /\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g,
    (match, source, path) => {
      const value = getNestedValue(context[`$${source}` as keyof typeof context], path);
      return value !== undefined ? String(value) : match;
    }
  );
}

/**
 * Validate a variable expression syntax
 * @param expression - The expression to validate
 * @returns True if the expression is valid
 */
export function validateVariableExpression(expression: string): boolean {
  const regex = /^\{\{\s*\$(json|workflow|node)\.[\w.]+\s*\}\}$/;
  return regex.test(expression);
}

/**
 * Suggest variables based on context
 * @param context - The current context
 * @returns Array of suggested variable expressions
 */
export function suggestVariables(context: {
  $json: any;
  $workflow: { id: string; name: string };
  $node: { id: string; name: string; type: string };
}): string[] {
  const suggestions: string[] = [];

  // Workflow suggestions
  suggestions.push('{{ $workflow.id }}', '{{ $workflow.name }}');

  // Node suggestions
  suggestions.push(
    '{{ $node.id }}',
    '{{ $node.name }}',
    '{{ $node.type }}'
  );

  // JSON suggestions (explore object structure)
  if (context.$json && typeof context.$json === 'object') {
    const exploreObject = (obj: any, prefix = '$json'): void => {
      for (const [key, value] of Object.entries(obj)) {
        const path = `${prefix}.${key}`;
        suggestions.push(`{{ ${path} }}`);

        if (value && typeof value === 'object' && !Array.isArray(value)) {
          exploreObject(value, path);
        }
      }
    };

    exploreObject(context.$json);
  }

  return suggestions;
}

/**
 * Format a value for display in the UI
 * @param value - The value to format
 * @returns Formatted string representation
 */
export function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}
