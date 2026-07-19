/**
 * NodeTestHarness - Utilitaire de test générique pour nœuds
 *
 * Permet de tester n'importe quel nœud avec un contexte mock
 */

import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

export interface TestCase {
  name: string;
  description: string;
  config: Record<string, any>;
  inputContext: ExecutionContext;
  expectedOutput: any;
  shouldFail?: boolean;
  expectedError?: string;
}

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  actualOutput?: any;
  expectedOutput?: any;
}

export class NodeTestHarness {
  private results: TestResult[] = [];

  /**
   * Exécuter un test individuel
   */
  async runTest(
    node: BaseNode,
    testCase: TestCase
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const result = await node.execute(testCase.inputContext);

      // Vérifier le résultat attendu
      if (testCase.shouldFail) {
        return {
          testName: testCase.name,
          passed: false,
          duration: Date.now() - startTime,
          error: `Expected to fail but succeeded`,
        };
      }

      if (this.deepEqual(result.data, testCase.expectedOutput)) {
        return {
          testName: testCase.name,
          passed: true,
          duration: Date.now() - startTime,
        };
      } else {
        return {
          testName: testCase.name,
          passed: false,
          duration: Date.now() - startTime,
          actualOutput: result.data,
          expectedOutput: testCase.expectedOutput,
        };
      }
    } catch (error: any) {
      if (testCase.shouldFail) {
        if (testCase.expectedError && error.message.includes(testCase.expectedError)) {
          return {
            testName: testCase.name,
            passed: true,
            duration: Date.now() - startTime,
          };
        }
      }

      return {
        testName: testCase.name,
        passed: false,
        duration: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  /**
   * Exécuter une suite de tests
   */
  async runTestSuite(
    nodeClass: new (id: string, name: string, config: Record<string, any>) => BaseNode,
    testCases: TestCase[]
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const node = new nodeClass('test-id', 'test-node', testCase.config);
      const result = await this.runTest(node, testCase);
      results.push(result);
      this.results.push(result);
    }

    return results;
  }

  /**
   * Comparaison profonde d'objets
   */
  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== 'object') {
      return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  /**
   * Afficher le résumé des tests
   */
  printSummary(): void {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    const total = this.results.length;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n📊 Test Results\n');
    console.log('═'.repeat(60));
    console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log(`   • ${r.testName}`);
          if (r.error) {
            console.log(`     Error: ${r.error}`);
          }
          if (r.actualOutput !== undefined) {
            console.log(`     Expected:`, r.expectedOutput);
            console.log(`     Actual:`, r.actualOutput);
          }
        });
    }

    console.log('═'.repeat(60) + '\n');
  }

  /**
   * Exporter les résultats en JSON
   */
  exportResults(): string {
    return JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          total: this.results.length,
          passed: this.results.filter((r) => r.passed).length,
          failed: this.results.filter((r) => !r.passed).length,
          duration: this.results.reduce((sum, r) => sum + r.duration, 0),
        },
        results: this.results,
      },
      null,
      2
    );
  }
}

/**
 * Créer un contexte d'exécution mock pour les tests
 */
export function createMockContext(
  data: any = {},
  workflowId: string = 'test-workflow',
  nodeId: string = 'test-node'
): ExecutionContext {
  return {
    $json: data,
    $workflow: {
      id: workflowId,
      name: 'Test Workflow',
      active: true,
    },
    $node: {
      id: nodeId,
      name: 'Test Node',
      type: 'test',
    },
  };
}

/**
 * Helper: Créer un test case
 */
export function createTestCase(
  name: string,
  config: Record<string, any>,
  inputData: any,
  expectedOutput: any
): TestCase {
  return {
    name,
    description: name,
    config,
    inputContext: createMockContext(inputData),
    expectedOutput,
  };
}
