import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Jira Node - Jira REST API integration
 * n8n-compatible: Jira operations (issues, projects, users, search, agile)
 *
 * Configuration:
 * - operation: 'getIssue' | 'createIssue' | 'updateIssue' | 'deleteIssue' | 'search' | 'addComment' | 'transition' | 'assign' | 'addAttachment' | 'getProject' | 'getProjects' | 'createProject' | 'getSprints' | 'getBoard'
 * - baseUrl: Jira instance URL (e.g., https://your-domain.atlassian.net)
 * - auth: { type: 'basic' | 'bearer' | 'oauth', email, apiToken, token }
 * - issueId: Issue key (e.g., PROJ-123)
 * - projectId: Project ID or key
 * - boardId: Agile board ID
 * - sprintId: Sprint ID
 * - issue: Issue data for create/update
 * - comment: Comment text
 * - transition: Workflow transition name or ID
 * - assignee: User account ID or name
 * - query: JQL query string
 * - fields: Fields to retrieve
 * - options: { maxResults, startAt, expand }
 */
export class JiraNode extends BaseNode {
  private apiBaseUrl: string;
  private headers: Record<string, string> = {};

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializeConnection();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.baseUrl) {
      throw new Error('baseUrl is required');
    }

    const operation = this.config.operation || 'getIssue';

    const validOperations = [
      'getIssue', 'createIssue', 'updateIssue', 'deleteIssue', 'search', 'addComment',
      'transition', 'assign', 'addAttachment', 'getAttachments',
      'getProject', 'getProjects', 'createProject',
      'getBoard', 'getBoards', 'getSprints', 'getSprintIssues',
      'getUser', 'getUsers', 'getCurrentUser',
      'getPriorities', 'getStatuses', 'getIssueTypes', 'getFields'
    ];

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (!this.config.auth) {
      throw new Error('auth configuration is required');
    }

    const authType = this.config.auth.type || 'basic';
    if (!['basic', 'bearer', 'oauth', 'pat'].includes(authType)) {
      throw new Error(`Invalid auth type: ${authType}`);
    }

    if (authType === 'basic' && (!this.config.auth.email || !this.config.auth.apiToken)) {
      throw new Error('email and apiToken are required for basic auth');
    }
    if (authType === 'bearer' && !this.config.auth.token) {
      throw new Error('token is required for bearer auth');
    }
    if (authType === 'pat' && !this.config.auth.personalAccessToken) {
      throw new Error('personalAccessToken is required for PAT auth');
    }
  }

  /**
   * Initialize connection
   */
  private initializeConnection(): void {
    this.apiBaseUrl = this.config.baseUrl.replace(/\/$/, '');

    const authType = this.config.auth.type || 'basic';

    if (authType === 'basic') {
      const credentials = Buffer.from(
        `${this.config.auth.email}:${this.config.auth.apiToken}`
      ).toString('base64');
      this.headers['Authorization'] = `Basic ${credentials}`;
    } else if (authType === 'bearer') {
      this.headers['Authorization'] = `Bearer ${this.config.auth.token}`;
    } else if (authType === 'pat') {
      this.headers['Authorization'] = `Bearer ${this.config.auth.personalAccessToken}`;
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'getIssue';

      switch (operation) {
        case 'getIssue':
          return await this.getIssue(context);
        case 'createIssue':
          return await this.createIssue(context);
        case 'updateIssue':
          return await this.updateIssue(context);
        case 'deleteIssue':
          return await this.deleteIssue(context);
        case 'search':
          return await this.search(context);
        case 'addComment':
          return await this.addComment(context);
        case 'transition':
          return await this.transitionIssue(context);
        case 'assign':
          return await this.assignIssue(context);
        case 'addAttachment':
          return await this.addAttachment(context);
        case 'getAttachments':
          return await this.getAttachments(context);
        case 'getProject':
          return await this.getProject(context);
        case 'getProjects':
          return await this.getProjects();
        case 'createProject':
          return await this.createProject(context);
        case 'getBoard':
          return await this.getBoard(context);
        case 'getBoards':
          return await this.getBoards();
        case 'getSprints':
          return await this.getSprints(context);
        case 'getSprintIssues':
          return await this.getSprintIssues(context);
        case 'getUser':
          return await this.getUser(context);
        case 'getUsers':
          return await this.getUsers();
        case 'getCurrentUser':
          return await this.getCurrentUser();
        case 'getPriorities':
          return await this.getPriorities();
        case 'getStatuses':
          return await this.getStatuses(context);
        case 'getIssueTypes':
          return await this.getIssueTypes(context);
        case 'getFields':
          return await this.getFields();
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Get issue by key
   */
  private async getIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const fields = this.config.fields || [];
    const expand = this.config.expand || [];

    if (!issueId) {
      throw new Error('issueId is required for getIssue operation');
    }

    let url = `/rest/api/3/issue/${issueId}`;
    const params = new URLSearchParams();

    if (fields.length > 0) {
      params.set('fields', fields.join(','));
    }
    if (expand.length > 0) {
      params.set('expand', expand.join(','));
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const issue = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        id: issue.id,
        key: issue.key,
        summary: issue.fields?.summary,
        description: issue.fields?.description,
        status: issue.fields?.status?.name,
        assignee: issue.fields?.assignee,
        reporter: issue.fields?.reporter,
        priority: issue.fields?.priority,
        issueType: issue.fields?.issuetype,
        project: issue.fields?.project,
        created: issue.fields?.created,
        updated: issue.fields?.updated,
        resolution: issue.fields?.resolution,
        resolutiondate: issue.fields?.resolutiondate,
      },
    };
  }

  /**
   * Create new issue
   */
  private async createIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueData = this.resolveValue(this.config.issue, context);

    if (!issueData) {
      throw new Error('issue data is required for createIssue operation');
    }
    if (!issueData.project || !issueData.project.key) {
      throw new Error('issue.project.key is required');
    }
    if (!issueData.issuetype || !issueData.issuetype.name) {
      throw new Error('issue.issuetype.name is required');
    }

    const payload: any = {
      fields: {
        project: { key: issueData.project.key },
        issuetype: { name: issueData.issuetype.name },
      },
    };

    if (issueData.summary) payload.fields.summary = issueData.summary;
    if (issueData.description) {
      payload.fields.description = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: issueData.description,
              },
            ],
          },
        ],
      };
    }
    if (issueData.priority) payload.fields.priority = { name: issueData.priority };
    if (issueData.assignee) payload.fields.assignee = { id: issueData.assignee };
    if (issueData.reporter) payload.fields.reporter = { id: issueData.reporter };
    if (issueData.labels) payload.fields.labels = issueData.labels;
    if (issueData.components) payload.fields.components = issueData.components.map((c: any) => ({ name: c }));
    if (issueData.duedate) payload.fields.duedate = issueData.duedate;
    if (issueData.estimate) payload.fields.timetracking = { originalEstimate: issueData.estimate };
    if (issueData.parent) payload.fields.parent = { key: issueData.parent };

    const issue = await this.callApi('/rest/api/3/issue', 'POST', payload);

    return {
      success: true,
      data: {
        id: issue.id,
        key: issue.key,
        self: issue.self,
        created: true,
      },
    };
  }

  /**
   * Update issue
   */
  private async updateIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const issueData = this.config.issue;

    if (!issueId) {
      throw new Error('issueId is required for updateIssue operation');
    }
    if (!issueData) {
      throw new Error('issue data is required for updateIssue operation');
    }

    const payload: any = { fields: {} };

    if (issueData.summary) payload.fields.summary = issueData.summary;
    if (issueData.description) {
      payload.fields.description = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: issueData.description,
              },
            ],
          },
        ],
      };
    }
    if (issueData.priority) payload.fields.priority = { name: issueData.priority };
    if (issueData.assignee) payload.fields.assignee = { id: issueData.assignee };
    if (issueData.labels) payload.fields.labels = issueData.labels;
    if (issueData.components) payload.fields.components = issueData.components.map((c: any) => ({ name: c }));
    if (issueData.duedate) payload.fields.duedate = issueData.duedate;

    await this.callApi(`/rest/api/3/issue/${issueId}`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: issueId,
        updated: true,
      },
    };
  }

  /**
   * Delete issue
   */
  private async deleteIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);

    if (!issueId) {
      throw new Error('issueId is required for deleteIssue operation');
    }

    await this.callApi(`/rest/api/3/issue/${issueId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: issueId,
        deleted: true,
      },
    };
  }

  /**
   * Search issues with JQL
   */
  private async search(context: ExecutionContext): Promise<NodeExecutionResult> {
    const jql = this.resolveValue(this.config.query, context);
    const maxResults = this.config.options?.maxResults || 50;
    const startAt = this.config.options?.startAt || 0;
    const fields = this.config.fields || [];

    if (!jql) {
      throw new Error('JQL query is required for search operation');
    }

    const payload: any = {
      jql,
      maxResults,
      startAt,
    };

    if (fields.length > 0) {
      payload.fields = fields;
    }

    const response = await this.callApi('/rest/api/3/search', 'POST', payload);

    const issues = response.issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields?.summary,
      status: issue.fields?.status?.name,
      assignee: issue.fields?.assignee,
      priority: issue.fields?.priority,
      issueType: issue.fields?.issuetype,
      project: issue.fields?.project,
      created: issue.fields?.created,
      updated: issue.fields?.updated,
    }));

    return {
      success: true,
      data: {
        issues,
        count: issues.length,
        total: response.total,
        startAt: response.startAt,
        maxResults: response.maxResults,
      },
    };
  }

  /**
   * Add comment to issue
   */
  private async addComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const comment = this.resolveValue(this.config.comment, context);

    if (!issueId) {
      throw new Error('issueId is required for addComment operation');
    }
    if (!comment) {
      throw new Error('comment text is required');
    }

    const payload = {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: comment,
              },
            ],
          },
        ],
      },
    };

    const result = await this.callApi(`/rest/api/3/issue/${issueId}/comment`, 'POST', payload);

    return {
      success: true,
      data: {
        id: result.id,
        issueId,
        comment: result.body?.content?.[0]?.content?.[0]?.text,
        created: result.created,
        author: result.author,
        added: true,
      },
    };
  }

  /**
   * Transition issue to new status
   */
  private async transitionIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const transition = this.config.transition;

    if (!issueId) {
      throw new Error('issueId is required for transition operation');
    }
    if (!transition) {
      throw new Error('transition is required');
    }

    // Get available transitions
    const transitionsResponse = await this.callApi(`/rest/api/3/issue/${issueId}/transitions`, 'GET');
    const availableTransition = transitionsResponse.transitions.find(
      (t: any) => t.name === transition || t.id === transition
    );

    if (!availableTransition) {
      throw new Error(`Transition "${transition}" not available. Available: ${transitionsResponse.transitions.map((t: any) => t.name).join(', ')}`);
    }

    const payload = {
      transition: {
        id: availableTransition.id,
      },
    };

    await this.callApi(`/rest/api/3/issue/${issueId}/transitions`, 'POST', payload);

    return {
      success: true,
      data: {
        issueId,
        transition: availableTransition.name,
        transitioned: true,
      },
    };
  }

  /**
   * Assign issue to user
   */
  private async assignIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const assignee = this.config.assignee;

    if (!issueId) {
      throw new Error('issueId is required for assign operation');
    }
    if (!assignee) {
      throw new Error('assignee is required');
    }

    const payload = {
      accountId: assignee,
    };

    await this.callApi(`/rest/api/3/issue/${issueId}/assignee`, 'PUT', payload);

    return {
      success: true,
      data: {
        issueId,
        assignee,
        assigned: true,
      },
    };
  }

  /**
   * Add attachment to issue
   */
  private async addAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);
    const fileUrl = this.config.fileUrl;
    const fileName = this.config.fileName;
    const contentType = this.config.contentType || 'application/octet-stream';

    if (!issueId) {
      throw new Error('issueId is required for addAttachment operation');
    }
    if (!fileUrl) {
      throw new Error('fileUrl is required');
    }

    // Download file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.statusText}`);
    }
    const fileBuffer = await fileResponse.arrayBuffer();

    // Upload to Jira
    const url = `${this.apiBaseUrl}/rest/api/3/issue/${issueId}/attachments`;
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: contentType });
    formData.append('file', blob, fileName || 'attachment');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': this.headers['Authorization']!,
        'X-Atlassian-Token': 'no-check',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const attachments = await response.json();

    return {
      success: true,
      data: {
        issueId,
        attachments: attachments.map((a: any) => ({
          id: a.id,
          filename: a.filename,
          size: a.size,
          content: a.content,
          mimeType: a.mimeType,
        })),
        uploaded: true,
      },
    };
  }

  /**
   * Get issue attachments
   */
  private async getAttachments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const issueId = this.resolveValue(this.config.issueId, context);

    if (!issueId) {
      throw new Error('issueId is required for getAttachments operation');
    }

    const issue = await this.callApi(`/rest/api/3/issue/${issueId}?fields=attachment`, 'GET');

    return {
      success: true,
      data: {
        issueId,
        attachments: issue.fields?.attachment || [],
        count: (issue.fields?.attachment || []).length,
      },
    };
  }

  /**
   * Get project by key or ID
   */
  private async getProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required for getProject operation');
    }

    const project = await this.callApi(`/rest/api/3/project/${projectId}`, 'GET');

    return {
      success: true,
      data: {
        id: project.id,
        key: project.key,
        name: project.name,
        description: project.description,
        lead: project.lead,
        url: project.self,
        projectTypeKey: project.projectTypeKey,
        avatarUrls: project.avatarUrls,
      },
    };
  }

  /**
   * Get all projects
   */
  private async getProjects(): Promise<NodeExecutionResult> {
    const response = await this.callApi('/rest/api/3/project', 'GET');

    return {
      success: true,
      data: {
        projects: response.map((p: any) => ({
          id: p.id,
          key: p.key,
          name: p.name,
          description: p.description,
          lead: p.lead,
          projectTypeKey: p.projectTypeKey,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Create project
   */
  private async createProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectData = this.config.project;

    if (!projectData || !projectData.key || !projectData.name) {
      throw new Error('project.key and project.name are required');
    }

    const payload = {
      key: projectData.key,
      name: projectData.name,
      description: projectData.description || '',
      projectTypeKey: projectData.projectTypeKey || 'software',
      leadAccountId: projectData.leadAccountId,
      url: projectData.url,
    };

    const project = await this.callApi('/rest/api/3/project', 'POST', payload);

    return {
      success: true,
      data: {
        id: project.id,
        key: project.key,
        name: project.name,
        created: true,
      },
    };
  }

  /**
   * Get agile board
   */
  private async getBoard(context: ExecutionContext): Promise<NodeExecutionResult> {
    const boardId = this.resolveValue(this.config.boardId, context);

    if (!boardId) {
      throw new Error('boardId is required for getBoard operation');
    }

    const board = await this.callApi(`/rest/agile/1.0/board/${boardId}`, 'GET');

    return {
      success: true,
      data: {
        id: board.id,
        name: board.name,
        type: board.type,
        location: board.location,
        self: board.self,
      },
    };
  }

  /**
   * Get all boards
   */
  private async getBoards(): Promise<NodeExecutionResult> {
    const response = await this.callApi('/rest/agile/1.0/board', 'GET');

    return {
      success: true,
      data: {
        boards: response.values.map((b: any) => ({
          id: b.id,
          name: b.name,
          type: b.type,
          location: b.location,
        })),
        count: response.values.length,
        total: response.total,
      },
    };
  }

  /**
   * Get sprints for board
   */
  private async getSprints(context: ExecutionContext): Promise<NodeExecutionResult> {
    const boardId = this.resolveValue(this.config.boardId, context);
    const state = this.config.state; // 'future', 'active', 'closed', or undefined for all

    if (!boardId) {
      throw new Error('boardId is required for getSprints operation');
    }

    let url = `/rest/agile/1.0/board/${boardId}/sprint`;
    const params = new URLSearchParams();

    if (state) {
      params.set('state', state);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        boardId,
        sprints: response.values.map((s: any) => ({
          id: s.id,
          name: s.name,
          state: s.state,
          startDate: s.startDate,
          endDate: s.endDate,
          completeDate: s.completeDate,
          goal: s.goal,
        })),
        count: response.values.length,
        total: response.total,
      },
    };
  }

  /**
   * Get issues in sprint
   */
  private async getSprintIssues(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sprintId = this.resolveValue(this.config.sprintId, context);

    if (!sprintId) {
      throw new Error('sprintId is required for getSprintIssues operation');
    }

    const response = await this.callApi(`/rest/agile/1.0/sprint/${sprintId}/issue`, 'GET');

    const issues = response.issues.map((issue: any) => ({
      id: issue.id,
      key: issue.key,
      summary: issue.fields?.summary,
      status: issue.fields?.status?.name,
      assignee: issue.fields?.assignee,
      priority: issue.fields?.priority,
    }));

    return {
      success: true,
      data: {
        sprintId,
        issues,
        count: issues.length,
        total: response.total,
      },
    };
  }

  /**
   * Get user by account ID
   */
  private async getUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.config.accountId;

    if (!accountId) {
      throw new Error('accountId is required for getUser operation');
    }

    const user = await this.callApi(`/rest/api/3/user?accountId=${accountId}`, 'GET');

    return {
      success: true,
      data: {
        accountId: user.accountId,
        displayName: user.displayName,
        emailAddress: user.emailAddress,
        avatarUrls: user.avatarUrls,
        active: user.active,
      },
    };
  }

  /**
   * Get users
   */
  private async getUsers(): Promise<NodeExecutionResult> {
    const startAt = this.config.options?.startAt || 0;
    const maxResults = this.config.options?.maxResults || 50;

    const response = await this.callApi(
      `/rest/api/3/users/search?startAt=${startAt}&maxResults=${maxResults}`,
      'GET'
    );

    return {
      success: true,
      data: {
        users: response.map((u: any) => ({
          accountId: u.accountId,
          displayName: u.displayName,
          emailAddress: u.emailAddress,
          active: u.active,
        })),
        count: response.length,
        startAt,
        maxResults,
      },
    };
  }

  /**
   * Get current user
   */
  private async getCurrentUser(): Promise<NodeExecutionResult> {
    const user = await this.callApi('/rest/api/3/myself', 'GET');

    return {
      success: true,
      data: {
        accountId: user.accountId,
        displayName: user.displayName,
        emailAddress: user.emailAddress,
        avatarUrls: user.avatarUrls,
        timeZone: user.timeZone,
        locale: user.locale,
      },
    };
  }

  /**
   * Get priorities
   */
  private async getPriorities(): Promise<NodeExecutionResult> {
    const response = await this.callApi('/rest/api/3/priority', 'GET');

    return {
      success: true,
      data: {
        priorities: response.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          iconUrl: p.iconUrl,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Get statuses for project
   */
  private async getStatuses(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required for getStatuses operation');
    }

    const response = await this.callApi(`/rest/api/3/project/${projectId}/statuses`, 'GET');

    return {
      success: true,
      data: {
        projectId,
        statuses: response.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          self: s.self,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Get issue types for project
   */
  private async getIssueTypes(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required for getIssueTypes operation');
    }

    const response = await this.callApi(`/rest/api/3/issue/createmeta?projectIds=${projectId}&expand=projects.issuetypes`, 'GET');

    const issueTypes = response.projects?.[0]?.issuetypes || [];

    return {
      success: true,
      data: {
        projectId,
        issueTypes: issueTypes.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          iconUrl: t.iconUrl,
          subtask: t.subtask,
        })),
        count: issueTypes.length,
      },
    };
  }

  /**
   * Get all fields
   */
  private async getFields(): Promise<NodeExecutionResult> {
    const response = await this.callApi('/rest/api/3/field', 'GET');

    return {
      success: true,
      data: {
        fields: response.map((f: any) => ({
          id: f.id,
          name: f.name,
          custom: f.custom,
          searchable: f.searchable,
          navigable: f.navigable,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Call Jira API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        ...this.headers,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    };

    if (payload && method !== 'GET') {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errorMessages?.[0] || error.message || response.statusText);
    }

    return await response.json();
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
    if (error.message?.includes('Unauthorized') || error.status === 401) {
      return 'Authentication failed. Check your credentials.';
    }
    if (error.message?.includes('Forbidden') || error.status === 403) {
      return 'Access denied. Insufficient permissions.';
    }
    if (error.message?.includes('Not Found') || error.status === 404) {
      return 'Resource not found. Check the ID/key.';
    }
    if (error.message?.includes('Rate Limit') || error.status === 429) {
      return 'Rate limit exceeded. Try again later.';
    }
    if (error.message?.includes('Invalid input') || error.status === 400) {
      return 'Invalid input. Check your request data.';
    }
    return `Jira API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'jira';
  }

  getIcon(): string {
    return 'CheckCircle';
  }

  /**
   * Test Jira connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.callApi('/rest/api/3/myself', 'GET');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create JQL query helper
   */
  static createJQL(config: {
    project?: string;
    status?: string[];
    assignee?: string;
    priority?: string[];
    type?: string[];
    text?: string;
    custom?: Record<string, any>;
  }): string {
    const clauses: string[] = [];

    if (config.project) {
      clauses.push(`project = "${config.project}"`);
    }

    if (config.status && config.status.length > 0) {
      clauses.push(`status IN (${config.status.map(s => `"${s}"`).join(', ')})`);
    }

    if (config.assignee) {
      clauses.push(`assignee = "${config.assignee}"`);
    }

    if (config.priority && config.priority.length > 0) {
      clauses.push(`priority IN (${config.priority.map(p => `"${p}"`).join(', ')})`);
    }

    if (config.type && config.type.length > 0) {
      clauses.push(`issuetype IN (${config.type.map(t => `"${t}"`).join(', ')})`);
    }

    if (config.text) {
      clauses.push(`text ~ "${config.text}"`);
    }

    // Custom JQL clauses
    if (config.custom) {
      for (const [field, value] of Object.entries(config.custom)) {
        if (Array.isArray(value)) {
          clauses.push(`${field} IN (${value.map(v => `"${v}"`).join(', ')})`);
        } else {
          clauses.push(`${field} = "${value}"`);
        }
      }
    }

    return clauses.join(' AND ');
  }

  /**
   * Get issue fields metadata
   */
  static readonly IssueFields = {
    SUMMARY: 'summary',
    DESCRIPTION: 'description',
    STATUS: 'status',
    ASSIGNEE: 'assignee',
    REPORTER: 'reporter',
    PRIORITY: 'priority',
    ISSUE_TYPE: 'issuetype',
    PROJECT: 'project',
    LABELS: 'labels',
    COMPONENTS: 'components',
    DUE_DATE: 'duedate',
    CREATED: 'created',
    UPDATED: 'updated',
    RESOLUTION: 'resolution',
    RESOLUTION_DATE: 'resolutiondate',
    ATTACHMENT: 'attachment',
    COMMENT: 'comment',
    WATCHER: 'watcher',
    VOTES: 'votes',
    TIME_TRACKING: 'timetracking',
    WORKLOG: 'worklog',
    SPRINT: 'sprint',
    EPIC_LINK: 'customfield_10014', // May vary by instance
    EPIC_NAME: 'customfield_10011', // May vary by instance
    STORY_POINTS: 'customfield_10002', // May vary by instance
  };
}
