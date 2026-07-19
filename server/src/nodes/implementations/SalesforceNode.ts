import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Salesforce Node - Salesforce REST API
 * n8n-compatible: Complete Salesforce REST API integration
 *
 * Configuration:
 * - operation: 'query' | 'create' | 'update' | 'upsert' | 'delete' | 'getRecord' | 'getRecords' | 'describe' |
 *              'createLead' | 'getLead' | 'updateLead' | 'deleteLead' | 'convertLead' | 'findLeads' |
 *              'createAccount' | 'getAccount' | 'updateAccount' | 'deleteAccount' | 'listAccounts' |
 *              'createContact' | 'getContact' | 'updateContact' | 'deleteContact' | 'listContacts' |
 *              'createOpportunity' | 'getOpportunity' | 'updateOpportunity' | 'deleteOpportunity' | 'listOpportunities' |
 *              'createCase' | 'getCase' | 'updateCase' | 'deleteCase' | 'listCases' |
 *              'createTask' | 'getTask' | 'updateTask' | 'deleteTask' | 'listTasks' |
 *              'createEvent' | 'getEvent' | 'updateEvent' | 'deleteEvent' | 'listEvents' |
 *              'attachFile' | 'getAttachment' | 'deleteAttachment' | 'listAttachments'
 * - instanceUrl: Salesforce instance URL (e.g., 'https://yourdomain.my.salesforce.com')
 * - accessToken: Salesforce OAuth access token
 * - apiVersion: Salesforce API version (default: '59.0')
 *
 * SOQL Query Operations:
 * - query: SOQL query string
 * - queryAll: Include deleted records
 * - queryMore: Continue query with nextRecordsUrl
 *
 * Record Operations:
 * - sobject: Object type (Account, Contact, Lead, etc.)
 * - recordId: Record ID
 * - externalId: External ID field for upsert
 * - data: Record data object
 */
