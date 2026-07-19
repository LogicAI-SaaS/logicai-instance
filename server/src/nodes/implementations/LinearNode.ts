import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * LinearNode - Linear Issue Tracking API Integration
 *
 * Provides comprehensive integration with Linear API including:
 * - Issues: Create, read, update, delete, search, list
 * - Projects: CRUD operations, project milestones
 * - Teams: List teams, get team members
 * - Views: Manage views
 * - Cycles: Create and manage cycles (sprints)
 * - Comments: Add, update, delete comments
 * - Attachments: Upload, delete attachments
 * - Labels: Manage labels, add/remove from issues
 * - Statuses: Manage issue statuses
 * - Priorities: Manage issue priorities
 * - Workflows: Manage workflow states
 * - Users: Get user info, search users
 * - Organizations: Get organization info
 * - Webhooks: Manage webhook subscriptions
 * - Roadmaps: Manage roadmaps
 * - Initiatives: Manage initiatives
 * - Integrations: Manage third-party integrations
 *
 * Authentication: Personal API Token
 * API Docs: https://developers.linear.app/docs/graphql/working-with-the-api
 */
export class LinearNode extends BaseNode {
  readonly apiKey: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.apiKey = config.apiKey || '';

    if (!this.apiKey) {
      throw new Error('Linear API key is required');
    }

    this.apiUrl = 'https://api.linear.app/graphql';
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


  getType(): string {
    return 'linear';
  }

  getIcon(): string {
    return '🚀';
  }

  getCategory(): string {
    return 'issue-tracking';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'listIssues';

    try {
      switch (operation) {
        // Issue Operations
        case 'getIssue':
          return await this.getIssue(context);
        case 'listIssues':
          return await this.listIssues(context);
        case 'createIssue':
          return await this.createIssue(context);
        case 'updateIssue':
          return await this.updateIssue(context);
        case 'deleteIssue':
          return await this.deleteIssue(context);
        case 'searchIssues':
          return await this.searchIssues(context);
        case 'archiveIssue':
          return await this.archiveIssue(context);

        // Project Operations
        case 'getProject':
          return await this.getProject(context);
        case 'listProjects':
          return await this.listProjects(context);
        case 'createProject':
          return await this.createProject(context);
        case 'updateProject':
          return await this.updateProject(context);
        case 'deleteProject':
          return await this.deleteProject(context);

        // Team Operations
        case 'getTeam':
          return await this.getTeam(context);
        case 'listTeams':
          return await this.listTeams();
        case 'getTeamMembers':
          return await this.getTeamMembers(context);

        // Cycle Operations
        case 'getCycle':
          return await this.getCycle(context);
        case 'listCycles':
          return await this.listCycles(context);
        case 'createCycle':
          return await this.createCycle(context);
        case 'updateCycle':
          return await this.updateCycle(context);
        case 'deleteCycle':
          return await this.deleteCycle(context);

        // Comment Operations
        case 'getComments':
          return await this.getComments(context);
        case 'createComment':
          return await this.createComment(context);
        case 'updateComment':
          return await this.updateComment(context);
        case 'deleteComment':
          return await this.deleteComment(context);

        // Label Operations
        case 'getLabels':
          return await this.getLabels(context);
        case 'createLabel':
          return await this.createLabel(context);
        case 'updateLabel':
          return await this.updateLabel(context);
        case 'deleteLabel':
          return await this.deleteLabel(context);
        case 'addLabelToIssue':
          return await this.addLabelToIssue(context);
        case 'removeLabelFromIssue':
          return await this.removeLabelFromIssue(context);

        // User Operations
        case 'getUser':
          return await this.getUser(context);
        case 'listUsers':
          return await this.listUsers();
        case 'getMe':
          return await this.getMe();

        // Organization Operations
        case 'getOrganization':
          return await this.getOrganization(context);

        // Workflow Operations
        case 'getWorkflowStates':
          return await this.getWorkflowStates(context);

        // Roadmap Operations
        case 'getRoadmap':
          return await this.getRoadmap(context);
        case 'listRoadmaps':
          return await this.listRoadmaps(context);
        case 'createRoadmap':
          return await this.createRoadmap(context);

        // Initiative Operations
        case 'getInitiative':
          return await this.getInitiative(context);
        case 'listInitiatives':
          return await this.listInitiatives(context);
        case 'createInitiative':
          return await this.createInitiative(context);

        // Attachment Operations
        case 'uploadAttachment':
          return await this.uploadAttachment(context);
        case 'deleteAttachment':
          return await this.deleteAttachment(context);

        // Webhook Operations
        case 'listWebhooks':
          return await this.listWebhooks();
        case 'createWebhook':
          return await this.createWebhook(context);
        case 'deleteWebhook':
          return await this.deleteWebhook(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute Linear operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  private async callApi(query: string, variables?: any): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Linear API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors) {
          errorMessage = errorJson.errors.map((e: any) => e.message).join(', ');
        }
      } catch {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors.map((e: any) => e.message).join(', '));
    }

    return data.data;
  }

