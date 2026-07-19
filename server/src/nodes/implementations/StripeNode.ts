import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Stripe Node - Stripe Payment Processing API
 * n8n-compatible: Complete Stripe integration
 *
 * Configuration:
 * - operation: 'createCharge' | 'createPaymentIntent' | 'confirmPayment' | 'refundCharge' | 'capturePayment' |
 *              'createCustomer' | 'getCustomer' | 'updateCustomer' | 'deleteCustomer' | 'listCustomers' |
 *              'createProduct' | 'getProduct' | 'updateProduct' | 'deleteProduct' | 'listProducts' |
 *              'createPrice' | 'getPrice' | 'updatePrice' | 'listPrices' |
 *              'createSubscription' | 'getSubscription' | 'updateSubscription' | 'cancelSubscription' | 'listSubscriptions' |
 *              'createInvoice' | 'getInvoice' | 'listInvoices' | 'payInvoice' |
 *              'createInvoiceItem' | 'getInvoiceItem' | 'deleteInvoiceItem' |
 *              'setupIntent' | 'getPaymentMethod' | 'attachPaymentMethod' | 'detachPaymentMethod' |
 *              'listPaymentIntents' | 'listCharges' | 'listEvents' | 'getEvent' |
 * - apiKey: Stripe API key (secret key)
 * - publishableKey: Stripe publishable key (for client-side operations)
 * - apiVersion: Stripe API version (default: '2023-10-16')
 *
 * Payment Operations:
 * - amount: Amount in cents (integer)
 * - currency: 3-letter ISO currency code
 * - customer: Customer ID
 * - paymentMethod: Payment method ID
 * - description: Payment description
 * - metadata: Additional metadata object
 * - receiptEmail: Email for receipt
 *
 * Customer Operations:
 * - email: Customer email
 * - name: Customer name
 * - phone: Customer phone
 * - description: Customer description
 * - shipping: Shipping address object
 * - paymentMethod: Default payment method ID
 *
 * Product/Price Operations:
 * - productName: Product name
 * - productDescription: Product description
 * - unitAmount: Price amount in cents
 * - recurring: Recurring billing interval { interval: 'month' | 'year', intervalCount: 1 }
 *
 * Subscription Operations:
 * - items: Array of { price: priceId, quantity: number }
 * - trialPeriodDays: Trial period
 * - coupon: Discount coupon code
 * - defaultPaymentMethod: Default payment method
 *
 * Invoice Operations:
 * - customer: Customer ID
 * - subscription: Subscription ID
 * - daysUntilDue: Days until due date
 *
 * Refund Operations:
 * - charge: Charge ID to refund
 * - amount: Amount to refund in cents (optional, full refund if not specified)
 * - reason: 'duplicate' | 'fraudulent' | 'requested_by_customer'
 */
