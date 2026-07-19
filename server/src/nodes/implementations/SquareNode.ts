import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Square Node - Square Payments API
 * n8n-compatible: Complete Square API integration
 *
 * Configuration:
 * - operation: 'createPayment' | 'getPayment' | 'listPayments' | 'refundPayment' | 'createCustomer' | 'getCustomer' | 'listCustomers' |
 *              'createOrder' | 'getOrder' | 'updateOrder' | 'listOrders' | 'payOrder' | 'createCatalogItem' | 'updateCatalogItem' | 'listCatalog' |
 *              'createLocation' | 'getLocation' | 'listLocations' | 'createCheckout' | 'getCheckout' | 'listTransactions'
 * - accessToken: Square access token
 * - environment: 'sandbox' | 'production'
 * - locationId: Square location ID (required for most operations)
 *
 * Payment Operations:
 * - amount: Amount in cents (integer)
 * - currency: Currency code (default: 'USD')
 * - sourceId: Payment source ID (card, gift card, etc.)
 * - customerId: Customer ID
 * - note: Payment note
 * - referenceId: Reference ID for idempotency
 *
 * Order Operations:
 * - order: Order object with line items, taxes, discounts
 * - idempotencyKey: Unique key for idempotency
 *
 * Catalog Operations:
 * - type: 'ITEM' | 'CATEGORY' | 'TAX' | 'DISCOUNT' | 'MODIFIER_LIST' | 'MODIFIER'
 * - itemData: Item data object
 *
 * Customer Operations:
 * - givenName: First name
 * - familyName: Last name
 * - emailAddress: Email
 * - phoneNumber: Phone
 * - address: Address object
 * - referenceId: Reference ID
 */
