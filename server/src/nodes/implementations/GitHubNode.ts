import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * GitHub Node - GitHub REST API integration
 * n8n-compatible: Manage repositories, PRs, issues, GitHub Actions, branches, releases, webhooks
 *
 * Configuration:
 * - operation: 'getRepository' | 'createRepository' | 'deleteRepository' | 'listRepositories'
 *              'getIssue' | 'createIssue' | 'updateIssue' | 'listIssues' | 'addComment' | 'addLabel'
 *              'getPR' | 'createPR' | 'updatePR' | 'listPRs' | 'mergePR' | 'addReview' | 'addComment'
 *              'getBranch' | 'createBranch' | 'deleteBranch' | 'listBranches'
 *              'getRelease' | 'createRelease' | 'deleteRelease' | 'listReleases'
 *              'getFile' | 'createFile' | 'updateFile' | 'deleteFile' | 'listContents'
 *              'triggerWorkflow' | 'listWorkflowRuns' | 'getWorkflowRun' | 'rerunWorkflow'
 *              'getCommit' | 'listCommits' | 'compareCommits'
 *              'createWebhook' | 'listWebhooks' | 'deleteWebhook' | 'pingWebhook'
 *              'getMilestone' | 'createMilestone' | 'listMilestones'
 * - baseUrl: GitHub API URL (default: https://api.github.com)
 * - accessToken: GitHub personal access token
 * - owner: Repository owner (username or organization)
 * - repo: Repository name
 * - options: Additional options for specific operations
 */
export class GitHubNode extends BaseNode {
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
    if (!this.config.accessToken && !this.config.auth?.token) {
      throw new Error('accessToken is required');
    }

    const operation = this.config.operation || 'getRepository';

    const validOperations = [
      // Repository
      'getRepository', 'createRepository', 'deleteRepository', 'updateRepository', 'listRepositories',
      'listUserRepositories', 'listOrganizationRepositories', 'getOrganization',
      // Issues
      'getIssue', 'createIssue', 'updateIssue', 'closeIssue', 'reopenIssue', 'listIssues',
      'addIssueComment', 'updateIssueComment', 'deleteIssueComment', 'addIssueLabels', 'removeIssueLabels',
      // Pull Requests
      'getPR', 'createPR', 'updatePR', 'closePR', 'listPRs', 'mergePR', 'addPRReview',
      'addPRComment', 'updatePRComment', 'deletePRComment', 'listPRReviews', 'listPRComments',
      // Branches
      'getBranch', 'createBranch', 'deleteBranch', 'listBranches', 'getBranchProtection', 'updateBranchProtection',
      // Tags & Releases
      'getTag', 'createTag', 'deleteTag', 'listTags',
      'getRelease', 'createRelease', 'updateRelease', 'deleteRelease', 'listReleases', 'getReleaseAsset',
      // Files & Commits
      'getFile', 'createFile', 'updateFile', 'deleteFile', 'listContents', 'getArchive',
      'getCommit', 'listCommits', 'compareCommits',
      // Actions
      'listWorkflows', 'triggerWorkflow', 'listWorkflowRuns', 'getWorkflowRun', 'rerunWorkflow', 'cancelWorkflowRun',
      'listWorkflowRunArtifacts', 'downloadWorkflowRunArtifact',
      // Webhooks
      'createWebhook', 'listWebhooks', 'deleteWebhook', 'pingWebhook', 'updateWebhook',
      // Milestones
      'getMilestone', 'createMilestone', 'updateMilestone', 'deleteMilestone', 'listMilestones',
      // Users & Teams
      'getUser', 'listUsers', 'listCollaborators', 'addCollaborator', 'removeCollaborator',
      'listTeams', 'getTeam', 'listTeamMembers', 'addTeamMember', 'removeTeamMember',
      // Organizations
      'getOrganization', 'listOrganizations', 'listOrganizationMembers', 'listOrganizationRepos',
      // Gists
      'getGist', 'createGist', 'listGists', 'updateGist', 'deleteGist', 'starGist', 'unstarGist',
      // Search
      'searchRepositories', 'searchCode', 'searchIssues', 'searchUsers',
    ];

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  /**
   * Initialize connection
   */
  private initializeConnection(): void {
    this.apiBaseUrl = this.config.baseUrl || 'https://api.github.com';
    const token = this.config.accessToken || this.config.auth?.token;

    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': this.config.apiVersion === 'graphql' ? 'application/vnd.github.v3+json' : 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'LogicAI-N8N',
    };
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'getRepository';

      switch (operation) {
        // Repository operations
        case 'getRepository':
          return await this.getRepository(context);
        case 'createRepository':
          return await this.createRepository(context);
        case 'deleteRepository':
          return await this.deleteRepository(context);
        case 'updateRepository':
          return await this.updateRepository(context);
        case 'listRepositories':
          return await this.listRepositories();
        case 'listUserRepositories':
          return await this.listUserRepositories(context);
        case 'listOrganizationRepositories':
          return await this.listOrganizationRepositories(context);
        case 'getOrganization':
          return await this.getOrganization(context);

        // Issue operations
        case 'getIssue':
          return await this.getIssue(context);
        case 'createIssue':
          return await this.createIssue(context);
        case 'updateIssue':
          return await this.updateIssue(context);
        case 'closeIssue':
          return await this.closeIssue(context);
        case 'reopenIssue':
          return await this.reopenIssue(context);
        case 'listIssues':
          return await this.listIssues();
        case 'addIssueComment':
          return await this.addIssueComment(context);
        case 'updateIssueComment':
          return await this.updateIssueComment(context);
        case 'deleteIssueComment':
          return await this.deleteIssueComment(context);
        case 'addIssueLabels':
          return await this.addIssueLabels(context);
        case 'removeIssueLabels':
          return await this.removeIssueLabels(context);

        // Pull Request operations
        case 'getPR':
          return await this.getPR(context);
        case 'createPR':
          return await this.createPR(context);
        case 'updatePR':
          return await this.updatePR(context);
        case 'closePR':
          return await this.closePR(context);
        case 'listPRs':
          return await this.listPRs();
        case 'mergePR':
          return await this.mergePR(context);
        case 'addPRReview':
          return await this.addPRReview(context);
        case 'addPRComment':
          return await this.addPRComment(context);
        case 'updatePRComment':
          return await this.updatePRComment(context);
        case 'deletePRComment':
          return await this.deletePRComment(context);
        case 'listPRReviews':
          return await this.listPRReviews(context);
        case 'listPRComments':
          return await this.listPRComments(context);

        // Branch operations
        case 'getBranch':
          return await this.getBranch(context);
        case 'createBranch':
          return await this.createBranch(context);
        case 'deleteBranch':
          return await this.deleteBranch(context);
        case 'listBranches':
          return await this.listBranches();
        case 'getBranchProtection':
          return await this.getBranchProtection(context);
        case 'updateBranchProtection':
          return await this.updateBranchProtection(context);

        // Tag & Release operations
        case 'getTag':
          return await this.getTag(context);
        case 'createTag':
          return await this.createTag(context);
        case 'deleteTag':
          return await this.deleteTag(context);
        case 'listTags':
          return await this.listTags();
        case 'getRelease':
          return await this.getRelease(context);
        case 'createRelease':
          return await this.createRelease(context);
        case 'updateRelease':
          return await this.updateRelease(context);
        case 'deleteRelease':
          return await this.deleteRelease(context);
        case 'listReleases':
          return await this.listReleases();
        case 'getReleaseAsset':
          return await this.getReleaseAsset(context);

        // File & Commit operations
        case 'getFile':
          return await this.getFile(context);
        case 'createFile':
          return await this.createFile(context);
        case 'updateFile':
          return await this.updateFile(context);
        case 'deleteFile':
          return await this.deleteFile(context);
        case 'listContents':
          return await this.listContents(context);
        case 'getArchive':
          return await this.getArchive(context);
        case 'getCommit':
          return await this.getCommit(context);
        case 'listCommits':
          return await this.listCommits();
        case 'compareCommits':
          return await this.compareCommits(context);

        // Actions operations
        case 'listWorkflows':
          return await this.listWorkflows();
        case 'triggerWorkflow':
          return await this.triggerWorkflow(context);
        case 'listWorkflowRuns':
          return await this.listWorkflowRuns();
        case 'getWorkflowRun':
          return await this.getWorkflowRun(context);
        case 'rerunWorkflow':
          return await this.rerunWorkflow(context);
        case 'cancelWorkflowRun':
          return await this.cancelWorkflowRun(context);
        case 'listWorkflowRunArtifacts':
          return await this.listWorkflowRunArtifacts(context);
        case 'downloadWorkflowRunArtifact':
          return await this.downloadWorkflowRunArtifact(context);

        // Webhook operations
        case 'createWebhook':
          return await this.createWebhook(context);
        case 'listWebhooks':
          return await this.listWebhooks();
        case 'deleteWebhook':
          return await this.deleteWebhook(context);
        case 'pingWebhook':
          return await this.pingWebhook(context);
        case 'updateWebhook':
          return await this.updateWebhook(context);

        // Milestone operations
        case 'getMilestone':
          return await this.getMilestone(context);
        case 'createMilestone':
          return await this.createMilestone(context);
        case 'updateMilestone':
          return await this.updateMilestone(context);
        case 'deleteMilestone':
          return await this.deleteMilestone(context);
        case 'listMilestones':
          return await this.listMilestones();

        // User & Team operations
        case 'getUser':
          return await this.getUser(context);
        case 'listUsers':
          return await this.listUsers();
        case 'listCollaborators':
          return await this.listCollaborators();
        case 'addCollaborator':
          return await this.addCollaborator(context);
        case 'removeCollaborator':
          return await this.removeCollaborator(context);
        case 'listTeams':
          return await this.listTeams();
        case 'getTeam':
          return await this.getTeam(context);
        case 'listTeamMembers':
          return await this.listTeamMembers(context);
        case 'addTeamMember':
          return await this.addTeamMember(context);
        case 'removeTeamMember':
          return await this.removeTeamMember(context);

        // Organization operations
        case 'listOrganizations':
          return await this.listOrganizations(context);
        case 'listOrganizationMembers':
          return await this.listOrganizationMembers(context);
        case 'listOrganizationRepos':
          return await this.listOrganizationRepos(context);

        // Gist operations
        case 'getGist':
          return await this.getGist(context);
        case 'createGist':
          return await this.createGist(context);
        case 'listGists':
          return await this.listGists(context);
        case 'updateGist':
          return await this.updateGist(context);
        case 'deleteGist':
          return await this.deleteGist(context);
        case 'starGist':
          return await this.starGist(context);
        case 'unstarGist':
          return await this.unstarGist(context);

        // Search operations
        case 'searchRepositories':
          return await this.searchRepositories(context);
        case 'searchCode':
          return await this.searchCode(context);
        case 'searchIssues':
          return await this.searchIssues(context);
        case 'searchUsers':
          return await this.searchUsers(context);

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

  // ==================== Repository Operations ====================

  /**
   * Get repository information
   */
  private async getRepository(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);

    if (!owner || !repo) {
      throw new Error('owner and repo are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        name: response.name,
        fullName: response.full_name,
        description: response.description,
        private: response.private,
        url: response.html_url,
        cloneUrl: response.clone_url,
        defaultBranch: response.default_branch,
        language: response.language,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        pushedAt: response.pushed_at,
        size: response.size,
        stars: response.stargazers_count,
        watchers: response.watchers_count,
        forks: response.forks_count,
        openIssues: response.open_issues_count,
        license: response.license,
        owner: {
          login: response.owner?.login,
          type: response.owner?.type,
        },
      },
    };
  }

  /**
   * Create repository
   */
  private async createRepository(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.repo, context);
    const org = this.config.organization;

    if (!name) {
      throw new Error('repo name is required');
    }

    const payload: any = {
      name,
      description: this.config.description || '',
      private: this.config.private || false,
      auto_init: this.config.autoInit !== false,
    };

    if (this.config.licenseTemplate) {
      payload.license_template = this.config.licenseTemplate;
    }
    if (this.config.gitignoreTemplate) {
      payload.gitignore_template = this.config.gitignoreTemplate;
    }
    if (this.config.allowSquashMerge !== undefined) {
      payload.allow_squash_merge = this.config.allowSquashMerge;
    }
    if (this.config.allowMergeCommit !== undefined) {
      payload.allow_merge_commit = this.config.allowMergeCommit;
    }
    if (this.config.allowRebaseMerge !== undefined) {
      payload.allow_rebase_merge = this.config.allowRebaseMerge;
    }
    if (this.config.deleteBranchOnMerge) {
      payload.delete_branch_on_merge = true;
    }

    const endpoint = org ? `/orgs/${org}/repos` : '/user/repos';
    const response = await this.callApi(endpoint, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        name: response.name,
        fullName: response.full_name,
        url: response.html_url,
        private: response.private,
        createdAt: response.created_at,
        created: true,
      },
    };
  }

  /**
   * Delete repository
   */
  private async deleteRepository(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);

    if (!owner || !repo) {
      throw new Error('owner and repo are required');
    }

    await this.callApi(`/repos/${owner}/${repo}`, 'DELETE');

    return {
      success: true,
      data: {
        owner,
        repo,
        deleted: true,
        warning: 'Repository deletion is permanent!',
      },
    };
  }

  /**
   * Update repository
   */
  private async updateRepository(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);

    if (!owner || !repo) {
      throw new Error('owner and repo are required');
    }

    const payload: any = {};
    if (this.config.name !== undefined) payload.name = this.config.name;
    if (this.config.description !== undefined) payload.description = this.config.description;
    if (this.config.private !== undefined) payload.private = this.config.private;
    if (this.config.defaultBranch !== undefined) payload.default_branch = this.config.defaultBranch;
    if (this.config.hasIssues !== undefined) payload.has_issues = this.config.hasIssues;
    if (this.config.hasWiki !== undefined) payload.has_wiki = this.config.hasWiki;
    if (this.config.hasDownloads !== undefined) payload.has_downloads = this.config.hasDownloads;
    if (this.config.archived !== undefined) payload.archived = this.config.archived;

    const response = await this.callApi(`/repos/${owner}/${repo}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        name: response.name,
        updated: true,
      },
    };
  }

  /**
   * List repositories for authenticated user
   */
  private async listRepositories(): Promise<NodeExecutionResult> {
    const type = this.config.type || 'all'; // all, owner, member
    const visibility = this.config.visibility; // all, public, private
    const sort = this.config.sort || 'updated'; // created, updated, pushed, full_name
    const direction = this.config.direction || 'desc'; // asc, desc
    const perPage = this.config.perPage || 30;
    const page = this.config.page || 1;

    const params = new URLSearchParams();
    params.set('per_page', String(perPage));
    params.set('page', String(page));
    if (type !== 'all') params.set('type', type);
    if (visibility) params.set('visibility', visibility);

    const response = await this.callApi(`/user/repos?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        repositories: response.map((r: any) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          private: r.private,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          updatedAt: r.updated_at,
        })),
        count: response.length,
      },
    };
  }

  /**
   * List user repositories
   */
  private async listUserRepositories(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.resolveValue(this.config.username, context);

    if (!username) {
      throw new Error('username is required');
    }

    const response = await this.callApi(`/users/${username}/repos`, 'GET');

    return {
      success: true,
      data: {
        username,
        repositories: response.map((r: any) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
        })),
        count: response.length,
      },
    };
  }

  /**
   * List organization repositories
   */
  private async listOrganizationRepositories(context: ExecutionContext): Promise<NodeExecutionResult> {
    const org = this.resolveValue(this.config.org, context);

    if (!org) {
      throw new Error('org is required');
    }

    const response = await this.callApi(`/orgs/${org}/repos`, 'GET');

    return {
      success: true,
      data: {
        org,
        repositories: response.map((r: any) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          description: r.description,
          private: r.private,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Get organization
   */
  private async getOrganization(context: ExecutionContext): Promise<NodeExecutionResult> {
    const org = this.resolveValue(this.config.org, context);

    if (!org) {
      throw new Error('org is required');
    }

    const response = await this.callApi(`/orgs/${org}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        login: response.login,
        name: response.name,
        description: response.description,
        email: response.email,
        location: response.location,
        website: response.blog,
        avatarUrl: response.avatar_url,
        followers: response.followers,
        following: response.following,
        publicRepos: response.public_repos,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      },
    };
  }

  // ==================== Issue Operations ====================

  /**
   * Get issue
   */
  private async getIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const issueNumber = this.config.issueNumber;

    if (!owner || !repo || !issueNumber) {
      throw new Error('owner, repo, and issueNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/issues/${issueNumber}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        body: response.body,
        state: response.state,
        author: response.user?.login,
        assignees: response.assignees?.map((a: any) => a.login) || [],
        labels: response.labels?.map((l: any) => ({ name: l.name, color: l.color })) || [],
        milestone: response.milestone?.title,
        comments: response.comments,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        closedAt: response.closed_at,
        url: response.html_url,
      },
    };
  }

  /**
   * Create issue
   */
  private async createIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const title = this.resolveValue(this.config.title, context);
    const body = this.resolveValue(this.config.body, context);

    if (!owner || !repo || !title) {
      throw new Error('owner, repo, and title are required');
    }

    const payload: any = {
      title,
    };

    if (body) payload.body = body;
    if (this.config.assignees) payload.assignees = this.config.assignees;
    if (this.config.labels) payload.labels = this.config.labels;
    if (this.config.milestone) payload.milestone = this.config.milestone;

    const response = await this.callApi(`/repos/${owner}/${repo}/issues`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        state: response.state,
        url: response.html_url,
        createdAt: response.created_at,
        created: true,
      },
    };
  }

  /**
   * Update issue
   */
  private async updateIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const issueNumber = this.config.issueNumber;

    if (!owner || !repo || !issueNumber) {
      throw new Error('owner, repo, and issueNumber are required');
    }

    const payload: any = {};
    if (this.config.title !== undefined) payload.title = this.config.title;
    if (this.config.body !== undefined) payload.body = this.config.body;
    if (this.config.state) payload.state = this.config.state; // open, closed
    if (this.config.assignees) payload.assignees = this.config.assignees;
    if (this.config.labels) payload.labels = this.config.labels;
    if (this.config.milestone !== undefined) payload.milestone = this.config.milestone;

    const response = await this.callApi(`/repos/${owner}/${repo}/issues/${issueNumber}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        state: response.state,
        updated: true,
      },
    };
  }

  /**
   * Close issue
   */
  private async closeIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const issueNumber = this.config.issueNumber;

    if (!owner || !repo || !issueNumber) {
      throw new Error('owner, repo, and issueNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/issues/${issueNumber}`, 'PATCH', {
      state: 'closed',
    });

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        state: response.state,
        closed: true,
      },
    };
  }

  /**
   * Reopen issue
   */
  private async reopenIssue(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const issueNumber = this.config.issueNumber;

    if (!owner || !repo || !issueNumber) {
      throw new Error('owner, repo, and issueNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/issues/${issueNumber}`, 'PATCH', {
      state: 'open',
    });

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        state: response.state,
        reopened: true,
      },
    };
  }

  /**
   * List issues
   */
  private async listIssues(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;
    const state = this.config.state || 'open'; // open, closed, all
    const sort = this.config.sort || 'created'; // created, updated, comments
    const direction = this.config.direction || 'desc'; // asc, desc
    const labels = this.config.labels;
    const since = this.config.since;

    const params = new URLSearchParams();
    params.set('state', state);
    params.set('sort', sort);
    params.set('direction', direction);
    if (labels) params.set('labels', labels.join(','));
    if (since) params.set('since', since);

    const response = await this.callApi(`/repos/${owner}/${repo}/issues?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        issues: response.map((i: any) => ({
          id: i.id,
          number: i.number,
          title: i.title,
          state: i.state,
          author: i.user?.login,
          labels: i.labels?.map((l: any) => ({ name: l.name, color: l.color })) || [],
          comments: i.comments,
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          url: i.html_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Add issue comment
   */
  private async addIssueComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const issueNumber = this.config.issueNumber;
    const body = this.resolveValue(this.config.body, context);

    if (!owner || !repo || !issueNumber || !body) {
      throw new Error('owner, repo, issueNumber, and body are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, 'POST', {
      body,
    });

    return {
      success: true,
      data: {
        id: response.id,
        body: response.body,
        author: response.user?.login,
        createdAt: response.created_at,
        url: response.html_url,
        created: true,
      },
    };
  }

  /**
   * Update issue comment
   */
  private async updateIssueComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const commentId = this.config.commentId;
    const body = this.resolveValue(this.config.body, context);

    if (!owner || !repo || !commentId || !body) {
      throw new Error('owner, repo, commentId, and body are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/issues/comments/${commentId}`, 'PATCH', {
      body,
    });

    return {
      success: true,
      data: {
        id: response.id,
        body: response.body,
        updatedAt: response.updated_at,
        updated: true,
      },
    };
  }

  /**
   * Delete issue comment
   */
  private async deleteIssueComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const commentId = this.config.commentId;

    if (!owner || !repo || !commentId) {
      throw new Error('owner, repo, and commentId are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/issues/comments/${commentId}`, 'DELETE');

    return {
      success: true,
      data: {
        commentId,
        deleted: true,
      },
    };
  }

  /**
   * Add labels to issue
   */
  private async addIssueLabels(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const issueNumber = this.config.issueNumber;
    const labels = this.config.labels;

    if (!owner || !repo || !issueNumber || !labels) {
      throw new Error('owner, repo, issueNumber, and labels are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/issues/${issueNumber}/labels`, 'POST', {
      labels,
    });

    return {
      success: true,
      data: {
        labels: response.map((l: any) => ({ name: l.name, color: l.color })),
        added: true,
      },
    };
  }

  /**
   * Remove labels from issue
   */
  private async removeIssueLabels(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const issueNumber = this.config.issueNumber;

    if (!owner || !repo || !issueNumber) {
      throw new Error('owner, repo, and issueNumber are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/issues/${issueNumber}/labels`, 'DELETE');

    return {
      success: true,
      data: {
        issueNumber,
        cleared: true,
      },
    };
  }

  // ==================== Pull Request Operations ====================

  /**
   * Get pull request
   */
  private async getPR(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;

    if (!owner || !repo || !prNumber) {
      throw new Error('owner, repo, and prNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        body: response.body,
        state: response.state,
        author: response.user?.login,
        head: {
          ref: response.head?.ref,
          sha: response.head?.sha,
          repo: response.head?.repo?.full_name,
        },
        base: {
          ref: response.base?.ref,
          sha: response.base?.sha,
          repo: response.base?.repo?.full_name,
        },
        mergeable: response.mergeable,
        merged: response.merged,
        draft: response.draft,
        comments: response.comments,
        reviewComments: response.review_comments,
        additions: response.additions,
        deletions: response.deletions,
        changedFiles: response.changed_files,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        url: response.html_url,
      },
    };
  }

  /**
   * Create pull request
   */
  private async createPR(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const title = this.resolveValue(this.config.title, context);
    const head = this.config.head;
    const base = this.config.base;
    const body = this.resolveValue(this.config.body, context);

    if (!owner || !repo || !title || !head || !base) {
      throw new Error('owner, repo, title, head, and base are required');
    }

    const payload: any = {
      title,
      head,
      base,
    };

    if (body) payload.body = body;
    if (this.config.draft) payload.draft = true;
    if (this.config.maintainerCanModify !== undefined) {
      payload.maintainer_can_modify = this.config.maintainerCanModify;
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        state: response.state,
        draft: response.draft,
        createdAt: response.created_at,
        url: response.html_url,
        created: true,
      },
    };
  }

  /**
   * Update pull request
   */
  private async updatePR(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;

    if (!owner || !repo || !prNumber) {
      throw new Error('owner, repo, and prNumber are required');
    }

    const payload: any = {};
    if (this.config.title !== undefined) payload.title = this.config.title;
    if (this.config.body !== undefined) payload.body = this.config.body;
    if (this.config.state) payload.state = this.config.state; // open, closed
    if (this.config.base !== undefined) payload.base = this.config.base;
    if (this.config.maintainerCanModify !== undefined) {
      payload.maintainer_can_modify = this.config.maintainerCanModify;
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        state: response.state,
        updated: true,
      },
    };
  }

  /**
   * Close pull request
   */
  private async closePR(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;

    if (!owner || !repo || !prNumber) {
      throw new Error('owner, repo, and prNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}`, 'PATCH', {
      state: 'closed',
    });

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        state: response.state,
        closed: true,
      },
    };
  }

  /**
   * List pull requests
   */
  private async listPRs(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;
    const state = this.config.state || 'open'; // open, closed, all
    const sort = this.config.sort || 'created'; // created, updated, popularity
    const direction = this.config.direction || 'desc'; // asc, desc
    const head = this.config.head;
    const base = this.config.base;

    const params = new URLSearchParams();
    params.set('state', state);
    params.set('sort', sort);
    params.set('direction', direction);
    if (head) params.set('head', head);
    if (base) params.set('base', base);

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        pullRequests: response.map((pr: any) => ({
          id: pr.id,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          author: pr.user?.login,
          head: pr.head?.ref,
          base: pr.base?.ref,
          mergeable: pr.mergeable,
          merged: pr.merged,
          draft: pr.draft,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          url: pr.html_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Merge pull request
   */
  private async mergePR(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;
    const commitTitle = this.config.commitTitle;
    const commitMessage = this.config.commitMessage;
    const mergeMethod = this.config.mergeMethod || 'merge'; // merge, squash, rebase

    if (!owner || !repo || !prNumber) {
      throw new Error('owner, repo, and prNumber are required');
    }

    const payload: any = {
      merge_method: mergeMethod,
    };

    if (commitTitle) payload.commit_title = commitTitle;
    if (commitMessage) payload.commit_message = commitMessage;

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, 'PUT', payload);

    return {
      success: true,
      data: {
        merged: response.merged,
        message: response.message,
        sha: response.sha,
        mergedAt: response.merged_at,
      },
    };
  }

  /**
   * Add pull request review
   */
  private async addPRReview(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;
    const body = this.resolveValue(this.config.body, context);
    const event = this.config.event || 'COMMENT'; // APPROVE, REQUEST_CHANGES, COMMENT
    const comments = this.config.comments;

    if (!owner || !repo || !prNumber) {
      throw new Error('owner, repo, and prNumber are required');
    }

    const payload: any = {
      event,
    };

    if (body) payload.body = body;
    if (comments) payload.comments = comments;

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        user: response.user?.login,
        state: response.state,
        body: response.body,
        submittedAt: response.submitted_at,
        created: true,
      },
    };
  }

  /**
   * Add pull request comment
   */
  private async addPRComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;
    const body = this.resolveValue(this.config.body, context);
    const commitId = this.config.commitId;
    const path = this.config.path;
    const position = this.config.position;

    if (!owner || !repo || !prNumber || !body) {
      throw new Error('owner, repo, prNumber, and body are required');
    }

    const payload: any = { body };

    if (commitId) {
      payload.commit_id = commitId;
      payload.path = path;
      payload.position = position;
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        body: response.body,
        author: response.user?.login,
        createdAt: response.created_at,
        url: response.html_url,
        created: true,
      },
    };
  }

  /**
   * Update pull request comment
   */
  private async updatePRComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const commentId = this.config.commentId;
    const body = this.resolveValue(this.config.body, context);

    if (!owner || !repo || !commentId || !body) {
      throw new Error('owner, repo, commentId, and body are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/comments/${commentId}`, 'PATCH', {
      body,
    });

    return {
      success: true,
      data: {
        id: response.id,
        body: response.body,
        updatedAt: response.updated_at,
        updated: true,
      },
    };
  }

  /**
   * Delete pull request comment
   */
  private async deletePRComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const commentId = this.config.commentId;

    if (!owner || !repo || !commentId) {
      throw new Error('owner, repo, and commentId are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/pulls/comments/${commentId}`, 'DELETE');

    return {
      success: true,
      data: {
        commentId,
        deleted: true,
      },
    };
  }

  /**
   * List pull request reviews
   */
  private async listPRReviews(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;

    if (!owner || !repo || !prNumber) {
      throw new Error('owner, repo, and prNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, 'GET');

    return {
      success: true,
      data: {
        reviews: response.map((r: any) => ({
          id: r.id,
          user: r.user?.login,
          state: r.state,
          body: r.body,
          submittedAt: r.submitted_at,
          commitId: r.commit_id,
        })),
        count: response.length,
      },
    };
  }

  /**
   * List pull request comments
   */
  private async listPRComments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const prNumber = this.config.prNumber;

    if (!owner || !repo || !prNumber) {
      throw new Error('owner, repo, and prNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`, 'GET');

    return {
      success: true,
      data: {
        comments: response.map((c: any) => ({
          id: c.id,
          body: c.body,
          author: c.user?.login,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          path: c.path,
          position: c.position,
          commitId: c.commit_id,
        })),
        count: response.length,
      },
    };
  }

  // ==================== Branch Operations ====================

  /**
   * Get branch
   */
  private async getBranch(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const branch = this.config.branch;

    if (!owner || !repo || !branch) {
      throw new Error('owner, repo, and branch are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/branches/${branch}`, 'GET');

    return {
      success: true,
      data: {
        name: response.name,
        sha: response.commit?.sha,
        protected: response.protected,
        commit: {
          sha: response.commit?.sha,
          url: response.commit?.url,
          message: response.commit?.commit?.message,
          author: response.commit?.commit?.author?.name,
        },
      },
    };
  }

  /**
   * Create branch
   */
  private async createBranch(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const branch = this.config.branch;
    const sha = this.config.sha;

    if (!owner || !repo || !branch || !sha) {
      throw new Error('owner, repo, branch, and sha are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/git/refs`, 'POST', {
      ref: `refs/heads/${branch}`,
      sha,
    });

    return {
      success: true,
      data: {
        ref: response.ref,
        sha: response.object?.sha,
        created: true,
      },
    };
  }

  /**
   * Delete branch
   */
  private async deleteBranch(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const branch = this.config.branch;

    if (!owner || !repo || !branch) {
      throw new Error('owner, repo, and branch are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, 'DELETE');

    return {
      success: true,
      data: {
        branch,
        deleted: true,
      },
    };
  }

  /**
   * List branches
   */
  private async listBranches(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;
    const protectedOnly = this.config.protectedOnly || false;

    const params = new URLSearchParams();
    if (protectedOnly) params.set('protected', 'true');

    const response = await this.callApi(`/repos/${owner}/${repo}/branches?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        branches: response.map((b: any) => ({
          name: b.name,
          sha: b.commit?.sha,
          protected: b.protected,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Get branch protection
   */
  private async getBranchProtection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const branch = this.config.branch;

    if (!owner || !repo || !branch) {
      throw new Error('owner, repo, and branch are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/branches/${branch}/protection`, 'GET');

    return {
      success: true,
      data: response,
    };
  }

  /**
   * Update branch protection
   */
  private async updateBranchProtection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const branch = this.config.branch;

    if (!owner || !repo || !branch) {
      throw new Error('owner, repo, and branch are required');
    }

    const payload: any = {};
    if (this.config.requiredStatusChecks !== undefined) {
      payload.required_status_checks = this.config.requiredStatusChecks;
    }
    if (this.config.enforceAdmins !== undefined) {
      payload.enforce_admins = this.config.enforceAdmins;
    }
    if (this.config.requiredPullRequestReviews !== undefined) {
      payload.required_pull_request_reviews = this.config.requiredPullRequestReviews;
    }
    if (this.config.restrictions !== undefined) {
      payload.restrictions = this.config.restrictions;
    }
    if (this.config.allowForcePushes !== undefined) {
      payload.allow_force_pushes = this.config.allowForcePushes;
    }
    if (this.config.allowDeletions !== undefined) {
      payload.allow_deletions = this.config.allowDeletions;
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/branches/${branch}/protection`, 'PUT', payload);

    return {
      success: true,
      data: {
        branch,
        updated: true,
        url: response.url,
      },
    };
  }

  // ==================== Tag & Release Operations ====================

  /**
   * Get tag
   */
  private async getTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const tag = this.config.tag;

    if (!owner || !repo || !tag) {
      throw new Error('owner, repo, and tag are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/git/refs/tags/${tag}`, 'GET');

    return {
      success: true,
      data: {
        ref: response.ref,
        sha: response.object?.sha,
        type: response.object?.type,
        url: response.url,
      },
    };
  }

  /**
   * Create tag
   */
  private async createTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const tag = this.config.tag;
    const message = this.config.message;
    const object = this.config.object; // { sha, type }
    const tagger = this.config.tagger; // { name, email, date }

    if (!owner || !repo || !tag || !object) {
      throw new Error('owner, repo, tag, and object are required');
    }

    // Create tag object
    const tagResponse = await this.callApi(`/repos/${owner}/${repo}/git/tags`, 'POST', {
      tag,
      message: message || '',
      object,
      tagger,
      type: object.type,
    });

    // Create reference
    const refResponse = await this.callApi(`/repos/${owner}/${repo}/git/refs`, 'POST', {
      ref: `refs/tags/${tag}`,
      sha: tagResponse.sha,
    });

    return {
      success: true,
      data: {
        tag,
        sha: tagResponse.sha,
        url: refResponse.url,
        created: true,
      },
    };
  }

  /**
   * Delete tag
   */
  private async deleteTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const tag = this.config.tag;

    if (!owner || !repo || !tag) {
      throw new Error('owner, repo, and tag are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/git/refs/tags/${tag}`, 'DELETE');

    return {
      success: true,
      data: {
        tag,
        deleted: true,
      },
    };
  }

  /**
   * List tags
   */
  private async listTags(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;

    const response = await this.callApi(`/repos/${owner}/${repo}/tags`, 'GET');

    return {
      success: true,
      data: {
        tags: response.map((t: any) => ({
          name: t.name,
          sha: t.commit?.sha,
          zipballUrl: t.zipball_url,
          tarballUrl: t.tarball_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Get release
   */
  private async getRelease(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const releaseId = this.config.releaseId; // Can be id or tag name

    if (!owner || !repo || !releaseId) {
      throw new Error('owner, repo, and releaseId are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/releases/${releaseId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        tagName: response.tag_name,
        name: response.name,
        body: response.body,
        draft: response.draft,
        prerelease: response.prerelease,
        createdAt: response.created_at,
        publishedAt: response.published_at,
        author: response.author?.login,
        url: response.html_url,
        assets: response.assets?.map((a: any) => ({
          id: a.id,
          name: a.name,
          size: a.size,
          downloadCount: a.download_count,
          contentType: a.content_type,
          downloadUrl: a.browser_download_url,
        })) || [],
      },
    };
  }

  /**
   * Create release
   */
  private async createRelease(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const tagName = this.config.tagName;
    const name = this.config.name;
    const body = this.config.body;
    const draft = this.config.draft || false;
    const prerelease = this.config.prerelease || false;
    const targetCommitish = this.config.targetCommitish;

    if (!owner || !repo || !tagName) {
      throw new Error('owner, repo, and tagName are required');
    }

    const payload: any = {
      tag_name: tagName,
      draft,
      prerelease,
    };

    if (name) payload.name = name;
    if (body) payload.body = body;
    if (targetCommitish) payload.target_commitish = targetCommitish;

    const response = await this.callApi(`/repos/${owner}/${repo}/releases`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        tagName: response.tag_name,
        name: response.name,
        createdAt: response.created_at,
        url: response.html_url,
        created: true,
      },
    };
  }

  /**
   * Update release
   */
  private async updateRelease(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const releaseId = this.config.releaseId;

    if (!owner || !repo || !releaseId) {
      throw new Error('owner, repo, and releaseId are required');
    }

    const payload: any = {};
    if (this.config.tagName !== undefined) payload.tag_name = this.config.tagName;
    if (this.config.name !== undefined) payload.name = this.config.name;
    if (this.config.body !== undefined) payload.body = this.config.body;
    if (this.config.draft !== undefined) payload.draft = this.config.draft;
    if (this.config.prerelease !== undefined) payload.prerelease = this.config.prerelease;

    const response = await this.callApi(`/repos/${owner}/${repo}/releases/${releaseId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        tagName: response.tag_name,
        name: response.name,
        updatedAt: response.updated_at,
        updated: true,
      },
    };
  }

  /**
   * Delete release
   */
  private async deleteRelease(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const releaseId = this.config.releaseId;

    if (!owner || !repo || !releaseId) {
      throw new Error('owner, repo, and releaseId are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/releases/${releaseId}`, 'DELETE');

    return {
      success: true,
      data: {
        releaseId,
        deleted: true,
      },
    };
  }

  /**
   * List releases
   */
  private async listReleases(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;

    const response = await this.callApi(`/repos/${owner}/${repo}/releases`, 'GET');

    return {
      success: true,
      data: {
        releases: response.map((r: any) => ({
          id: r.id,
          tagName: r.tag_name,
          name: r.name,
          draft: r.draft,
          prerelease: r.prerelease,
          createdAt: r.created_at,
          publishedAt: r.published_at,
          author: r.author?.login,
          url: r.html_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Get release asset
   */
  private async getReleaseAsset(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const assetId = this.config.assetId;

    if (!owner || !repo || !assetId) {
      throw new Error('owner, repo, and assetId are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/releases/assets/${assetId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        name: response.name,
        size: response.size,
        downloadCount: response.download_count,
        contentType: response.content_type,
        downloadUrl: response.browser_download_url,
        updatedAt: response.updated_at,
      },
    };
  }

  // ==================== File & Commit Operations ====================

  /**
   * Get file content
   */
  private async getFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const path = this.config.path;
    const ref = this.config.ref;

    if (!owner || !repo || !path) {
      throw new Error('owner, repo, and path are required');
    }

    const params = new URLSearchParams();
    if (ref) params.set('ref', ref);

    const response = await this.callApi(`/repos/${owner}/${repo}/contents/${path}?${params.toString()}`, 'GET');

    const content = response.content
      ? Buffer.from(response.content, 'base64').toString('utf-8')
      : null;

    return {
      success: true,
      data: {
        name: response.name,
        path: response.path,
        sha: response.sha,
        size: response.size,
        type: response.type,
        encoding: response.encoding,
        content,
        url: response.html_url,
      },
    };
  }

  /**
   * Create file
   */
  private async createFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const path = this.config.path;
    const message = this.config.message;
    const content = this.resolveValue(this.config.content, context);
    const branch = this.config.branch;

    if (!owner || !repo || !path || !message || content === undefined) {
      throw new Error('owner, repo, path, message, and content are required');
    }

    const payload: any = {
      message,
      content: Buffer.from(content).toString('base64'),
    };

    if (branch) payload.branch = branch;

    const response = await this.callApi(`/repos/${owner}/${repo}/contents/${path}`, 'PUT', payload);

    return {
      success: true,
      data: {
        path: response.content?.path,
        sha: response.content?.sha,
        size: response.content?.size,
        downloadUrl: response.content?.download_url,
        created: true,
      },
    };
  }

  /**
   * Update file
   */
  private async updateFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const path = this.config.path;
    const message = this.config.message;
    const content = this.resolveValue(this.config.content, context);
    const sha = this.config.sha;
    const branch = this.config.branch;

    if (!owner || !repo || !path || !message || !sha || content === undefined) {
      throw new Error('owner, repo, path, message, sha, and content are required');
    }

    const payload: any = {
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
    };

    if (branch) payload.branch = branch;

    const response = await this.callApi(`/repos/${owner}/${repo}/contents/${path}`, 'PUT', payload);

    return {
      success: true,
      data: {
        path: response.content?.path,
        sha: response.content?.sha,
        size: response.content?.size,
        updated: true,
      },
    };
  }

  /**
   * Delete file
   */
  private async deleteFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const path = this.config.path;
    const message = this.config.message;
    const sha = this.config.sha;
    const branch = this.config.branch;

    if (!owner || !repo || !path || !message || !sha) {
      throw new Error('owner, repo, path, message, and sha are required');
    }

    const payload: any = {
      message,
      sha,
    };

    if (branch) payload.branch = branch;

    await this.callApi(`/repos/${owner}/${repo}/contents/${path}`, 'DELETE', { data: payload });

    return {
      success: true,
      data: {
        path,
        deleted: true,
      },
    };
  }

  /**
   * List repository contents
   */
  private async listContents(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const path = this.config.path || '';
    const ref = this.config.ref;

    if (!owner || !repo) {
      throw new Error('owner and repo are required');
    }

    const params = new URLSearchParams();
    if (ref) params.set('ref', ref);

    const response = await this.callApi(`/repos/${owner}/${repo}/contents/${path}?${params.toString()}`, 'GET');

    const items = Array.isArray(response)
      ? response.map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
        }))
      : [response].map((item: any) => ({
          name: item.name,
          path: item.path,
          type: item.type,
          size: item.size,
          sha: item.sha,
        }));

    return {
      success: true,
      data: {
        path,
        items,
        count: items.length,
      },
    };
  }

  /**
   * Get repository archive
   */
  private async getArchive(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const ref = this.config.ref || 'HEAD';
    const format = this.config.format || 'tarball'; // tarball, zipball

    if (!owner || !repo) {
      throw new Error('owner and repo are required');
    }

    const archiveUrl = `${this.apiBaseUrl}/repos/${owner}/${repo}/${format}/${ref}`;

    return {
      success: true,
      data: {
        owner,
        repo,
        ref,
        format,
        archiveUrl,
      },
    };
  }

  /**
   * Get commit
   */
  private async getCommit(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const ref = this.config.ref;

    if (!owner || !repo || !ref) {
      throw new Error('owner, repo, and ref are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/commits/${ref}`, 'GET');

    return {
      success: true,
      data: {
        sha: response.sha,
        message: response.commit?.message,
        author: {
          name: response.commit?.author?.name,
          email: response.commit?.author?.email,
          date: response.commit?.author?.date,
        },
        committer: {
          name: response.commit?.committer?.name,
          email: response.commit?.committer?.email,
          date: response.commit?.committer?.date,
        },
        url: response.html_url,
        stats: response.stats,
        files: response.files?.map((f: any) => ({
          filename: f.filename,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          status: f.status,
        })) || [],
      },
    };
  }

  /**
   * List commits
   */
  private async listCommits(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;
    const sha = this.config.sha;
    const path = this.config.path;
    const since = this.config.since;
    const until = this.config.until;
    const perPage = this.config.perPage || 30;

    const params = new URLSearchParams();
    params.set('per_page', String(perPage));
    if (sha) params.set('sha', sha);
    if (path) params.set('path', path);
    if (since) params.set('since', since);
    if (until) params.set('until', until);

    const response = await this.callApi(`/repos/${owner}/${repo}/commits?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        commits: response.map((c: any) => ({
          sha: c.sha,
          message: c.commit?.message,
          author: c.commit?.author?.name,
          date: c.commit?.author?.date,
          url: c.html_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Compare commits
   */
  private async compareCommits(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const base = this.config.base;
    const head = this.config.head;

    if (!owner || !repo || !base || !head) {
      throw new Error('owner, repo, base, and head are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/compare/${base}...${head}`, 'GET');

    return {
      success: true,
      data: {
        base: response.base?.sha,
        head: response.head?.sha,
        aheadBy: response.ahead_by,
        behindBy: response.behind_by,
        status: response.status,
        ahead_by: response.ahead_by,
        behind_by: response.behind_by,
        totalCommits: response.total_commits,
        files: response.files?.map((f: any) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch,
        })) || [],
        commits: response.commits?.map((c: any) => ({
          sha: c.sha,
          message: c.commit?.message,
          author: c.commit?.author?.name,
          date: c.commit?.author?.date,
        })) || [],
      },
    };
  }

  // ==================== Actions Operations ====================

  /**
   * List workflows
   */
  private async listWorkflows(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;

    const response = await this.callApi(`/repos/${owner}/${repo}/actions/workflows`, 'GET');

    return {
      success: true,
      data: {
        workflows: response.workflows?.map((w: any) => ({
          id: w.id,
          name: w.name,
          path: w.path,
          state: w.state,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
          url: w.html_url,
          badgeUrl: w.badge_url,
        })) || [],
        count: response.total_count,
      },
    };
  }

  /**
   * Trigger workflow
   */
  private async triggerWorkflow(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const workflowId = this.config.workflowId;
    const ref = this.config.ref || 'main';
    const inputs = this.config.inputs || {};

    if (!owner || !repo || !workflowId) {
      throw new Error('owner, repo, and workflowId are required');
    }

    const payload = {
      ref,
      inputs,
    };

    const response = await this.callApi(`/repos/${owner}/${repo}/actions/workflows/${workflowId}/dispatches`, 'POST', payload);

    return {
      success: true,
      data: {
        triggered: true,
        ref,
        inputs,
      },
    };
  }

  /**
   * List workflow runs
   */
  private async listWorkflowRuns(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;

    const response = await this.callApi(`/repos/${owner}/${repo}/actions/runs`, 'GET');

    return {
      success: true,
      data: {
        workflowRuns: response.workflow_runs?.map((wr: any) => ({
          id: wr.id,
          name: wr.name,
          status: wr.status,
          conclusion: wr.conclusion,
          event: wr.event,
          createdAt: wr.created_at,
          updatedAt: wr.updated_at,
          runNumber: wr.run_number,
          runUrl: wr.html_url,
          actor: wr.triggering_actor?.login,
          headBranch: wr.head_branch,
          headSha: wr.head_sha,
        })) || [],
        count: response.total_count,
      },
    };
  }

  /**
   * Get workflow run
   */
  private async getWorkflowRun(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const runId = this.config.runId;

    if (!owner || !repo || !runId) {
      throw new Error('owner, repo, and runId are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/actions/runs/${runId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        name: response.name,
        status: response.status,
        conclusion: response.conclusion,
        event: response.event,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        runNumber: response.run_number,
        runUrl: response.html_url,
        actor: response.triggering_actor?.login,
        headBranch: response.head_branch,
        headSha: response.head_sha,
        jobs: response.jobs?.map((j: any) => ({
          id: j.id,
          name: j.name,
          status: j.status,
          conclusion: j.conclusion,
          startedAt: j.started_at,
          completedAt: j.completed_at,
        })) || [],
      },
    };
  }

  /**
   * Rerun workflow
   */
  private async rerunWorkflow(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const runId = this.config.runId;

    if (!owner || !repo || !runId) {
      throw new Error('owner, repo, and runId are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/actions/runs/${runId}/rerun`, 'POST');

    return {
      success: true,
      data: {
        runId,
        rerun: true,
      },
    };
  }

  /**
   * Cancel workflow run
   */
  private async cancelWorkflowRun(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const runId = this.config.runId;

    if (!owner || !repo || !runId) {
      throw new Error('owner, repo, and runId are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/actions/runs/${runId}/cancel`, 'POST');

    return {
      success: true,
      data: {
        runId,
        cancelled: true,
      },
    };
  }

  /**
   * List workflow run artifacts
   */
  private async listWorkflowRunArtifacts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const runId = this.config.runId;

    if (!owner || !repo || !runId) {
      throw new Error('owner, repo, and runId are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`, 'GET');

    return {
      success: true,
      data: {
        artifacts: response.artifacts?.map((a: any) => ({
          id: a.id,
          name: a.name,
          sizeInBytes: a.size_in_bytes,
          createdAt: a.created_at,
          expired: a.expired,
          expiresAt: a.expires_at,
          archiveDownloadUrl: a.archive_download_url,
        })) || [],
        count: response.total_count,
      },
    };
  }

  /**
   * Download workflow run artifact
   */
  private async downloadWorkflowRunArtifact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const artifactId = this.config.artifactId;

    if (!owner || !repo || !artifactId) {
      throw new Error('owner, repo, and artifactId are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/actions/artifacts/${artifactId}/zip`, 'GET');

    return {
      success: true,
      data: {
        artifactId,
        archiveDownloadUrl: response.archive_download_url,
      },
    };
  }

  // ==================== Webhook Operations ====================

  /**
   * Create webhook
   */
  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const url = this.config.url;
    const contentType = this.config.contentType || 'json';
    const secret = this.config.secret;
    const events = this.config.events || ['push'];

    if (!owner || !repo || !url) {
      throw new Error('owner, repo, and url are required');
    }

    const payload: any = {
      name: 'web',
      active: true,
      events,
      config: {
        url,
        content_type: contentType,
      },
    };

    if (secret) {
      payload.config.secret = secret;
    }
    if (this.config.insecureSsl) {
      payload.config.insecure_ssl = true;
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/hooks`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        url: response.config.url,
        events: response.events,
        active: response.active,
        createdAt: response.created_at,
        created: true,
      },
    };
  }

  /**
   * List webhooks
   */
  private async listWebhooks(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;

    const response = await this.callApi(`/repos/${owner}/${repo}/hooks`, 'GET');

    return {
      success: true,
      data: {
        webhooks: response.map((w: any) => ({
          id: w.id,
          url: w.config.url,
          events: w.events,
          active: w.active,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Delete webhook
   */
  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const hookId = this.config.hookId;

    if (!owner || !repo || !hookId) {
      throw new Error('owner, repo, and hookId are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/hooks/${hookId}`, 'DELETE');

    return {
      success: true,
      data: {
        hookId,
        deleted: true,
      },
    };
  }

  /**
   * Ping webhook
   */
  private async pingWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const hookId = this.config.hookId;

    if (!owner || !repo || !hookId) {
      throw new Error('owner, repo, and hookId are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/hooks/${hookId}/pings`, 'POST');

    return {
      success: true,
      data: {
        hookId,
        pinged: true,
      },
    };
  }

  /**
   * Update webhook
   */
  private async updateWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const hookId = this.config.hookId;

    if (!owner || !repo || !hookId) {
      throw new Error('owner, repo, and hookId are required');
    }

    const payload: any = {};

    if (this.config.url !== undefined) {
      payload.config = { url: this.config.url };
    }
    if (this.config.events) {
      payload.events = this.config.events;
    }
    if (this.config.active !== undefined) {
      payload.active = this.config.active;
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/hooks/${hookId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        url: response.config.url,
        events: response.events,
        active: response.active,
        updated: true,
      },
    };
  }

  // ==================== Milestone Operations ====================

  /**
   * Get milestone
   */
  private async getMilestone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const milestoneNumber = this.config.milestoneNumber;

    if (!owner || !repo || !milestoneNumber) {
      throw new Error('owner, repo, and milestoneNumber are required');
    }

    const response = await this.callApi(`/repos/${owner}/${repo}/milestones/${milestoneNumber}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        description: response.description,
        state: response.state,
        openIssues: response.open_issues,
        closedIssues: response.closed_issues,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        closedAt: response.closed_at,
        dueOn: response.due_on,
      },
    };
  }

  /**
   * Create milestone
   */
  private async createMilestone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const title = this.config.title;
    const state = this.config.state || 'open';
    const description = this.config.description;
    const dueOn = this.config.dueOn;

    if (!owner || !repo || !title) {
      throw new Error('owner, repo, and title are required');
    }

    const payload: any = {
      title,
      state,
    };

    if (description) payload.description = description;
    if (dueOn) payload.due_on = dueOn;

    const response = await this.callApi(`/repos/${owner}/${repo}/milestones`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        state: response.state,
        createdAt: response.created_at,
        created: true,
      },
    };
  }

  /**
   * Update milestone
   */
  private async updateMilestone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const milestoneNumber = this.config.milestoneNumber;

    if (!owner || !repo || !milestoneNumber) {
      throw new Error('owner, repo, and milestoneNumber are required');
    }

    const payload: any = {};
    if (this.config.title !== undefined) payload.title = this.config.title;
    if (this.config.state) payload.state = this.config.state;
    if (this.config.description !== undefined) payload.description = this.config.description;
    if (this.config.dueOn !== undefined) payload.due_on = this.config.dueOn;
    if (this.config.state !== undefined) payload.state = this.config.state;

    const response = await this.callApi(`/repos/${owner}/${repo}/milestones/${milestoneNumber}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        number: response.number,
        title: response.title,
        state: response.state,
        updated: true,
      },
    };
  }

  /**
   * Delete milestone
   */
  private async deleteMilestone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const milestoneNumber = this.config.milestoneNumber;

    if (!owner || !repo || !milestoneNumber) {
      throw new Error('owner, repo, and milestoneNumber are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/milestones/${milestoneNumber}`, 'DELETE');

    return {
      success: true,
      data: {
        milestoneNumber,
        deleted: true,
      },
    };
  }

  /**
   * List milestones
   */
  private async listMilestones(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;
    const state = this.config.state || 'open'; // open, closed, all
    const sort = this.config.sort || 'due_on'; // due_on, completeness
    const direction = this.config.direction || 'asc'; // asc, desc

    const params = new URLSearchParams();
    params.set('state', state);
    params.set('sort', sort);
    params.set('direction', direction);

    const response = await this.callApi(`/repos/${owner}/${repo}/milestones?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        milestones: response.map((m: any) => ({
          id: m.id,
          number: m.number,
          title: m.title,
          description: m.description,
          state: m.state,
          openIssues: m.open_issues,
          closedIssues: m.closed_issues,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
          closedAt: m.closed_at,
          dueOn: m.due_on,
        })),
        count: response.length,
      },
    };
  }

  // ==================== User & Team Operations ====================

  /**
   * Get user
   */
  private async getUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.resolveValue(this.config.username, context);

    if (!username) {
      throw new Error('username is required');
    }

    const response = await this.callApi(`/users/${username}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        login: response.login,
        name: response.name,
        email: response.email,
        bio: response.bio,
        location: response.location,
        website: response.blog,
        avatarUrl: response.avatar_url,
        followers: response.followers,
        following: response.following,
        publicRepos: response.public_repos,
        publicGists: response.public_gists,
        type: response.type,
        createdAt: response.created_at,
        url: response.html_url,
      },
    };
  }

  /**
   * List users
   */
  private async listUsers(): Promise<NodeExecutionResult> {
    const since = this.config.since;
    const perPage = this.config.perPage || 30;

    const params = new URLSearchParams();
    params.set('per_page', String(perPage));
    if (since) params.set('since', String(since));

    const response = await this.callApi(`/users?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        users: response.map((u: any) => ({
          id: u.id,
          login: u.login,
          type: u.type,
          avatarUrl: u.avatar_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * List collaborators
   */
  private async listCollaborators(): Promise<NodeExecutionResult> {
    const owner = this.config.owner;
    const repo = this.config.repo;

    const response = await this.callApi(`/repos/${owner}/${repo}/collaborators`, 'GET');

    return {
      success: true,
      data: {
        collaborators: response.map((c: any) => ({
          login: c.login,
          id: c.id,
          type: c.type,
          permissions: c.permissions,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Add collaborator
   */
  private async addCollaborator(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const username = this.config.username;
    const permission = this.config.permission || 'write'; // pull, push, admin, maintain, triage

    if (!owner || !repo || !username) {
      throw new Error('owner, repo, and username are required');
    }

    const payload = {
      permission,
    };

    const response = await this.callApi(`/repos/${owner}/${repo}/collaborators/${username}`, 'PUT', payload);

    return {
      success: true,
      data: {
        login: response.login,
        id: response.id,
        permissions: response.permissions,
        added: true,
      },
    };
  }

  /**
   * Remove collaborator
   */
  private async removeCollaborator(context: ExecutionContext): Promise<NodeExecutionResult> {
    const owner = this.resolveValue(this.config.owner, context);
    const repo = this.resolveValue(this.config.repo, context);
    const username = this.config.username;

    if (!owner || !repo || !username) {
      throw new Error('owner, repo, and username are required');
    }

    await this.callApi(`/repos/${owner}/${repo}/collaborators/${username}`, 'DELETE');

    return {
      success: true,
      data: {
        username,
        removed: true,
      },
    };
  }

  /**
   * List teams
   */
  private async listTeams(): Promise<NodeExecutionResult> {
    const org = this.config.org;

    if (!org) {
      throw new Error('org is required');
    }

    const response = await this.callApi(`/orgs/${org}/teams`, 'GET');

    return {
      success: true,
      data: {
        teams: response.map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          description: t.description,
          permission: t.permission,
          privacy: t.privacy,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Get team
   */
  private async getTeam(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.config.teamId;

    if (!teamId) {
      throw new Error('teamId is required');
    }

    const response = await this.callApi(`/teams/${teamId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        name: response.name,
        slug: response.slug,
        description: response.description,
        permission: response.permission,
        privacy: response.privacy,
        membersCount: response.members_count,
        reposCount: response.repos_count,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
      },
    };
  }

  /**
   * List team members
   */
  private async listTeamMembers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.config.teamId;

    if (!teamId) {
      throw new Error('teamId is required');
    }

    const response = await this.callApi(`/teams/${teamId}/members`, 'GET');

    return {
      success: true,
      data: {
        members: response.map((m: any) => ({
          login: m.login,
          id: m.id,
          type: m.type,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Add team member
   */
  private async addTeamMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.config.teamId;
    const username = this.config.username;
    const role = this.config.role || 'member'; // member, maintainer

    if (!teamId || !username) {
      throw new Error('teamId and username are required');
    }

    const payload = { role };
    const response = await this.callApi(`/teams/${teamId}/memberships/${username}`, 'PUT', payload);

    return {
      success: true,
      data: {
        username,
        role: response.role,
        added: true,
      },
    };
  }

  /**
   * Remove team member
   */
  private async removeTeamMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const teamId = this.config.teamId;
    const username = this.config.username;

    if (!teamId || !username) {
      throw new Error('teamId and username are required');
    }

    await this.callApi(`/teams/${teamId}/memberships/${username}`, 'DELETE');

    return {
      success: true,
      data: {
        username,
        removed: true,
      },
    };
  }

  // ==================== Organization Operations ====================

  /**
   * List organizations
   */
  private async listOrganizations(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.resolveValue(this.config.username, context);

    const response = await this.callApi(`/users/${username}/orgs`, 'GET');

    return {
      success: true,
      data: {
        organizations: response.map((o: any) => ({
          id: o.id,
          login: o.login,
          description: o.description,
          avatarUrl: o.avatar_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * List organization members
   */
  private async listOrganizationMembers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const org = this.resolveValue(this.config.org, context);

    if (!org) {
      throw new Error('org is required');
    }

    const response = await this.callApi(`/orgs/${org}/members`, 'GET');

    return {
      success: true,
      data: {
        members: response.map((m: any) => ({
          login: m.login,
          id: m.id,
          type: m.type,
        })),
        count: response.length,
      },
    };
  }

  /**
   * List organization repos
   */
  private async listOrganizationRepos(context: ExecutionContext): Promise<NodeExecutionResult> {
    const org = this.resolveValue(this.config.org, context);
    const type = this.config.type || 'all'; // all, public, private, forks, sources, member

    if (!org) {
      throw new Error('org is required');
    }

    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);

    const response = await this.callApi(`/orgs/${org}/repos?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        repos: response.map((r: any) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          private: r.private,
          description: r.description,
        })),
        count: response.length,
      },
    };
  }

  // ==================== Gist Operations ====================

  /**
   * Get gist
   */
  private async getGist(context: ExecutionContext): Promise<NodeExecutionResult> {
    const gistId = this.config.gistId;

    if (!gistId) {
      throw new Error('gistId is required');
    }

    const response = await this.callApi(`/gists/${gistId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        description: response.description,
        public: response.public,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        comments: response.comments,
        owner: response.owner?.login,
        files: Object.keys(response.files || {}).map((key) => ({
          filename: key,
          size: response.files[key].size,
          type: response.files[key].type,
          language: response.files[key].language,
          rawUrl: response.files[key].raw_url,
        })),
        url: response.html_url,
      },
    };
  }

  /**
   * Create gist
   */
  private async createGist(context: ExecutionContext): Promise<NodeExecutionResult> {
    const description = this.config.description || '';
    const publicGist = this.config.public !== false;
    const files = this.config.files;

    if (!files || Object.keys(files).length === 0) {
      throw new Error('files are required');
    }

    const payload = {
      description,
      public: publicGist,
      files,
    };

    const response = await this.callApi('/gists', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        description: response.description,
        public: response.public,
        createdAt: response.created_at,
        url: response.html_url,
        created: true,
      },
    };
  }

  /**
   * List gists
   */
  private async listGists(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.resolveValue(this.config.username, context);

    const response = await this.callApi(`/users/${username}/gists`, 'GET');

    return {
      success: true,
      data: {
        gists: response.map((g: any) => ({
          id: g.id,
          description: g.description,
          public: g.public,
          createdAt: g.created_at,
          updatedAt: g.updated_at,
          comments: g.comments,
          files: Object.keys(g.files || {}),
          url: g.html_url,
        })),
        count: response.length,
      },
    };
  }

  /**
   * Update gist
   */
  private async updateGist(context: ExecutionContext): Promise<NodeExecutionResult> {
    const gistId = this.config.gistId;
    const description = this.config.description;
    const files = this.config.files;

    if (!gistId) {
      throw new Error('gistId is required');
    }

    const payload: any = {};
    if (description !== undefined) payload.description = description;
    if (files) payload.files = files;

    const response = await this.callApi(`/gists/${gistId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        description: response.description,
        updatedAt: response.updated_at,
        updated: true,
      },
    };
  }

  /**
   * Delete gist
   */
  private async deleteGist(context: ExecutionContext): Promise<NodeExecutionResult> {
    const gistId = this.config.gistId;

    if (!gistId) {
      throw new Error('gistId is required');
    }

    await this.callApi(`/gists/${gistId}`, 'DELETE');

    return {
      success: true,
      data: {
        gistId,
        deleted: true,
      },
    };
  }

  /**
   * Star gist
   */
  private async starGist(context: ExecutionContext): Promise<NodeExecutionResult> {
    const gistId = this.config.gistId;

    if (!gistId) {
      throw new Error('gistId is required');
    }

    await this.callApi(`/gists/${gistId}/star`, 'PUT');

    return {
      success: true,
      data: {
        gistId,
        starred: true,
      },
    };
  }

  /**
   * Unstar gist
   */
  private async unstarGist(context: ExecutionContext): Promise<NodeExecutionResult> {
    const gistId = this.config.gistId;

    if (!gistId) {
      throw new Error('gistId is required');
    }

    await this.callApi(`/gists/${gistId}/star`, 'DELETE');

    return {
      success: true,
      data: {
        gistId,
        unstarred: true,
      },
    };
  }

  // ==================== Search Operations ====================

  /**
   * Search repositories
   */
  private async searchRepositories(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const sort = this.config.sort || 'best-match'; // stars, forks, help-wanted-issues, best-match
    const order = this.config.order || 'desc'; // asc, desc
    const perPage = this.config.perPage || 30;

    if (!query) {
      throw new Error('query is required');
    }

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('sort', sort);
    params.set('order', order);
    params.set('per_page', String(perPage));

    const response = await this.callApi(`/search/repositories?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        repositories: response.items?.map((r: any) => ({
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          private: r.private,
          description: r.description,
          language: r.language,
          stars: r.stargazers_count,
          forks: r.forks_count,
          openIssues: r.open_issues_count,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          url: r.html_url,
        })) || [],
        count: response.total_count,
      },
    };
  }

  /**
   * Search code
   */
  private async searchCode(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const sort = this.config.sort || 'indexed'; // indexed
    const order = this.config.order || 'desc'; // asc, desc
    const perPage = this.config.perPage || 30;

    if (!query) {
      throw new Error('query is required');
    }

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('sort', sort);
    params.set('order', order);
    params.set('per_page', String(perPage));

    const response = await this.callApi(`/search/code?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        results: response.items?.map((item: any) => ({
          name: item.name,
          path: item.path,
          score: item.score,
          repository: {
            name: item.repository?.full_name,
            url: item.repository?.html_url,
          },
        })) || [],
        count: response.total_count,
      },
    };
  }

  /**
   * Search issues
   */
  private async searchIssues(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const sort = this.config.sort || 'comments'; // comments, created, updated
    const order = this.config.order || 'desc'; // asc, desc
    const perPage = this.config.perPage || 30;

    if (!query) {
      throw new Error('query is required');
    }

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('sort', sort);
    params.set('order', order);
    params.set('per_page', String(perPage));

    const response = await this.callApi(`/search/issues?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        issues: response.items?.map((i: any) => ({
          id: i.id,
          number: i.number,
          title: i.title,
          state: i.state,
          author: i.user?.login,
          repository: i.repository?.full_name,
          labels: i.labels?.map((l: any) => ({ name: l.name, color: l.color })) || [],
          createdAt: i.created_at,
          updatedAt: i.updated_at,
          url: i.html_url,
        })) || [],
        count: response.total_count,
      },
    };
  }

  /**
   * Search users
   */
  private async searchUsers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const sort = this.config.sort || 'best-match'; // followers, repositories, best-match
    const order = this.config.order || 'desc'; // asc, desc
    const perPage = this.config.perPage || 30;

    if (!query) {
      throw new Error('query is required');
    }

    const params = new URLSearchParams();
    params.set('q', query);
    params.set('sort', sort);
    params.set('order', order);
    params.set('per_page', String(perPage));

    const response = await this.callApi(`/search/users?${params.toString()}`, 'GET');

    return {
      success: true,
      data: {
        users: response.items?.map((u: any) => ({
          id: u.id,
          login: u.login,
          type: u.type,
          score: u.score,
          avatarUrl: u.avatar_url,
          url: u.html_url,
        })) || [],
        count: response.total_count,
      },
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Call GitHub API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: { ...this.headers },
    };

    if (payload && method !== 'GET') {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    // Return empty object for 204 No Content
    if (response.status === 204) {
      return {};
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
    if (error.message?.includes('Bad credentials') || error.status === 401) {
      return 'Authentication failed. Check your access token.';
    }
    if (error.message?.includes('Not Found') || error.status === 404) {
      return 'Resource not found. Check the owner, repo, and ID.';
    }
    if (error.message?.includes('Forbidden') || error.status === 403) {
      return 'Access denied. Check your permissions.';
    }
    if (error.message?.includes('Repository access blocked')) {
      return 'Repository access blocked. You may need to authorize access.';
    }
    if (error.message?.includes('Validation failed')) {
      return 'Validation failed. Check your input data.';
    }
    if (error.message?.includes('Resource protected')) {
      return 'Resource is protected. Enable branch protection or required checks.';
    }
    if (error.message?.includes('Failed to create') || error.message?.includes('merge')) {
      return 'Merge failed. The PR may have conflicts or requirements not met.';
    }
    if (error.message?.includes('rate limit exceeded') || error.status === 403) {
      return 'Rate limit exceeded. Try again later.';
    }
    return `GitHub API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'gitHub';
  }

  getIcon(): string {
    return 'Github';
  }

  /**
   * Test GitHub connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.callApi('/user', 'GET');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * GitHub webhook event types
   */
  static readonly WebhookEvents = {
    PUSH: 'push',
    PULL_REQUEST: 'pull_request',
    PULL_REQUEST_REVIEW: 'pull_request_review',
    ISSUES: 'issues',
    ISSUE_COMMENT: 'issue_comment',
    CREATE: 'create',
    DELETE: 'delete',
    RELEASE: 'release',
    WATCH: 'watch',
    FORK: 'fork',
    STATUS: 'status',
    DEPLOYMENT: 'deployment',
    DEPLOYMENT_STATUS: 'deployment_status',
    WORKFLOW_RUN: 'workflow_run',
    WORKFLOW_DISPATCH: 'workflow_dispatch',
    REPOSITORY_DISPATCH: 'repository_dispatch',
    MILESTONE: 'milestone',
    GOLLUM: 'gollum',
    MEMBER: 'member',
    PUBLIC: 'public',
  };

  /**
   * Create repository topics
   */
  static createTopics(topics: string[]): any {
    return {
      names: topics,
    };
  }

  /**
   * Create auto-link reference
   */
  static createAutoLink(keyPrefix: string, urlTemplate: string): any {
    return {
      key_prefix: keyPrefix,
      url_template: urlTemplate,
    };
  }

  /**
   * Merge methods
   */
  static readonly MergeMethods = {
    MERGE: 'merge',
    SQUASH: 'squash',
    REBASE: 'rebase',
  };

  /**
   * Issue/PR states
   */
  static readonly States = {
    OPEN: 'open',
    CLOSED: 'closed',
    ALL: 'all',
  };

  /**
   * Branch protection defaults
   */
  static createBranchProtection(config?: {
    requireLinearHistory?: boolean;
    allowForcePushes?: boolean;
    requireConversationResolution?: boolean;
  }): any {
    const protection: any = {
      required_status_checks: null,
      enforce_admins: config?.requireConversationResolution || false,
      required_pull_request_reviews: config?.requireConversationResolution ? {
        require_code_owner_reviews: true,
      } : null,
      restrictions: null,
      allow_force_pushes: config?.allowForcePushes || false,
    };

    if (config?.requireLinearHistory) {
      protection.required_linear_history = {
        enabled: true,
      };
    }

    return protection;
  }
}