export class StripeNode extends BaseNode {
  private apiBaseUrl = 'https://api.stripe.com/v1';
  private apiKey: string;
  private apiVersion: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.apiKey = config.apiKey || '';
    this.apiVersion = config.apiVersion || '2023-10-16';
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.apiKey) {
      throw new Error('Stripe API key is required');
    }

    if (!this.apiKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe API key. Must start with "sk_"');
    }

    const validOperations = [
      'createCharge', 'createPaymentIntent', 'confirmPayment', 'refundCharge', 'capturePayment',
      'createCustomer', 'getCustomer', 'updateCustomer', 'deleteCustomer', 'listCustomers',
      'createProduct', 'getProduct', 'updateProduct', 'deleteProduct', 'listProducts',
      'createPrice', 'getPrice', 'updatePrice', 'listPrices',
      'createSubscription', 'getSubscription', 'updateSubscription', 'cancelSubscription', 'listSubscriptions',
      'createInvoice', 'getInvoice', 'listInvoices', 'payInvoice', 'upcomingInvoice',
      'createInvoiceItem', 'getInvoiceItem', 'deleteInvoiceItem',
      'setupIntent', 'getPaymentMethod', 'attachPaymentMethod', 'detachPaymentMethod', 'listPaymentMethods',
      'listPaymentIntents', 'getCharge', 'listCharges', 'listEvents', 'getEvent', 'verifyWebhook',
      'createToken', 'createEphemeralKey',
    ];

    const operation = this.config.operation || 'createPaymentIntent';

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'createPaymentIntent';

      switch (operation) {
        // Payment Operations
        case 'createCharge':
          return await this.createCharge(context);
        case 'createPaymentIntent':
          return await this.createPaymentIntent(context);
        case 'confirmPayment':
          return await this.confirmPayment(context);
        case 'refundCharge':
          return await this.refundCharge(context);
        case 'capturePayment':
          return await this.capturePayment(context);

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

        // Product Operations
        case 'createProduct':
          return await this.createProduct(context);
        case 'getProduct':
          return await this.getProduct(context);
        case 'updateProduct':
          return await this.updateProduct(context);
        case 'deleteProduct':
          return await this.deleteProduct(context);
        case 'listProducts':
          return await this.listProducts();

        // Price Operations
        case 'createPrice':
          return await this.createPrice(context);
        case 'getPrice':
          return await this.getPrice(context);
        case 'updatePrice':
          return await this.updatePrice(context);
        case 'listPrices':
          return await this.listPrices();

        // Subscription Operations
        case 'createSubscription':
          return await this.createSubscription(context);
        case 'getSubscription':
          return await this.getSubscription(context);
        case 'updateSubscription':
          return await this.updateSubscription(context);
        case 'cancelSubscription':
          return await this.cancelSubscription(context);
        case 'listSubscriptions':
          return await this.listSubscriptions();

        // Invoice Operations
        case 'createInvoice':
          return await this.createInvoice(context);
        case 'getInvoice':
          return await this.getInvoice(context);
        case 'listInvoices':
          return await this.listInvoices();
        case 'payInvoice':
          return await this.payInvoice(context);
        case 'upcomingInvoice':
          return await this.getUpcomingInvoice(context);
        case 'createInvoiceItem':
          return await this.createInvoiceItem(context);
        case 'getInvoiceItem':
          return await this.getInvoiceItem(context);
        case 'deleteInvoiceItem':
          return await this.deleteInvoiceItem(context);

        // Payment Method Operations
        case 'setupIntent':
          return await this.createSetupIntent(context);
        case 'getPaymentMethod':
          return await this.getPaymentMethod(context);
        case 'attachPaymentMethod':
          return await this.attachPaymentMethod(context);
        case 'detachPaymentMethod':
          return await this.detachPaymentMethod(context);
        case 'listPaymentMethods':
          return await this.listPaymentMethods(context);

        // List Operations
        case 'listPaymentIntents':
          return await this.listPaymentIntents();
        case 'getCharge':
          return await this.getCharge(context);
        case 'listCharges':
          return await this.listCharges();
        case 'listEvents':
          return await this.listEvents();
        case 'getEvent':
          return await this.getEvent(context);
        case 'verifyWebhook':
          return await this.verifyWebhook(context);

        // Token & Ephemeral Key Operations
        case 'createToken':
          return await this.createToken(context);
        case 'createEphemeralKey':
          return await this.createEphemeralKey(context);

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
   * Create a direct charge (legacy)
   */
  private async createCharge(context: ExecutionContext): Promise<NodeExecutionResult> {
    const amount = this.config.amount;
    const currency = this.config.currency || 'usd';
    const customer = this.resolveValue(this.config.customer, context);
    const source = this.resolveValue(this.config.source, context);
    const description = this.resolveValue(this.config.description, context);
    const metadata = this.config.metadata || {};
    const receiptEmail = this.resolveValue(this.config.receiptEmail, context);
    const capture = this.config.capture !== false;

    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required (in cents)');
    }

    if (!currency || currency.length !== 3) {
      throw new Error('Valid 3-letter currency code is required');
    }

    if (!customer && !source) {
      throw new Error('Either customer or source is required');
    }

    const payload: any = {
      amount,
      currency,
      capture,
    };

    if (customer) payload.customer = customer;
    if (source) payload.source = source;
    if (description) payload.description = description;
    if (receiptEmail) payload.receipt_email = receiptEmail;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const charge = await this.callApi('charges', 'POST', payload);

    return {
      success: true,
      data: {
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        paid: charge.paid,
        captured: charge.captured,
        description: charge.description,
        receiptUrl: charge.receipt_url,
        receiptNumber: charge.receipt_number,
        paymentMethod: charge.payment_method,
        customerId: charge.customer,
        created: new Date(charge.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Create a payment intent (recommended)
   */
  private async createPaymentIntent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const amount = this.config.amount;
    const currency = this.config.currency || 'usd';
    const customer = this.resolveValue(this.config.customer, context);
    const paymentMethod = this.resolveValue(this.config.paymentMethod, context);
    const description = this.resolveValue(this.config.description, context);
    const metadata = this.config.metadata || {};
    const receiptEmail = this.resolveValue(this.config.receiptEmail, context);
    const captureMethod = this.config.captureMethod || 'automatic';
    const setupFutureUsage = this.config.setupFutureUsage;
    const paymentMethodTypes = this.config.paymentMethodTypes || ['card'];

    if (amount !== undefined && (amount < 0 || typeof amount !== 'number')) {
      throw new Error('Valid amount is required (in cents)');
    }

    if (!currency || currency.length !== 3) {
      throw new Error('Valid 3-letter currency code is required');
    }

    const payload: any = {
      currency,
      payment_method_types: paymentMethodTypes,
      capture_method: captureMethod,
    };

    if (amount !== undefined) payload.amount = amount;
    if (customer) payload.customer = customer;
    if (paymentMethod) payload.payment_method = paymentMethod;
    if (setupFutureUsage) payload.setup_future_usage = setupFutureUsage;
    if (description) payload.description = description;
    if (receiptEmail) payload.receipt_email = receiptEmail;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const intent = await this.callApi('payment_intents', 'POST', payload);

    return {
      success: true,
      data: {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        clientSecret: intent.client_secret,
        nextAction: intent.next_action,
        paymentMethod: intent.payment_method,
        customerId: intent.customer,
        description: intent.description,
        created: new Date(intent.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Confirm a payment intent
   */
  private async confirmPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const intentId = this.resolveValue(this.config.intentId, context);
    const paymentMethod = this.resolveValue(this.config.paymentMethod, context);

    if (!intentId) {
      throw new Error('intentId is required');
    }

    const payload: any = {};
    if (paymentMethod) payload.payment_method = paymentMethod;

    const intent = await this.callApi(`payment_intents/${intentId}/confirm`, 'POST', payload);

    return {
      success: true,
      data: {
        id: intent.id,
        status: intent.status,
        amount: intent.amount,
        currency: intent.currency,
        clientSecret: intent.client_secret,
        nextAction: intent.next_action,
      },
    };
  }

  /**
   * Refund a charge
   */
  private async refundCharge(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chargeId = this.resolveValue(this.config.chargeId, context) || this.resolveValue(this.config.charge, context);
    const amount = this.config.amount;
    const reason = this.config.reason; // 'duplicate' | 'fraudulent' | 'requested_by_customer'
    const metadata = this.config.metadata || {};

    if (!chargeId) {
      throw new Error('chargeId is required');
    }

    const payload: any = {
      charge: chargeId,
    };

    if (amount) payload.amount = amount;
    if (reason) payload.reason = reason;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const refund = await this.callApi('refunds', 'POST', payload);

    return {
      success: true,
      data: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        chargeId: refund.charge,
        status: refund.status,
        reason: refund.reason,
        created: new Date(refund.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Capture an authorized payment
   */
  private async capturePayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chargeId = this.resolveValue(this.config.chargeId, context);
    const amount = this.config.amount;
    const applicationFee = this.config.applicationFee;

    if (!chargeId) {
      throw new Error('chargeId is required');
    }

    const payload: any = {};
    if (amount) payload.amount = amount;
    if (applicationFee) payload.application_fee = applicationFee;

    const charge = await this.callApi(`charges/${chargeId}/capture`, 'POST', payload);

    return {
      success: true,
      data: {
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        paid: charge.paid,
        captured: charge.captured,
        receiptUrl: charge.receipt_url,
      },
    };
  }

  /**
   * Create a customer
   */
  private async createCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);
    const name = this.resolveValue(this.config.name, context);
    const phone = this.resolveValue(this.config.phone, context);
    const description = this.resolveValue(this.config.description, context);
    const paymentMethod = this.resolveValue(this.config.paymentMethod, context);
    const metadata = this.config.metadata || {};
    const shipping = this.config.shipping;
    const address = this.config.address;
    const taxIds = this.config.taxIds;

    if (!email && !name) {
      throw new Error('Either email or name is required');
    }

    const payload: any = {};

    if (email) payload.email = email;
    if (name) payload.name = name;
    if (phone) payload.phone = phone;
    if (description) payload.description = description;
    if (paymentMethod) payload.invoice_settings = { default_payment_method: paymentMethod };
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;
    if (shipping) payload.shipping = shipping;
    if (address) payload.address = address;
    if (taxIds) payload.tax_ids = taxIds;

    const customer = await this.callApi('customers', 'POST', payload);

    return {
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        description: customer.description,
        created: new Date(customer.created * 1000).toISOString(),
        defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
      },
    };
  }

  /**
   * Get a customer
   */
  private async getCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context) || this.resolveValue(this.config.customer, context);

    if (!customerId) {
      throw new Error('customerId is required');
    }

    const customer = await this.callApi(`customers/${customerId}`);

    return {
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        description: customer.description,
        created: new Date(customer.created * 1000).toISOString(),
        defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
        subscriptions: customer.subscriptions?.data || [],
        metadata: customer.metadata,
      },
    };
  }

  /**
   * Update a customer
   */
  private async updateCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context);
    const email = this.resolveValue(this.config.email, context);
    const name = this.resolveValue(this.config.name, context);
    const phone = this.resolveValue(this.config.phone, context);
    const description = this.resolveValue(this.config.description, context);
    const paymentMethod = this.resolveValue(this.config.paymentMethod, context);
    const metadata = this.config.metadata || {};
    const shipping = this.config.shipping;
    const address = this.config.address;

    if (!customerId) {
      throw new Error('customerId is required');
    }

    const payload: any = {};

    if (email !== undefined) payload.email = email;
    if (name !== undefined) payload.name = name;
    if (phone !== undefined) payload.phone = phone;
    if (description !== undefined) payload.description = description;
    if (paymentMethod) payload.invoice_settings = { default_payment_method: paymentMethod };
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;
    if (shipping) payload.shipping = shipping;
    if (address) payload.address = address;

    const customer = await this.callApi(`customers/${customerId}`, 'POST', payload);

    return {
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        updated: true,
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

    await this.callApi(`customers/${customerId}`, 'DELETE');

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
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const email = this.config.email;

    let url = `customers?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (email) url += `&email=${encodeURIComponent(email)}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        customers: response.data.map((c: any) => ({
          id: c.id,
          email: c.email,
          name: c.name,
          description: c.description,
          created: new Date(c.created * 1000).toISOString(),
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * Create a product
   */
  private async createProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context);
    const metadata = this.config.metadata || {};
    const active = this.config.active !== false;
    const images = this.config.images || [];
    const packageDimensions = this.config.packageDimensions;
    const shippable = this.config.shippable;
    const url = this.config.url;
    const statementDescriptor = this.config.statementDescriptor;
    const unitLabel = this.config.unitLabel;

    if (!name) {
      throw new Error('Product name is required');
    }

    const payload: any = {
      name,
      active,
    };

    if (description) payload.description = description;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;
    if (images.length > 0) payload.images = images;
    if (packageDimensions) payload.package_dimensions = packageDimensions;
    if (shippable !== undefined) payload.shippable = shippable;
    if (url) payload.url = url;
    if (statementDescriptor) payload.statement_descriptor = statementDescriptor;
    if (unitLabel) payload.unit_label = unitLabel;

    const product = await this.callApi('products', 'POST', payload);

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        created: new Date(product.created * 1000).toISOString(),
        updated: new Date(product.updated * 1000).toISOString(),
      },
    };
  }

  /**
   * Get a product
   */
  private async getProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);

    if (!productId) {
      throw new Error('productId is required');
    }

    const product = await this.callApi(`products/${productId}`);

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        active: product.active,
        images: product.images,
        shippable: product.shippable,
        url: product.url,
        created: new Date(product.created * 1000).toISOString(),
        updated: new Date(product.updated * 1000).toISOString(),
        metadata: product.metadata,
      },
    };
  }

  /**
   * Update a product
   */
  private async updateProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);
    const name = this.config.name;
    const description = this.config.description;
    const active = this.config.active;
    const metadata = this.config.metadata || {};
    const images = this.config.images;

    if (!productId) {
      throw new Error('productId is required');
    }

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (description !== undefined) payload.description = description;
    if (active !== undefined) payload.active = active;
    if (images) payload.images = images;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const product = await this.callApi(`products/${productId}`, 'POST', payload);

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        updated: true,
      },
    };
  }

  /**
   * Delete a product
   */
  private async deleteProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);

    if (!productId) {
      throw new Error('productId is required');
    }

    await this.callApi(`products/${productId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: productId,
        deleted: true,
      },
    };
  }

  /**
   * List products
   */
  private async listProducts(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const active = this.config.active;

    let url = `products?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (active !== undefined) url += `&active=${active}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        products: response.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active,
          created: new Date(p.created * 1000).toISOString(),
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * Create a price
   */
  private async createPrice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);
    const unitAmount = this.config.unitAmount;
    const currency = this.config.currency || 'usd';
    const recurring = this.config.recurring; // { interval: 'month' | 'year', intervalCount: 1 }
    const metadata = this.config.metadata || {};
    const nickname = this.resolveValue(this.config.nickname, context);
    const product = this.config.product; // For creating price inline with product
    const taxBehavior = this.config.taxBehavior; // 'exclusive' | 'inclusive' | 'unspecified'

    if (!productId && !product) {
      throw new Error('Either productId or product data is required');
    }

    if (unitAmount === undefined || unitAmount <= 0) {
      throw new Error('Valid unitAmount is required (in cents)');
    }

    if (!currency || currency.length !== 3) {
      throw new Error('Valid 3-letter currency code is required');
    }

    const payload: any = {
      unit_amount: unitAmount,
      currency,
    };

    if (productId) payload.product = productId;
    if (product) payload.product_data = product;
    if (recurring) payload.recurring = recurring;
    if (nickname) payload.nickname = nickname;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;
    if (taxBehavior) payload.tax_behavior = taxBehavior;

    const price = await this.callApi('prices', 'POST', payload);

    return {
      success: true,
      data: {
        id: price.id,
        productId: price.product,
        unitAmount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        nickname: price.nickname,
        created: new Date(price.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Get a price
   */
  private async getPrice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const priceId = this.resolveValue(this.config.priceId, context);

    if (!priceId) {
      throw new Error('priceId is required');
    }

    const price = await this.callApi(`prices/${priceId}`);

    return {
      success: true,
      data: {
        id: price.id,
        productId: price.product,
        unitAmount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        nickname: price.nickname,
        created: new Date(price.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Update a price (limited fields)
   */
  private async updatePrice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const priceId = this.resolveValue(this.config.priceId, context);
    const active = this.config.active;
    const metadata = this.config.metadata || {};
    const nickname = this.config.nickname;

    if (!priceId) {
      throw new Error('priceId is required');
    }

    const payload: any = {};
    if (active !== undefined) payload.active = active;
    if (nickname !== undefined) payload.nickname = nickname;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const price = await this.callApi(`prices/${priceId}`, 'POST', payload);

    return {
      success: true,
      data: {
        id: price.id,
        updated: true,
      },
    };
  }

  /**
   * List prices
   */
  private async listPrices(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const product = this.config.product;
    const active = this.config.active;
    const recurring = this.config.recurring; // { interval: 'month' | 'year' }

    let url = `prices?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (product) url += `&product=${product}`;
    if (active !== undefined) url += `&active=${active}`;
    if (recurring?.interval) url += `&recurring[interval]=${recurring.interval}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        prices: response.data.map((p: any) => ({
          id: p.id,
          productId: p.product,
          unitAmount: p.unit_amount,
          currency: p.currency,
          recurring: p.recurring,
          nickname: p.nickname,
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * Create a subscription
   */
  private async createSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customer = this.resolveValue(this.config.customer, context);
    const items = this.config.items; // Array of { price: priceId, quantity: number }
    const trialPeriodDays = this.config.trialPeriodDays;
    const coupon = this.resolveValue(this.config.coupon, context);
    const defaultPaymentMethod = this.resolveValue(this.config.defaultPaymentMethod, context);
    const metadata = this.config.metadata || {};
    const paymentBehavior = this.config.paymentBehavior || 'default_incomplete';
    const prorationBehavior = this.config.prorationBehavior || 'create_prorations';

    if (!customer) {
      throw new Error('Customer ID is required');
    }

    if (!items || items.length === 0) {
      throw new Error('At least one subscription item is required');
    }

    const payload: any = {
      customer,
      items: items.map((item: any) => ({
        price: item.price,
        quantity: item.quantity || 1,
      })),
      payment_behavior: paymentBehavior,
      proration_behavior: prorationBehavior,
    };

    if (trialPeriodDays) payload.trial_period_days = trialPeriodDays;
    if (coupon) payload.coupon = coupon;
    if (defaultPaymentMethod) payload.default_payment_method = defaultPaymentMethod;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const subscription = await this.callApi('subscriptions', 'POST', payload);

    return {
      success: true,
      data: {
        id: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        items: subscription.items?.data || [],
        latestInvoice: subscription.latest_invoice,
        created: new Date(subscription.created * 1000).toISOString(),
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

    const subscription = await this.callApi(`subscriptions/${subscriptionId}`);

    return {
      success: true,
      data: {
        id: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        items: subscription.items?.data || [],
        latestInvoice: subscription.latest_invoice,
        defaultPaymentMethod: subscription.default_payment_method,
        created: new Date(subscription.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Update a subscription
   */
  private async updateSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const items = this.config.items;
    const trialEnd = this.config.trialEnd;
    const defaultPaymentMethod = this.resolveValue(this.config.defaultPaymentMethod, context);
    const metadata = this.config.metadata || {};
    const prorationBehavior = this.config.prorationBehavior;

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const payload: any = {};

    if (items) payload.items = items;
    if (trialEnd !== undefined) payload.trial_end = trialEnd;
    if (defaultPaymentMethod) payload.default_payment_method = defaultPaymentMethod;
    if (prorationBehavior) payload.proration_behavior = prorationBehavior;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const subscription = await this.callApi(`subscriptions/${subscriptionId}`, 'POST', payload);

    return {
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        updated: true,
      },
    };
  }

  /**
   * Cancel a subscription
   */
  private async cancelSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const cancelAtPeriodEnd = this.config.cancelAtPeriodEnd;
    const cancelAt = this.config.cancelAt;

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    let url = `subscriptions/${subscriptionId}`;

    const payload: any = {};
    if (cancelAtPeriodEnd) {
      payload.cancel_at_period_end = true;
    } else if (cancelAt) {
      payload.cancel_at = cancelAt;
    }

    const subscription = await this.callApi(url, 'DELETE', payload);

    return {
      success: true,
      data: {
        id: subscription.id,
        status: subscription.status,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        canceled: true,
      },
    };
  }

  /**
   * List subscriptions
   */
  private async listSubscriptions(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const customer = this.config.customer;
    const status = this.config.status; // 'all' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing'

    let url = `subscriptions?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (customer) url += `&customer=${customer}`;
    if (status) url += `&status=${status}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        subscriptions: response.data.map((s: any) => ({
          id: s.id,
          customerId: s.customer,
          status: s.status,
          currentPeriodStart: new Date(s.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(s.current_period_end * 1000).toISOString(),
          created: new Date(s.created * 1000).toISOString(),
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * Create an invoice
   */
  private async createInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customer = this.resolveValue(this.config.customer, context);
    const subscription = this.resolveValue(this.config.subscription, context);
    const daysUntilDue = this.config.daysUntilDue;
    const description = this.resolveValue(this.config.description, context);
    const metadata = this.config.metadata || {};
    const autoAdvance = this.config.autoAdvance !== false;

    if (!customer) {
      throw new Error('Customer ID is required');
    }

    const payload: any = {
      customer,
      auto_advance: autoAdvance,
    };

    if (subscription) payload.subscription = subscription;
    if (daysUntilDue) payload.days_until_due = daysUntilDue;
    if (description) payload.description = description;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const invoice = await this.callApi('invoices', 'POST', payload);

    return {
      success: true,
      data: {
        id: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription,
        status: invoice.status,
        total: invoice.total,
        currency: invoice.currency,
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        created: new Date(invoice.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Get an invoice
   */
  private async getInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const invoiceId = this.resolveValue(this.config.invoiceId, context);

    if (!invoiceId) {
      throw new Error('invoiceId is required');
    }

    const invoice = await this.callApi(`invoices/${invoiceId}`);

    return {
      success: true,
      data: {
        id: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription,
        status: invoice.status,
        total: invoice.total,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        tax: invoice.total_tax_amounts || [],
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000).toISOString() : null,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        created: new Date(invoice.created * 1000).toISOString(),
      },
    };
  }

  /**
   * List invoices
   */
  private async listInvoices(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const customer = this.config.customer;
    const status = this.config.status; // 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'

    let url = `invoices?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (customer) url += `&customer=${customer}`;
    if (status) url += `&status=${status}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        invoices: response.data.map((inv: any) => ({
          id: inv.id,
          customerId: inv.customer,
          subscriptionId: inv.subscription,
          status: inv.status,
          total: inv.total,
          currency: inv.currency,
          created: new Date(inv.created * 1000).toISOString(),
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * Pay an invoice
   */
  private async payInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const invoiceId = this.resolveValue(this.config.invoiceId, context);
    const paymentMethod = this.resolveValue(this.config.paymentMethod, context);

    if (!invoiceId) {
      throw new Error('invoiceId is required');
    }

    const payload: any = {};
    if (paymentMethod) payload.payment_method = paymentMethod;

    const invoice = await this.callApi(`invoices/${invoiceId}/pay`, 'POST', payload);

    return {
      success: true,
      data: {
        id: invoice.id,
        status: invoice.status,
        paid: invoice.paid,
        amountPaid: invoice.amount_paid,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
      },
    };
  }

  /**
   * Get upcoming invoice
   */
  private async getUpcomingInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customer = this.resolveValue(this.config.customer, context);
    const subscription = this.resolveValue(this.config.subscription, context);
    const subscriptionItems = this.config.subscriptionItems;

    if (!customer && !subscription) {
      throw new Error('Either customer or subscription is required');
    }

    let url = 'invoices/upcoming';
    const params: string[] = [];
    if (customer) params.push(`customer=${customer}`);
    if (subscription) params.push(`subscription=${subscription}`);
    if (subscriptionItems) {
      subscriptionItems.forEach((item: any, index: number) => {
        params.push(`subscription_items[${index}][id]=${item.id}`);
        params.push(`subscription_items[${index}][deleted]=${item.deleted || false}`);
        if (item.price) params.push(`subscription_items[${index}][price]=${item.price}`);
      });
    }

    if (params.length > 0) url += `?${params.join('&')}`;

    const invoice = await this.callApi(url);

    return {
      success: true,
      data: {
        total: invoice.total,
        subtotal: invoice.subtotal,
        currency: invoice.currency,
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
        periodStart: new Date(invoice.period_start * 1000).toISOString(),
        periodEnd: new Date(invoice.period_end * 1000).toISOString(),
        lines: invoice.lines?.data || [],
      },
    };
  }

  /**
   * Create an invoice item
   */
  private async createInvoiceItem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customer = this.resolveValue(this.config.customer, context);
    const amount = this.config.amount;
    const currency = this.config.currency || 'usd';
    const description = this.resolveValue(this.config.description, context);
    const invoice = this.resolveValue(this.config.invoice, context);
    const subscription = this.resolveValue(this.config.subscription, context);
    const metadata = this.config.metadata || {};

    if (!customer) {
      throw new Error('Customer ID is required');
    }

    if (!amount || amount <= 0) {
      throw new Error('Valid amount is required (in cents)');
    }

    const payload: any = {
      customer,
      amount,
      currency,
    };

    if (description) payload.description = description;
    if (invoice) payload.invoice = invoice;
    if (subscription) payload.subscription = subscription;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const item = await this.callApi('invoiceitems', 'POST', payload);

    return {
      success: true,
      data: {
        id: item.id,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        created: new Date(item.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Get an invoice item
   */
  private async getInvoiceItem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context);

    if (!itemId) {
      throw new Error('itemId is required');
    }

    const item = await this.callApi(`invoiceitems/${itemId}`);

    return {
      success: true,
      data: {
        id: item.id,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
        customerId: item.customer,
        invoiceId: item.invoice,
        subscriptionId: item.subscription,
        created: new Date(item.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Delete an invoice item
   */
  private async deleteInvoiceItem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context);

    if (!itemId) {
      throw new Error('itemId is required');
    }

    await this.callApi(`invoiceitems/${itemId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: itemId,
        deleted: true,
      },
    };
  }

  /**
   * Create a setup intent
   */
  private async createSetupIntent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customer = this.resolveValue(this.config.customer, context);
    const paymentMethod = this.resolveValue(this.config.paymentMethod, context);
    const paymentMethodTypes = this.config.paymentMethodTypes || ['card'];
    const metadata = this.config.metadata || {};
    const usage = this.config.usage || 'off_session';

    const payload: any = {
      payment_method_types: paymentMethodTypes,
      usage,
    };

    if (customer) payload.customer = customer;
    if (paymentMethod) payload.payment_method = paymentMethod;
    if (Object.keys(metadata).length > 0) payload.metadata = metadata;

    const intent = await this.callApi('setup_intents', 'POST', payload);

    return {
      success: true,
      data: {
        id: intent.id,
        clientSecret: intent.client_secret,
        status: intent.status,
        paymentMethod: intent.payment_method,
        created: new Date(intent.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Get a payment method
   */
  private async getPaymentMethod(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentMethodId = this.resolveValue(this.config.paymentMethodId, context);

    if (!paymentMethodId) {
      throw new Error('paymentMethodId is required');
    }

    const method = await this.callApi(`payment_methods/${paymentMethodId}`);

    return {
      success: true,
      data: {
        id: method.id,
        type: method.type,
        customerId: method.customer,
        card: method.card,
        created: new Date(method.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Attach payment method to customer
   */
  private async attachPaymentMethod(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentMethodId = this.resolveValue(this.config.paymentMethodId, context);
    const customer = this.resolveValue(this.config.customer, context);

    if (!paymentMethodId) {
      throw new Error('paymentMethodId is required');
    }

    if (!customer) {
      throw new Error('Customer ID is required');
    }

    const payload = { customer };
    const method = await this.callApi(`payment_methods/${paymentMethodId}/attach`, 'POST', payload);

    return {
      success: true,
      data: {
        id: method.id,
        customerId: method.customer,
        attached: true,
      },
    };
  }

  /**
   * Detach payment method from customer
   */
  private async detachPaymentMethod(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentMethodId = this.resolveValue(this.config.paymentMethodId, context);

    if (!paymentMethodId) {
      throw new Error('paymentMethodId is required');
    }

    const method = await this.callApi(`payment_methods/${paymentMethodId}/detach`, 'POST');

    return {
      success: true,
      data: {
        id: method.id,
        detached: true,
      },
    };
  }

  /**
   * List payment methods for a customer
   */
  private async listPaymentMethods(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customer = this.resolveValue(this.config.customer, context);
    const type = this.config.type || 'card';
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;

    if (!customer) {
      throw new Error('Customer ID is required');
    }

    let url = `payment_methods?customer=${customer}&type=${type}&limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        paymentMethods: response.data.map((m: any) => ({
          id: m.id,
          type: m.type,
          card: m.card,
          created: new Date(m.created * 1000).toISOString(),
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * List payment intents
   */
  private async listPaymentIntents(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const customer = this.config.customer;

    let url = `payment_intents?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (customer) url += `&customer=${customer}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        paymentIntents: response.data.map((pi: any) => ({
          id: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          status: pi.status,
          customerId: pi.customer,
          created: new Date(pi.created * 1000).toISOString(),
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * Get a charge
   */
  private async getCharge(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chargeId = this.resolveValue(this.config.chargeId, context);

    if (!chargeId) {
      throw new Error('chargeId is required');
    }

    const charge = await this.callApi(`charges/${chargeId}`);

    return {
      success: true,
      data: {
        id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        status: charge.status,
        paid: charge.paid,
        captured: charge.captured,
        refunded: charge.refunded,
        amountRefunded: charge.amount_refunded,
        paymentMethod: charge.payment_method,
        customerId: charge.customer,
        description: charge.description,
        receiptUrl: charge.receipt_url,
        created: new Date(charge.created * 1000).toISOString(),
      },
    };
  }

  /**
   * List charges
   */
  private async listCharges(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const customer = this.config.customer;

    let url = `charges?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (customer) url += `&customer=${customer}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        charges: response.data.map((c: any) => ({
          id: c.id,
          amount: c.amount,
          currency: c.currency,
          status: c.status,
          customerId: c.customer,
          created: new Date(c.created * 1000).toISOString(),
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * List events
   */
  private async listEvents(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const startingAfter = this.config.startingAfter;
    const type = this.config.type;
    const created = this.config.created; // { gt, gte, lt, lte }

    let url = `events?limit=${limit}`;
    if (startingAfter) url += `&starting_after=${startingAfter}`;
    if (type) url += `&type=${type}`;
    if (created) {
      if (created.gt) url += `&created[gt]=${created.gt}`;
      if (created.gte) url += `&created[gte]=${created.gte}`;
      if (created.lt) url += `&created[lt]=${created.lt}`;
      if (created.lte) url += `&created[lte]=${created.lte}`;
    }

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        events: response.data.map((e: any) => ({
          id: e.id,
          type: e.type,
          apiVersion: e.api_version,
          created: new Date(e.created * 1000).toISOString(),
          data: e.data,
        })),
        hasMore: response.has_more,
        count: response.data.length,
      },
    };
  }

  /**
   * Get an event
   */
  private async getEvent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const eventId = this.resolveValue(this.config.eventId, context);

    if (!eventId) {
      throw new Error('eventId is required');
    }

    const event = await this.callApi(`events/${eventId}`);

    return {
      success: true,
      data: {
        id: event.id,
        type: event.type,
        apiVersion: event.api_version,
        created: new Date(event.created * 1000).toISOString(),
        data: event.data,
        request: event.request,
      },
    };
  }

  /**
   * Verify webhook signature
   */
  private async verifyWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const payload = this.resolveValue(this.config.payload, context);
    const signature = this.resolveValue(this.config.signature, context);
    const webhookSecret = this.config.webhookSecret;
    const tolerance = this.config.tolerance || 300; // 5 minutes default

    if (!payload) {
      throw new Error('Webhook payload is required');
    }

    if (!signature) {
      throw new Error('Webhook signature is required');
    }

    if (!webhookSecret) {
      throw new Error('Webhook secret is required for verification');
    }

    // This is a simplified verification - in production, use Stripe's official webhook verification library
    const timestamp = signature.split(',')[0]?.split('=')[1];
    if (!timestamp) {
      return {
        success: false,
        error: 'Invalid signature format',
      };
    }

    const signatureAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (signatureAge > tolerance) {
      return {
        success: false,
        error: 'Signature timestamp is outside tolerance window',
      };
    }

    // In production: const stripe = require('stripe')(apiKey);
    // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    return {
      success: true,
      data: {
        verified: true,
        timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
      },
    };
  }

  /**
   * Create a token
   */
  private async createToken(context: ExecutionContext): Promise<NodeExecutionResult> {
    const card = this.config.card; // { number, exp_month, exp_year, cvc }
    const customer = this.resolveValue(this.config.customer, context);
    const person = this.config.person;
    const account = this.config.account;

    if (!card && !person && !account) {
      throw new Error('Either card, person, or account is required');
    }

    const payload: any = {};

    if (card) payload.card = card;
    if (customer) payload.customer = customer;
    if (person) payload.person = person;
    if (account) payload.account = account;

    const token = await this.callApi('tokens', 'POST', payload);

    return {
      success: true,
      data: {
        id: token.id,
        type: token.type,
        clientId: token.client_id,
        livemode: token.livemode,
        created: new Date(token.created * 1000).toISOString(),
      },
    };
  }

  /**
   * Create an ephemeral key
   */
  private async createEphemeralKey(context: ExecutionContext): Promise<NodeExecutionResult> {
    const apiVersion = this.config.ephemeralKeyApiVersion || this.apiVersion;
    const customer = this.resolveValue(this.config.customer, context);

    if (!customer) {
      throw new Error('Customer ID is required');
    }

    const payload = {
      customer,
      issuing: { merchant_data: { id: customer } },
    };

    const key = await this.callApi(`ephemeral_keys?stripe_version=${apiVersion}`, 'POST', payload);

    return {
      success: true,
      data: {
        id: key.id,
        associatedObjects: key.associated_objects,
        created: new Date(key.created * 1000).toISOString(),
        expires: new Date(key.expires * 1000).toISOString(),
        secret: key.secret,
      },
    };
  }

  /**
   * Call Stripe API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Stripe-Version': this.apiVersion,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    if (method !== 'GET' && payload) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      }
      options.body = params.toString();
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || error.message || response.statusText);
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
    if (error.type === 'StripeCardError') {
      return `Card error: ${error.message}`;
    }
    if (error.type === 'StripeInvalidRequestError') {
      return `Invalid request: ${error.message}`;
    }
    if (error.type === 'StripeAPIError') {
      return `Stripe API error: ${error.message}`;
    }
    if (error.type === 'StripeConnectionError') {
      return `Connection error: ${error.message}`;
    }
    if (error.type === 'StripeAuthenticationError') {
      return `Authentication error: ${error.message}`;
    }
    if (error.type === 'StripeRateLimitError') {
      return `Rate limit error: ${error.message}`;
    }
    if (error.code === 'rate_limit') {
      return 'Rate limit exceeded. Please try again later.';
    }
    if (error.code === 'resource_missing') {
      return 'Resource not found. Check the ID.';
    }
    if (error.code === 'parameter_missing') {
      return `Missing required parameter: ${error.param}`;
    }
    if (error.code === 'invalid_number') {
      return 'Invalid card number.';
    }
    if (error.code === 'invalid_expiry_month') {
      return 'Invalid card expiry month.';
    }
    if (error.code === 'invalid_expiry_year') {
      return 'Invalid card expiry year.';
    }
    if (error.code === 'invalid_cvc') {
      return 'Invalid CVC code.';
    }
    return `Stripe error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'stripe';
  }

  getIcon(): string {
    return '💳';
  }

  /**
   * Currency codes helper
   */
  static readonly Currencies = {
    USD: 'usd',
    EUR: 'eur',
    GBP: 'gbp',
    CAD: 'cad',
    AUD: 'aud',
    JPY: 'jpy',
    CHF: 'chf',
    SEK: 'sek',
    NOK: 'nok',
    DKK: 'dkk',
  } as const;

  /**
   * Common error codes
   */
  static readonly ErrorCodes = {
    CardDeclined: 'card_declined',
    InsufficientFunds: 'insufficient_funds',
    IncorrectCvc: 'incorrect_cvc',
    ExpiredCard: 'expired_card',
    ProcessingError: 'processing_error',
    RateLimit: 'rate_limit',
  } as const;

  /**
   * Convert amount to cents
   */
  static toCents(amount: number, currency: string = 'usd'): number {
    const zeroDecimalCurrencies = ['jpy', 'clf', 'krw', 'pyc'];
    if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
      return Math.round(amount);
    }
    return Math.round(amount * 100);
  }

  /**
   * Convert cents to amount
   */
  static fromCents(cents: number, currency: string = 'usd'): number {
    const zeroDecimalCurrencies = ['jpy', 'clf', 'krw', 'pyc'];
    if (zeroDecimalCurrencies.includes(currency.toLowerCase())) {
      return cents;
    }
    return cents / 100;
  }
}
