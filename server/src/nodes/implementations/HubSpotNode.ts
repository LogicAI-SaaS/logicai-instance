import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * HubSpot Node - HubSpot CRM API
 * n8n-compatible: Complete HubSpot REST API integration
 *
 * Configuration:
 * - operation: 'getContact' | 'listContacts' | 'createContact' | 'updateContact' | 'deleteContact' | 'searchContacts' |
 *              'getCompany' | 'listCompanies' | 'createCompany' | 'updateCompany' | 'deleteCompany' | 'searchCompanies' |
 *              'getDeal' | 'listDeals' | 'createDeal' | 'updateDeal' | 'deleteDeal' | 'associateDeal' | 'searchDeals' |
 *              'getTicket' | 'listTickets' | 'createTicket' | 'updateTicket' | 'deleteTicket' | 'searchTickets' |
 *              'getEngagement' | 'listEngagements' | 'createEngagement' | 'updateEngagement' | 'deleteEngagement' |
 *              'createNote' | 'createTask' | 'createMeeting' | 'createCall' | 'createEmail'
 * - apiKey: HubSpot API key (private app) or accessToken (OAuth)
 * - useOAuth: Set to true if using OAuth access token instead of API key
 *
 * Contact Operations:
 * - contactId: Contact ID
 * - email: Contact email
 * - firstname/lastname: Contact name
 * - phone: Phone number
 * - company: Company name
 * - website: Website URL
 * - lifecyclestage: 'subscriber' | 'lead' | 'marketingqualifiedlead' | 'salesqualifiedlead' | 'opportunity' | 'customer' | 'evangelist' | 'other'
 *
 * Company Operations:
 * - companyId: Company ID
 * - name: Company name
 * - domain: Website domain
 * - industry: Industry
 * - description: Company description
 * - numberOfEmployees: Number of employees
 * - annualrevenue: Annual revenue
 *
 * Deal Operations:
 * - dealId: Deal ID
 * - dealname: Deal name
 * - amount: Deal amount
 * - dealstage: Deal stage
 * - closedate: Close date
 * - pipeline: Pipeline ID
 *
 * Ticket Operations:
 * - ticketId: Ticket ID
 * - subject: Ticket subject
 * - content: Ticket content/description
 * - hs_pipeline: Pipeline ID
 * - hs_pipeline_stage: Stage ID
 * - hs_ticket_category: Category
 * - hs_ticket_priority: Priority
 */
