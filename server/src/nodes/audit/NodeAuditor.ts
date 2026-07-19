/**
 * NodeAuditor - Analyseur automatique de nœuds pour LogicAI-N8N
 *
 * Scan tous les nœuds existants et identifie:
 * - Mock/stub implementations
 * - API integrations manquantes
 * - Error handling incomplet
 * - Tests manquants
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface NodeAuditStatus {
  nodeId: string;
  fileName: string;
  hasRealImplementation: boolean;
  hasErrorHandling: boolean;
  hasTests: boolean;
  apiIntegrationStatus: 'none' | 'partial' | 'complete';
  dependenciesInstalled: boolean;
  qualityScore: number; // 0-100
  priority: 'critical' | 'high' | 'medium' | 'low';
  issues: string[];
  suggestions: string[];
}

export class NodeAuditor {
  private nodesPath: string;
  private auditResults: Map<string, NodeAuditStatus> = new Map();

  constructor(nodesPath: string = './src/nodes/implementations') {
    this.nodesPath = nodesPath;
  }

  /**
   * Scanner tous les fichiers de nœuds et générer l'audit
   */
  async auditAllNodes(): Promise<NodeAuditStatus[]> {
    const files = await this.getNodeFiles();
    const results: NodeAuditStatus[] = [];

    for (const file of files) {
      const audit = await this.auditNodeFile(file);
      results.push(audit);
      this.auditResults.set(audit.nodeId, audit);
    }

    return results;
  }

  /**
   * Auditor un fichier de nœud individuel
   */
  async auditNodeFile(filePath: string): Promise<NodeAuditStatus> {
    const fullPath = path.join(this.nodesPath, filePath);
    const content = await fs.readFile(fullPath, 'utf-8');
    const fileName = path.basename(filePath, '.ts');

    // Extraire les classes de nœuds du fichier
    const nodeClasses = this.extractNodeClasses(content);

    if (nodeClasses.length === 0) {
      return this.createEmptyAudit(fileName, filePath);
    }

    // Pour l'instant, on audit la première classe trouvée
    const nodeName = nodeClasses[0];

    return {
      nodeId: nodeName,
      fileName,
      hasRealImplementation: this.checkRealImplementation(content),
      hasErrorHandling: this.checkErrorHandling(content),
      hasTests: await this.checkForTests(fileName),
      apiIntegrationStatus: this.checkAPIIntegration(content),
      dependenciesInstalled: await this.checkDependencies(content),
      qualityScore: this.calculateQualityScore(content),
      priority: this.determinePriority(content, fileName),
      issues: this.identifyIssues(content),
      suggestions: this.generateSuggestions(content),
    };
  }

  /**
   * Extraire tous les noms de classes de nœuds
   */
  private extractNodeClasses(content: string): string[] {
    const classRegex = /export\s+class\s+(\w+Node)\s+extends\s+BaseNode/g;
    const matches = [];
    let match;

    while ((match = classRegex.exec(content)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  /**
   * Vérifier si le nœud a une vraie implémentation (pas mock/stub)
   */
  private checkRealImplementation(content: string): boolean {
    // Signes de mock/stub
    const mockPatterns = [
      /mock\s*:/i,
      /stub\s*:/i,
      /TODO.*implement/i,
      /FIXME/i,
      /return.*mock\s/i,
      /placeholder/i,
      /\/\*\s*MOCK/i,
    ];

    for (const pattern of mockPatterns) {
      if (pattern.test(content)) {
        return false;
      }
    }

    // Vérifier s'il y a une vraie logique
    const hasRealLogic =
      /await\s+\w+\.\w+\(/.test(content) || // Appels async
      /axios\.(get|post|put|delete|patch)/i.test(content) || // Appels HTTP
      /new\s+\w+\(/.test(content); // Instantiation de clients

    return hasRealLogic;
  }

  /**
   * Vérifier la présence d'error handling
   */
  private checkErrorHandling(content: string): boolean {
    const errorHandlingPatterns = [
      /try\s*{[\s\S]*?}\s*catch/,
      /catch\s*\(\s*\w+:\s*\w+\)/,
      /throw\s+new\s+Error/,
      /\.then\(.*\)\.catch/,
    ];

    return errorHandlingPatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Vérifier si des tests existent pour ce nœud
   */
  private async checkForTests(nodeName: string): Promise<boolean> {
    const testPaths = [
      `./server/src/nodes/__tests__/${nodeName}.test.ts`,
      `./server/src/nodes/__tests__/${nodeName}.spec.ts`,
      `./server/src/nodes/implementations/__tests__/${nodeName}.test.ts`,
    ];

    for (const testPath of testPaths) {
      try {
        await fs.access(testPath);
        return true;
      } catch {
        // Continue
      }
    }

    return false;
  }

  /**
   * Vérifier le statut d'intégration API
   */
  private checkAPIIntegration(content: string): 'none' | 'partial' | 'complete' {
    // Signes d'intégration API
    const hasAPICall = /axios|fetch|request|@slack\/web-api|openai|mongodb/i.test(content);
    const hasClientInit = /new\s+\w+\(\s*\{[^}]*apiKey|token|credentials/i.test(content);
    const hasAPIKeyConfig = /config\.(apiKey|token|secret|credentials)/i.test(content);

    if (hasAPICall && hasClientInit && hasAPIKeyConfig) {
      return 'complete';
    } else if (hasAPICall || hasClientInit) {
      return 'partial';
    } else {
      return 'none';
    }
  }

  /**
   * Vérifier si les dépendances sont installées
   */
  private async checkDependencies(content: string): Promise<boolean> {
    // Extraire les imports externes
    const importRegex = /import\s+.*?\s+from\s+['"](?!\.|\@\/)([^'"]+)['"]/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // Vérifier si les packages sont dans package.json
    try {
      const packageJson = JSON.parse(
        await fs.readFile('./server/package.json', 'utf-8')
      );

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      return imports.every((imp) => allDeps[imp]);
    } catch {
      return false;
    }
  }

  /**
   * Calculer un score de qualité (0-100)
   */
  private calculateQualityScore(content: string): number {
    let score = 0;

    // Implémentation réelle (+40)
    if (this.checkRealImplementation(content)) score += 40;

    // Error handling (+20)
    if (this.checkErrorHandling(content)) score += 20;

    // Documentation (+15)
    if (/[\/\*]{3}[\s\S]*?\*\/|\/\/\s*@param/.test(content)) score += 15;

    // Type safety (+15)
    if (/: Promise<\w+>/.test(content) && /: \w+\s*=/g.test(content)) score += 15;

    // Validation des inputs (+10)
    if (/validate|check|verify.*input/i.test(content)) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Déterminer la priorité du nœud
   */
  private determinePriority(content: string, fileName: string): 'critical' | 'high' | 'medium' | 'low' {
    // Critique si c'est un mock fréquemment utilisé
    if (/OpenAI|Slack|Gmail|HTTP|Webhook|MongoDB/i.test(fileName)) {
      return 'critical';
    }

    // High si c'est un mock
    if (!this.checkRealImplementation(content)) {
      return 'high';
    }

    // Medium si partial API
    if (this.checkAPIIntegration(content) === 'partial') {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Identifier les problèmes dans le code
   */
  private identifyIssues(content: string): string[] {
    const issues: string[] = [];

    // Mock/stub
    if (/mock|stub|placeholder|TODO/i.test(content)) {
      issues.push('Contains mock/stub implementation');
    }

    // Pas d'error handling
    if (!this.checkErrorHandling(content)) {
      issues.push('Missing error handling');
    }

    // Credentials hardcoded
    if (/apiKey\s*[:=]\s*['"][\w-]+['"]|token\s*[:=]\s*['"][\w-]+['"]/.test(content)) {
      issues.push('Possible hardcoded credentials');
    }

    // Pas de validation
    if (!/validate|check.*input|verify/i.test(content)) {
      issues.push('Missing input validation');
    }

    // console.log au lieu de logger
    if (/console\.log/.test(content)) {
      issues.push('Using console.log instead of proper logger');
    }

    return issues;
  }

  /**
   * Générer des suggestions d'amélioration
   */
  private generateSuggestions(content: string): string[] {
    const suggestions: string[] = [];

    if (!this.checkRealImplementation(content)) {
      suggestions.push('Implement real API integration');
    }

    if (!this.checkErrorHandling(content)) {
      suggestions.push('Add try-catch blocks for error handling');
    }

    if (!/validate|check.*input/i.test(content)) {
      suggestions.push('Add input validation');
    }

    if (!/joi|yup|zod/.test(content)) {
      suggestions.push('Consider using a validation library (joi/yup/zod)');
    }

    if (!/logger|winston|pino/i.test(content)) {
      suggestions.push('Use proper logging instead of console.log');
    }

    return suggestions;
  }

  /**
   * Obtenir tous les fichiers de nœuds
   */
  private async getNodeFiles(): Promise<string[]> {
    const files = await fs.readdir(this.nodesPath);
    return files.filter((file) => file.endsWith('.ts'));
  }

  /**
   * Créer un audit vide pour un fichier sans nœuds
   */
  private createEmptyAudit(nodeName: string, fileName: string): NodeAuditStatus {
    return {
      nodeId: nodeName,
      fileName,
      hasRealImplementation: false,
      hasErrorHandling: false,
      hasTests: false,
      apiIntegrationStatus: 'none',
      dependenciesInstalled: false,
      qualityScore: 0,
      priority: 'low',
      issues: ['No node class found'],
      suggestions: ['Implement a node extending BaseNode'],
    };
  }

  /**
   * Générer le rapport JSON
   */
  async generateReport(): Promise<string> {
    const results = await this.auditAllNodes();

    const report = {
      timestamp: new Date().toISOString(),
      totalNodes: results.length,
      summary: {
        mockImplementations: results.filter((r) => !r.hasRealImplementation).length,
        withErrorHandling: results.filter((r) => r.hasErrorHandling).length,
        withTests: results.filter((r) => r.hasTests).length,
        averageQualityScore:
          results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length,
        byPriority: {
          critical: results.filter((r) => r.priority === 'critical').length,
          high: results.filter((r) => r.priority === 'high').length,
          medium: results.filter((r) => r.priority === 'medium').length,
          low: results.filter((r) => r.priority === 'low').length,
        },
      },
      nodes: results,
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Sauvegarder le rapport dans un fichier
   */
  async saveReport(outputPath: string = './src/nodes/audit/auditResults.json') {
    const report = await this.generateReport();
    await fs.writeFile(outputPath, report, 'utf-8');
    console.log(`✅ Audit report saved to ${outputPath}`);
  }

  /**
   * Afficher un résumé console
   */
  async printSummary() {
    const results = await this.auditAllNodes();

    console.log('\n📊 LogicAI-N8N Node Audit Summary\n');
    console.log('═'.repeat(60));
    console.log(`Total Nodes: ${results.length}`);
    console.log(`\n⚠️  Mock/Stub Implementations: ${results.filter((r) => !r.hasRealImplementation).length}`);
    console.log(`✅  With Error Handling: ${results.filter((r) => r.hasErrorHandling).length}`);
    console.log(`🧪 With Tests: ${results.filter((r) => r.hasTests).length}`);
    console.log(
      `📈 Average Quality Score: ${Math.round(
        results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length
      )}/100`
    );

    console.log('\n🎯 By Priority:');
    console.log(`   🔴 Critical: ${results.filter((r) => r.priority === 'critical').length}`);
    console.log(`   🟠 High: ${results.filter((r) => r.priority === 'high').length}`);
    console.log(`   🟡 Medium: ${results.filter((r) => r.priority === 'medium').length}`);
    console.log(`   🟢 Low: ${results.filter((r) => r.priority === 'low').length}`);

    console.log('\n⚠️  Critical Nodes (Need Immediate Attention):');
    const critical = results.filter((r) => r.priority === 'critical' || !r.hasRealImplementation);
    critical.forEach((node) => {
      console.log(`   • ${node.fileName} - ${node.issues.join(', ')}`);
    });

    console.log('\n' + '═'.repeat(60) + '\n');
  }
}

// CLI: permet de lancer l'audit directement
if (require.main === module) {
  const auditor = new NodeAuditor();
  auditor
    .printSummary()
    .then(() => auditor.saveReport())
    .then(() => {
      console.log('✅ Audit complete!');
    })
    .catch((error) => {
      console.error('❌ Audit failed:', error);
      process.exit(1);
    });
}
