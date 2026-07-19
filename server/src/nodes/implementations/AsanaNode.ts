import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * AsanaNode - Asana Project Management API Integration
 *
 * Provides comprehensive integration with Asana API including:
 * - Tasks: Create, read, update, delete, search, duplicate
 * - Projects: CRUD operations, project members, project status
 * - Sections: Create, update, delete sections in projects
 * - Tags: Manage tags, add/remove tags from tasks
 * - Stories (Comments): Add, get comments on tasks
 * - Attachments: Upload, download, delete attachments
 * - Teams: List teams, get team members
 * - Users: Get user info, search users
 * - Workspaces: List workspaces
 * - Portfolios: Manage portfolios
 * - Goals: Track goals and progress
 * - Custom Fields: Manage custom field settings
 * - Webhooks: Manage webhook subscriptions
 * - Task Dependencies: Add/remove dependencies
 * - Subtasks: Manage subtasks
 * - Followers: Add/remove task followers
 *
 * Authentication: Personal Access Token (PAT)
 * API Docs: https://developers.asana.com/reference
 */
export class AsanaNode extends BaseNode {
  readonly accessToken: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.accessToken = config.accessToken || '';

    if (!this.accessToken) {
      throw new Error('Asana access token is required');
    }

    this.apiUrl = 'https://app.asana.com/api/1.0';
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
    return 'asana';
  }

  getIcon(): string {
    return '📋';
  }

  getCategory(): string {
    return 'project-management';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'getTask';

    try {
      switch (operation) {
        // Task Operations
        case 'getTask':
          return await this.getTask(context);
        case 'createTask':
          return await this.createTask(context);
        case 'updateTask':
          return await this.updateTask(context);
        case 'deleteTask':
          return await this.deleteTask(context);
        case 'listTasks':
          return await this.listTasks(context);
        case 'searchTasks':
          return await this.searchTasks(context);
        case 'duplicateTask':
          return await this.duplicateTask(context);
        case 'getSubtasks':
          return await this.getSubtasks(context);
        case 'createSubtask':
          return await this.createSubtask(context);
        case 'setParent':
          return await this.setParent(context);

        // Project Operations
        case 'getProject':
          return await this.getProject(context);
        case 'createProject':
          return await this.createProject(context);
        case 'updateProject':
          return await this.updateProject(context);
        case 'deleteProject':
          return await this.deleteProject(context);
        case 'listProjects':
          return await this.listProjects(context);
        case 'getProjectTasks':
          return await this.getProjectTasks(context);
        case 'getProjectMemberships':
          return await this.getProjectMemberships(context);

        // Section Operations
        case 'getSection':
          return await this.getSection(context);
        case 'createSection':
          return await this.createSection(context);
        case 'updateSection':
          return await this.updateSection(context);
        case 'deleteSection':
          return await this.deleteSection(context);
        case 'listSections':
          return await this.listSections(context);
        case 'getSectionTasks':
          return await this.getSectionTasks(context);

        // Tag Operations
        case 'getTag':
          return await this.getTag(context);
        case 'createTag':
          return await this.createTag(context);
        case 'updateTag':
          return await this.updateTag(context);
        case 'deleteTag':
          return await this.deleteTag(context);
        case 'listTags':
          return await this.listTags(context);
        case 'getTagTasks':
          return await this.getTagTasks(context);
        case 'addTagToTask':
          return await this.addTagToTask(context);
        case 'removeTagFromTask':
          return await this.removeTagFromTask(context);

        // Story (Comment) Operations
        case 'getStories':
          return await this.getStories(context);
        case 'createStory':
          return await this.createStory(context);
        case 'updateStory':
          return await this.updateStory(context);
        case 'deleteStory':
          return await this.deleteStory(context);

        // Attachment Operations
        case 'getAttachments':
          return await this.getAttachments(context);
        case 'uploadAttachment':
          return await this.uploadAttachment(context);
        case 'deleteAttachment':
          return await this.deleteAttachment(context);

        // Team Operations
        case 'getTeams':
          return await this.getTeams(context);
        case 'getTeamMemberships':
          return await this.getTeamMemberships(context);
        case 'getTeamMembershipsForUser':
          return await this.getTeamMembershipsForUser(context);

        // User Operations
        case 'getUser':
          return await this.getUser(context);
        case 'getMe':
          return await this.getMe();
        case 'listUsers':
          return await this.listUsers(context);
        case 'searchUsers':
          return await this.searchUsers(context);

        // Workspace Operations
        case 'getWorkspaces':
          return await this.getWorkspaces();
        case 'getWorkspace':
          return await this.getWorkspace(context);

        // Portfolio Operations
        case 'getPortfolios':
          return await this.getPortfolios(context);
        case 'getPortfolio':
          return await this.getPortfolio(context);
        case 'createPortfolio':
          return await this.createPortfolio(context);
        case 'updatePortfolio':
          return await this.updatePortfolio(context);
        case 'deletePortfolio':
          return await this.deletePortfolio(context);

        // Goal Operations
        case 'getGoals':
          return await this.getGoals(context);
        case 'getGoal':
          return await this.getGoal(context);
        case 'createGoal':
          return await this.createGoal(context);
        case 'updateGoal':
          return await this.updateGoal(context);
        case 'deleteGoal':
          return await this.deleteGoal(context);

        // Custom Field Operations
        case 'getCustomFields':
          return await this.getCustomFields(context);
        case 'getCustomField':
          return await this.getCustomField(context);
        case 'createCustomField':
          return await this.createCustomField(context);
        case 'updateCustomField':
          return await this.updateCustomField(context);
        case 'deleteCustomField':
          return await this.deleteCustomField(context);

        // Dependency Operations
        case 'addDependencies':
          return await this.addDependencies(context);
        case 'removeDependencies':
          return await this.removeDependencies(context);
        case 'getDependencies':
          return await this.getDependencies(context);

        // Follower Operations
        case 'addFollowers':
          return await this.addFollowers(context);
        case 'removeFollowers':
          return await this.removeFollowers(context);
        case 'getFollowers':
          return await this.getFollowers(context);

        // Webhook Operations
        case 'getWebhooks':
          return await this.getWebhooks(context);
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
        error: error.message || `Failed to execute Asana operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async callApi(
    endpoint: string,
    method = 'GET',
    body?: any,
    queryParams?: Record<string, string>
  ): Promise<any> {
    let url = `${this.apiUrl}${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: this.getAuthHeaders(),
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify({ data: body });
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Asana API error: ${response.status} ${response.statusText}`;

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
    return data.data;
  }

  // ==================== Task Operations ====================

  private async getTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const data = await this.callApi(`/tasks/${taskId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const name = this.resolveValue(this.config.name, context);
    const notes = this.resolveValue(this.config.notes, context) || null;
    const assignee = this.resolveValue(this.config.assignee, context) || null;
    const projects = this.config.projects || [];
    const parent = this.resolveValue(this.config.parent, context) || null;
    const dueOn = this.resolveValue(this.config.dueOn, context) || null;
    const dueAt = this.resolveValue(this.config.dueAt, context) || null;
    const startOn = this.resolveValue(this.config.startOn, context) || null;
    const followers = this.config.followers || [];
    const tags = this.config.tags || [];
    const customFields = this.config.customFields || {};

    if (!workspace) {
      throw new Error('workspace is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      workspace,
      name,
      projects,
      followers,
      tags,
    };

    if (notes) {
      body.notes = notes;
    }
    if (assignee) {
      body.assignee = assignee;
    }
    if (parent) {
      body.parent = parent;
    }
    if (dueOn) {
      body.due_on = dueOn;
    }
    if (dueAt) {
      body.due_at = dueAt;
    }
    if (startOn) {
      body.start_on = startOn;
    }
    if (Object.keys(customFields).length > 0) {
      body.custom_fields = customFields;
    }

    const data = await this.callApi('/tasks', 'POST', body);

    return {
      success: true,
      data: {
        task: data,
        message: 'Task created successfully',
      },
    };
  }

  private async updateTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const notes = this.resolveValue(this.config.notes, context) || null;
    const assignee = this.resolveValue(this.config.assignee, context) || null;
    const completed = this.config.completed !== undefined ? this.config.completed : null;
    const dueOn = this.resolveValue(this.config.dueOn, context) || null;
    const dueAt = this.resolveValue(this.config.dueAt, context) || null;
    const startOn = this.resolveValue(this.config.startOn, context) || null;
    const projects = this.config.projects || null;
    const customFields = this.config.customFields || null;

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (notes) {
      body.notes = notes;
    }
    if (assignee !== null) {
      body.assignee = assignee;
    }
    if (completed !== null) {
      body.completed = completed;
    }
    if (dueOn) {
      body.due_on = dueOn;
    }
    if (dueAt) {
      body.due_at = dueAt;
    }
    if (startOn) {
      body.start_on = startOn;
    }
    if (projects) {
      body.projects = projects;
    }
    if (customFields) {
      body.custom_fields = customFields;
    }

    const data = await this.callApi(`/tasks/${taskId}`, 'PUT', body);

    return {
      success: true,
      data: {
        task: data,
        message: 'Task updated successfully',
      },
    };
  }

  private async deleteTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    await this.callApi(`/tasks/${taskId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Task deleted successfully',
      },
    };
  }

  private async listTasks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const project = this.resolveValue(this.config.project, context) || '';
    const tag = this.resolveValue(this.config.tag, context) || '';
    const assignee = this.resolveValue(this.config.assignee, context) || '';
    const completedSince = this.resolveValue(this.config.completedSince, context) || '';
    const modifiedSince = this.resolveValue(this.config.modifiedSince, context) || '';
    const workspace = this.resolveValue(this.config.workspace, context) || '';
    const limit = Math.min(this.config.limit || 100, 100);
    const offset = this.config.offset || 0;

    const queryParams: Record<string, string> = {
      limit: String(limit),
      offset: String(offset),
    };

    if (project) {
      queryParams.project = project;
    }
    if (tag) {
      queryParams.tag = tag;
    }
    if (assignee) {
      queryParams.assignee = assignee;
    }
    if (completedSince) {
      queryParams.completed_since = completedSince;
    }
    if (modifiedSince) {
      queryParams.modified_since = modifiedSince;
    }
    if (workspace) {
      queryParams.workspace = workspace;
    }

    const data = await this.callApi('/tasks', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        tasks: Array.isArray(data) ? data : [],
      },
    };
  }

  private async searchTasks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const query = this.resolveValue(this.config.query, context) || '';
    const projects = this.config.projects || [];
    const tags = this.config.tags || [];
    const assignee = this.resolveValue(this.config.assignee, context) || null;
    const completed = this.config.completed !== undefined ? this.config.completed : null;

    if (!workspace) {
      throw new Error('workspace is required');
    }

    const body: any = {
      workspace,
      projects,
      tags,
      text: query,
    };

    if (assignee !== null) {
      body.assignee = assignee;
    }
    if (completed !== null) {
      body.completed = completed;
    }

    const data = await this.callApi('/workspaces/:workspace/search/tasks', 'POST', body);

    return {
      success: true,
      data: {
        tasks: Array.isArray(data) ? data : [],
      },
    };
  }

  private async duplicateTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const name = this.resolveValue(this.config.name, context);
    const include = this.config.include || [];
    const project = this.resolveValue(this.config.project, context) || null;

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const body: any = {
      name,
      include,
    };

    if (project) {
      body.project = project;
    }

    const data = await this.callApi(`/tasks/${taskId}/duplicate`, 'POST', body);

    return {
      success: true,
      data: {
        task: data.new_task,
        message: 'Task duplicated successfully',
      },
    };
  }

  private async getSubtasks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/subtasks`);

    return {
      success: true,
      data: {
        subtasks: Array.isArray(data) ? data : [],
      },
    };
  }

  private async createSubtask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const name = this.resolveValue(this.config.name, context);
    const notes = this.resolveValue(this.config.notes, context) || null;
    const assignee = this.resolveValue(this.config.assignee, context) || null;
    const dueOn = this.resolveValue(this.config.dueOn, context) || null;
    const followers = this.config.followers || [];

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      name,
      followers,
    };

    if (notes) {
      body.notes = notes;
    }
    if (assignee) {
      body.assignee = assignee;
    }
    if (dueOn) {
      body.due_on = dueOn;
    }

    const data = await this.callApi(`/tasks/${taskId}/subtasks`, 'POST', body);

    return {
      success: true,
      data: {
        subtask: data,
        message: 'Subtask created successfully',
      },
    };
  }

  private async setParent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const parent = this.resolveValue(this.config.parent, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (!parent) {
      throw new Error('parent is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/setParent`, 'POST', {
      parent,
    });

    return {
      success: true,
      data: {
        task: data,
        message: 'Parent set successfully',
      },
    };
  }

  // ==================== Project Operations ====================

  private async getProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required');
    }

    const data = await this.callApi(`/projects/${projectId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const name = this.resolveValue(this.config.name, context);
    const notes = this.resolveValue(this.config.notes, context) || null;
    const team = this.resolveValue(this.config.team, context) || null;
    const color = this.config.color || null;
    const public_ = this.config.public !== undefined ? this.config.public : null;

    if (!workspace) {
      throw new Error('workspace is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      workspace,
      name,
    };

    if (notes) {
      body.notes = notes;
    }
    if (team) {
      body.team = team;
    }
    if (color) {
      body.color = color;
    }
    if (public_ !== null) {
      body.public = public_;
    }

    const data = await this.callApi('/projects', 'POST', body);

    return {
      success: true,
      data: {
        project: data,
        message: 'Project created successfully',
      },
    };
  }

  private async updateProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const notes = this.resolveValue(this.config.notes, context) || null;
    const color = this.config.color || null;
    const public_ = this.config.public !== undefined ? this.config.public : null;

    if (!projectId) {
      throw new Error('projectId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (notes) {
      body.notes = notes;
    }
    if (color) {
      body.color = color;
    }
    if (public_ !== null) {
      body.public = public_;
    }

    const data = await this.callApi(`/projects/${projectId}`, 'PUT', body);

    return {
      success: true,
      data: {
        project: data,
        message: 'Project updated successfully',
      },
    };
  }

  private async deleteProject(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required');
    }

    await this.callApi(`/projects/${projectId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Project deleted successfully',
      },
    };
  }

  private async listProjects(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context) || '';
    const team = this.resolveValue(this.config.team, context) || '';
    const archived = this.config.archived !== undefined ? this.config.archived : false;
    const limit = Math.min(this.config.limit || 100, 100);
    const offset = this.config.offset || 0;

    const queryParams: Record<string, string> = {
      limit: String(limit),
      offset: String(offset),
      archived: String(archived),
    };

    if (workspace) {
      queryParams.workspace = workspace;
    }
    if (team) {
      queryParams.team = team;
    }

    const data = await this.callApi('/projects', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        projects: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getProjectTasks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required');
    }

    const data = await this.callApi(`/projects/${projectId}/tasks`);

    return {
      success: true,
      data: {
        tasks: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getProjectMemberships(context: ExecutionContext): Promise<NodeExecutionResult> {
    const projectId = this.resolveValue(this.config.projectId, context);

    if (!projectId) {
      throw new Error('projectId is required');
    }

    const data = await this.callApi(`/projects/${projectId}/project_memberships`);

    return {
      success: true,
      data: {
        memberships: Array.isArray(data) ? data : [],
      },
    };
  }

  // ==================== Section Operations ====================

  private async getSection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sectionId = this.resolveValue(this.config.sectionId, context);

    if (!sectionId) {
      throw new Error('sectionId is required');
    }

    const data = await this.callApi(`/sections/${sectionId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createSection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const project = this.resolveValue(this.config.project, context);
    const name = this.resolveValue(this.config.name, context);

    if (!project) {
      throw new Error('project is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi('/sections', 'POST', {
      project,
      name,
    });

    return {
      success: true,
      data: {
        section: data,
        message: 'Section created successfully',
      },
    };
  }

  private async updateSection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sectionId = this.resolveValue(this.config.sectionId, context);
    const name = this.resolveValue(this.config.name, context) || null;

    if (!sectionId) {
      throw new Error('sectionId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }

    const data = await this.callApi(`/sections/${sectionId}`, 'PUT', body);

    return {
      success: true,
      data: {
        section: data,
        message: 'Section updated successfully',
      },
    };
  }

  private async deleteSection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sectionId = this.resolveValue(this.config.sectionId, context);

    if (!sectionId) {
      throw new Error('sectionId is required');
    }

    await this.callApi(`/sections/${sectionId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Section deleted successfully',
      },
    };
  }

  private async listSections(context: ExecutionContext): Promise<NodeExecutionResult> {
    const project = this.resolveValue(this.config.project, context);

    if (!project) {
      throw new Error('project is required');
    }

    const data = await this.callApi(`/projects/${project}/sections`);

    return {
      success: true,
      data: {
        sections: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getSectionTasks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sectionId = this.resolveValue(this.config.sectionId, context);

    if (!sectionId) {
      throw new Error('sectionId is required');
    }

    const data = await this.callApi(`/sections/${sectionId}/tasks`);

    return {
      success: true,
      data: {
        tasks: Array.isArray(data) ? data : [],
      },
    };
  }

  // ==================== Tag Operations ====================

  private async getTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tagId = this.resolveValue(this.config.tagId, context);

    if (!tagId) {
      throw new Error('tagId is required');
    }

    const data = await this.callApi(`/tags/${tagId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const name = this.resolveValue(this.config.name, context);
    const color = this.config.color || null;

    if (!workspace) {
      throw new Error('workspace is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      workspace,
      name,
    };

    if (color) {
      body.color = color;
    }

    const data = await this.callApi('/tags', 'POST', body);

    return {
      success: true,
      data: {
        tag: data,
        message: 'Tag created successfully',
      },
    };
  }

  private async updateTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tagId = this.resolveValue(this.config.tagId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const color = this.config.color || null;

    if (!tagId) {
      throw new Error('tagId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (color) {
      body.color = color;
    }

    const data = await this.callApi(`/tags/${tagId}`, 'PUT', body);

    return {
      success: true,
      data: {
        tag: data,
        message: 'Tag updated successfully',
      },
    };
  }

  private async deleteTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tagId = this.resolveValue(this.config.tagId, context);

    if (!tagId) {
      throw new Error('tagId is required');
    }

    await this.callApi(`/tags/${tagId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Tag deleted successfully',
      },
    };
  }

  private async listTags(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);

    if (!workspace) {
      throw new Error('workspace is required');
    }

    const data = await this.callApi(`/workspaces/${workspace}/tags`);

    return {
      success: true,
      data: {
        tags: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getTagTasks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tagId = this.resolveValue(this.config.tagId, context);

    if (!tagId) {
      throw new Error('tagId is required');
    }

    const data = await this.callApi(`/tags/${tagId}/tasks`);

    return {
      success: true,
      data: {
        tasks: Array.isArray(data) ? data : [],
      },
    };
  }

  private async addTagToTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const tag = this.resolveValue(this.config.tag, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (!tag) {
      throw new Error('tag is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/addTag`, 'POST', {
      tag,
    });

    return {
      success: true,
      data: {
        task: data,
        message: 'Tag added to task successfully',
      },
    };
  }

  private async removeTagFromTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const tag = this.resolveValue(this.config.tag, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (!tag) {
      throw new Error('tag is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/removeTag`, 'POST', {
      tag,
    });

    return {
      success: true,
      data: {
        task: data,
        message: 'Tag removed from task successfully',
      },
    };
  }

  // ==================== Story (Comment) Operations ====================

  private async getStories(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/stories`);

    return {
      success: true,
      data: {
        stories: Array.isArray(data) ? data : [],
      },
    };
  }

  private async createStory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const text = this.resolveValue(this.config.text, context);
    const isPinned = this.config.isPinned || false;

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (!text) {
      throw new Error('text is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/stories`, 'POST', {
      text,
      is_pinned: isPinned,
    });

    return {
      success: true,
      data: {
        story: data,
        message: 'Comment created successfully',
      },
    };
  }

  private async updateStory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storyId = this.resolveValue(this.config.storyId, context);
    const text = this.resolveValue(this.config.text, context) || null;
    const isPinned = this.config.isPinned !== undefined ? this.config.isPinned : null;

    if (!storyId) {
      throw new Error('storyId is required');
    }

    const body: any = {};

    if (text) {
      body.text = text;
    }
    if (isPinned !== null) {
      body.is_pinned = isPinned;
    }

    const data = await this.callApi(`/stories/${storyId}`, 'PUT', body);

    return {
      success: true,
      data: {
        story: data,
        message: 'Comment updated successfully',
      },
    };
  }

  private async deleteStory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storyId = this.resolveValue(this.config.storyId, context);

    if (!storyId) {
      throw new Error('storyId is required');
    }

    await this.callApi(`/stories/${storyId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Comment deleted successfully',
      },
    };
  }

  // ==================== Attachment Operations ====================

  private async getAttachments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/attachments`);

    return {
      success: true,
      data: {
        attachments: Array.isArray(data) ? data : [],
      },
    };
  }

  private async uploadAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const url = this.resolveValue(this.config.url, context) || null;
    const fileData = this.resolveValue(this.config.fileData, context) || null;
    const fileName = this.resolveValue(this.config.fileName, context) || null;

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (!url && !fileData) {
      throw new Error('Either url or fileData is required');
    }

    const body: any = {};

    if (url) {
      body.url = url;
    }
    if (fileData) {
      body.file = fileData;
    }
    if (fileName) {
      body.filename = fileName;
    }

    // For file uploads, we need to use multipart/form-data
    if (fileData) {
      const formData = new FormData();
      formData.append('file', fileData, fileName || 'file');

      const response = await fetch(`${this.apiUrl}/tasks/${taskId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload attachment: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          attachment: data.data,
          message: 'Attachment uploaded successfully',
        },
      };
    }

    const data = await this.callApi(`/tasks/${taskId}/attachments`, 'POST', body);

    return {
      success: true,
      data: {
        attachment: data,
        message: 'Attachment uploaded successfully',
      },
    };
  }

  private async deleteAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const attachmentId = this.resolveValue(this.config.attachmentId, context);

    if (!attachmentId) {
      throw new Error('attachmentId is required');
    }

    await this.callApi(`/attachments/${attachmentId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Attachment deleted successfully',
      },
    };
  }

  // ==================== Team Operations ====================

  private async getTeams(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);

    if (!workspace) {
      throw new Error('workspace is required');
    }

    const data = await this.callApi(`/organizations/${workspace}/teams`);

    return {
      success: true,
      data: {
        teams: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getTeamMemberships(context: ExecutionContext): Promise<NodeExecutionResult> {
    const team = this.resolveValue(this.config.team, context);

    if (!team) {
      throw new Error('team is required');
    }

    const data = await this.callApi(`/teams/${team}/team_memberships`);

    return {
      success: true,
      data: {
        memberships: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getTeamMembershipsForUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const user = this.resolveValue(this.config.user, context);

    if (!user) {
      throw new Error('user is required');
    }

    const data = await this.callApi(`/users/${user}/team_memberships`);

    return {
      success: true,
      data: {
        memberships: Array.isArray(data) ? data : [],
      },
    };
  }

  // ==================== User Operations ====================

  private async getUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);

    if (!userId) {
      throw new Error('userId is required');
    }

    const data = await this.callApi(`/users/${userId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async getMe(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/users/me');

    return {
      success: true,
      data: data,
    };
  }

  private async listUsers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);

    if (!workspace) {
      throw new Error('workspace is required');
    }

    const data = await this.callApi(`/workspaces/${workspace}/users`);

    return {
      success: true,
      data: {
        users: Array.isArray(data) ? data : [],
      },
    };
  }

  private async searchUsers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const query = this.resolveValue(this.config.query, context) || '';

    if (!workspace) {
      throw new Error('workspace is required');
    }

    const data = await this.callApi('/workspaces/:workspace/users/search', 'GET', null, {
      query,
    });

    return {
      success: true,
      data: {
        users: data?.data || [],
      },
    };
  }

  // ==================== Workspace Operations ====================

  private async getWorkspaces(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/workspaces');

    return {
      success: true,
      data: {
        workspaces: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getWorkspace(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspaceId = this.resolveValue(this.config.workspaceId, context);

    if (!workspaceId) {
      throw new Error('workspaceId is required');
    }

    const data = await this.callApi(`/workspaces/${workspaceId}`);

    return {
      success: true,
      data: data,
    };
  }

  // ==================== Portfolio Operations ====================

  private async getPortfolios(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context) || '';

    const queryParams: Record<string, string> = {};

    if (workspace) {
      queryParams.workspace = workspace;
    }

    const data = await this.callApi('/portfolios', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        portfolios: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getPortfolio(context: ExecutionContext): Promise<NodeExecutionResult> {
    const portfolioId = this.resolveValue(this.config.portfolioId, context);

    if (!portfolioId) {
      throw new Error('portfolioId is required');
    }

    const data = await this.callApi(`/portfolios/${portfolioId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createPortfolio(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const name = this.resolveValue(this.config.name, context);
    const color = this.config.color || null;

    if (!workspace) {
      throw new Error('workspace is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      workspace,
      name,
    };

    if (color) {
      body.color = color;
    }

    const data = await this.callApi('/portfolios', 'POST', body);

    return {
      success: true,
      data: {
        portfolio: data,
        message: 'Portfolio created successfully',
      },
    };
  }

  private async updatePortfolio(context: ExecutionContext): Promise<NodeExecutionResult> {
    const portfolioId = this.resolveValue(this.config.portfolioId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const color = this.config.color || null;

    if (!portfolioId) {
      throw new Error('portfolioId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (color) {
      body.color = color;
    }

    const data = await this.callApi(`/portfolios/${portfolioId}`, 'PUT', body);

    return {
      success: true,
      data: {
        portfolio: data,
        message: 'Portfolio updated successfully',
      },
    };
  }

  private async deletePortfolio(context: ExecutionContext): Promise<NodeExecutionResult> {
    const portfolioId = this.resolveValue(this.config.portfolioId, context);

    if (!portfolioId) {
      throw new Error('portfolioId is required');
    }

    await this.callApi(`/portfolios/${portfolioId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Portfolio deleted successfully',
      },
    };
  }

  // ==================== Goal Operations ====================

  private async getGoals(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context) || '';

    const queryParams: Record<string, string> = {};

    if (workspace) {
      queryParams.workspace = workspace;
    }

    const data = await this.callApi('/goals', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        goals: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getGoal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const goalId = this.resolveValue(this.config.goalId, context);

    if (!goalId) {
      throw new Error('goalId is required');
    }

    const data = await this.callApi(`/goals/${goalId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createGoal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const title = this.resolveValue(this.config.title, context);
    const dueOn = this.resolveValue(this.config.dueOn, context) || null;
    const isWorkspaceLevel = this.config.isWorkspaceLevel !== undefined ? this.config.isWorkspaceLevel : false;

    if (!workspace) {
      throw new Error('workspace is required');
    }
    if (!title) {
      throw new Error('title is required');
    }

    const body: any = {
      workspace,
      title,
      is_workspace_level: isWorkspaceLevel,
    };

    if (dueOn) {
      body.due_on = dueOn;
    }

    const data = await this.callApi('/goals', 'POST', body);

    return {
      success: true,
      data: {
        goal: data,
        message: 'Goal created successfully',
      },
    };
  }

  private async updateGoal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const goalId = this.resolveValue(this.config.goalId, context);
    const title = this.resolveValue(this.config.title, context) || null;
    const dueOn = this.resolveValue(this.config.dueOn, context) || null;

    if (!goalId) {
      throw new Error('goalId is required');
    }

    const body: any = {};

    if (title) {
      body.title = title;
    }
    if (dueOn) {
      body.due_on = dueOn;
    }

    const data = await this.callApi(`/goals/${goalId}`, 'PUT', body);

    return {
      success: true,
      data: {
        goal: data,
        message: 'Goal updated successfully',
      },
    };
  }

  private async deleteGoal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const goalId = this.resolveValue(this.config.goalId, context);

    if (!goalId) {
      throw new Error('goalId is required');
    }

    await this.callApi(`/goals/${goalId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Goal deleted successfully',
      },
    };
  }

  // ==================== Custom Field Operations ====================

  private async getCustomFields(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);

    if (!workspace) {
      throw new Error('workspace is required');
    }

    const data = await this.callApi(`/workspaces/${workspace}/custom_field_settings`);

    return {
      success: true,
      data: {
        customFields: Array.isArray(data) ? data : [],
      },
    };
  }

  private async getCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customFieldId = this.resolveValue(this.config.customFieldId, context);

    if (!customFieldId) {
      throw new Error('customFieldId is required');
    }

    const data = await this.callApi(`/custom_fields/${customFieldId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const name = this.resolveValue(this.config.name, context);
    const type = this.config.type || 'text';
    const hasNotification = this.config.hasNotification !== undefined ? this.config.hasNotification : false;

    if (!workspace) {
      throw new Error('workspace is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi('/custom_fields', 'POST', {
      workspace,
      name,
      type,
      has_notification: hasNotification,
    });

    return {
      success: true,
      data: {
        customField: data,
        message: 'Custom field created successfully',
      },
    };
  }

  private async updateCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customFieldId = this.resolveValue(this.config.customFieldId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const hasNotification = this.config.hasNotification !== undefined ? this.config.hasNotification : null;

    if (!customFieldId) {
      throw new Error('customFieldId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (hasNotification !== null) {
      body.has_notification = hasNotification;
    }

    const data = await this.callApi(`/custom_fields/${customFieldId}`, 'PUT', body);

    return {
      success: true,
      data: {
        customField: data,
        message: 'Custom field updated successfully',
      },
    };
  }

  private async deleteCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customFieldId = this.resolveValue(this.config.customFieldId, context);

    if (!customFieldId) {
      throw new Error('customFieldId is required');
    }

    await this.callApi(`/custom_fields/${customFieldId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Custom field deleted successfully',
      },
    };
  }

  // ==================== Dependency Operations ====================

  private async addDependencies(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const dependents = this.config.dependents || [];
    const dependencies = this.config.dependencies || [];

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const body: any = {};

    if (dependents.length > 0) {
      body.addDependents = dependents;
    }
    if (dependencies.length > 0) {
      body.addDependencies = dependencies;
    }

    if (Object.keys(body).length === 0) {
      throw new Error('Either dependents or dependencies are required');
    }

    const data = await this.callApi(`/tasks/${taskId}/addDependencies`, 'POST', body);

    return {
      success: true,
      data: {
        task: data,
        message: 'Dependencies added successfully',
      },
    };
  }

  private async removeDependencies(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const dependents = this.config.dependents || [];
    const dependencies = this.config.dependencies || [];

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const body: any = {};

    if (dependents.length > 0) {
      body.removeDependents = dependents;
    }
    if (dependencies.length > 0) {
      body.removeDependencies = dependencies;
    }

    if (Object.keys(body).length === 0) {
      throw new Error('Either dependents or dependencies are required');
    }

    const data = await this.callApi(`/tasks/${taskId}/removeDependencies`, 'POST', body);

    return {
      success: true,
      data: {
        task: data,
        message: 'Dependencies removed successfully',
      },
    };
  }

  private async getDependencies(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/dependencies`);

    return {
      success: true,
      data: {
        dependents: Array.isArray(data?.dependents) ? data.dependents : [],
        dependencies: Array.isArray(data?.dependencies) ? data.dependencies : [],
      },
    };
  }

  // ==================== Follower Operations ====================

  private async addFollowers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const followers = this.config.followers || [];

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (followers.length === 0) {
      throw new Error('followers are required');
    }

    const data = await this.callApi(`/tasks/${taskId}/addFollowers`, 'POST', {
      followers,
    });

    return {
      success: true,
      data: {
        task: data,
        message: 'Followers added successfully',
      },
    };
  }

  private async removeFollowers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const followers = this.config.followers || [];

    if (!taskId) {
      throw new Error('taskId is required');
    }
    if (followers.length === 0) {
      throw new Error('followers are required');
    }

    const data = await this.callApi(`/tasks/${taskId}/removeFollowers`, 'POST', {
      followers,
    });

    return {
      success: true,
      data: {
        task: data,
        message: 'Followers removed successfully',
      },
    };
  }

  private async getFollowers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const data = await this.callApi(`/tasks/${taskId}/followers`);

    return {
      success: true,
      data: {
        followers: Array.isArray(data) ? data : [],
      },
    };
  }

  // ==================== Webhook Operations ====================

  private async getWebhooks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);

    if (!workspace) {
      throw new Error('workspace is required');
    }

    const data = await this.callApi(`/webhooks`, 'GET', null, {
      workspace,
    });

    return {
      success: true,
      data: {
        webhooks: Array.isArray(data) ? data : [],
      },
    };
  }

  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workspace = this.resolveValue(this.config.workspace, context);
    const target = this.resolveValue(this.config.target, context);
    const resource = this.config.resource || null;
    const filters = this.config.filters || [];

    if (!workspace) {
      throw new Error('workspace is required');
    }
    if (!target) {
      throw new Error('target (webhook URL) is required');
    }

    const body: any = {
      resource,
      target,
      filters,
    };

    const data = await this.callApi('/webhooks', 'POST', body);

    return {
      success: true,
      data: {
        webhook: data,
        message: 'Webhook created successfully',
      },
    };
  }

  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    await this.callApi(`/webhooks/${webhookId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Webhook deleted successfully',
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly TaskStatus = {
    Inbox: 'inbox',
    Upcoming: 'upcoming',
    Later: 'later',
    New: 'new',
    Today: 'today',
  } as const;

  static readonly CustomFieldType = {
    Text: 'text',
    Number: 'number',
    Enum: 'enum',
    MultiEnum: 'multi_enum',
    Date: 'date',
  } as const;

  static readonly ProjectColor = {
    LightPink: 'light-pink',
    LightGreen: 'light-green',
    LightBlue: 'light-blue',
    LightYellow: 'light-yellow',
    LightPurple: 'light-purple',
    LightOrange: 'light-orange',
    LightRed: 'light-red',
    LightTeal: 'light-teal',
    DarkPink: 'dark-pink',
    DarkGreen: 'dark-green',
    DarkBlue: 'dark-blue',
    DarkYellow: 'dark-yellow',
    DarkPurple: 'dark-purple',
    DarkOrange: 'dark-orange',
    DarkRed: 'dark-red',
    DarkTeal: 'dark-teal',
  } as const;

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format Asana API error
   */
  static formatError(error: any): string {
    if (error.response?.data?.errors) {
      return error.response.data.errors.map((e: any) => e.message).join(', ');
    }
    return error.message || 'Unknown Asana API error';
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  static isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return false;
    }
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }
}