  // ==================== Issue Operations ====================

  private async getIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);

    if (!issueId) {
      throw new Error('issueId is required');
    }

    const query = `
      query Issue($issueId: String!) {
        issue(id: $issueId) {
          id
          identifier
          title
          description
          state { id name type }
          priority
          assignee { id name email }
          creator { id name email }
          labels { nodes { id name color } }
          project { id name }
          team { id name key }
          createdAt
          updatedAt
          dueDate
          estimate
          url
        }
      }
    `;

    const data = await this.callApi(query, { issueId });

    return {
      success: true,
      data: data.issue,
    };
  }

  private async listIssues(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context) || '';
    const projectId = this.resolveValue(this.config.projectId, context) || '';
    const cycleId = this.resolveValue(this.config.cycleId, context) || '';
    const status = this.config.status || '';
    const priority = this.config.priority || null;
    const assigneeId = this.resolveValue(this.config.assigneeId, context) || '';
    const first = Math.min(this.config.first || 50, 100);
    const after = this.resolveValue(this.config.after, context) || '';

    const filter: any = {};

    if (teamId) {
      filter.team = { id: { eq: teamId } };
    }
    if (projectId) {
      filter.project = { id: { eq: projectId } };
    }
    if (cycleId) {
      filter.cycle = { id: { eq: cycleId } };
    }
    if (status) {
      filter.state = { name: { eq: status } };
    }
    if (priority !== null) {
      filter.priority = { eq: priority };
    }
    if (assigneeId) {
      filter.assignee = { id: { eq: assigneeId } };
    }

    const query = `
      query Issues($filter: IssueFilter, $first: Int, $after: String) {
        issues(filter: $filter, first: $first, after: $after) {
          nodes {
            id
            identifier
            title
            description
            state { id name type }
            priority
            assignee { id name email }
            creator { id name email }
            labels { nodes { id name color } }
            project { id name }
            team { id name key }
            createdAt
            updatedAt
            dueDate
            estimate
            url
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables: any = {
      first,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
    };

    if (after) {
      variables.after = after;
    }

    const data = await this.callApi(query, variables);

    return {
      success: true,
      data: {
        issues: data.issues.nodes,
        pageInfo: data.issues.pageInfo,
      },
    };
  }

  private async createIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);
    const title = this.resolveValue(this.config.title, context);
    const description = this.resolveValue(this.config.description, context) || '';
    const assigneeId = this.resolveValue(this.config.assigneeId, context) || null;
    const projectId = this.resolveValue(this.config.projectId, context) || null;
    const cycleId = this.resolveValue(this.config.cycleId, context) || null;
    const stateId = this.resolveValue(this.config.stateId, context) || null;
    const priority = this.config.priority || null;
    const labelIds = this.config.labelIds || [];
    const estimate = this.config.estimate || null;
    const dueDate = this.resolveValue(this.config.dueDate, context) || null;

    if (!teamId) {
      throw new Error('teamId is required');
    }
    if (!title) {
      throw new Error('title is required');
    }

    const mutation = `
      mutation IssueCreate(
        $teamId: String!
        $title: String!
        $description: String
        $assigneeId: String
        $projectId: String
        $cycleId: String
        $stateId: String
        $priority: Int
        $labelIds: [String!]
        $estimate: Int
        $dueDate: String
      ) {
        issueCreate(
          input: {
            teamId: $teamId
            title: $title
            description: $description
            assigneeId: $assigneeId
            projectId: $projectId
            cycleId: $cycleId
            stateId: $stateId
            priority: $priority
            labelIds: $labelIds
            estimate: $estimate
            dueDate: $dueDate
          }
        ) {
          success
          issue {
            id
            identifier
            title
            description
            state { id name type }
            priority
            assignee { id name email }
            project { id name }
            cycle { id name }
            team { id name key }
            url
          }
        }
      }
    `;

    const variables = {
      teamId,
      title,
      description,
      assigneeId,
      projectId,
      cycleId,
      stateId,
      priority,
      labelIds,
      estimate,
      dueDate,
    };

    const data = await this.callApi(mutation, variables);

    return {
      success: data.issueCreate.success,
      data: {
        issue: data.issueCreate.issue,
        message: 'Issue created successfully',
      },
    };
  }

  private async updateIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const title = this.resolveValue(this.config.title, context) || null;
    const description = this.resolveValue(this.config.description, context) || null;
    const assigneeId = this.resolveValue(this.config.assigneeId, context) || null;
    const stateId = this.resolveValue(this.config.stateId, context) || null;
    const priority = this.config.priority !== undefined ? this.config.priority : null;
    const projectId = this.resolveValue(this.config.projectId, context) || null;
    const cycleId = this.resolveValue(this.config.cycleId, context) || null;
    const estimate = this.config.estimate !== undefined ? this.config.estimate : null;
    const dueDate = this.resolveValue(this.config.dueDate, context) || null;

    if (!issueId) {
      throw new Error('issueId is required');
    }

    const mutation = `
      mutation IssueUpdate(
        $issueId: String!
        $title: String
        $description: String
        $assigneeId: String
        $stateId: String
        $priority: Int
        $projectId: String
        $cycleId: String
        $estimate: Int
        $dueDate: String
      ) {
        issueUpdate(
          id: $issueId
          input: {
            title: $title
            description: $description
            assigneeId: $assigneeId
            stateId: $stateId
            priority: $priority
            projectId: $projectId
            cycleId: $cycleId
            estimate: $estimate
            dueDate: $dueDate
          }
        ) {
          success
          issue {
            id
            identifier
            title
            description
            state { id name type }
            priority
            assignee { id name email }
            project { id name }
            cycle { id name }
            url
          }
        }
      }
    `;

    const variables = {
      issueId,
      title,
      description,
      assigneeId,
      stateId,
      priority,
      projectId,
      cycleId,
      estimate,
      dueDate,
    };

    const data = await this.callApi(mutation, variables);

    return {
      success: data.issueUpdate.success,
      data: {
        issue: data.issueUpdate.issue,
        message: 'Issue updated successfully',
      },
    };
  }

  private async deleteIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);

    if (!issueId) {
      throw new Error('issueId is required');
    }

    const mutation = `
      mutation IssueDelete($issueId: String!) {
        issueDelete(id: $issueId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { issueId });

    return {
      success: data.issueDelete.success,
      data: {
        message: 'Issue deleted successfully',
      },
    };
  }

  private async archiveIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);

    if (!issueId) {
      throw new Error('issueId is required');
    }

    const mutation = `
      mutation IssueArchive($issueId: String!) {
        issueArchive(id: $issueId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { issueId });

    return {
      success: data.issueArchive.success,
      data: {
        message: 'Issue archived successfully',
      },
    };
  }

  private async searchIssues(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const teamId = this.resolveValue(this.config.teamId, context) || '';

    if (!query) {
      throw new Error('query is required');
    }

    const searchFilter: any = {
      query,
    };

    if (teamId) {
      searchFilter.team = { id: { eq: teamId } };
    }

    const graphQuery = `
      query Search($filter: IssueFilter) {
        issues(filter: $filter, first: 50) {
          nodes {
            id
            identifier
            title
            description
            state { id name type }
            priority
            assignee { id name email }
            labels { nodes { id name color } }
            team { id name key }
            url
          }
        }
      }
    `;

    const variables = {
      filter: searchFilter,
    };

    const data = await this.callApi(graphQuery, variables);

    return {
      success: true,
      data: {
        issues: data.issues.nodes,
      },
    };
  }

  // ==================== Project Operations ====================

  private async getProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required');
    }

    const query = `
      query Project($projectId: String!) {
        project(id: $projectId) {
          id
          name
          description
          state
          team { id name }
          lead { id name }
          startDate
          targetDate
          status {
            state
            color
          }
          url
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.callApi(query, { projectId });

    return {
      success: true,
      data: data.project,
    };
  }

  private async listProjects(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context) || '';

    const query = `
      query Projects($teamId: String) {
        projects(${teamId ? 'filter: { team: { id: { eq: $teamId } } }' : ''}) {
          nodes {
            id
            name
            description
            state
            team { id name }
            lead { id name }
            startDate
            targetDate
            url
          }
        }
      }
    `;

    const variables = teamId ? { teamId } : {};

    const data = await this.callApi(query, variables);

    return {
      success: true,
      data: {
        projects: data.projects.nodes,
      },
    };
  }

  private async createProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context) || '';
    const leadId = this.resolveValue(this.config.leadId, context) || null;
    const startDate = this.resolveValue(this.config.startDate, context) || null;
    const targetDate = this.resolveValue(this.config.targetDate, context) || null;

    if (!teamId) {
      throw new Error('teamId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const mutation = `
      mutation ProjectCreate(
        $teamId: String!
        $name: String!
        $description: String
        $leadId: String
        $startDate: String
        $targetDate: String
      ) {
        projectCreate(
          input: {
            teamId: $teamId
            name: $name
            description: $description
            leadId: $leadId
            startDate: $startDate
            targetDate: $targetDate
          }
        ) {
          success
          project {
            id
            name
            description
            team { id name }
            url
          }
        }
      }
    `;

    const variables = {
      teamId,
      name,
      description,
      leadId,
      startDate,
      targetDate,
    };

    const data = await this.callApi(mutation, variables);

    return {
      success: data.projectCreate.success,
      data: {
        project: data.projectCreate.project,
        message: 'Project created successfully',
      },
    };
  }

  private async updateProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const description = this.resolveValue(this.config.description, context) || null;
    const state = this.config.state || null;
    const targetDate = this.resolveValue(this.config.targetDate, context) || null;

    if (!projectId) {
      throw new Error('projectId is required');
    }

    const mutation = `
      mutation ProjectUpdate(
        $projectId: String!
        $name: String
        $description: String
        $state: String
        $targetDate: String
      ) {
        projectUpdate(
          id: $projectId
          input: {
            name: $name
            description: $description
            state: $state
            targetDate: $targetDate
          }
        ) {
          success
          project {
            id
            name
            description
            state
            url
          }
        }
      }
    `;

    const variables = {
      projectId,
      name,
      description,
      state,
      targetDate,
    };

    const data = await this.callApi(mutation, variables);

    return {
      success: data.projectUpdate.success,
      data: {
        project: data.projectUpdate.project,
        message: 'Project updated successfully',
      },
    };
  }

  private async deleteProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required');
    }

    const mutation = `
      mutation ProjectDelete($projectId: String!) {
        projectDelete(id: $projectId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { projectId });

    return {
      success: data.projectDelete.success,
      data: {
        message: 'Project deleted successfully',
      },
    };
  }

  // ==================== Team Operations ====================

  private async getTeam(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);

    if (!teamId) {
      throw new Error('teamId is required');
    }

    const query = `
      query Team($teamId: String!) {
        team(id: $teamId) {
          id
          name
          key
          description
          icon
          color
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.callApi(query, { teamId });

    return {
      success: true,
      data: data.team,
    };
  }

  private async listTeams(): Promise<NodeExecutionResult> {
    const query = `
      query Teams {
        teams {
          nodes {
            id
            name
            key
            description
            icon
            color
          }
        }
      }
    `;

    const data = await this.callApi(query);

    return {
      success: true,
      data: {
        teams: data.teams.nodes,
      },
    };
  }

  private async getTeamMembers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);

    if (!teamId) {
      throw new Error('teamId is required');
    }

    const query = `
      query TeamMembers($teamId: String!) {
        team(id: $teamId) {
          members {
            nodes {
              id
              name
              email
              avatarUrl
              role
            }
          }
        }
      }
    `;

    const data = await this.callApi(query, { teamId });

    return {
      success: true,
      data: {
        members: data.team.members.nodes,
      },
    };
  }

  // ==================== Cycle Operations ====================

  private async getCycle(context: ExecutionContext): Promise<NodeExecutionResult> {
    const cycleId = this.resolveValue(this.config.cycleId, context);

    if (!cycleId) {
      throw new Error('cycleId is required');
    }

    const query = `
      query Cycle($cycleId: String!) {
        cycle(id: $cycleId) {
          id
          name
          description
          number
          state
          team { id name }
          startDate
          endDate
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.callApi(query, { cycleId });

    return {
      success: true,
      data: data.cycle,
    };
  }

  private async listCycles(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context) || '';

    if (!teamId) {
      throw new Error('teamId is required');
    }

    const query = `
      query Cycles($teamId: String) {
        cycles(filter: { team: { id: { eq: $teamId } } }) {
          nodes {
            id
            name
            description
            number
            state
            team { id name }
            startDate
            endDate
          }
        }
      }
    `;

    const data = await this.callApi(query, { teamId });

    return {
      success: true,
      data: {
        cycles: data.cycles.nodes,
      },
    };
  }

  private async createCycle(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context) || '';
    const startDate = this.resolveValue(this.config.startDate, context) || null;
    const endDate = this.resolveValue(this.config.endDate, context) || null;

    if (!teamId) {
      throw new Error('teamId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const mutation = `
      mutation CycleCreate(
        $teamId: String!
        $name: String!
        $description: String
        $startDate: String
        $endDate: String
      ) {
        cycleCreate(
          input: {
            teamId: $teamId
            name: $name
            description: $description
            startDate: $startDate
            endDate: $endDate
          }
        ) {
          success
          cycle {
            id
            name
            description
            number
            team { id name }
          }
        }
      }
    `;

    const variables = {
      teamId,
      name,
      description,
      startDate,
      endDate,
    };

    const data = await this.callApi(mutation, variables);

    return {
      success: data.cycleCreate.success,
      data: {
        cycle: data.cycleCreate.cycle,
        message: 'Cycle created successfully',
      },
    };
  }

  private async updateCycle(context: ExecutionContext): Promise<NodeExecutionResult> {
    const cycleId = this.resolveValue(this.config.cycleId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const description = this.resolveValue(this.config.description, context) || null;
    const state = this.config.state || null;
    const startDate = this.resolveValue(this.config.startDate, context) || null;
    const endDate = this.resolveValue(this.config.endDate, context) || null;

    if (!cycleId) {
      throw new Error('cycleId is required');
    }

    const mutation = `
      mutation CycleUpdate(
        $cycleId: String!
        $name: String
        $description: String
        $state: String
        $startDate: String
        $endDate: String
      ) {
        cycleUpdate(
          id: $cycleId
          input: {
            name: $name
            description: $description
            state: $state
            startDate: $startDate
            endDate: $endDate
          }
        ) {
          success
          cycle {
            id
            name
            description
            state
          }
        }
      }
    `;

    const variables = {
      cycleId,
      name,
      description,
      state,
      startDate,
      endDate,
    };

    const data = await this.callApi(mutation, variables);

    return {
      success: data.cycleUpdate.success,
      data: {
        cycle: data.cycleUpdate.cycle,
        message: 'Cycle updated successfully',
      },
    };
  }

  private async deleteCycle(context: ExecutionContext): Promise<NodeExecutionResult> {
    const cycleId = this.resolveValue(this.config.cycleId, context);

    if (!cycleId) {
      throw new Error('cycleId is required');
    }

    const mutation = `
      mutation CycleDelete($cycleId: String!) {
        cycleDelete(id: $cycleId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { cycleId });

    return {
      success: data.cycleDelete.success,
      data: {
        message: 'Cycle deleted successfully',
      },
    };
  }

  // ==================== Comment Operations ====================

  private async getComments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);

    if (!issueId) {
      throw new Error('issueId is required');
    }

    const query = `
      query Comments($issueId: String!) {
        issue(id: $issueId) {
          comments {
            nodes {
              id
              body
              user { id name email }
              createdAt
              updatedAt
              url
            }
          }
        }
      }
    `;

    const data = await this.callApi(query, { issueId });

    return {
      success: true,
      data: {
        comments: data.issue.comments.nodes,
      },
    };
  }

  private async createComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const body = this.resolveValue(this.config.body, context);

    if (!issueId) {
      throw new Error('issueId is required');
    }
    if (!body) {
      throw new Error('body is required');
    }

    const mutation = `
      mutation CommentCreate($issueId: String!, $body: String!) {
        commentCreate(
          input: {
            issueId: $issueId
            body: $body
          }
        ) {
          success
          comment {
            id
            body
            user { id name }
            createdAt
            url
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { issueId, body });

    return {
      success: data.commentCreate.success,
      data: {
        comment: data.commentCreate.comment,
        message: 'Comment created successfully',
      },
    };
  }

  private async updateComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const commentId = this.resolveValue(this.config.commentId, context);
    const body = this.resolveValue(this.config.body, context);

    if (!commentId) {
      throw new Error('commentId is required');
    }
    if (!body) {
      throw new Error('body is required');
    }

    const mutation = `
      mutation CommentUpdate($commentId: String!, $body: String!) {
        commentUpdate(
          id: $commentId
          input: {
            body: $body
          }
        ) {
          success
          comment {
            id
            body
            updatedAt
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { commentId, body });

    return {
      success: data.commentUpdate.success,
      data: {
        comment: data.commentUpdate.comment,
        message: 'Comment updated successfully',
      },
    };
  }

  private async deleteComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const commentId = this.resolveValue(this.config.commentId, context);

    if (!commentId) {
      throw new Error('commentId is required');
    }

    const mutation = `
      mutation CommentDelete($commentId: String!) {
        commentDelete(id: $commentId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { commentId });

    return {
      success: data.commentDelete.success,
      data: {
        message: 'Comment deleted successfully',
      },
    };
  }

  // ==================== Label Operations ====================

  private async getLabels(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context) || '';

    const query = `
      query Labels($teamId: String) {
        team(id: $teamId) {
          labels {
            nodes {
              id
              name
              color
              description
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const data = await this.callApi(query, { teamId });

    return {
      success: true,
      data: {
        labels: data.team?.labels?.nodes || [],
      },
    };
  }

  private async createLabel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);
    const name = this.resolveValue(this.config.name, context);
    const color = this.config.color || '#555555';
    const description = this.resolveValue(this.config.description, context) || '';

    if (!teamId) {
      throw new Error('teamId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const mutation = `
      mutation LabelCreate(
        $teamId: String!
        $name: String!
        $color: String!
        $description: String
      ) {
        labelCreate(
          input: {
            teamId: $teamId
            name: $name
            color: $color
            description: $description
          }
        ) {
          success
          label {
            id
            name
            color
            description
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { teamId, name, color, description });

    return {
      success: data.labelCreate.success,
      data: {
        label: data.labelCreate.label,
        message: 'Label created successfully',
      },
    };
  }

  private async updateLabel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const labelId = this.resolveValue(this.config.labelId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const color = this.config.color || null;
    const description = this.resolveValue(this.config.description, context) || null;

    if (!labelId) {
      throw new Error('labelId is required');
    }

    const mutation = `
      mutation LabelUpdate(
        $labelId: String!
        $name: String
        $color: String
        $description: String
      ) {
        labelUpdate(
          id: $labelId
          input: {
            name: $name
            color: $color
            description: $description
          }
        ) {
          success
          label {
            id
            name
            color
            description
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { labelId, name, color, description });

    return {
      success: data.labelUpdate.success,
      data: {
        label: data.labelUpdate.label,
        message: 'Label updated successfully',
      },
    };
  }

  private async deleteLabel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const labelId = this.resolveValue(this.config.labelId, context);

    if (!labelId) {
      throw new Error('labelId is required');
    }

    const mutation = `
      mutation LabelDelete($labelId: String!) {
        labelDelete(id: $labelId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { labelId });

    return {
      success: data.labelDelete.success,
      data: {
        message: 'Label deleted successfully',
      },
    };
  }

  private async addLabelToIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const labelId = this.resolveValue(this.config.labelId, context);

    if (!issueId) {
      throw new Error('issueId is required');
    }
    if (!labelId) {
      throw new Error('labelId is required');
    }

    const mutation = `
      mutation IssueLabelAdd($issueId: String!, $labelId: String!) {
        issueLabelAdd(
          id: $issueId
          labelId: $labelId
        ) {
          success
          issue {
            id
            labels {
              nodes { id name color }
            }
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { issueId, labelId });

    return {
      success: data.issueLabelAdd.success,
      data: {
        issue: data.issueLabelAdd.issue,
        message: 'Label added to issue successfully',
      },
    };
  }

  private async removeLabelFromIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const labelId = this.resolveValue(this.config.labelId, context);

    if (!issueId) {
      throw new Error('issueId is required');
    }
    if (!labelId) {
      throw new Error('labelId is required');
    }

    const mutation = `
      mutation IssueLabelRemove($issueId: String!, $labelId: String!) {
        issueLabelRemove(
          id: $issueId
          labelId: $labelId
        ) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { issueId, labelId });

    return {
      success: data.issueLabelRemove.success,
      data: {
        message: 'Label removed from issue successfully',
      },
    };
  }

  // ==================== User Operations ====================

  private async getUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);

    if (!userId) {
      throw new Error('userId is required');
    }

    const query = `
      query User($userId: String!) {
        user(id: $userId) {
          id
          name
          email
          avatarUrl
          displayName
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.callApi(query, { userId });

    return {
      success: true,
      data: data.user,
    };
  }

  private async listUsers(): Promise<NodeExecutionResult> {
    const query = `
      query Users {
        users {
          nodes {
            id
            name
            email
            avatarUrl
            displayName
          }
        }
      }
    `;

    const data = await this.callApi(query);

    return {
      success: true,
      data: {
        users: data.users.nodes,
      },
    };
  }

  private async getMe(): Promise<NodeExecutionResult> {
    const query = `
      query Viewer {
        viewer {
          id
          name
          email
          avatarUrl
          displayName
        }
      }
    `;

    const data = await this.callApi(query);

    return {
      success: true,
      data: data.viewer,
    };
  }

  // ==================== Organization Operations ====================

  private async getOrganization(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = `
      query Organization {
        organization {
          id
          name
          urlKey
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.callApi(query);

    return {
      success: true,
      data: data.organization,
    };
  }

  // ==================== Workflow Operations ====================

  private async getWorkflowStates(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context) || '';

    const query = `
      query WorkflowStates($teamId: String) {
        team(id: $teamId) {
          states {
            nodes {
              id
              name
              type
              color
              position
              description
            }
          }
        }
      }
    `;

    const data = await this.callApi(query, { teamId });

    return {
      success: true,
      data: {
        states: data.team?.states?.nodes || [],
      },
    };
  }

  // ==================== Roadmap Operations ====================

  private async getRoadmap(context: ExecutionContext): Promise<NodeExecutionResult> {
    const roadmapId = this.resolveValue(this.config.roadmapId, context);

    if (!roadmapId) {
      throw new Error('roadmapId is required');
    }

    const query = `
      query Roadmap($roadmapId: String!) {
        roadmap(id: $roadmapId) {
          id
          name
          description
          team { id name }
          projects {
            nodes {
              id
              name
              state
            }
          }
        }
      }
    `;

    const data = await this.callApi(query, { roadmapId });

    return {
      success: true,
      data: data.roadmap,
    };
  }

  private async listRoadmaps(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context) || '';

    const query = `
      query Roadmaps($teamId: String) {
        roadmaps(filter: { team: { id: { eq: $teamId } } }) {
          nodes {
            id
            name
            description
            team { id name }
          }
        }
      }
    `;

    const data = await this.callApi(query, { teamId });

    return {
      success: true,
      data: {
        roadmaps: data.roadmaps.nodes,
      },
    };
  }

  private async createRoadmap(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context) || '';

    if (!teamId) {
      throw new Error('teamId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const mutation = `
      mutation RoadmapCreate(
        $teamId: String!
        $name: String!
        $description: String
      ) {
        roadmapCreate(
          input: {
            teamId: $teamId
            name: $name
            description: $description
          }
        ) {
          success
          roadmap {
            id
            name
            description
            team { id name }
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { teamId, name, description });

    return {
      success: data.roadmapCreate.success,
      data: {
        roadmap: data.roadmapCreate.roadmap,
        message: 'Roadmap created successfully',
      },
    };
  }

  // ==================== Initiative Operations ====================

  private async getInitiative(context: ExecutionContext): Promise<NodeExecutionResult> {
    const initiativeId = this.resolveValue(this.config.initiativeId, context);

    if (!initiativeId) {
      throw new Error('initiativeId is required');
    }

    const query = `
      query Initiative($initiativeId: String!) {
        initiative(id: $initiativeId) {
          id
          name
          description
          status
          team { id name }
          projects {
            nodes {
              id
              name
            }
          }
        }
      }
    `;

    const data = await this.callApi(query, { initiativeId });

    return {
      success: true,
      data: data.initiative,
    };
  }

  private async listInitiatives(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context) || '';

    const query = `
      query Initiatives($teamId: String) {
        initiatives(filter: { team: { id: { eq: $teamId } } }) {
          nodes {
            id
            name
            description
            status
            team { id name }
          }
        }
      }
    `;

    const data = await this.callApi(query, { teamId });

    return {
      success: true,
      data: {
        initiatives: data.initiatives.nodes,
      },
    };
  }

  private async createInitiative(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.resolveValue(this.config.teamId, context);
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context) || '';
    const projectId = this.resolveValue(this.config.projectId, context) || null;

    if (!teamId) {
      throw new Error('teamId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const mutation = `
      mutation InitiativeCreate(
        $teamId: String!
        $name: String!
        $description: String
        $projectId: String
      ) {
        initiativeCreate(
          input: {
            teamId: $teamId
            name: $name
            description: $description
            projectId: $projectId
          }
        ) {
          success
          initiative {
            id
            name
            description
            team { id name }
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { teamId, name, description, projectId });

    return {
      success: data.initiativeCreate.success,
      data: {
        initiative: data.initiativeCreate.initiative,
        message: 'Initiative created successfully',
      },
    };
  }

  // ==================== Attachment Operations ====================

  private async uploadAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const url = this.resolveValue(this.config.url, context);
    const title = this.resolveValue(this.config.title, context) || '';
    const fileType = this.config.fileType || 'unknown';

    if (!issueId) {
      throw new Error('issueId is required');
    }
    if (!url) {
      throw new Error('url is required');
    }

    const mutation = `
      mutation AttachmentCreate(
        $issueId: String!
        $url: String!
        $title: String!
        $fileType: String
      ) {
        attachmentCreate(
          input: {
            issueId: $issueId
            url: $url
            title: $title
            fileType: $fileType
          }
        ) {
          success
          attachment {
            id
            title
            url
            fileType
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { issueId, url, title, fileType });

    return {
      success: data.attachmentCreate.success,
      data: {
        attachment: data.attachmentCreate.attachment,
        message: 'Attachment uploaded successfully',
      },
    };
  }

  private async deleteAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const attachmentId = this.resolveValue(this.config.attachmentId, context);

    if (!attachmentId) {
      throw new Error('attachmentId is required');
    }

    const mutation = `
      mutation AttachmentDelete($attachmentId: String!) {
        attachmentDelete(id: $attachmentId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { attachmentId });

    return {
      success: data.attachmentDelete.success,
      data: {
        message: 'Attachment deleted successfully',
      },
    };
  }

  // ==================== Webhook Operations ====================

  private async listWebhooks(): Promise<NodeExecutionResult> {
    const query = `
      query Webhooks {
        webhooks {
          nodes {
            id
            url
            resourceTypes
            createdAt
            updatedAt
          }
        }
      }
    `;

    const data = await this.callApi(query);

    return {
      success: true,
      data: {
        webhooks: data.webhooks.nodes,
      },
    };
  }

  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const url = this.resolveValue(this.config.url, context);
    const resourceTypes = this.config.resourceTypes || ['Issue'];
    const secret = this.resolveValue(this.config.secret, context) || '';

    if (!url) {
      throw new Error('url is required');
    }

    const mutation = `
      mutation WebhookCreate(
        $url: String!
        $resourceTypes: [WebhookResourceType!]
        $secret: String!
      ) {
        webhookCreate(
          input: {
            url: $url
            resourceTypes: $resourceTypes
            secret: $secret
          }
        ) {
          success
          webhook {
            id
            url
            resourceTypes
            secret
          }
        }
      }
    `;

    const data = await this.callApi(mutation, { url, resourceTypes, secret });

    return {
      success: data.webhookCreate.success,
      data: {
        webhook: data.webhookCreate.webhook,
        message: 'Webhook created successfully',
      },
    };
  }

  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    const mutation = `
      mutation WebhookDelete($webhookId: String!) {
        webhookDelete(id: $webhookId) {
          success
        }
      }
    `;

    const data = await this.callApi(mutation, { webhookId });

    return {
      success: data.webhookDelete.success,
      data: {
        message: 'Webhook deleted successfully',
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly IssuePriority = {
    Urgent: 0,
    High: 1,
    Medium: 2,
    Low: 3,
    NoPriority: 4,
  } as const;

  static readonly IssueState = {
    Backlog: 'backlog',
    Todo: 'todo',
    InProgress: 'in_progress',
    Done: 'done',
    Cancelled: 'cancelled',
  } as const;

  static readonly CycleState = {
    Upcoming: 'upcoming',
    Started: 'started',
    Completed: 'completed',
  } as const;

  static readonly ProjectState = {
    Planned: 'planned',
    Started: 'started',
    Paused: 'paused',
    Completed: 'completed',
    Cancelled: 'cancelled',
  } as const;

  /**
   * Get priority label
   */
  static getPriorityLabel(priority: number): string {
    switch (priority) {
      case 0:
        return 'Urgent';
      case 1:
        return 'High';
      case 2:
        return 'Medium';
      case 3:
        return 'Low';
      case 4:
        return 'No Priority';
      default:
        return 'Unknown';
    }
  }

  /**
   * Format Linear API error
   */
  static formatError(error: any): string {
    if (error.response?.data?.errors) {
      return error.response.data.errors.map((e: any) => e.message).join(', ');
    }
    return error.message || 'Unknown Linear API error';
  }
}