export class SquareNode extends BaseNode {
  private apiBaseUrl: string;
  private accessToken: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    const environment = config.environment || 'sandbox';
    this.apiBaseUrl = environment === 'production'
      ? 'https://connect.squareup.com'
      : 'https://connect.squareupsandbox.com';
    this.accessToken = config.accessToken || '';
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.accessToken) {
      throw new Error('Square access token is required');
    }

    const validOperations = [
      'createPayment', 'getPayment', 'listPayments', 'refundPayment', 'cancelPayment',
      'createCustomer', 'getCustomer', 'updateCustomer', 'listCustomers', 'deleteCustomer', 'searchCustomers',
      'createOrder', 'getOrder', 'updateOrder', 'listOrders', 'payOrder',
      'createCatalogItem', 'updateCatalogItem', 'batchDeleteCatalog', 'retrieveCatalog', 'searchCatalog', 'listCatalog',
      'createLocation', 'getLocation', 'listLocations',
      'createCheckout', 'getCheckout', 'listTransactions',
      'createInvoice', 'getInvoice', 'listInvoices', 'deleteInvoice',
      'createSubscription', 'getSubscription', 'listSubscriptions', 'cancelSubscription', 'updateSubscription',
    ];

    const operation = this.config.operation || 'listPayments';

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'listPayments';

      switch (operation) {
        // Payment Operations
        case 'createPayment':
          return await this.createPayment(context);
        case 'getPayment':
          return await this.getPayment(context);
        case 'listPayments':
          return await this.listPayments();
        case 'refundPayment':
          return await this.refundPayment(context);
        case 'cancelPayment':
          return await this.cancelPayment(context);

        // Customer Operations
        case 'createCustomer':
          return await this.createCustomer(context);
        case 'getCustomer':
          return await this.getCustomer(context);
        case 'updateCustomer':
          return await this.updateCustomer(context);
        case 'deleteCustomer':
          return await this.deleteCustomer(context);
        case 'listCustomers':
          return await this.listCustomers();
        case 'searchCustomers':
          return await this.searchCustomers();

        // Order Operations
        case 'createOrder':
          return await this.createOrder(context);
        case 'getOrder':
          return await this.getOrder(context);
        case 'updateOrder':
          return await this.updateOrder(context);
        case 'listOrders':
          return await this.listOrders();
        case 'payOrder':
          return await this.payOrder(context);

        // Catalog Operations
        case 'createCatalogItem':
          return await this.createCatalogItem(context);
        case 'updateCatalogItem':
          return await this.updateCatalogItem(context);
        case 'batchDeleteCatalog':
          return await this.batchDeleteCatalog(context);
        case 'retrieveCatalog':
          return await this.retrieveCatalog(context);
        case 'searchCatalog':
          return await this.searchCatalog();
        case 'listCatalog':
          return await this.listCatalog();

        // Location Operations
        case 'createLocation':
          return await this.createLocation(context);
        case 'getLocation':
          return await this.getLocation(context);
        case 'listLocations':
          return await this.listLocations();

        // Checkout Operations
        case 'createCheckout':
          return await this.createCheckout(context);
        case 'getCheckout':
          return await this.getCheckout(context);

        // Transaction Operations
        case 'listTransactions':
          return await this.listTransactions();

        // Invoice Operations
        case 'createInvoice':
          return await this.createInvoice(context);
        case 'getInvoice':
          return await this.getInvoice(context);
        case 'listInvoices':
          return await this.listInvoices();
        case 'deleteInvoice':
          return await this.deleteInvoice(context);

        // Subscription Operations
        case 'createSubscription':
          return await this.createSubscription(context);
        case 'getSubscription':
          return await this.getSubscription(context);
        case 'listSubscriptions':
          return await this.listSubscriptions();
        case 'cancelSubscription':
          return await this.cancelSubscription(context);
        case 'updateSubscription':
          return await this.updateSubscription(context);

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
   * Create a payment
   */
  private async createPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const locationId = this.resolveValue(this.config.locationId, context);
    const sourceId = this.resolveValue(this.config.sourceId, context);
    const amount = this.config.amount;
    const currency = this.config.currency || 'USD';
    const customerId = this.resolveValue(this.config.customerId, context);
    const note = this.resolveValue(this.config.note, context);
    const referenceId = this.resolveValue(this.config.referenceId, context);
    const tipMoney = this.config.tipMoney;
    const autocomplete = this.config.autocomplete !== false;

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (!sourceId) {
      throw new Error('sourceId is required');
    }

    if (amount === undefined || amount <= 0) {
      throw new Error('Valid amount is required (in cents)');
    }

    const payload: any = {
      location_id: locationId,
      source_id: sourceId,
      amount_money: {
        amount: amount,
        currency,
      },
      autocomplete,
    };

    if (customerId) payload.customer_id = customerId;
    if (note) payload.note = note;
    if (referenceId) payload.reference_id = referenceId;
    if (tipMoney) payload.tip_money = tipMoney;

    const response = await this.callApi('v2/payments', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.payment.id,
        amount: response.payment.amount_money?.amount,
        currency: response.payment.amount_money?.currency,
        status: response.payment.status,
        createdAt: response.payment.created_at,
        orderId: response.payment.order_id,
      },
    };
  }

  /**
   * Get a payment
   */
  private async getPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentId = this.resolveValue(this.config.paymentId, context);

    if (!paymentId) {
      throw new Error('paymentId is required');
    }

    const response = await this.callApi(`v2/payments/${paymentId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.payment.id,
        amount: response.payment.amount_money,
        status: response.payment.status,
        createdAt: response.payment.created_at,
        orderId: response.payment.order_id,
      },
    };
  }

  /**
   * List payments
   */
  private async listPayments(): Promise<NodeExecutionResult> {
    const locationId = this.config.locationId;
    const beginTime = this.config.beginTime;
    const endTime = this.config.endTime;
    const last4 = this.config.last4;
    const cardBrand = this.config.cardBrand;
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;

    let url = `v2/payments?limit=${limit}`;
    if (locationId) url += `&location_id=${locationId}`;
    if (beginTime) url += `&begin_time=${beginTime}`;
    if (endTime) url += `&end_time=${endTime}`;
    if (last4) url += `&last_4=${last4}`;
    if (cardBrand) url += `&card_brand=${cardBrand}`;
    if (cursor) url += `&cursor=${cursor}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        payments: response.map((p: any) => ({
          id: p.id,
          amount: p.amount_money?.amount,
          currency: p.amount_money?.currency,
          status: p.status,
          createdAt: p.created_at,
          orderId: p.order_id,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Refund a payment
   */
  private async refundPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentId = this.resolveValue(this.config.paymentId, context);
    const amount = this.config.amount;
    const currency = this.config.currency || 'USD';
    const reason = this.resolveValue(this.config.reason, context);
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!paymentId) {
      throw new Error('paymentId is required');
    }

    const payload: any = {
      amount_money: {
        amount,
        currency,
      },
      reason,
    };

    if (orderId) payload.order_id = orderId;

    const response = await this.callApi(`v2/payments/${paymentId}/refund`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.refund.id,
        amount: response.refund.amount_money?.amount,
        status: response.refund.status,
        createdAt: response.refund.created_at,
      },
    };
  }

  /**
   * Cancel a payment (terminal refund)
   */
  private async cancelPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentId = this.resolveValue(this.config.paymentId, context);

    if (!paymentId) {
      throw new Error('paymentId is required');
    }

    const response = await this.callApi(`v2/payments/${paymentId}/cancel`, 'POST', {});

    return {
      success: true,
      data: {
        id: response.payment.id,
        status: response.payment.status,
        canceledAt: response.payment.canceled_at,
      },
    };
  }

  /**
   * Create a customer
   */
  private async createCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const givenName = this.resolveValue(this.config.givenName, context);
    const familyName = this.resolveValue(this.config.familyName, context);
    const companyName = this.resolveValue(this.config.companyName, context);
    const emailAddress = this.resolveValue(this.config.emailAddress, context);
    const phoneNumber = this.resolveValue(this.config.phoneNumber, context);
    const referenceId = this.resolveValue(this.config.referenceId, context);
    const note = this.resolveValue(this.config.note, context);

    const payload: any = {
      given_name: givenName,
      family_name: familyName,
    };

    if (companyName) payload.company_name = companyName;
    if (emailAddress) payload.email_address = emailAddress;
    if (phoneNumber) payload.phone_number = phoneNumber;
    if (referenceId) payload.reference_id = referenceId;
    if (note) payload.note = note;

    const response = await this.callApi('v2/customers', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.customer.id,
        createdAt: response.customer.created_at,
      },
    };
  }

  /**
   * Get a customer
   */
  private async getCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context);

    if (!customerId) {
      throw new Error('customerId is required');
    }

    const response = await this.callApi(`v2/customers/${customerId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.customer.id,
        givenName: response.customer.given_name,
        familyName: response.customer.family_name,
        companyName: response.customer.company_name,
        emailAddress: response.customer.email_address,
        phoneNumber: response.customer.phone_number,
        createdAt: response.customer.created_at,
        cards: response.customer.cards,
      },
    };
  }

  /**
   * Update a customer
   */
  private async updateCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context);
    const emailAddress = this.config.emailAddress;
    const phoneNumber = this.config.phoneNumber;
    const note = this.config.note;

    if (!customerId) {
      throw new Error('customerId is required');
    }

    const payload: any = {};

    if (emailAddress) payload.email_address = emailAddress;
    if (phoneNumber) payload.phone_number = phoneNumber;
    if (note) payload.note = note;

    const response = await this.callApi(`v2/customers/${customerId}`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.customer.id,
        updatedAt: response.customer.updated_at,
      },
    };
  }

  /**
   * Delete a customer
   */
  private async deleteCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context);

    if (!customerId) {
      throw new Error('customerId is required');
    }

    await this.callApi(`v2/customers/${customerId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: customerId,
        deleted: true,
      },
    };
  }

  /**
   * List customers
   */
  private async listCustomers(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;
    const sort = this.config.sort || 'DEFAULT'; // DEFAULT, CREATED_AT
    const order = this.config.order || 'ASC'; // ASC, DESC

    let url = `v2/customers?limit=${limit}&sort=${sort}&order=${order}`;
    if (cursor) url += `&cursor=${cursor}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        customers: response.map((c: any) => ({
          id: c.id,
          givenName: c.given_name,
          familyName: c.family_name,
          emailAddress: c.email_address,
          createdAt: c.created_at,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Search customers
   */
  private async searchCustomers(): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const limit = this.config.limit || 100;

    if (!query) {
      throw new Error('query is required');
    }

    const payload = {
      query: {
        filter: {
          expression: query,
        },
        limit,
      },
    };

    const response = await this.callApi('v2/customers/search', 'POST', payload);

    return {
      success: true,
      data: {
        customers: response.map((c: any) => ({
          id: c.id,
          givenName: c.given_name,
          familyName: c.family_name,
          emailAddress: c.email_address,
          createdAt: c.created_at,
        })),
      },
    };
  }

  /**
   * Create an order
   */
  private async createOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const locationId = this.resolveValue(this.config.locationId, context);
    const order = this.config.order;
    const idempotencyKey = this.resolveValue(this.config.idempotencyKey, context);

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (!order) {
      throw new Error('order object is required');
    }

    const payload: any = {
      idempotency_key: idempotencyKey,
      order,
    };

    if (!order.location_id) {
      order.location_id = locationId;
    }

    const response = await this.callApi('v2/orders', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.order.id,
        state: response.order.state,
        totalMoney: response.order.total_money,
        createdAt: response.order.created_at,
      },
    };
  }

  /**
   * Get an order
   */
  private async getOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const response = await this.callApi(`v2/orders/${orderId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.order.id,
        state: response.order.state,
        totalMoney: response.order.total_money,
        createdAt: response.order.created_at,
        updatedAt: response.order.updated_at,
      },
    };
  }

  /**
   * Update an order
   */
  private async updateOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const order = this.config.order;
    const idempotencyKey = this.resolveValue(this.config.idempotencyKey, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    if (!order) {
      throw new Error('order object is required');
    }

    const payload: any = {
      idempotency_key: idempotencyKey,
      order,
      fields_to_clear: this.config.fieldsToClear || [],
    };

    const response = await this.callApi(`v2/orders/${orderId}`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.order.id,
        state: response.order.state,
        updatedAt: response.order.updated_at,
      },
    };
  }

  /**
   * List orders
   */
  private async listOrders(): Promise<NodeExecutionResult> {
    const locationId = this.config.locationId;
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;
    const state = this.config.state; // OPEN, COMPLETED, CANCELED, FAILED

    let url = `v2/orders?limit=${limit}`;
    if (locationId) url += `&location_id=${locationId}`;
    if (cursor) url += `&cursor=${cursor}`;
    if (state) url += `&state=${state}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        orders: response.map((o: any) => ({
          id: o.id,
          state: o.state,
          totalMoney: o.total_money,
          createdAt: o.created_at,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Pay an order
   */
  private async payOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const sourceId = this.resolveValue(this.config.sourceId, context);
    const amountMoney = this.config.amountMoney;
    const tipMoney = this.config.tipMoney;
    const autocomplete = this.config.autocomplete !== false;
    const idempotencyKey = this.resolveValue(this.config.idempotencyKey, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    if (!sourceId) {
      throw new Error('sourceId is required');
    }

    const payload: any = {
      idempotency_key: idempotencyKey,
      source_id: sourceId,
      autocomplete,
    };

    if (amountMoney) payload.amount_money = amountMoney;
    if (tipMoney) payload.tip_money = tipMoney;

    const response = await this.callApi(`v2/orders/${orderId}/pay`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.order.id,
        state: response.order.state,
        totalMoney: response.order.total_money,
      },
    };
  }

  /**
   * Create a catalog item
   */
  private async createCatalogItem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const type = this.config.type; // ITEM, CATEGORY, TAX, DISCOUNT, MODIFIER_LIST, MODIFIER
    const idempotencyKey = this.resolveValue(this.config.idempotencyKey, context);
    const itemData = this.config.itemData;

    if (!type) {
      throw new Error('type is required (ITEM, CATEGORY, TAX, DISCOUNT, MODIFIER_LIST, or MODIFIER)');
    }

    if (!itemData) {
      throw new Error('itemData is required');
    }

    const payload = {
      idempotency_key: idempotencyKey,
      object: {
        type,
        ...itemData,
      },
    };

    const response = await this.callApi('v2/catalog/object', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.object.id,
        type: response.object.type,
        version: response.object.version,
        createdAt: response.object.created_at,
      },
    };
  }

  /**
   * Update a catalog item
   */
  private async updateCatalogItem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const objectId = this.resolveValue(this.config.objectId, context);
    const itemData = this.config.itemData;

    if (!objectId) {
      throw new Error('objectId is required');
    }

    if (!itemData) {
      throw new Error('itemData is required');
    }

    const payload = {
      object: {
        id: objectId,
        ...itemData,
      },
    };

    const response = await this.callApi('v2/catalog/object', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.object.id,
        version: response.object.version,
        updatedAt: response.object.updated_at,
      },
    };
  }

  /**
   * Batch delete catalog items
   */
  private async batchDeleteCatalog(context: ExecutionContext): Promise<NodeExecutionResult> {
    const objectIds = this.config.objectIds;

    if (!objectIds || objectIds.length === 0) {
      throw new Error('objectIds array is required');
    }

    const payload = {
      object_ids: objectIds,
    };

    const response = await this.callApi('v2/catalog/batch-delete', 'POST', payload);

    return {
      success: true,
      data: {
        deleted: response.deleted_object_ids?.length || 0,
        ids: response.deleted_object_ids || [],
      },
    };
  }

  /**
   * Retrieve catalog item
   */
  private async retrieveCatalog(context: ExecutionContext): Promise<NodeExecutionResult> {
    const objectId = this.resolveValue(this.config.objectId, context);
    const includeRelatedObjects = this.config.includeRelatedObjects || false;

    if (!objectId) {
      throw new Error('objectId is required');
    }

    let url = `v2/catalog/object/${objectId}`;
    if (includeRelatedObjects) url += '?include_related_objects=true';

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        id: response.object.id,
        type: response.object.type,
        version: response.object.version,
        data: response.object.data,
        relatedObjects: response.related_objects,
      },
    };
  }

  /**
   * Search catalog
   */
  private async searchCatalog(): Promise<NodeExecutionResult> {
    const objectTypes = this.config.objectTypes || ['ITEM'];
    const query = this.config.query;
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;

    const payload: any = {
      object_types: objectTypes,
      limit,
      query: {
        filter: query,
      },
    };

    if (cursor) payload.cursor = cursor;

    const response = await this.callApi('v2/catalog/search', 'POST', payload);

    return {
      success: true,
      data: {
        items: response.map((r: any) => ({
          id: r.id,
          type: r.type,
          version: r.version,
          data: r.data,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * List catalog
   */
  private async listCatalog(): Promise<NodeExecutionResult> {
    const types = this.config.types || ['ITEM'];
    const cursor = this.config.cursor;
    const limit = this.config.limit || 100;

    let url = `v2/catalog/list?types=${types.join(',')}&limit=${limit}`;
    if (cursor) url += `&cursor=${cursor}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        items: response.map((r: any) => ({
          id: r.id,
          type: r.type,
          version: r.version,
          data: r.data,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Create a location
   */
  private async createLocation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const businessName = this.resolveValue(this.config.businessName, context);
    const address = this.config.address;
    const phoneNumber = this.resolveValue(this.config.phoneNumber, context);
    const websiteUrl = this.resolveValue(this.config.websiteUrl, context);
    const taxIds = this.config.taxIds;

    if (!name) {
      throw new Error('name is required');
    }

    const payload: any = {};

    if (name) payload.name = name;
    if (businessName) payload.business_name = businessName;
    if (address) payload.address = address;
    if (phoneNumber) payload.phone_number = phoneNumber;
    if (websiteUrl) payload.website_url = websiteUrl;
    if (taxIds) payload.tax_ids = taxIds;

    const response = await this.callApi('v2/locations', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.location.id,
        name: response.location.name,
        createdAt: response.location.created_at,
      },
    };
  }

  /**
   * Get a location
   */
  private async getLocation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const locationId = this.resolveValue(this.config.locationId, context);

    if (!locationId) {
      throw new Error('locationId is required');
    }

    const response = await this.callApi(`v2/locations/${locationId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.location.id,
        name: response.location.name,
        businessName: response.location.business_name,
        address: response.location.address,
        currency: response.location.currency,
        status: response.location.status,
      },
    };
  }

  /**
   * List locations
   */
  private async listLocations(): Promise<NodeExecutionResult> {
    const cursor = this.config.cursor;

    let url = 'v2/locations';
    if (cursor) url += `?cursor=${cursor}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        locations: response.map((l: any) => ({
          id: l.id,
          name: l.name,
          businessName: l.business_name,
          currency: l.currency,
          status: l.status,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Create a checkout
   */
  private async createCheckout(context: ExecutionContext): Promise<NodeExecutionResult> {
    const locationId = this.resolveValue(this.config.locationId, context);
    const order = this.config.order;
    const merchantSupportEmail = this.resolveValue(this.config.merchantSupportEmail, context);
    const prePopulateBuyerEmail = this.resolveValue(this.config.prePopulateBuyerEmail, context);
    const redirectUrl = this.resolveValue(this.config.redirectUrl, context);
    const idempotencyKey = this.resolveValue(this.config.idempotencyKey, context);

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (!order) {
      throw new Error('order object is required');
    }

    const payload: any = {
      idempotency_key: idempotencyKey,
      order,
    };

    if (merchantSupportEmail) payload.merchant_support_email = merchantSupportEmail;
    if (prePopulateBuyerEmail) payload.pre_populate_buyer_email = prePopulateBuyerEmail;
    if (redirectUrl) payload.redirect_url = redirectUrl;
    if (!order.location_id) order.location_id = locationId;

    const response = await this.callApi('v2/checkouts', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.checkout.id,
        checkoutUrl: response.checkout.checkout_page_url,
        createdAt: response.checkout.created_at,
      },
    };
  }

  /**
   * Get a checkout
   */
  private async getCheckout(context: ExecutionContext): Promise<NodeExecutionResult> {
    const checkoutId = this.resolveValue(this.config.checkoutId, context);

    if (!checkoutId) {
      throw new Error('checkoutId is required');
    }

    const response = await this.callApi(`v2/checkouts/${checkoutId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.checkout.id,
        order: response.checkout.order,
        checkoutUrl: response.checkout.checkout_page_url,
      },
    };
  }

  /**
   * List transactions
   */
  private async listTransactions(): Promise<NodeExecutionResult> {
    const locationId = this.config.locationId;
    const beginTime = this.config.beginTime;
    const endTime = this.config.endTime;
    const sort = this.config.sort || 'CREATED_AT';
    const sortOrder = this.config.sortOrder || 'DESC';
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;

    let url = `v2/transactions?limit=${limit}&sort=${sort}&sort_order=${sortOrder}`;
    if (locationId) url += `&location_id=${locationId}`;
    if (beginTime) url += `&begin_time=${beginTime}`;
    if (endTime) url += `&end_time=${endTime}`;
    if (cursor) url += `&cursor=${cursor}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        transactions: response.map((t: any) => ({
          id: t.transaction.id,
          amountMoney: t.transaction.amount_money,
          createdAt: t.transaction.created_at,
          tender: t.transaction.tender,
          orderId: t.transaction.order_id,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Create an invoice
   */
  private async createInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const locationId = this.resolveValue(this.config.locationId, context);
    const orderId = this.resolveValue(this.config.orderId, context);
    const primaryRecipient = this.resolveValue(this.config.primaryRecipient, context);
    const paymentRequests = this.config.paymentRequests;
    const idempotencyKey = this.resolveValue(this.config.idempotencyKey, context);
    const description = this.resolveValue(this.config.description, context);
    const deliveryMethod = this.config.deliveryMethod || 'EMAIL';
    const scheduledAt = this.config.scheduledAt;

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (!orderId) {
      throw new Error('orderId is required');
    }

    if (!primaryRecipient) {
      throw new Error('primaryRecipient is required');
    }

    const invoice: any = {
      location_id: locationId,
      order_id: orderId,
      primary_recipient: {
        customer_id: primaryRecipient.customerId,
        email_address: primaryRecipient.emailAddress,
      },
      payment_requests: paymentRequests,
      delivery_method: deliveryMethod,
      description,
    };

    if (scheduledAt) invoice.scheduled_at = scheduledAt;

    const payload = {
      idempotency_key: idempotencyKey,
      invoice,
    };

    const response = await this.callApi('v2/invoices', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.invoice.id,
        invoiceNumber: response.invoice.invoice_number,
        version: response.invoice.version,
        status: response.invoice.status,
      },
    };
  }

  /**
   * Get an invoice
   */
  private async getInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const invoiceId = this.resolveValue(this.config.invoiceId, context);
    const version = this.config.version;

    if (!invoiceId) {
      throw new Error('invoiceId is required');
    }

    let url = `v2/invoices/${invoiceId}`;
    if (version) url += `?version=${version}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        id: response.invoice.id,
        invoiceNumber: response.invoice.invoice_number,
        version: response.invoice.version,
        status: response.invoice.status,
        totalMoney: response.invoice.total_money,
      },
    };
  }

  /**
   * List invoices
   */
  private async listInvoices(): Promise<NodeExecutionResult> {
    const locationId = this.config.locationId;
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;

    let url = `v2/invoices?limit=${limit}`;
    if (locationId) url += `&location_id=${locationId}`;
    if (cursor) url += `&cursor=${cursor}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        invoices: response.map((i: any) => ({
          id: i.id,
          invoiceNumber: i.invoice_number,
          version: i.version,
          status: i.status,
          totalMoney: i.total_money,
          orderId: i.order_id,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Delete an invoice
   */
  private async deleteInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const invoiceId = this.resolveValue(this.config.invoiceId, context);
    const version = this.config.version;

    if (!invoiceId) {
      throw new Error('invoiceId is required');
    }

    if (!version) {
      throw new Error('version is required for deletion');
    }

    let url = `v2/invoices/${invoiceId}?version=${version}`;

    await this.callApi(url, 'DELETE');

    return {
      success: true,
      data: {
        id: invoiceId,
        deleted: true,
      },
    };
  }

  /**
   * Create a subscription
   */
  private async createSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const locationId = this.resolveValue(this.config.locationId, context);
    const planId = this.resolveValue(this.config.planId, context);
    const customerId = this.resolveValue(this.config.customerId, context);
    const idempotencyKey = this.resolveValue(this.config.idempotencyKey, context);
    const startDate = this.config.startDate; // YYYY-MM-DD
    const canceledDate = this.config.canceledDate; // YYYY-MM-DD
    const taxPercentage = this.config.taxPercentage;
    const priceOverrideMoney = this.config.priceOverrideMoney;
    const cardId = this.resolveValue(this.config.cardId, context);

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (!planId) {
      throw new Error('planId is required');
    }

    if (!customerId) {
      throw new Error('customerId is required');
    }

    const subscription: any = {
      location_id: locationId,
      plan_id: planId,
      customer_id: customerId,
    };

    if (startDate) subscription.start_date = startDate;
    if (canceledDate) subscription.canceled_date = canceledDate;
    if (taxPercentage !== undefined) subscription.tax_percentage = taxPercentage;
    if (priceOverrideMoney) subscription.price_override_money = priceOverrideMoney;
    if (cardId) subscription.card_id = cardId;

    const payload = {
      idempotency_key: idempotencyKey,
      subscription,
    };

    const response = await this.callApi('v2/subscriptions', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.subscription.id,
        status: response.subscription.status,
        startDate: response.subscription.start_date,
      },
    };
  }

  /**
   * Get a subscription
   */
  private async getSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const response = await this.callApi(`v2/subscriptions/${subscriptionId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.subscription.id,
        status: response.subscription.status,
        planId: response.subscription.plan_id,
        customerId: response.subscription.customer_id,
        startDate: response.subscription.start_date,
        canceledDate: response.subscription.canceled_date,
      },
    };
  }

  /**
   * List subscriptions
   */
  private async listSubscriptions(): Promise<NodeExecutionResult> {
    const locationId = this.config.locationId;
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;
    const status = this.config.status; // ACTIVE, CANCELED, PAST_DUE

    let url = `v2/subscriptions?limit=${limit}`;
    if (locationId) url += `&location_id=${locationId}`;
    if (cursor) url += `&cursor=${cursor}`;
    if (status) url += `&status=${status}`;

    const response = await this.callApi(url, 'GET');

    return {
      success: true,
      data: {
        subscriptions: response.map((s: any) => ({
          id: s.id,
          status: s.status,
          planId: s.plan_id,
          customerId: s.customer_id,
          startDate: s.start_date,
        })),
        cursor: response[response.length - 1]?.cursor,
      },
    };
  }

  /**
   * Cancel a subscription
   */
  private async cancelSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const response = await this.callApi(`v2/subscriptions/${subscriptionId}/cancel`, 'POST', {});

    return {
      success: true,
      data: {
        id: response.subscription.id,
        status: response.subscription.status,
        canceledAt: response.subscription.canceled_date,
      },
    };
  }

  /**
   * Update a subscription
   */
  private async updateSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const taxPercentage = this.config.taxPercentage;
    const priceOverrideMoney = this.config.priceOverrideMoney;
    const cardId = this.config.cardId;

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const payload: any = {};

    if (taxPercentage !== undefined) payload.tax_percentage = taxPercentage;
    if (priceOverrideMoney) payload.price_override_money = priceOverrideMoney;
    if (cardId) payload.card_id = cardId;

    const response = await this.callApi(`v2/subscriptions/${subscriptionId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.subscription.id,
        version: response.subscription.version,
        updatedAt: response.subscription.updated_at,
      },
    };
  }

  /**
   * Call Square API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Square-Version': '2024-01-18',
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
      throw new Error(error.errors?.[0]?.detail || error.message || response.statusText);
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
    if (error.code === 'PAYMENT_NOT_REFUNDABLE') {
      return 'Payment is not refundable';
    }
    if (error.code === 'INVALID_CARD') {
      return 'Invalid card';
    }
    if (error.code === 'CARD_DECLINED') {
      return 'Card declined';
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return 'Insufficient funds';
    }
    if (error.code === 'CUSTOMER_NOT_FOUND') {
      return 'Customer not found';
    }
    if (error.code === 'BAD_REQUEST') {
      return 'Bad request. Check your input parameters.';
    }
    return `Square error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'square';
  }

  getIcon(): string {
    return '⬜';
  }

  /**
   * Currency codes
   */
  static readonly Currencies = {
    USD: 'USD',
    CAD: 'CAD',
    EUR: 'EUR',
    GBP: 'GBP',
    JPY: 'JPY',
    AUD: 'AUD',
  } as const;

  /**
   * Order states
   */
  static readonly OrderStates = {
    OPEN: 'OPEN',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED',
    FAILED: 'FAILED',
  } as const;

  /**
   * Subscription statuses
   */
  static readonly SubscriptionStatuses = {
    ACTIVE: 'ACTIVE',
    CANCELED: 'CANCELED',
    PAST_DUE: 'PAST_DUE',
    PAUSED: 'PAUSED',
  } as const;
}