export class HubSpotNode extends BaseNode {
  private apiBaseUrl = 'https://api.hubapi.com';
  private apiKey: string;
  private useOAuth: boolean;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.apiKey = config.apiKey || '';
    this.useOAuth = config.useOAuth || false;
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.useOAuth && !this.apiKey) {
      throw new Error('HubSpot API key is required (or use OAuth access token)');
    }

    const validOperations = [
      'getContact', 'listContacts', 'createContact', 'updateContact', 'deleteContact', 'searchContacts', 'mergeContacts', 'getContactByEmail',
      'getCompany', 'listCompanies', 'createCompany', 'updateCompany', 'deleteCompany', 'searchCompanies', 'getCompanyByDomain',
      'getDeal', 'listDeals', 'createDeal', 'updateDeal', 'deleteDeal', 'associateDeal', 'searchDeals',
      'getTicket', 'listTickets', 'createTicket', 'updateTicket', 'deleteTicket', 'searchTickets',
      'getEngagement', 'listEngagements', 'createEngagement', 'updateEngagement', 'deleteEngagement', 'associateEngagement',
      'createNote', 'createTask', 'createMeeting', 'createCall', 'createEmail',
      'listOwners', 'getOwner', 'listPipelines', 'getPipeline', 'getPipelineStages',
    ];

    const operation = this.config.operation || 'listContacts';

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'listContacts';

      switch (operation) {
        // Contact Operations
        case 'getContact':
          return await this.getContact(context);
        case 'listContacts':
          return await this.listContacts();
        case 'createContact':
          return await this.createContact(context);
        case 'updateContact':
          return await this.updateContact(context);
        case 'deleteContact':
          return await this.deleteContact(context);
        case 'searchContacts':
          return await this.searchContacts();
        case 'mergeContacts':
          return await this.mergeContacts(context);
        case 'getContactByEmail':
          return await this.getContactByEmail(context);

        // Company Operations
        case 'getCompany':
          return await this.getCompany(context);
        case 'listCompanies':
          return await this.listCompanies();
        case 'createCompany':
          return await this.createCompany(context);
        case 'updateCompany':
          return await this.updateCompany(context);
        case 'deleteCompany':
          return await this.deleteCompany(context);
        case 'searchCompanies':
          return await this.searchCompanies();
        case 'getCompanyByDomain':
          return await this.getCompanyByDomain();

        // Deal Operations
        case 'getDeal':
          return await this.getDeal(context);
        case 'listDeals':
          return await this.listDeals();
        case 'createDeal':
          return await this.createDeal(context);
        case 'updateDeal':
          return await this.updateDeal(context);
        case 'deleteDeal':
          return await this.deleteDeal(context);
        case 'associateDeal':
          return await this.associateDeal(context);
        case 'searchDeals':
          return await this.searchDeals();

        // Ticket Operations
        case 'getTicket':
          return await this.getTicket(context);
        case 'listTickets':
          return await this.listTickets();
        case 'createTicket':
          return await this.createTicket(context);
        case 'updateTicket':
          return await this.updateTicket(context);
        case 'deleteTicket':
          return await this.deleteTicket(context);
        case 'searchTickets':
          return await this.searchTickets();

        // Engagement Operations
        case 'getEngagement':
          return await this.getEngagement(context);
        case 'listEngagements':
          return await this.listEngagements();
        case 'createEngagement':
          return await this.createEngagement(context);
        case 'updateEngagement':
          return await this.updateEngagement(context);
        case 'deleteEngagement':
          return await this.deleteEngagement(context);
        case 'associateEngagement':
          return await this.associateEngagement(context);

        // Quick create operations
        case 'createNote':
          return await this.createNote(context);
        case 'createTask':
          return await this.createTask(context);
        case 'createMeeting':
          return await this.createMeeting(context);
        case 'createCall':
          return await this.createCall(context);
        case 'createEmail':
          return await this.createEmail(context);

        // Utility Operations
        case 'listOwners':
          return await this.listOwners();
        case 'getOwner':
          return await this.getOwner(context);
        case 'listPipelines':
          return await this.listPipelines();
        case 'getPipeline':
          return await this.getPipeline();
        case 'getPipelineStages':
          return await this.getPipelineStages();

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
   * Get a contact
   */
  private async getContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const contactId = this.resolveValue(this.config.contactId, context);

    if (!contactId) {
      throw new Error('contactId is required');
    }

    const contact = await this.callApi(`crm/v3/objects/contacts/${contactId}`);

    return {
      success: true,
      data: {
        id: contact.id,
        properties: contact.properties,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
        archived: contact.archived,
      },
    };
  }

  /**
   * List contacts
   */
  private async listContacts(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const after = this.config.after;
    const properties = this.config.properties || ['email', 'firstname', 'lastname', 'company', 'phone', 'website', 'lifecyclestage'];

    let url = `crm/v3/objects/contacts?limit=${limit}`;
    if (after) url += `&after=${after}`;
    if (properties && properties.length > 0) url += `&properties=${properties.join(',')}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        contacts: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Create a contact
   */
  private async createContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);
    const firstname = this.resolveValue(this.config.firstname, context);
    const lastname = this.resolveValue(this.config.lastname, context);
    const phone = this.resolveValue(this.config.phone, context);
    const company = this.resolveValue(this.config.company, context);
    const website = this.resolveValue(this.config.website, context);
    const lifecyclestage = this.config.lifecyclestage;
    const jobtitle = this.resolveValue(this.config.jobtitle, context);

    if (!email) {
      throw new Error('email is required');
    }

    const properties: any = {
      email,
    };

    if (firstname) properties.firstname = firstname;
    if (lastname) properties.lastname = lastname;
    if (phone) properties.phone = phone;
    if (company) properties.company = company;
    if (website) properties.website = website;
    if (lifecyclestage) properties.lifecyclestage = lifecyclestage;
    if (jobtitle) properties.jobtitle = jobtitle;

    const contact = await this.callApi('crm/v3/objects/contacts', 'POST', { properties });

    return {
      success: true,
      data: {
        id: contact.id,
        properties: contact.properties,
        createdAt: contact.createdAt,
      },
    };
  }

  /**
   * Update a contact
   */
  private async updateContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const contactId = this.resolveValue(this.config.contactId, context);
    const email = this.config.email;
    const firstname = this.config.firstname;
    const lastname = this.config.lastname;
    const phone = this.config.phone;
    const company = this.config.company;
    const website = this.config.website;
    const lifecyclestage = this.config.lifecyclestage;

    if (!contactId) {
      throw new Error('contactId is required');
    }

    const properties: any = {};
    if (email) properties.email = email;
    if (firstname) properties.firstname = firstname;
    if (lastname) properties.lastname = lastname;
    if (phone) properties.phone = phone;
    if (company) properties.company = company;
    if (website) properties.website = website;
    if (lifecyclestage) properties.lifecyclestage = lifecyclestage;

    const contact = await this.callApi(`crm/v3/objects/contacts/${contactId}`, 'PATCH', { properties });

    return {
      success: true,
      data: {
        id: contact.id,
        updatedAt: contact.updatedAt,
      },
    };
  }

  /**
   * Delete a contact
   */
  private async deleteContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const contactId = this.resolveValue(this.config.contactId, context);

    if (!contactId) {
      throw new Error('contactId is required');
    }

    await this.callApi(`crm/v3/objects/contacts/${contactId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: contactId,
        deleted: true,
      },
    };
  }

  /**
   * Search contacts
   */
  private async searchContacts(): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const filter = this.config.filter;
    const limit = this.config.limit || 100;

    if (!query && !filter) {
      throw new Error('Either query or filter is required for search');
    }

    const payload: any = {
      limit,
    };

    if (query) {
      payload.query = query;
    }

    if (filter) {
      payload.filterGroups = [filter];
    }

    const response = await this.callApi('crm/v3/objects/contacts/search', 'POST', payload);

    return {
      success: true,
      data: {
        contacts: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Merge contacts
   */
  private async mergeContacts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const primaryContactId = this.resolveValue(this.config.primaryContactId, context);
    const secondaryContactId = this.resolveValue(this.config.secondaryContactId, context);

    if (!primaryContactId) {
      throw new Error('primaryContactId is required');
    }

    if (!secondaryContactId) {
      throw new Error('secondaryContactId is required');
    }

    const payload = {
      primaryObjectId: primaryContactId,
      objectIdToMerge: secondaryContactId,
    };

    const result = await this.callApi('crm/v3/objects/contacts/merge', 'POST', payload);

    return {
      success: true,
      data: {
        id: result.id,
        merged: true,
      },
    };
  }

  /**
   * Get contact by email
   */
  private async getContactByEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);

    if (!email) {
      throw new Error('email is required');
    }

    const response = await this.callApi(`crm/v3/objects/contacts/${email}?idProperty=email`);

    return {
      success: true,
      data: {
        id: response.id,
        properties: response.properties,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      },
    };
  }

  /**
   * Get a company
   */
  private async getCompany(context: ExecutionContext): Promise<NodeExecutionResult> {
    const companyId = this.resolveValue(this.config.companyId, context);

    if (!companyId) {
      throw new Error('companyId is required');
    }

    const company = await this.callApi(`crm/v3/objects/companies/${companyId}`);

    return {
      success: true,
      data: {
        id: company.id,
        properties: company.properties,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        archived: company.archived,
      },
    };
  }

  /**
   * List companies
   */
  private async listCompanies(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const after = this.config.after;
    const properties = this.config.properties || ['domain', 'name', 'industry', 'description', 'numemployees', 'annualrevenue'];

    let url = `crm/v3/objects/companies?limit=${limit}`;
    if (after) url += `&after=${after}`;
    if (properties && properties.length > 0) url += `&properties=${properties.join(',')}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        companies: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Create a company
   */
  private async createCompany(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const domain = this.resolveValue(this.config.domain, context);
    const industry = this.resolveValue(this.config.industry, context);
    const description = this.resolveValue(this.config.description, context);
    const numberOfEmployees = this.config.numberOfEmployees;
    const annualRevenue = this.config.annualRevenue;
    const website = this.resolveValue(this.config.website, context);

    if (!name) {
      throw new Error('name is required');
    }

    const properties: any = {
      name,
    };

    if (domain) properties.domain = domain;
    if (industry) properties.industry = industry;
    if (description) properties.description = description;
    if (numberOfEmployees) properties.numemployees = numberOfEmployees;
    if (annualRevenue) properties.annualrevenue = annualRevenue;
    if (website) properties.website = website;

    const company = await this.callApi('crm/v3/objects/companies', 'POST', { properties });

    return {
      success: true,
      data: {
        id: company.id,
        properties: company.properties,
        createdAt: company.createdAt,
      },
    };
  }

  /**
   * Update a company
   */
  private async updateCompany(context: ExecutionContext): Promise<NodeExecutionResult> {
    const companyId = this.resolveValue(this.config.companyId, context);
    const name = this.config.name;
    const domain = this.config.domain;
    const industry = this.config.industry;
    const description = this.config.description;
    const numberOfEmployees = this.config.numberOfEmployees;

    if (!companyId) {
      throw new Error('companyId is required');
    }

    const properties: any = {};
    if (name) properties.name = name;
    if (domain) properties.domain = domain;
    if (industry) properties.industry = industry;
    if (description) properties.description = description;
    if (numberOfEmployees) properties.numemployees = numberOfEmployees;

    const company = await this.callApi(`crm/v3/objects/companies/${companyId}`, 'PATCH', { properties });

    return {
      success: true,
      data: {
        id: company.id,
        updatedAt: company.updatedAt,
      },
    };
  }

  /**
   * Delete a company
   */
  private async deleteCompany(context: ExecutionContext): Promise<NodeExecutionResult> {
    const companyId = this.resolveValue(this.config.companyId, context);

    if (!companyId) {
      throw new Error('companyId is required');
    }

    await this.callApi(`crm/v3/objects/companies/${companyId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: companyId,
        deleted: true,
      },
    };
  }

  /**
   * Search companies
   */
  private async searchCompanies(): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const filter = this.config.filter;
    const limit = this.config.limit || 100;

    if (!query && !filter) {
      throw new Error('Either query or filter is required for search');
    }

    const payload: any = {
      limit,
    };

    if (query) {
      payload.query = query;
    }

    if (filter) {
      payload.filterGroups = [filter];
    }

    const response = await this.callApi('crm/v3/objects/companies/search', 'POST', payload);

    return {
      success: true,
      data: {
        companies: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Get company by domain
   */
  private async getCompanyByDomain(): Promise<NodeExecutionResult> {
    const domain = this.config.domain;

    if (!domain) {
      throw new Error('domain is required');
    }

    const payload = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'domain',
              operator: 'EQ',
              value: domain,
            },
          ],
        },
      ],
    };

    const response = await this.callApi('crm/v3/objects/companies/search', 'POST', payload);

    if (!response.results || response.results.length === 0) {
      return {
        success: true,
        data: {
          company: null,
        },
      };
    }

    return {
      success: true,
      data: {
        company: response.results[0],
      },
    };
  }

  /**
   * Get a deal
   */
  private async getDeal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const dealId = this.resolveValue(this.config.dealId, context);

    if (!dealId) {
      throw new Error('dealId is required');
    }

    const deal = await this.callApi(`crm/v3/objects/deals/${dealId}`);

    return {
      success: true,
      data: {
        id: deal.id,
        properties: deal.properties,
        createdAt: deal.createdAt,
        updatedAt: deal.updatedAt,
        archived: deal.archived,
      },
    };
  }

  /**
   * List deals
   */
  private async listDeals(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const after = this.config.after;
    const properties = this.config.properties || ['dealname', 'amount', 'dealstage', 'closedate', 'pipeline'];
    const associations = this.config.associations || ['contact', 'company'];

    let url = `crm/v3/objects/deals?limit=${limit}`;
    if (after) url += `&after=${after}`;
    if (properties && properties.length > 0) url += `&properties=${properties.join(',')}`;
    if (associations && associations.length > 0) url += `&associations=${associations.join(',')}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        deals: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          associations: r.associations,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Create a deal
   */
  private async createDeal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const dealname = this.resolveValue(this.config.dealname, context);
    const amount = this.config.amount;
    const dealstage = this.resolveValue(this.config.dealstage, context);
    const closedate = this.config.closedate;
    const pipeline = this.resolveValue(this.config.pipeline, context);
    const description = this.resolveValue(this.config.description, context);

    if (!dealname) {
      throw new Error('dealname is required');
    }

    const properties: any = {
      dealname,
    };

    if (amount) properties.amount = amount;
    if (dealstage) properties.dealstage = dealstage;
    if (closedate) properties.closedate = closedate;
    if (pipeline) properties.pipeline = pipeline;
    if (description) properties.description = description;

    const deal = await this.callApi('crm/v3/objects/deals', 'POST', { properties });

    return {
      success: true,
      data: {
        id: deal.id,
        properties: deal.properties,
        createdAt: deal.createdAt,
      },
    };
  }

  /**
   * Update a deal
   */
  private async updateDeal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const dealId = this.resolveValue(this.config.dealId, context);
    const dealname = this.config.dealname;
    const amount = this.config.amount;
    const dealstage = this.config.dealstage;
    const closedate = this.config.closedate;

    if (!dealId) {
      throw new Error('dealId is required');
    }

    const properties: any = {};
    if (dealname) properties.dealname = dealname;
    if (amount) properties.amount = amount;
    if (dealstage) properties.dealstage = dealstage;
    if (closedate) properties.closedate = closedate;

    const deal = await this.callApi(`crm/v3/objects/deals/${dealId}`, 'PATCH', { properties });

    return {
      success: true,
      data: {
        id: deal.id,
        updatedAt: deal.updatedAt,
      },
    };
  }

  /**
   * Delete a deal
   */
  private async deleteDeal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const dealId = this.resolveValue(this.config.dealId, context);

    if (!dealId) {
      throw new Error('dealId is required');
    }

    await this.callApi(`crm/v3/objects/deals/${dealId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: dealId,
        deleted: true,
      },
    };
  }

  /**
   * Associate deal with contact/company
   */
  private async associateDeal(context: ExecutionContext): Promise<NodeExecutionResult> {
    const dealId = this.resolveValue(this.config.dealId, context);
    const toObjectId = this.resolveValue(this.config.toObjectId, context);
    const toObjectType = this.config.toObjectType || 'contact'; // 'contact' or 'company'
    const associationType = this.config.associationType || 'deal_to_contact';

    if (!dealId) {
      throw new Error('dealId is required');
    }

    if (!toObjectId) {
      throw new Error('toObjectId is required');
    }

    const payload = {
      toObjectId,
      toObjectType,
      associationType,
    };

    await this.callApi(`crm/v3/objects/deals/${dealId}/associations`, 'PUT', payload);

    return {
      success: true,
      data: {
        dealId,
        toObjectId,
        toObjectType,
        associated: true,
      },
    };
  }

  /**
   * Search deals
   */
  private async searchDeals(): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const filter = this.config.filter;
    const limit = this.config.limit || 100;
    const sorts = this.config.sorts;

    if (!query && !filter) {
      throw new Error('Either query or filter is required for search');
    }

    const payload: any = {
      limit,
    };

    if (query) {
      payload.query = query;
    }

    if (filter) {
      payload.filterGroups = [filter];
    }

    if (sorts) {
      payload.sorts = sorts;
    }

    const response = await this.callApi('crm/v3/objects/deals/search', 'POST', payload);

    return {
      success: true,
      data: {
        deals: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Get a ticket
   */
  private async getTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const ticket = await this.callApi(`crm/v3/objects/tickets/${ticketId}`);

    return {
      success: true,
      data: {
        id: ticket.id,
        properties: ticket.properties,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        archived: ticket.archived,
      },
    };
  }

  /**
   * List tickets
   */
  private async listTickets(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const after = this.config.after;
    const properties = this.config.properties || ['subject', 'content', 'hs_pipeline', 'hs_pipeline_stage', 'hs_ticket_category', 'hs_ticket_priority'];

    let url = `crm/v3/objects/tickets?limit=${limit}`;
    if (after) url += `&after=${after}`;
    if (properties && properties.length > 0) url += `&properties=${properties.join(',')}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        tickets: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Create a ticket
   */
  private async createTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subject = this.resolveValue(this.config.subject, context);
    const content = this.resolveValue(this.config.content, context);
    const pipeline = this.resolveValue(this.config.pipeline, context);
    const pipelineStage = this.resolveValue(this.config.pipelineStage, context);
    const category = this.resolveValue(this.config.category, context);
    const priority = this.resolveValue(this.config.priority, context);
    const hsTicketId = this.resolveValue(this.config.hsTicketId, context); // External ID

    if (!subject) {
      throw new Error('subject is required');
    }

    const properties: any = {
      subject,
    };

    if (content) properties.content = content;
    if (pipeline) properties.hs_pipeline = pipeline;
    if (pipelineStage) properties.hs_pipeline_stage = pipelineStage;
    if (category) properties.hs_ticket_category = category;
    if (priority) properties.hs_ticket_priority = priority;

    const endpoint = hsTicketId
      ? `crm/v3/objects/tickets/${hsTicketId}?idProperty=hs_ticket_id`
      : 'crm/v3/objects/tickets';

    const ticket = await this.callApi(endpoint, hsTicketId ? 'PATCH' : 'POST', { properties });

    return {
      success: true,
      data: {
        id: ticket.id,
        properties: ticket.properties,
        createdAt: ticket.createdAt,
      },
    };
  }

  /**
   * Update a ticket
   */
  private async updateTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const subject = this.config.subject;
    const content = this.config.content;
    const pipelineStage = this.config.pipelineStage;
    const category = this.config.category;
    const priority = this.config.priority;

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const properties: any = {};
    if (subject) properties.subject = subject;
    if (content) properties.content = content;
    if (pipelineStage) properties.hs_pipeline_stage = pipelineStage;
    if (category) properties.hs_ticket_category = category;
    if (priority) properties.hs_ticket_priority = priority;

    const ticket = await this.callApi(`crm/v3/objects/tickets/${ticketId}`, 'PATCH', { properties });

    return {
      success: true,
      data: {
        id: ticket.id,
        updatedAt: ticket.updatedAt,
      },
    };
  }

  /**
   * Delete a ticket
   */
  private async deleteTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    await this.callApi(`crm/v3/objects/tickets/${ticketId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: ticketId,
        deleted: true,
      },
    };
  }

  /**
   * Search tickets
   */
  private async searchTickets(): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const filter = this.config.filter;
    const limit = this.config.limit || 100;

    if (!query && !filter) {
      throw new Error('Either query or filter is required for search');
    }

    const payload: any = {
      limit,
    };

    if (query) {
      payload.query = query;
    }

    if (filter) {
      payload.filterGroups = [filter];
    }

    const response = await this.callApi('crm/v3/objects/tickets/search', 'POST', payload);

    return {
      success: true,
      data: {
        tickets: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Get an engagement
   */
  private async getEngagement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const engagementId = this.resolveValue(this.config.engagementId, context);

    if (!engagementId) {
      throw new Error('engagementId is required');
    }

    const engagement = await this.callApi(`crm/v3/objects/engagements/${engagementId}`);

    return {
      success: true,
      data: {
        id: engagement.id,
        properties: engagement.properties,
        createdAt: engagement.createdAt,
        updatedAt: engagement.updatedAt,
        archived: engagement.archived,
      },
    };
  }

  /**
   * List engagements
   */
  private async listEngagements(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const after = this.config.after;

    let url = `crm/v3/objects/engagements?limit=${limit}`;
    if (after) url += `&after=${after}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        engagements: response.results.map((r: any) => ({
          id: r.id,
          properties: r.properties,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Create an engagement
   */
  private async createEngagement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const type = this.config.type; // 'NOTE' | 'TASK' | 'MEETING' | 'CALL' | 'EMAIL'
    const metadata = this.config.metadata;
    const associations = this.config.associations;

    if (!type) {
      throw new Error('type is required (NOTE, TASK, MEETING, CALL, or EMAIL)');
    }

    const payload: any = {
      type,
      metadata,
    };

    if (associations) {
      payload.associations = associations;
    }

    const engagement = await this.callApi('crm/v3/objects/engagements', 'POST', payload);

    return {
      success: true,
      data: {
        id: engagement.id,
        createdAt: engagement.createdAt,
      },
    };
  }

  /**
   * Update an engagement
   */
  private async updateEngagement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const engagementId = this.resolveValue(this.config.engagementId, context);
    const metadata = this.config.metadata;

    if (!engagementId) {
      throw new Error('engagementId is required');
    }

    const payload: any = {
      metadata,
    };

    const engagement = await this.callApi(`crm/v3/objects/engagements/${engagementId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: engagement.id,
        updatedAt: engagement.updatedAt,
      },
    };
  }

  /**
   * Delete an engagement
   */
  private async deleteEngagement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const engagementId = this.resolveValue(this.config.engagementId, context);

    if (!engagementId) {
      throw new Error('engagementId is required');
    }

    await this.callApi(`crm/v3/objects/engagements/${engagementId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: engagementId,
        deleted: true,
      },
    };
  }

  /**
   * Associate engagement with records
   */
  private async associateEngagement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const engagementId = this.resolveValue(this.config.engagementId, context);
    const toObjectId = this.resolveValue(this.config.toObjectId, context);
    const toObjectType = this.config.toObjectType || 'contact';
    const associationType = this.config.associationType || 'ENGAGEMENT';

    if (!engagementId) {
      throw new Error('engagementId is required');
    }

    if (!toObjectId) {
      throw new Error('toObjectId is required');
    }

    const payload = {
      toObjectId,
      toObjectType,
      associationType,
    };

    await this.callApi(`crm/v3/objects/engagements/${engagementId}/associations`, 'PUT', payload);

    return {
      success: true,
      data: {
        engagementId,
        toObjectId,
        toObjectType,
        associated: true,
      },
    };
  }

  /**
   * Create a note
   */
  private async createNote(context: ExecutionContext): Promise<NodeExecutionResult> {
    const note = this.resolveValue(this.config.note, context);
    const associations = this.config.associations;

    if (!note) {
      throw new Error('note content is required');
    }

    const metadata = {
      body: note,
    };

    const payload: any = {
      type: 'NOTE',
      metadata,
    };

    if (associations) {
      payload.associations = associations;
    }

    const engagement = await this.callApi('crm/v3/objects/engagements', 'POST', payload);

    return {
      success: true,
      data: {
        id: engagement.id,
        createdAt: engagement.createdAt,
      },
    };
  }

  /**
   * Create a task
   */
  private async createTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subject = this.resolveValue(this.config.subject, context);
    const body = this.resolveValue(this.config.body, context);
    const dueDate = this.config.dueDate;
    const taskType = this.config.taskType; // 'EMAIL' | 'CALL' | 'TODO' | 'FOLLOW_UP'
    const status = this.config.status; // 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED'
    const priority = this.config.priority; // 'HIGH' | 'MEDIUM' | 'LOW'
    const associations = this.config.associations;

    if (!subject) {
      throw new Error('subject is required');
    }

    const metadata: any = {
      subject,
    };

    if (body) metadata.body = body;
    if (dueDate) metadata.dueDate = dueDate;
    if (taskType) metadata.taskType = taskType;
    if (status) metadata.status = status;
    if (priority) metadata.priority = priority;

    const payload: any = {
      type: 'TASK',
      metadata,
    };

    if (associations) {
      payload.associations = associations;
    }

    const engagement = await this.callApi('crm/v3/objects/engagements', 'POST', payload);

    return {
      success: true,
      data: {
        id: engagement.id,
        createdAt: engagement.createdAt,
      },
    };
  }

  /**
   * Create a meeting
   */
  private async createMeeting(context: ExecutionContext): Promise<NodeExecutionResult> {
    const title = this.resolveValue(this.config.title, context);
    const body = this.resolveValue(this.config.body, context);
    const startTime = this.config.startTime;
    const endTime = this.config.endTime;
    const associations = this.config.associations;

    if (!title) {
      throw new Error('title is required');
    }

    const metadata: any = {
      title,
    };

    if (body) metadata.body = body;
    if (startTime) metadata.startTime = startTime;
    if (endTime) metadata.endTime = endTime;

    const payload: any = {
      type: 'MEETING',
      metadata,
    };

    if (associations) {
      payload.associations = associations;
    }

    const engagement = await this.callApi('crm/v3/objects/engagements', 'POST', payload);

    return {
      success: true,
      data: {
        id: engagement.id,
        createdAt: engagement.createdAt,
      },
    };
  }

  /**
   * Create a call
   */
  private async createCall(context: ExecutionContext): Promise<NodeExecutionResult> {
    const body = this.resolveValue(this.config.body, context);
    const status = this.config.status; // 'COMPLETED' | 'NO_ANSWER' | 'BUSY' | 'FAILED'
    const duration = this.config.duration; // milliseconds
    const fromNumber = this.resolveValue(this.config.fromNumber, context);
    const toNumber = this.resolveValue(this.config.toNumber, context);
    const associations = this.config.associations;

    if (!body) {
      throw new Error('body (call notes) is required');
    }

    if (!status) {
      throw new Error('status is required (COMPLETED, NO_ANSWER, BUSY, or FAILED)');
    }

    const metadata: any = {
      body,
      status,
    };

    if (duration) metadata.duration = duration;
    if (fromNumber) metadata.fromNumber = fromNumber;
    if (toNumber) metadata.toNumber = toNumber;

    const payload: any = {
      type: 'CALL',
      metadata,
    };

    if (associations) {
      payload.associations = associations;
    }

    const engagement = await this.callApi('crm/v3/objects/engagements', 'POST', payload);

    return {
      success: true,
      data: {
        id: engagement.id,
        createdAt: engagement.createdAt,
      },
    };
  }

  /**
   * Create an email engagement
   */
  private async createEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subject = this.resolveValue(this.config.subject, context);
    const body = this.resolveValue(this.config.body, context);
    const fromEmail = this.resolveValue(this.config.fromEmail, context);
    const toEmail = this.resolveValue(this.config.toEmail, context);
    const status = this.config.status; // 'SENT' | 'DRAFT' | 'FAILED'
    const associations = this.config.associations;

    if (!subject) {
      throw new Error('subject is required');
    }

    if (!fromEmail) {
      throw new Error('fromEmail is required');
    }

    if (!toEmail) {
      throw new Error('toEmail is required');
    }

    const metadata: any = {
      subject,
      from: { email: fromEmail },
      to: [{ email: toEmail }],
    };

    if (body) metadata.html = body;
    if (status) metadata.status = status;

    const payload: any = {
      type: 'EMAIL',
      metadata,
    };

    if (associations) {
      payload.associations = associations;
    }

    const engagement = await this.callApi('crm/v3/objects/engagements', 'POST', payload);

    return {
      success: true,
      data: {
        id: engagement.id,
        createdAt: engagement.createdAt,
      },
    };
  }

  /**
   * List owners
   */
  private async listOwners(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const after = this.config.after;

    let url = `crm/v3/owners?limit=${limit}`;
    if (after) url += `&after=${after}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        owners: response.results.map((r: any) => ({
          id: r.id,
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
          userId: r.userId,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        })),
        total: response.total,
        paging: response.paging,
      },
    };
  }

  /**
   * Get an owner
   */
  private async getOwner(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ownerId = this.resolveValue(this.config.ownerId, context);

    if (!ownerId) {
      throw new Error('ownerId is required');
    }

    const owner = await this.callApi(`crm/v3/owners/${ownerId}`);

    return {
      success: true,
      data: {
        id: owner.id,
        email: owner.email,
        firstName: owner.firstName,
        lastName: owner.lastName,
        userId: owner.userId,
        createdAt: owner.createdAt,
        updatedAt: owner.updatedAt,
      },
    };
  }

  /**
   * List pipelines
   */
  private async listPipelines(): Promise<NodeExecutionResult> {
    const objectType = this.config.objectType || 'deal'; // 'deal', 'ticket'

    const response = await this.callApi(`crm/v3/pipelines/${objectType}`);

    return {
      success: true,
      data: {
        pipelines: response.results,
      },
    };
  }

  /**
   * Get a pipeline
   */
  private async getPipeline(): Promise<NodeExecutionResult> {
    const objectType = this.config.objectType || 'deal';
    const pipelineId = this.config.pipelineId;

    if (!pipelineId) {
      throw new Error('pipelineId is required');
    }

    const pipeline = await this.callApi(`crm/v3/pipelines/${objectType}/${pipelineId}`);

    return {
      success: true,
      data: {
        pipeline,
      },
    };
  }

  /**
   * Get pipeline stages
   */
  private async getPipelineStages(): Promise<NodeExecutionResult> {
    const objectType = this.config.objectType || 'deal';
    const pipelineId = this.config.pipelineId;

    if (!pipelineId) {
      throw new Error('pipelineId is required');
    }

    const pipeline = await this.callApi(`crm/v3/pipelines/${objectType}/${pipelineId}`);

    return {
      success: true,
      data: {
        stages: pipeline.stages,
      },
    };
  }

  /**
   * Call HubSpot API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    let url = `${this.apiBaseUrl}/${endpoint}`;

    if (!this.useOAuth) {
      url += endpoint.includes('?') ? `&hapikey=${this.apiKey}` : `?hapikey=${this.apiKey}`;
    }

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    if (this.useOAuth) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.apiKey}`,
      };
    }

    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.error || response.statusText);
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
    if (error.categoryCode === 'INVALID_AUTH_TOKEN') {
      return 'Invalid authentication token. Please re-authenticate.';
    }
    if (error.categoryCode === 'EXPIRED_AUTH_TOKEN') {
      return 'Authentication token has expired. Please refresh your token.';
    }
    if (error.categoryCode === 'INVALID_OBJECT_TYPE') {
      return 'Invalid object type specified.';
    }
    if (error.categoryCode === 'OBJECT_NOT_FOUND') {
      return 'Object not found. Check the ID.';
    }
    if (error.categoryCode === 'PROPERTY_NOT_FOUND') {
      return 'Property not found. Check the property name.';
    }
    if (error.categoryCode === 'INVALID_PROPERTY_NAME') {
      return 'Invalid property name.';
    }
    if (error.categoryCode === 'LIMIT_EXCEEDED') {
      return 'API rate limit exceeded. Please try again later.';
    }
    if (error.message?.includes('already exists')) {
      return 'Record already exists.';
    }
    return `HubSpot error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'hubspot';
  }

  getIcon(): string {
    return '🔄';
  }

  /**
   * Lifecycle stages
   */
  static readonly LifecycleStages = {
    Subscriber: 'subscriber',
    Lead: 'lead',
    MarketingQualifiedLead: 'marketingqualifiedlead',
    SalesQualifiedLead: 'salesqualifiedlead',
    Opportunity: 'opportunity',
    Customer: 'customer',
    Evangelist: 'evangelist',
    Other: 'other',
  } as const;

  /**
   * Task types
   */
  static readonly TaskTypes = {
    Email: 'EMAIL',
    Call: 'CALL',
    Todo: 'TODO',
    FollowUp: 'FOLLOW_UP',
  } as const;

  /**
   * Task statuses
   */
  static readonly TaskStatuses = {
    NotStarted: 'NOT_STARTED',
    InProgress: 'IN_PROGRESS',
    Completed: 'COMPLETED',
    Deferred: 'DEFERRED',
  } as const;

  /**
   * Priorities
   */
  static readonly Priorities = {
    High: 'HIGH',
    Medium: 'MEDIUM',
    Low: 'LOW',
  } as const;
}