export class SalesforceNode extends BaseNode {
  private apiBaseUrl: string;
  private accessToken: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    const instanceUrl = config.instanceUrl || '';
    const apiVersion = config.apiVersion || '59.0';
    this.apiBaseUrl = `${instanceUrl}/services/data/v${apiVersion}`;
    this.accessToken = config.accessToken || '';
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.apiBaseUrl.includes('.salesforce.com')) {
      throw new Error('Valid instanceUrl is required (e.g., https://yourdomain.my.salesforce.com)');
    }

    if (!this.accessToken) {
      throw new Error('Salesforce access token is required');
    }

    const validOperations = [
      'query', 'queryAll', 'queryMore', 'create', 'update', 'upsert', 'delete', 'getRecord', 'getRecords', 'describe',
      'createLead', 'getLead', 'updateLead', 'deleteLead', 'convertLead', 'findLeads',
      'createAccount', 'getAccount', 'updateAccount', 'deleteAccount', 'listAccounts',
      'createContact', 'getContact', 'updateContact', 'deleteContact', 'listContacts',
      'createOpportunity', 'getOpportunity', 'updateOpportunity', 'deleteOpportunity', 'listOpportunities',
      'createCase', 'getCase', 'updateCase', 'deleteCase', 'listCases',
      'createTask', 'getTask', 'updateTask', 'deleteTask', 'listTasks',
      'createEvent', 'getEvent', 'updateEvent', 'deleteEvent', 'listEvents',
      'attachFile', 'getAttachment', 'deleteAttachment', 'listAttachments',
    ];

    const operation = this.config.operation || 'query';

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'query';

      switch (operation) {
        // Generic Operations
        case 'query':
          return await this.query();
        case 'queryAll':
          return await this.queryAll();
        case 'queryMore':
          return await this.queryMore();
        case 'create':
          return await this.create(context);
        case 'update':
          return await this.update(context);
        case 'upsert':
          return await this.upsert(context);
        case 'delete':
          return await this.delete(context);
        case 'getRecord':
          return await this.getRecord(context);
        case 'getRecords':
          return await this.getRecords();
        case 'describe':
          return await this.describe();

        // Lead Operations
        case 'createLead':
          return await this.createLead(context);
        case 'getLead':
          return await this.getLead(context);
        case 'updateLead':
          return await this.updateLead(context);
        case 'deleteLead':
          return await this.deleteLead(context);
        case 'convertLead':
          return await this.convertLead(context);
        case 'findLeads':
          return await this.findLeads();

        // Account Operations
        case 'createAccount':
          return await this.createAccount(context);
        case 'getAccount':
          return await this.getAccount(context);
        case 'updateAccount':
          return await this.updateAccount(context);
        case 'deleteAccount':
          return await this.deleteAccount(context);
        case 'listAccounts':
          return await this.listAccounts();

        // Contact Operations
        case 'createContact':
          return await this.createContact(context);
        case 'getContact':
          return await this.getContact(context);
        case 'updateContact':
          return await this.updateContact(context);
        case 'deleteContact':
          return await this.deleteContact(context);
        case 'listContacts':
          return await this.listContacts();

        // Opportunity Operations
        case 'createOpportunity':
          return await this.createOpportunity(context);
        case 'getOpportunity':
          return await this.getOpportunity(context);
        case 'updateOpportunity':
          return await this.updateOpportunity(context);
        case 'deleteOpportunity':
          return await this.deleteOpportunity(context);
        case 'listOpportunities':
          return await this.listOpportunities();

        // Case Operations
        case 'createCase':
          return await this.createCase(context);
        case 'getCase':
          return await this.getCase(context);
        case 'updateCase':
          return await this.updateCase(context);
        case 'deleteCase':
          return await this.deleteCase(context);
        case 'listCases':
          return await this.listCases();

        // Task Operations
        case 'createTask':
          return await this.createTask(context);
        case 'getTask':
          return await this.getTask(context);
        case 'updateTask':
          return await this.updateTask(context);
        case 'deleteTask':
          return await this.deleteTask(context);
        case 'listTasks':
          return await this.listTasks();

        // Event Operations
        case 'createEvent':
          return await this.createEvent(context);
        case 'getEvent':
          return await this.getEvent(context);
        case 'updateEvent':
          return await this.updateEvent(context);
        case 'deleteEvent':
          return await this.deleteEvent(context);
        case 'listEvents':
          return await this.listEvents();

        // Attachment Operations
        case 'attachFile':
          return await this.attachFile(context);
        case 'getAttachment':
          return await this.getAttachment(context);
        case 'deleteAttachment':
          return await this.deleteAttachment(context);
        case 'listAttachments':
          return await this.listAttachments(context);

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
   * Execute SOQL query
   */
  private async query(): Promise<NodeExecutionResult> {
    const soql = this.config.query;

    if (!soql) {
      throw new Error('SOQL query is required');
    }

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        records: response.records,
        totalSize: response.totalSize,
        done: response.done,
        nextRecordsUrl: response.nextRecordsUrl || null,
      },
    };
  }

  /**
   * Execute SOQL query including deleted records
   */
  private async queryAll(): Promise<NodeExecutionResult> {
    const soql = this.config.query;

    if (!soql) {
      throw new Error('SOQL query is required');
    }

    const response = await this.callApi(`queryAll?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        records: response.records,
        totalSize: response.totalSize,
        done: response.done,
        nextRecordsUrl: response.nextRecordsUrl || null,
      },
    };
  }

  /**
   * Query more results
   */
  private async queryMore(): Promise<NodeExecutionResult> {
    const nextRecordsUrl = this.config.nextRecordsUrl;

    if (!nextRecordsUrl) {
      throw new Error('nextRecordsUrl is required');
    }

    // Remove the base URL if included
    const url = nextRecordsUrl.startsWith('/services/data/')
      ? nextRecordsUrl
      : nextRecordsUrl.replace(this.apiBaseUrl, '');

    const response = await this.callApi(url.replace(/^\//, ''));

    return {
      success: true,
      data: {
        records: response.records,
        totalSize: response.totalSize,
        done: response.done,
        nextRecordsUrl: response.nextRecordsUrl || null,
      },
    };
  }

  /**
   * Create a record
   */
  private async create(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sobject = this.config.sobject;
    const data = this.resolveValue(this.config.data, context);

    if (!sobject) {
      throw new Error('sobject (object type) is required');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('data object is required');
    }

    const response = await this.callApi(`sobjects/${sobject}`, 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
        errors: response.errors,
      },
    };
  }

  /**
   * Update a record
   */
  private async update(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sobject = this.config.sobject;
    const recordId = this.resolveValue(this.config.recordId, context);
    const data = this.resolveValue(this.config.data, context);

    if (!sobject) {
      throw new Error('sobject (object type) is required');
    }

    if (!recordId) {
      throw new Error('recordId is required');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('data object is required');
    }

    await this.callApi(`sobjects/${sobject}/${recordId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: recordId,
        updated: true,
      },
    };
  }

  /**
   * Upsert a record
   */
  private async upsert(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sobject = this.config.sobject;
    const externalId = this.config.externalId;
    const externalIdField = this.config.externalIdField;
    const data = this.resolveValue(this.config.data, context);

    if (!sobject) {
      throw new Error('sobject (object type) is required');
    }

    if (!externalId) {
      throw new Error('externalId is required');
    }

    if (!externalIdField) {
      throw new Error('externalIdField is required');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('data object is required');
    }

    const response = await this.callApi(`sobjects/${sobject}/${externalIdField}/${externalId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: response.id,
        created: response.created,
      },
    };
  }

  /**
   * Delete a record
   */
  private async delete(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sobject = this.config.sobject;
    const recordId = this.resolveValue(this.config.recordId, context);

    if (!sobject) {
      throw new Error('sobject (object type) is required');
    }

    if (!recordId) {
      throw new Error('recordId is required');
    }

    await this.callApi(`sobjects/${sobject}/${recordId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: recordId,
        deleted: true,
      },
    };
  }

  /**
   * Get a single record
   */
  private async getRecord(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sobject = this.config.sobject;
    const recordId = this.resolveValue(this.config.recordId, context);
    const fields = this.config.fields;

    if (!sobject) {
      throw new Error('sobject (object type) is required');
    }

    if (!recordId) {
      throw new Error('recordId is required');
    }

    let url = `sobjects/${sobject}/${recordId}`;
    if (fields) {
      url += `?fields=${Array.isArray(fields) ? fields.join(',') : fields}`;
    }

    const record = await this.callApi(url);

    return {
      success: true,
      data: record,
    };
  }

  /**
   * Get records for an object
   */
  private async getRecords(): Promise<NodeExecutionResult> {
    const sobject = this.config.sobject;
    const fields = this.config.fields || ['Id'];
    const limit = this.config.limit || 100;
    const orderBy = this.config.orderBy;
    const sortOrder = this.config.sortOrder || 'ASC';
    const where = this.config.where;

    if (!sobject) {
      throw new Error('sobject (object type) is required');
    }

    let soql = `SELECT ${Array.isArray(fields) ? fields.join(', ') : fields} FROM ${sobject}`;

    if (where) {
      soql += ` WHERE ${where}`;
    }

    if (orderBy) {
      soql += ` ORDER BY ${orderBy} ${sortOrder}`;
    }

    soql += ` LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        records: response.records,
        totalSize: response.totalSize,
        done: response.done,
      },
    };
  }

  /**
   * Describe an object
   */
  private async describe(): Promise<NodeExecutionResult> {
    const sobject = this.config.sobject;

    if (!sobject) {
      throw new Error('sobject (object type) is required');
    }

    const describe = await this.callApi(`sobjects/${sobject}/describe`);

    return {
      success: true,
      data: {
        name: describe.name,
        label: describe.label,
        fields: describe.fields.map((f: any) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          length: f.length,
          nullable: f.nillable,
          updateable: f.updateable,
          createable: f.createable,
          defaultedOnCreate: f.defaultedOnCreate,
        })),
        recordTypeInfos: describe.recordTypeInfos,
      },
    };
  }

  /**
   * Create a lead
   */
  private async createLead(context: ExecutionContext): Promise<NodeExecutionResult> {
    const firstName = this.resolveValue(this.config.firstName, context);
    const lastName = this.resolveValue(this.config.lastName, context);
    const company = this.resolveValue(this.config.company, context);
    const email = this.resolveValue(this.config.email, context);
    const phone = this.resolveValue(this.config.phone, context);
    const website = this.resolveValue(this.config.website, context);
    const description = this.resolveValue(this.config.description, context);
    const status = this.resolveValue(this.config.status, context);
    const rating = this.resolveValue(this.config.rating, context);
    const annualRevenue = this.config.annualRevenue;
    const numberOfEmployees = this.config.numberOfEmployees;
    const industry = this.resolveValue(this.config.industry, context);
    const leadSource = this.resolveValue(this.config.leadSource, context);

    if (!lastName) {
      throw new Error('lastName is required');
    }

    if (!company) {
      throw new Error('company is required');
    }

    const data: any = {
      LastName: lastName,
      Company: company,
    };

    if (firstName) data.FirstName = firstName;
    if (email) data.Email = email;
    if (phone) data.Phone = phone;
    if (website) data.Website = website;
    if (description) data.Description = description;
    if (status) data.Status = status;
    if (rating) data.Rating = rating;
    if (annualRevenue) data.AnnualRevenue = annualRevenue;
    if (numberOfEmployees) data.NumberOfEmployees = numberOfEmployees;
    if (industry) data.Industry = industry;
    if (leadSource) data.LeadSource = leadSource;

    const response = await this.callApi('sobjects/Lead', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get a lead
   */
  private async getLead(context: ExecutionContext): Promise<NodeExecutionResult> {
    const leadId = this.resolveValue(this.config.leadId, context) || this.resolveValue(this.config.recordId, context);

    if (!leadId) {
      throw new Error('leadId is required');
    }

    const lead = await this.callApi(`sobjects/Lead/${leadId}`);

    return {
      success: true,
      data: {
        id: lead.Id,
        firstName: lead.FirstName,
        lastName: lead.LastName,
        email: lead.Email,
        phone: lead.Phone,
        company: lead.Company,
        status: lead.Status,
        isConverted: lead.IsConverted,
        convertedDate: lead.ConvertedDate,
        createdDate: lead.CreatedDate,
      },
    };
  }

  /**
   * Update a lead
   */
  private async updateLead(context: ExecutionContext): Promise<NodeExecutionResult> {
    const leadId = this.resolveValue(this.config.leadId, context) || this.resolveValue(this.config.recordId, context);
    const lastName = this.config.lastName;
    const firstName = this.config.firstName;
    const email = this.config.email;
    const phone = this.config.phone;
    const company = this.config.company;
    const status = this.config.status;
    const description = this.config.description;
    const rating = this.config.rating;

    if (!leadId) {
      throw new Error('leadId is required');
    }

    const data: any = {};
    if (lastName) data.LastName = lastName;
    if (firstName) data.FirstName = firstName;
    if (email) data.Email = email;
    if (phone) data.Phone = phone;
    if (company) data.Company = company;
    if (status) data.Status = status;
    if (description) data.Description = description;
    if (rating) data.Rating = rating;

    await this.callApi(`sobjects/Lead/${leadId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: leadId,
        updated: true,
      },
    };
  }

  /**
   * Delete a lead
   */
  private async deleteLead(context: ExecutionContext): Promise<NodeExecutionResult> {
    const leadId = this.resolveValue(this.config.leadId, context) || this.resolveValue(this.config.recordId, context);

    if (!leadId) {
      throw new Error('leadId is required');
    }

    await this.callApi(`sobjects/Lead/${leadId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: leadId,
        deleted: true,
      },
    };
  }

  /**
   * Convert a lead
   */
  private async convertLead(context: ExecutionContext): Promise<NodeExecutionResult> {
    const leadId = this.resolveValue(this.config.leadId, context);
    const ownerId = this.resolveValue(this.config.ownerId, context);
    const convertedStatus = this.resolveValue(this.config.convertedStatus, context);
    const doNotCreateOpportunity = this.config.doNotCreateOpportunity;
    const opportunityName = this.resolveValue(this.config.opportunityName, context);
    const accountId = this.resolveValue(this.config.accountId, context);
    const contactId = this.resolveValue(this.config.contactId, context);
    const sendEmailToOwner = this.config.sendEmailToOwner;

    if (!leadId) {
      throw new Error('leadId is required');
    }

    const data: any = {
      leadId: leadId.substring(0, 3) === '00Q' ? leadId : `00Q${leadId}`,
    };

    if (ownerId) data.ownerId = ownerId;
    if (convertedStatus) data.convertedStatus = convertedStatus;
    if (doNotCreateOpportunity !== undefined) data.doNotCreateOpportunity = doNotCreateOpportunity;
    if (opportunityName) data.opportunityName = opportunityName;
    if (accountId) data.accountId = accountId;
    if (contactId) data.contactId = contactId;
    if (sendEmailToOwner !== undefined) data.sendEmailToOwner = sendEmailToOwner;

    const response = await this.callApi('leads/convert', 'POST', data);

    return {
      success: true,
      data: {
        leadId: response.leadId,
        accountId: response.accountId,
        contactId: response.contactId,
        opportunityId: response.opportunityId,
        success: response.success,
      },
    };
  }

  /**
   * Find leads by query
   */
  private async findLeads(): Promise<NodeExecutionResult> {
    const where = this.config.where;
    const limit = this.config.limit || 100;

    let soql = 'SELECT Id, FirstName, LastName, Email, Phone, Company, Status, IsConverted, CreatedDate FROM Lead';

    if (where) {
      soql += ` WHERE ${where}`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        leads: response.records.map((r: any) => ({
          id: r.Id,
          firstName: r.FirstName,
          lastName: r.LastName,
          email: r.Email,
          phone: r.Phone,
          company: r.Company,
          status: r.Status,
          isConverted: r.IsConverted,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Create an account
   */
  private async createAccount(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const type = this.resolveValue(this.config.type, context);
    const industry = this.resolveValue(this.config.industry, context);
    const billingStreet = this.resolveValue(this.config.billingStreet, context);
    const billingCity = this.resolveValue(this.config.billingCity, context);
    const billingState = this.resolveValue(this.config.billingState, context);
    const billingPostalCode = this.resolveValue(this.config.billingPostalCode, context);
    const billingCountry = this.resolveValue(this.config.billingCountry, context);
    const website = this.resolveValue(this.config.website, context);
    const phone = this.resolveValue(this.config.phone, context);
    const description = this.resolveValue(this.config.description, context);
    const numberOfEmployees = this.config.numberOfEmployees;
    const annualRevenue = this.config.annualRevenue;

    if (!name) {
      throw new Error('name is required');
    }

    const data: any = {
      Name: name,
    };

    if (type) data.Type = type;
    if (industry) data.Industry = industry;
    if (billingStreet) data.BillingStreet = billingStreet;
    if (billingCity) data.BillingCity = billingCity;
    if (billingState) data.BillingState = billingState;
    if (billingPostalCode) data.BillingPostalCode = billingPostalCode;
    if (billingCountry) data.BillingCountry = billingCountry;
    if (website) data.Website = website;
    if (phone) data.Phone = phone;
    if (description) data.Description = description;
    if (numberOfEmployees) data.NumberOfEmployees = numberOfEmployees;
    if (annualRevenue) data.AnnualRevenue = annualRevenue;

    const response = await this.callApi('sobjects/Account', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get an account
   */
  private async getAccount(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.resolveValue(this.config.accountId, context) || this.resolveValue(this.config.recordId, context);

    if (!accountId) {
      throw new Error('accountId is required');
    }

    const account = await this.callApi(`sobjects/Account/${accountId}`);

    return {
      success: true,
      data: {
        id: account.Id,
        name: account.Name,
        type: account.Type,
        industry: account.Industry,
        website: account.Website,
        phone: account.Phone,
        numberOfEmployees: account.NumberOfEmployees,
        annualRevenue: account.AnnualRevenue,
        billingAddress: {
          street: account.BillingStreet,
          city: account.BillingCity,
          state: account.BillingState,
          postalCode: account.BillingPostalCode,
          country: account.BillingCountry,
        },
        createdDate: account.CreatedDate,
      },
    };
  }

  /**
   * Update an account
   */
  private async updateAccount(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.resolveValue(this.config.accountId, context) || this.resolveValue(this.config.recordId, context);
    const name = this.config.name;
    const type = this.config.type;
    const industry = this.config.industry;
    const website = this.config.website;
    const phone = this.config.phone;
    const description = this.config.description;

    if (!accountId) {
      throw new Error('accountId is required');
    }

    const data: any = {};
    if (name) data.Name = name;
    if (type) data.Type = type;
    if (industry) data.Industry = industry;
    if (website) data.Website = website;
    if (phone) data.Phone = phone;
    if (description) data.Description = description;

    await this.callApi(`sobjects/Account/${accountId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: accountId,
        updated: true,
      },
    };
  }

  /**
   * Delete an account
   */
  private async deleteAccount(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.resolveValue(this.config.accountId, context) || this.resolveValue(this.config.recordId, context);

    if (!accountId) {
      throw new Error('accountId is required');
    }

    await this.callApi(`sobjects/Account/${accountId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: accountId,
        deleted: true,
      },
    };
  }

  /**
   * List accounts
   */
  private async listAccounts(): Promise<NodeExecutionResult> {
    const where = this.config.where;
    const limit = this.config.limit || 100;

    let soql = 'SELECT Id, Name, Type, Industry, Website, Phone, BillingCity, BillingState, BillingCountry, CreatedDate FROM Account';

    if (where) {
      soql += ` WHERE ${where}`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        accounts: response.records.map((r: any) => ({
          id: r.Id,
          name: r.Name,
          type: r.Type,
          industry: r.Industry,
          website: r.Website,
          phone: r.Phone,
          billingCity: r.BillingCity,
          billingState: r.BillingState,
          billingCountry: r.BillingCountry,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Create a contact
   */
  private async createContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const firstName = this.resolveValue(this.config.firstName, context);
    const lastName = this.resolveValue(this.config.lastName, context);
    const accountId = this.resolveValue(this.config.accountId, context);
    const email = this.resolveValue(this.config.email, context);
    const phone = this.resolveValue(this.config.phone, context);
    const mobilePhone = this.resolveValue(this.config.mobilePhone, context);
    const title = this.resolveValue(this.config.title, context);
    const department = this.resolveValue(this.config.department, context);
    const mailingStreet = this.resolveValue(this.config.mailingStreet, context);
    const mailingCity = this.resolveValue(this.config.mailingCity, context);
    const mailingState = this.resolveValue(this.config.mailingState, context);
    const mailingPostalCode = this.resolveValue(this.config.mailingPostalCode, context);
    const mailingCountry = this.resolveValue(this.config.mailingCountry, context);
    const description = this.resolveValue(this.config.description, context);

    if (!lastName) {
      throw new Error('lastName is required');
    }

    const data: any = {
      LastName: lastName,
    };

    if (firstName) data.FirstName = firstName;
    if (accountId) data.AccountId = accountId;
    if (email) data.Email = email;
    if (phone) data.Phone = phone;
    if (mobilePhone) data.MobilePhone = mobilePhone;
    if (title) data.Title = title;
    if (department) data.Department = department;
    if (mailingStreet) data.MailingStreet = mailingStreet;
    if (mailingCity) data.MailingCity = mailingCity;
    if (mailingState) data.MailingState = mailingState;
    if (mailingPostalCode) data.MailingPostalCode = mailingPostalCode;
    if (mailingCountry) data.MailingCountry = mailingCountry;
    if (description) data.Description = description;

    const response = await this.callApi('sobjects/Contact', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get a contact
   */
  private async getContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const contactId = this.resolveValue(this.config.contactId, context) || this.resolveValue(this.config.recordId, context);

    if (!contactId) {
      throw new Error('contactId is required');
    }

    const contact = await this.callApi(`sobjects/Contact/${contactId}`);

    return {
      success: true,
      data: {
        id: contact.Id,
        firstName: contact.FirstName,
        lastName: contact.LastName,
        accountId: contact.AccountId,
        email: contact.Email,
        phone: contact.Phone,
        mobilePhone: contact.MobilePhone,
        title: contact.Title,
        department: contact.Department,
        mailingAddress: {
          street: contact.MailingStreet,
          city: contact.MailingCity,
          state: contact.MailingState,
          postalCode: contact.MailingPostalCode,
          country: contact.MailingCountry,
        },
        createdDate: contact.CreatedDate,
      },
    };
  }

  /**
   * Update a contact
   */
  private async updateContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const contactId = this.resolveValue(this.config.contactId, context) || this.resolveValue(this.config.recordId, context);
    const lastName = this.config.lastName;
    const firstName = this.config.firstName;
    const email = this.config.email;
    const phone = this.config.phone;
    const title = this.config.title;
    const department = this.config.department;

    if (!contactId) {
      throw new Error('contactId is required');
    }

    const data: any = {};
    if (firstName) data.FirstName = firstName;
    if (lastName) data.LastName = lastName;
    if (email) data.Email = email;
    if (phone) data.Phone = phone;
    if (title) data.Title = title;
    if (department) data.Department = department;

    await this.callApi(`sobjects/Contact/${contactId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: contactId,
        updated: true,
      },
    };
  }

  /**
   * Delete a contact
   */
  private async deleteContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const contactId = this.resolveValue(this.config.contactId, context) || this.resolveValue(this.config.recordId, context);

    if (!contactId) {
      throw new Error('contactId is required');
    }

    await this.callApi(`sobjects/Contact/${contactId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: contactId,
        deleted: true,
      },
    };
  }

  /**
   * List contacts
   */
  private async listContacts(): Promise<NodeExecutionResult> {
    const where = this.config.where;
    const limit = this.config.limit || 100;

    let soql = 'SELECT Id, FirstName, LastName, Email, Phone, AccountId, Title, Department, CreatedDate FROM Contact';

    if (where) {
      soql += ` WHERE ${where}`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        contacts: response.records.map((r: any) => ({
          id: r.Id,
          firstName: r.FirstName,
          lastName: r.LastName,
          email: r.Email,
          phone: r.Phone,
          accountId: r.AccountId,
          title: r.Title,
          department: r.Department,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Create an opportunity
   */
  private async createOpportunity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const accountId = this.resolveValue(this.config.accountId, context);
    const amount = this.config.amount;
    const stageName = this.resolveValue(this.config.stageName, context);
    const closeDate = this.resolveValue(this.config.closeDate, context);
    const type = this.resolveValue(this.config.type, context);
    const leadSource = this.resolveValue(this.config.leadSource, context);
    const probability = this.config.probability;
    const description = this.resolveValue(this.config.description, context);

    if (!name) {
      throw new Error('name is required');
    }

    if (!accountId) {
      throw new Error('accountId is required');
    }

    if (!stageName) {
      throw new Error('stageName is required');
    }

    if (!closeDate) {
      throw new Error('closeDate is required');
    }

    const data: any = {
      Name: name,
      AccountId: accountId,
      StageName: stageName,
      CloseDate: closeDate,
    };

    if (amount) data.Amount = amount;
    if (type) data.Type = type;
    if (leadSource) data.LeadSource = leadSource;
    if (probability) data.Probability = probability;
    if (description) data.Description = description;

    const response = await this.callApi('sobjects/Opportunity', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get an opportunity
   */
  private async getOpportunity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const opportunityId = this.resolveValue(this.config.opportunityId, context) || this.resolveValue(this.config.recordId, context);

    if (!opportunityId) {
      throw new Error('opportunityId is required');
    }

    const opportunity = await this.callApi(`sobjects/Opportunity/${opportunityId}`);

    return {
      success: true,
      data: {
        id: opportunity.Id,
        name: opportunity.Name,
        accountId: opportunity.AccountId,
        amount: opportunity.Amount,
        stageName: opportunity.StageName,
        closeDate: opportunity.CloseDate,
        type: opportunity.Type,
        probability: opportunity.Probability,
        forecastCategory: opportunity.ForecastCategory,
        createdDate: opportunity.CreatedDate,
      },
    };
  }

  /**
   * Update an opportunity
   */
  private async updateOpportunity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const opportunityId = this.resolveValue(this.config.opportunityId, context) || this.resolveValue(this.config.recordId, context);
    const amount = this.config.amount;
    const stageName = this.config.stageName;
    const closeDate = this.config.closeDate;
    const probability = this.config.probability;
    const description = this.config.description;

    if (!opportunityId) {
      throw new Error('opportunityId is required');
    }

    const data: any = {};
    if (amount !== undefined) data.Amount = amount;
    if (stageName) data.StageName = stageName;
    if (closeDate) data.CloseDate = closeDate;
    if (probability !== undefined) data.Probability = probability;
    if (description) data.Description = description;

    await this.callApi(`sobjects/Opportunity/${opportunityId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: opportunityId,
        updated: true,
      },
    };
  }

  /**
   * Delete an opportunity
   */
  private async deleteOpportunity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const opportunityId = this.resolveValue(this.config.opportunityId, context) || this.resolveValue(this.config.recordId, context);

    if (!opportunityId) {
      throw new Error('opportunityId is required');
    }

    await this.callApi(`sobjects/Opportunity/${opportunityId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: opportunityId,
        deleted: true,
      },
    };
  }

  /**
   * List opportunities
   */
  private async listOpportunities(): Promise<NodeExecutionResult> {
    const where = this.config.where;
    const limit = this.config.limit || 100;

    let soql = 'SELECT Id, Name, AccountId, Amount, StageName, CloseDate, Type, Probability, CreatedDate FROM Opportunity';

    if (where) {
      soql += ` WHERE ${where}`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        opportunities: response.records.map((r: any) => ({
          id: r.Id,
          name: r.Name,
          accountId: r.AccountId,
          amount: r.Amount,
          stageName: r.StageName,
          closeDate: r.CloseDate,
          type: r.Type,
          probability: r.Probability,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Create a case
   */
  private async createCase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subject = this.resolveValue(this.config.subject, context);
    const accountId = this.resolveValue(this.config.accountId, context);
    const contactId = this.resolveValue(this.config.contactId, context);
    const description = this.resolveValue(this.config.description, context);
    const status = this.resolveValue(this.config.status, context);
    const priority = this.resolveValue(this.config.priority, context);
    const origin = this.resolveValue(this.config.origin, context);
    const type = this.resolveValue(this.config.type, context);
    const reason = this.resolveValue(this.config.reason, context);

    if (!subject) {
      throw new Error('subject is required');
    }

    const data: any = {
      Subject: subject,
    };

    if (accountId) data.AccountId = accountId;
    if (contactId) data.ContactId = contactId;
    if (description) data.Description = description;
    if (status) data.Status = status;
    if (priority) data.Priority = priority;
    if (origin) data.Origin = origin;
    if (type) data.Type = type;
    if (reason) data.Reason = reason;

    const response = await this.callApi('sobjects/Case', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get a case
   */
  private async getCase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const caseId = this.resolveValue(this.config.caseId, context) || this.resolveValue(this.config.recordId, context);

    if (!caseId) {
      throw new Error('caseId is required');
    }

    const caseData = await this.callApi(`sobjects/Case/${caseId}`);

    return {
      success: true,
      data: {
        id: caseData.Id,
        caseNumber: caseData.CaseNumber,
        subject: caseData.Subject,
        accountId: caseData.AccountId,
        contactId: caseData.ContactId,
        status: caseData.Status,
        priority: caseData.Priority,
        origin: caseData.Origin,
        type: caseData.Type,
        reason: caseData.Reason,
        description: caseData.Description,
        closedDate: caseData.ClosedDate,
        createdDate: caseData.CreatedDate,
      },
    };
  }

  /**
   * Update a case
   */
  private async updateCase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const caseId = this.resolveValue(this.config.caseId, context) || this.resolveValue(this.config.recordId, context);
    const status = this.config.status;
    const priority = this.config.priority;
    const description = this.config.description;
    const reason = this.config.reason;

    if (!caseId) {
      throw new Error('caseId is required');
    }

    const data: any = {};
    if (status) data.Status = status;
    if (priority) data.Priority = priority;
    if (description) data.Description = description;
    if (reason) data.Reason = reason;

    await this.callApi(`sobjects/Case/${caseId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: caseId,
        updated: true,
      },
    };
  }

  /**
   * Delete a case
   */
  private async deleteCase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const caseId = this.resolveValue(this.config.caseId, context) || this.resolveValue(this.config.recordId, context);

    if (!caseId) {
      throw new Error('caseId is required');
    }

    await this.callApi(`sobjects/Case/${caseId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: caseId,
        deleted: true,
      },
    };
  }

  /**
   * List cases
   */
  private async listCases(): Promise<NodeExecutionResult> {
    const where = this.config.where;
    const limit = this.config.limit || 100;

    let soql = 'SELECT Id, CaseNumber, Subject, Status, Priority, Origin, AccountId, ContactId, CreatedDate FROM Case';

    if (where) {
      soql += ` WHERE ${where}`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        cases: response.records.map((r: any) => ({
          id: r.Id,
          caseNumber: r.CaseNumber,
          subject: r.Subject,
          status: r.Status,
          priority: r.Priority,
          origin: r.Origin,
          accountId: r.AccountId,
          contactId: r.ContactId,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Create a task
   */
  private async createTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subject = this.resolveValue(this.config.subject, context);
    const whatId = this.resolveValue(this.config.whatId, context); // Related to record
    const whoId = this.resolveValue(this.config.whoId, context); // Contact
    const description = this.resolveValue(this.config.description, context);
    const status = this.resolveValue(this.config.status, context);
    const priority = this.resolveValue(this.config.priority, context);
    const activityDate = this.resolveValue(this.config.activityDate, context);
    const reminderDateTime = this.resolveValue(this.config.reminderDateTime, context);

    if (!subject) {
      throw new Error('subject is required');
    }

    const data: any = {
      Subject: subject,
    };

    if (whatId) data.WhatId = whatId;
    if (whoId) data.WhoId = whoId;
    if (description) data.Description = description;
    if (status) data.Status = status;
    if (priority) data.Priority = priority;
    if (activityDate) data.ActivityDate = activityDate;
    if (reminderDateTime) data.ReminderDateTime = reminderDateTime;

    const response = await this.callApi('sobjects/Task', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get a task
   */
  private async getTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context) || this.resolveValue(this.config.recordId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const task = await this.callApi(`sobjects/Task/${taskId}`);

    return {
      success: true,
      data: {
        id: task.Id,
        subject: task.Subject,
        status: task.Status,
        priority: task.Priority,
        whatId: task.WhatId,
        whoId: task.WhoId,
        description: task.Description,
        activityDate: task.ActivityDate,
        createdDate: task.CreatedDate,
      },
    };
  }

  /**
   * Update a task
   */
  private async updateTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context) || this.resolveValue(this.config.recordId, context);
    const status = this.config.status;
    const priority = this.config.priority;
    const description = this.config.description;

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const data: any = {};
    if (status) data.Status = status;
    if (priority) data.Priority = priority;
    if (description) data.Description = description;

    await this.callApi(`sobjects/Task/${taskId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: taskId,
        updated: true,
      },
    };
  }

  /**
   * Delete a task
   */
  private async deleteTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context) || this.resolveValue(this.config.recordId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    await this.callApi(`sobjects/Task/${taskId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: taskId,
        deleted: true,
      },
    };
  }

  /**
   * List tasks
   */
  private async listTasks(): Promise<NodeExecutionResult> {
    const where = this.config.where;
    const limit = this.config.limit || 100;

    let soql = 'SELECT Id, Subject, Status, Priority, WhatId, WhoId, ActivityDate, CreatedDate FROM Task';

    if (where) {
      soql += ` WHERE ${where}`;
    }

    soql += ` ORDER BY CreatedDate DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        tasks: response.records.map((r: any) => ({
          id: r.Id,
          subject: r.Subject,
          status: r.Status,
          priority: r.Priority,
          whatId: r.WhatId,
          whoId: r.WhoId,
          activityDate: r.ActivityDate,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Create an event
   */
  private async createEvent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subject = this.resolveValue(this.config.subject, context);
    const startDateTime = this.resolveValue(this.config.startDateTime, context);
    const endDateTime = this.resolveValue(this.config.endDateTime, context);
    const whatId = this.resolveValue(this.config.whatId, context);
    const whoId = this.resolveValue(this.config.whoId, context);
    const description = this.resolveValue(this.config.description, context);
    const location = this.resolveValue(this.config.location, context);
    const isAllDayEvent = this.config.isAllDayEvent;

    if (!subject) {
      throw new Error('subject is required');
    }

    if (!startDateTime) {
      throw new Error('startDateTime is required');
    }

    const data: any = {
      Subject: subject,
      StartDateTime: startDateTime,
    };

    if (endDateTime) data.EndDateTime = endDateTime;
    if (whatId) data.WhatId = whatId;
    if (whoId) data.WhoId = whoId;
    if (description) data.Description = description;
    if (location) data.Location = location;
    if (isAllDayEvent !== undefined) data.IsAllDayEvent = isAllDayEvent;

    const response = await this.callApi('sobjects/Event', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get an event
   */
  private async getEvent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const eventId = this.resolveValue(this.config.eventId, context) || this.resolveValue(this.config.recordId, context);

    if (!eventId) {
      throw new Error('eventId is required');
    }

    const event = await this.callApi(`sobjects/Event/${eventId}`);

    return {
      success: true,
      data: {
        id: event.Id,
        subject: event.Subject,
        startDateTime: event.StartDateTime,
        endDateTime: event.EndDateTime,
        whatId: event.WhatId,
        whoId: event.WhoId,
        location: event.Location,
        description: event.Description,
        isAllDayEvent: event.IsAllDayEvent,
        createdDate: event.CreatedDate,
      },
    };
  }

  /**
   * Update an event
   */
  private async updateEvent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const eventId = this.resolveValue(this.config.eventId, context) || this.resolveValue(this.config.recordId, context);
    const subject = this.config.subject;
    const startDateTime = this.config.startDateTime;
    const endDateTime = this.config.endDateTime;
    const description = this.config.description;
    const location = this.config.location;

    if (!eventId) {
      throw new Error('eventId is required');
    }

    const data: any = {};
    if (subject) data.Subject = subject;
    if (startDateTime) data.StartDateTime = startDateTime;
    if (endDateTime) data.EndDateTime = endDateTime;
    if (description) data.Description = description;
    if (location) data.Location = location;

    await this.callApi(`sobjects/Event/${eventId}`, 'PATCH', data);

    return {
      success: true,
      data: {
        id: eventId,
        updated: true,
      },
    };
  }

  /**
   * Delete an event
   */
  private async deleteEvent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const eventId = this.resolveValue(this.config.eventId, context) || this.resolveValue(this.config.recordId, context);

    if (!eventId) {
      throw new Error('eventId is required');
    }

    await this.callApi(`sobjects/Event/${eventId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: eventId,
        deleted: true,
      },
    };
  }

  /**
   * List events
   */
  private async listEvents(): Promise<NodeExecutionResult> {
    const where = this.config.where;
    const limit = this.config.limit || 100;

    let soql = 'SELECT Id, Subject, StartDateTime, EndDateTime, WhatId, WhoId, Location, CreatedDate FROM Event';

    if (where) {
      soql += ` WHERE ${where}`;
    }

    soql += ` ORDER BY StartDateTime DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        events: response.records.map((r: any) => ({
          id: r.Id,
          subject: r.Subject,
          startDateTime: r.StartDateTime,
          endDateTime: r.EndDateTime,
          whatId: r.WhatId,
          whoId: r.WhoId,
          location: r.Location,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Attach a file to a record
   */
  private async attachFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const parentId = this.resolveValue(this.config.parentId, context);
    const name = this.resolveValue(this.config.name, context);
    const body = this.resolveValue(this.config.body, context);
    const contentType = this.config.contentType || 'application/octet-stream';

    if (!parentId) {
      throw new Error('parentId is required');
    }

    if (!body) {
      throw new Error('body (file content) is required');
    }

    const data: any = {
      ParentId: parentId,
      Body: body,
      ContentType: contentType,
    };

    if (name) data.Name = name;

    const response = await this.callApi('sobjects/Attachment', 'POST', data);

    return {
      success: true,
      data: {
        id: response.id,
        success: response.success,
      },
    };
  }

  /**
   * Get an attachment
   */
  private async getAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const attachmentId = this.resolveValue(this.config.attachmentId, context) || this.resolveValue(this.config.recordId, context);

    if (!attachmentId) {
      throw new Error('attachmentId is required');
    }

    const attachment = await this.callApi(`sobjects/Attachment/${attachmentId}`);

    return {
      success: true,
      data: {
        id: attachment.Id,
        name: attachment.Name,
        parentId: attachment.ParentId,
        contentType: attachment.ContentType,
        bodyLength: attachment.BodyLength,
        createdDate: attachment.CreatedDate,
      },
    };
  }

  /**
   * Delete an attachment
   */
  private async deleteAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const attachmentId = this.resolveValue(this.config.attachmentId, context) || this.resolveValue(this.config.recordId, context);

    if (!attachmentId) {
      throw new Error('attachmentId is required');
    }

    await this.callApi(`sobjects/Attachment/${attachmentId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: attachmentId,
        deleted: true,
      },
    };
  }

  /**
   * List attachments for a parent record
   */
  private async listAttachments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const parentId = this.resolveValue(this.config.parentId, context);
    const limit = this.config.limit || 100;

    if (!parentId) {
      throw new Error('parentId is required');
    }

    const soql = `SELECT Id, Name, ContentType, BodyLength, CreatedDate FROM Attachment WHERE ParentId = '${parentId}' ORDER BY CreatedDate DESC LIMIT ${limit}`;

    const response = await this.callApi(`query?q=${encodeURIComponent(soql)}`);

    return {
      success: true,
      data: {
        attachments: response.records.map((r: any) => ({
          id: r.Id,
          name: r.Name,
          contentType: r.ContentType,
          bodyLength: r.BodyLength,
          createdDate: r.CreatedDate,
        })),
        totalSize: response.totalSize,
      },
    };
  }

  /**
   * Call Salesforce API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error[0]?.message || error.message || error.error || response.statusText);
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
    if (error.includes('INVALID_SESSION_ID')) {
      return 'Invalid session ID. Please re-authenticate.';
    }
    if (error.includes('ENTITY_IS_DELETED')) {
      return 'The record has been deleted.';
    }
    if (error.includes('INVALID_FIELD')) {
      return 'Invalid field name or field is not accessible.';
    }
    if (error.includes('REQUIRED_FIELD_MISSING')) {
      return 'Required field is missing.';
    }
    if (error.includes('DUPLICATE_VALUE')) {
      return 'Duplicate value found. A record with this value already exists.';
    }
    if (error.includes('INSUFFICIENT_ACCESS')) {
      return 'Insufficient access rights. Check your permissions.';
    }
    if (error.includes('INVALID_ID_FIELD')) {
      return 'Invalid ID. Check the record ID format.';
    }
    return `Salesforce error: ${error || 'Unknown error'}`;
  }

  getType(): string {
    return 'salesforce';
  }

  getIcon(): string {
    return '☁️';
  }

  /**
   * Common field types
   */
  static readonly FieldTypes = {
    String: 'string',
    Boolean: 'boolean',
    Integer: 'int',
    Long: 'long',
    Double: 'double',
    Currency: 'currency',
    Date: 'date',
    DateTime: 'datetime',
    Email: 'email',
    Phone: 'phone',
    Url: 'url',
    Textarea: 'textarea',
    Picklist: 'picklist',
    MultiSelectPicklist: 'multipicklist',
    Reference: 'reference',
  } as const;

  /**
   * Lead statuses
   */
  static readonly LeadStatuses = {
    Open: 'Open - Not Contacted',
    Contacted: 'Working - Contacted',
    Qualified: 'Qualified',
    Unqualified: 'Unqualified',
  } as const;

  /**
   * Opportunity stages
   */
  static readonly OpportunityStages = {
    Prospecting: 'Prospecting',
    Qualification: 'Qualification',
    NeedsAnalysis: 'Needs Analysis',
    ValueProposition: 'Value Proposition',
    IdDecisionMakers: 'Id. Decision Makers',
    PerceptionAnalysis: 'Perception Analysis',
    Proposal: 'Proposal/Price Quote',
    Negotiation: 'Negotiation/Review',
    ClosedWon: 'Closed Won',
    ClosedLost: 'Closed Lost',
  } as const;

  /**
   * Case statuses
   */
  static readonly CaseStatuses = {
    New: 'New',
    Working: 'Working',
    Escalated: 'Escalated',
    Closed: 'Closed',
  } as const;
}
