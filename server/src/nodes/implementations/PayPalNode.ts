import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * PayPal Node - PayPal Payment Processing API
 * n8n-compatible: Complete PayPal REST API integration
 *
 * Configuration:
 * - operation: 'createOrder' | 'getOrder' | 'captureOrder' | 'authorizeOrder' | 'refundOrder' |
 *              'createPayment' | 'getPayment' | 'executePayment' | 'capturePayment' | 'refundPayment' |
 *              'createSale' | 'getSale' | 'refundSale' |
 *              'createBillingAgreement' | 'getBillingAgreement' | 'cancelBillingAgreement' |
 *              'createSubscription' | 'getSubscription' | 'updateSubscription' | 'cancelSubscription' | 'activateSubscription' | 'suspendSubscription' |
 *              'createPlan' | 'getPlan' | 'updatePlan' | 'listPlans' | 'activatePlan' | 'deactivatePlan' |
 *              'createProduct' | 'getProduct' | 'updateProduct' | 'listProducts' |
 *              'createInvoice' | 'getInvoice' | 'sendInvoice' | 'deleteInvoice' | 'listInvoices' |
 *              'createPayout' | 'getPayout' | 'listPayouts' |
 *              'createWebhook' | 'getWebhook' | 'deleteWebhook' | 'listWebhooks' | 'verifyWebhookSignature' |
 *              'getBalance' | 'getTransaction' | 'listTransactions' | 'searchTransactions'
 * - clientId: PayPal REST API Client ID
 * - clientSecret: PayPal REST API Client Secret
 * - mode: 'sandbox' | 'live'
 *
 * Order Operations:
 * - intent: 'SALE' | 'AUTHORIZE' | 'ORDER'
 * - purchaseUnits: Array of { amount: { currency, value, breakdown }, description, customId, invoiceId, items }
 * - paymentSource: { card: { number, expiry, name, billingAddress } } | { paypal: { experienceContext } }
 * - applicationContext: { returnUrl, cancelUrl, brandName, locale, landingPage, shippingPreference, userAction }
 *
 * Subscription Operations:
 * - planId: Billing plan ID
 * - startTime: Subscription start time (ISO 8601)
 * - quantity: Quantity for subscription
 * - shippingAmount: Shipping cost
 * - subscriber: { name, emailAddress, shippingAddress }
 *
 * Invoice Operations:
 * - merchantInfo: { email, firstName, lastName, businessName }
 * - billingInfo: { firstName, lastName, businessName, emailAddress }
 * - items: Array of { name, quantity, unitPrice, tax, description }
 * - detail: { currency, paymentTerm, note }
 */
export class PayPalNode extends BaseNode {
  private apiBaseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;
  private tokenExpiry?: number;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    const mode = config.mode || 'sandbox';
    this.apiBaseUrl = mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    this.clientId = config.clientId || '';
    this.clientSecret = config.clientSecret || '';
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.clientId) {
      throw new Error('PayPal Client ID is required');
    }

    if (!this.clientSecret) {
      throw new Error('PayPal Client Secret is required');
    }

    const validOperations = [
      'createOrder', 'getOrder', 'captureOrder', 'authorizeOrder', 'refundOrder',
      'createPayment', 'getPayment', 'executePayment', 'capturePayment', 'refundPayment',
      'createSale', 'getSale', 'refundSale',
      'createBillingAgreement', 'getBillingAgreement', 'cancelBillingAgreement',
      'createSubscription', 'getSubscription', 'updateSubscription', 'cancelSubscription', 'activateSubscription', 'suspendSubscription', 'reviseSubscription',
      'createPlan', 'getPlan', 'updatePlan', 'listPlans', 'activatePlan', 'deactivatePlan',
      'createProduct', 'getProduct', 'updateProduct', 'listProducts',
      'createInvoice', 'getInvoice', 'sendInvoice', 'deleteInvoice', 'listInvoices', 'listInvoicesByQuantity',
      'createPayout', 'getPayout', 'listPayouts', 'getPayoutItem',
      'createWebhook', 'getWebhook', 'deleteWebhook', 'listWebhooks', 'verifyWebhookSignature', 'updateWebhook',
      'getBalance', 'getTransaction', 'listTransactions', 'searchTransactions', 'captureAuthorizedPayment',
      'reauthorizePayment', 'voidAuthorization',
    ];

    const operation = this.config.operation || 'createOrder';

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'createOrder';

      switch (operation) {
        // Order Operations
        case 'createOrder':
          return await this.createOrder(context);
        case 'getOrder':
          return await this.getOrder(context);
        case 'captureOrder':
          return await this.captureOrder(context);
        case 'authorizeOrder':
          return await this.authorizeOrder(context);
        case 'refundOrder':
          return await this.refundOrder(context);

        // Payment Operations
        case 'createPayment':
          return await this.createPayment(context);
        case 'getPayment':
          return await this.getPayment(context);
        case 'executePayment':
          return await this.executePayment(context);
        case 'capturePayment':
          return await this.capturePayment(context);
        case 'refundPayment':
          return await this.refundPayment(context);
        case 'captureAuthorizedPayment':
          return await this.captureAuthorizedPayment(context);
        case 'reauthorizePayment':
          return await this.reauthorizePayment(context);
        case 'voidAuthorization':
          return await this.voidAuthorization(context);

        // Sale Operations
        case 'createSale':
          return await this.createSale(context);
        case 'getSale':
          return await this.getSale(context);
        case 'refundSale':
          return await this.refundSale(context);

        // Billing Agreement Operations
        case 'createBillingAgreement':
          return await this.createBillingAgreement(context);
        case 'getBillingAgreement':
          return await this.getBillingAgreement(context);
        case 'cancelBillingAgreement':
          return await this.cancelBillingAgreement(context);

        // Subscription Operations
        case 'createSubscription':
          return await this.createSubscription(context);
        case 'getSubscription':
          return await this.getSubscription(context);
        case 'updateSubscription':
          return await this.updateSubscription(context);
        case 'cancelSubscription':
          return await this.cancelSubscription(context);
        case 'activateSubscription':
          return await this.activateSubscription(context);
        case 'suspendSubscription':
          return await this.suspendSubscription(context);
        case 'reviseSubscription':
          return await this.reviseSubscription(context);

        // Plan Operations
        case 'createPlan':
          return await this.createPlan(context);
        case 'getPlan':
          return await this.getPlan(context);
        case 'updatePlan':
          return await this.updatePlan(context);
        case 'listPlans':
          return await this.listPlans();
        case 'activatePlan':
          return await this.activatePlan(context);
        case 'deactivatePlan':
          return await this.deactivatePlan(context);

        // Product Operations
        case 'createProduct':
          return await this.createProduct(context);
        case 'getProduct':
          return await this.getProduct(context);
        case 'updateProduct':
          return await this.updateProduct(context);
        case 'listProducts':
          return await this.listProducts();

        // Invoice Operations
        case 'createInvoice':
          return await this.createInvoice(context);
        case 'getInvoice':
          return await this.getInvoice(context);
        case 'sendInvoice':
          return await this.sendInvoice(context);
        case 'deleteInvoice':
          return await this.deleteInvoice(context);
        case 'listInvoices':
          return await this.listInvoices();
        case 'listInvoicesByQuantity':
          return await this.listInvoicesByInvoiceNumber();

        // Payout Operations
        case 'createPayout':
          return await this.createPayout(context);
        case 'getPayout':
          return await this.getPayout(context);
        case 'listPayouts':
          return await this.listPayouts();
        case 'getPayoutItem':
          return await this.getPayoutItem(context);

        // Webhook Operations
        case 'createWebhook':
          return await this.createWebhook(context);
        case 'getWebhook':
          return await this.getWebhook(context);
        case 'deleteWebhook':
          return await this.deleteWebhook(context);
        case 'listWebhooks':
          return await this.listWebhooks();
        case 'verifyWebhookSignature':
          return await this.verifyWebhookSignature(context);
        case 'updateWebhook':
          return await this.updateWebhook(context);

        // Balance & Transaction Operations
        case 'getBalance':
          return await this.getBalance();
        case 'getTransaction':
          return await this.getTransaction(context);
        case 'listTransactions':
          return await this.listTransactions();
        case 'searchTransactions':
          return await this.searchTransactions(context);

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
   * Get access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${this.apiBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to get access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 1 minute buffer

    return this.accessToken;
  }

  /**
   * Create an order
   */
  private async createOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const intent = this.config.intent || 'CAPTURE';
    const purchaseUnits = this.config.purchaseUnits;
    const paymentSource = this.config.paymentSource;
    const applicationContext = this.config.applicationContext;

    if (!purchaseUnits || purchaseUnits.length === 0) {
      throw new Error('At least one purchase unit is required');
    }

    for (const unit of purchaseUnits) {
      if (!unit.amount || !unit.amount.value || !unit.amount.currency) {
        throw new Error('Each purchase unit must have an amount with value and currency');
      }
    }

    const payload: any = {
      intent,
      purchase_units: purchaseUnits,
    };

    if (paymentSource) payload.payment_source = paymentSource;
    if (applicationContext) payload.application_context = applicationContext;

    const order = await this.callApi('v2/checkout/orders', 'POST', payload);

    return {
      success: true,
      data: {
        id: order.id,
        status: order.status,
        intent: order.intent,
        purchaseUnits: order.purchase_units,
        links: order.links,
        createTime: order.create_time,
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

    const order = await this.callApi(`v2/checkout/orders/${orderId}`);

    return {
      success: true,
      data: {
        id: order.id,
        status: order.status,
        intent: order.intent,
        purchaseUnits: order.purchase_units,
        payer: order.payer,
        createTime: order.create_time,
        updateTime: order.update_time,
      },
    };
  }

  /**
   * Capture payment for an order
   */
  private async captureOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const paymentSource = this.config.paymentSource;
    const note = this.resolveValue(this.config.note, context);
    const softDescriptor = this.config.softDescriptor;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const payload: any = {};
    if (paymentSource) payload.payment_source = paymentSource;
    if (note) payload.note = note;
    if (softDescriptor) payload.payment_instruction = { disbursement_mode: 'INSTANT', soft_descriptor: softDescriptor };

    const response = await this.callApi(`v2/checkout/orders/${orderId}/capture`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        status: response.status,
        purchaseUnits: response.purchase_units,
        createTime: response.create_time,
        updateTime: response.update_time,
      },
    };
  }

  /**
   * Authorize payment for an order
   */
  private async authorizeOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const paymentSource = this.config.paymentSource;
    const note = this.resolveValue(this.config.note, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const payload: any = {};
    if (paymentSource) payload.payment_source = paymentSource;
    if (note) payload.note = note;

    const response = await this.callApi(`v2/checkout/orders/${orderId}/authorize`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        status: response.status,
        purchaseUnits: response.purchase_units,
        links: response.links,
      },
    };
  }

  /**
   * Refund a captured order
   */
  private async refundOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const captureId = this.resolveValue(this.config.captureId, context);
    const amount = this.config.amount; // { value, currency }
    const note = this.resolveValue(this.config.note, context);
    const invoiceId = this.resolveValue(this.config.invoiceId, context);

    if (!captureId) {
      throw new Error('captureId is required');
    }

    const payload: any = {};
    if (amount) payload.amount = amount;
    if (note) payload.note_to_payer = note;
    if (invoiceId) payload.invoice_id = invoiceId;

    const refund = await this.callApi(`v2/payments/captures/${captureId}/refund`, 'POST', payload);

    return {
      success: true,
      data: {
        id: refund.id,
        status: refund.status,
        amount: refund.amount,
        createTime: refund.create_time,
      },
    };
  }

  /**
   * Create a payment (legacy)
   */
  private async createPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const intent = this.config.intent || 'sale';
    const payer = this.config.payer;
    const transactions = this.config.transactions;
    const redirectUrls = this.config.redirectUrls;
    const experienceProfileId = this.config.experienceProfileId;

    if (!transactions || transactions.length === 0) {
      throw new Error('At least one transaction is required');
    }

    const payload: any = {
      intent,
      payer,
      transactions,
    };

    if (redirectUrls) payload.redirect_urls = redirectUrls;
    if (experienceProfileId) payload.experience_profile_id = experienceProfileId;

    const payment = await this.callApi('v1/payments/payment', 'POST', payload);

    return {
      success: true,
      data: {
        id: payment.id,
        intent: payment.intent,
        state: payment.state,
        transactions: payment.transactions,
        links: payment.links,
        createTime: payment.create_time,
      },
    };
  }

  /**
   * Get a payment (legacy)
   */
  private async getPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentId = this.resolveValue(this.config.paymentId, context);

    if (!paymentId) {
      throw new Error('paymentId is required');
    }

    const payment = await this.callApi(`v1/payments/payment/${paymentId}`);

    return {
      success: true,
      data: {
        id: payment.id,
        intent: payment.intent,
        state: payment.state,
        transactions: payment.transactions,
        payer: payment.payer,
        createTime: payment.create_time,
        updateTime: payment.update_time,
      },
    };
  }

  /**
   * Execute a payment (legacy)
   */
  private async executePayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentId = this.resolveValue(this.config.paymentId, context);
    const payerId = this.resolveValue(this.config.payerId, context);

    if (!paymentId) {
      throw new Error('paymentId is required');
    }

    if (!payerId) {
      throw new Error('payerId is required');
    }

    const payload = { payer_id: payerId };
    const payment = await this.callApi(`v1/payments/payment/${paymentId}/execute`, 'POST', payload);

    return {
      success: true,
      data: {
        id: payment.id,
        state: payment.state,
        transactions: payment.transactions,
      },
    };
  }

  /**
   * Capture an authorized payment
   */
  private async capturePayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const authorizationId = this.resolveValue(this.config.authorizationId, context);
    const amount = this.config.amount;
    const isFinalCapture = this.config.isFinalCapture !== false;

    if (!authorizationId) {
      throw new Error('authorizationId is required');
    }

    const payload: any = {
      is_final_capture: isFinalCapture,
    };

    if (amount) payload.amount = amount;

    const capture = await this.callApi(`v1/payments/authorization/${authorizationId}/capture`, 'POST', payload);

    return {
      success: true,
      data: {
        id: capture.id,
        state: capture.state,
        amount: capture.amount,
        createTime: capture.create_time,
      },
    };
  }

  /**
   * Capture an authorized payment (v2)
   */
  private async captureAuthorizedPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const authorizationId = this.resolveValue(this.config.authorizationId, context);
    const amount = this.config.amount;
    const invoiceId = this.resolveValue(this.config.invoiceId, context);
    const note = this.resolveValue(this.config.note, context);
    const softDescriptor = this.config.softDescriptor;

    if (!authorizationId) {
      throw new Error('authorizationId is required');
    }

    const payload: any = {};
    if (amount) payload.amount = amount;
    if (invoiceId) payload.invoice_id = invoiceId;
    if (note) payload.note = note;
    if (softDescriptor) payload.soft_descriptor = softDescriptor;

    const capture = await this.callApi(`v2/payments/authorizations/${authorizationId}/capture`, 'POST', payload);

    return {
      success: true,
      data: {
        id: capture.id,
        status: capture.status,
        amount: capture.amount,
      },
    };
  }

  /**
   * Reauthorize a payment
   */
  private async reauthorizePayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const authorizationId = this.resolveValue(this.config.authorizationId, context);
    const amount = this.config.amount;

    if (!authorizationId) {
      throw new Error('authorizationId is required');
    }

    if (!amount) {
      throw new Error('amount is required');
    }

    const payload = { amount };
    const authorization = await this.callApi(`v2/payments/authorizations/${authorizationId}/reauthorize`, 'POST', payload);

    return {
      success: true,
      data: {
        id: authorization.id,
        status: authorization.status,
        amount: authorization.amount,
      },
    };
  }

  /**
   * Void an authorization
   */
  private async voidAuthorization(context: ExecutionContext): Promise<NodeExecutionResult> {
    const authorizationId = this.resolveValue(this.config.authorizationId, context);

    if (!authorizationId) {
      throw new Error('authorizationId is required');
    }

    const response = await this.callApi(`v2/payments/authorizations/${authorizationId}/void`, 'POST');

    return {
      success: true,
      data: {
        id: response.id,
        status: response.status,
      },
    };
  }

  /**
   * Refund a payment (legacy)
   */
  private async refundPayment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const saleId = this.resolveValue(this.config.saleId, context);
    const amount = this.config.amount;
    const refundSource = this.config.refundSource;
    const reason = this.resolveValue(this.config.reason, context);
    const invoiceId = this.resolveValue(this.config.invoiceId, context);

    if (!saleId) {
      throw new Error('saleId is required');
    }

    const payload: any = {};
    if (amount) payload.amount = amount;
    if (refundSource) payload.refund_source = refundSource;
    if (reason) payload.reason = reason;
    if (invoiceId) payload.invoice_id = invoiceId;

    const refund = await this.callApi(`v1/payments/sale/${saleId}/refund`, 'POST', payload);

    return {
      success: true,
      data: {
        id: refund.id,
        state: refund.state,
        amount: refund.amount,
        saleId: refund.sale_id,
        createTime: refund.create_time,
      },
    };
  }

  /**
   * Create a sale (direct payment, legacy)
   */
  private async createSale(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentIntent = this.config.intent || 'sale';
    const payer = this.config.payer;
    const transactions = this.config.transactions;
    const experienceProfileId = this.config.experienceProfileId;

    if (!transactions || transactions.length === 0) {
      throw new Error('At least one transaction is required');
    }

    const payload: any = {
      intent: paymentIntent,
      payer,
      transactions,
    };

    if (experienceProfileId) payload.experience_profile_id = experienceProfileId;

    const payment = await this.callApi('v1/payments/payment', 'POST', payload);

    return {
      success: true,
      data: {
        id: payment.id,
        transactions: payment.transactions,
        links: payment.links,
      },
    };
  }

  /**
   * Get a sale (legacy)
   */
  private async getSale(context: ExecutionContext): Promise<NodeExecutionResult> {
    const saleId = this.resolveValue(this.config.saleId, context);

    if (!saleId) {
      throw new Error('saleId is required');
    }

    const sale = await this.callApi(`v1/payments/sale/${saleId}`);

    return {
      success: true,
      data: {
        id: sale.id,
        state: sale.state,
        amount: sale.amount,
        paymentMode: sale.payment_mode,
        createTime: sale.create_time,
        updateTime: sale.update_time,
      },
    };
  }

  /**
   * Refund a sale (legacy)
   */
  private async refundSale(context: ExecutionContext): Promise<NodeExecutionResult> {
    const saleId = this.resolveValue(this.config.saleId, context);
    const amount = this.config.amount;
    const refundSource = this.config.refundSource;
    const reason = this.resolveValue(this.config.reason, context);

    if (!saleId) {
      throw new Error('saleId is required');
    }

    const payload: any = {};
    if (amount) payload.amount = amount;
    if (refundSource) payload.refund_source = refundSource;
    if (reason) payload.reason = reason;

    const refund = await this.callApi(`v1/payments/sale/${saleId}/refund`, 'POST', payload);

    return {
      success: true,
      data: {
        id: refund.id,
        state: refund.state,
        amount: refund.amount,
        createTime: refund.create_time,
      },
    };
  }

  /**
   * Create a billing agreement
   */
  private async createBillingAgreement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const description = this.resolveValue(this.config.description, context);
    const shippingAddress = this.config.shippingAddress;
    const payer = this.config.payer;
    const plan = this.config.plan;

    if (!description) {
      throw new Error('description is required');
    }

    if (!plan) {
      throw new Error('plan is required');
    }

    const payload: any = {
      description,
      payer,
      plan,
    };

    if (shippingAddress) payload.shipping_address = shippingAddress;

    const agreement = await this.callApi('v1/payments/billing-agreements', 'POST', payload);

    return {
      success: true,
      data: {
        id: agreement.id,
        state: agreement.state,
        description: agreement.description,
        createTime: agreement.create_time,
      },
    };
  }

  /**
   * Get a billing agreement
   */
  private async getBillingAgreement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const agreementId = this.resolveValue(this.config.agreementId, context);

    if (!agreementId) {
      throw new Error('agreementId is required');
    }

    const agreement = await this.callApi(`v1/payments/billing-agreements/${agreementId}`);

    return {
      success: true,
      data: {
        id: agreement.id,
        state: agreement.state,
        description: agreement.description,
        payer: agreement.payer,
        plan: agreement.plan,
        createTime: agreement.create_time,
        updateTime: agreement.update_time,
      },
    };
  }

  /**
   * Cancel a billing agreement
   */
  private async cancelBillingAgreement(context: ExecutionContext): Promise<NodeExecutionResult> {
    const agreementId = this.resolveValue(this.config.agreementId, context);
    const note = this.resolveValue(this.config.note, context);

    if (!agreementId) {
      throw new Error('agreementId is required');
    }

    const payload: any = {};
    if (note) payload.note = note;

    await this.callApi(`v1/payments/billing-agreements/${agreementId}/cancel`, 'POST', payload);

    return {
      success: true,
      data: {
        id: agreementId,
        canceled: true,
      },
    };
  }

  /**
   * Create a subscription
   */
  private async createSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const planId = this.resolveValue(this.config.planId, context);
    const startTime = this.config.startTime;
    const quantity = this.config.quantity || 1;
    const shippingAmount = this.config.shippingAmount;
    const subscriber = this.config.subscriber;
    const autoRenew = this.config.autoRenew !== false;
    const customId = this.resolveValue(this.config.customId, context);
    const planContext = this.config.planContext;

    if (!planId) {
      throw new Error('planId is required');
    }

    const payload: any = {
      plan_id: planId,
      quantity,
      auto_renew: autoRenew,
    };

    if (startTime) payload.start_time = startTime;
    if (shippingAmount) payload.shipping_amount = shippingAmount;
    if (subscriber) payload.subscriber = subscriber;
    if (customId) payload.custom_id = customId;
    if (planContext) payload.plan = planContext;

    const subscription = await this.callApi('v1/billing/subscriptions', 'POST', payload);

    return {
      success: true,
      data: {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        quantity: subscription.quantity,
        createTime: subscription.create_time,
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

    const subscription = await this.callApi(`v1/billing/subscriptions/${subscriptionId}`);

    return {
      success: true,
      data: {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        quantity: subscription.quantity,
        subscriber: subscription.subscriber,
        createTime: subscription.create_time,
        updateTime: subscription.update_time,
      },
    };
  }

  /**
   * Update a subscription
   */
  private async updateSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const planId = this.resolveValue(this.config.planId, context);
    const quantity = this.config.quantity;
    const shippingAmount = this.config.shippingAmount;

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const payload: any = {};
    if (planId) payload.plan_id = planId;
    if (quantity) payload.quantity = quantity;
    if (shippingAmount) payload.shipping_amount = shippingAmount;

    const patches = Object.keys(payload).map(key => ({
      op: 'replace',
      path: `/${key}`,
      value: payload[key],
    }));

    await this.callApi(`v1/billing/subscriptions/${subscriptionId}`, 'PATCH', patches);

    return {
      success: true,
      data: {
        id: subscriptionId,
        updated: true,
      },
    };
  }

  /**
   * Cancel a subscription
   */
  private async cancelSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const reason = this.resolveValue(this.config.reason, context);

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const payload: any = {
      reason,
    };

    await this.callApi(`v1/billing/subscriptions/${subscriptionId}/cancel`, 'POST', payload);

    return {
      success: true,
      data: {
        id: subscriptionId,
        canceled: true,
      },
    };
  }

  /**
   * Activate a subscription
   */
  private async activateSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const reason = this.resolveValue(this.config.reason, context);

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const payload: { reason?: string } = {};
    if (reason) payload.reason = reason;

    await this.callApi(`v1/billing/subscriptions/${subscriptionId}/activate`, 'POST', payload);

    return {
      success: true,
      data: {
        id: subscriptionId,
        activated: true,
      },
    };
  }

  /**
   * Suspend a subscription
   */
  private async suspendSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const reason = this.resolveValue(this.config.reason, context);

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const payload: { reason?: string } = {};
    if (reason) payload.reason = reason;

    await this.callApi(`v1/billing/subscriptions/${subscriptionId}/suspend`, 'POST', payload);

    return {
      success: true,
      data: {
        id: subscriptionId,
        suspended: true,
      },
    };
  }

  /**
   * Revise a subscription (change plan or quantity)
   */
  private async reviseSubscription(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subscriptionId = this.resolveValue(this.config.subscriptionId, context);
    const planId = this.resolveValue(this.config.planId, context);
    const quantity = this.config.quantity;
    const shippingAmount = this.config.shippingAmount;

    if (!subscriptionId) {
      throw new Error('subscriptionId is required');
    }

    const payload: any = {};
    if (planId) payload.plan_id = planId;
    if (quantity) payload.quantity = quantity;
    if (shippingAmount) payload.shipping_amount = shippingAmount;

    const patches = Object.keys(payload).map(key => ({
      op: 'replace',
      path: `/${key}`,
      value: payload[key],
    }));

    const subscription = await this.callApi(`v1/billing/subscriptions/${subscriptionId}/revise`, 'POST', patches);

    return {
      success: true,
      data: {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        revised: true,
      },
    };
  }

  /**
   * Create a billing plan
   */
  private async createPlan(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context);
    const type = this.config.type || 'FIXED';
    const paymentDefinitions = this.config.paymentDefinitions;
    const merchantPreferences = this.config.merchantPreferences;

    if (!name) {
      throw new Error('Plan name is required');
    }

    if (!paymentDefinitions || paymentDefinitions.length === 0) {
      throw new Error('At least one payment definition is required');
    }

    const payload: any = {
      name,
      description,
      type,
      payment_definitions: paymentDefinitions,
    };

    if (merchantPreferences) payload.merchant_preferences = merchantPreferences;

    const plan = await this.callApi('v1/payments/billing-plans', 'POST', payload);

    return {
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        state: plan.state,
        createTime: plan.create_time,
      },
    };
  }

  /**
   * Get a billing plan
   */
  private async getPlan(context: ExecutionContext): Promise<NodeExecutionResult> {
    const planId = this.resolveValue(this.config.planId, context);

    if (!planId) {
      throw new Error('planId is required');
    }

    const plan = await this.callApi(`v1/payments/billing-plans/${planId}`);

    return {
      success: true,
      data: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        state: plan.state,
        type: plan.type,
        paymentDefinitions: plan.payment_definitions,
        merchantPreferences: plan.merchant_preferences,
        createTime: plan.create_time,
        updateTime: plan.update_time,
      },
    };
  }

  /**
   * Update a billing plan
   */
  private async updatePlan(context: ExecutionContext): Promise<NodeExecutionResult> {
    const planId = this.resolveValue(this.config.planId, context);
    const state = this.config.state; // 'ACTIVE' | 'INACTIVE'

    if (!planId) {
      throw new Error('planId is required');
    }

    if (!state) {
      throw new Error('state is required (ACTIVE or INACTIVE)');
    }

    const payload = [{
      op: 'replace',
      path: '/state',
      value: state,
    }];

    await this.callApi(`v1/payments/billing-plans/${planId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: planId,
        state,
        updated: true,
      },
    };
  }

  /**
   * List billing plans
   */
  private async listPlans(): Promise<NodeExecutionResult> {
    const status = this.config.status; // 'CREATED' | 'ACTIVE' | 'INACTIVE' | 'ALL'
    const pageSize = this.config.pageSize || 20;
    const page = this.config.page || 1;
    const totalRequired = this.config.totalRequired || false;

    let url = `v1/payments/billing-plans?page=${page}&page_size=${pageSize}&total_required=${totalRequired}`;
    if (status) url += `&status=${status}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        plans: response.plans || [],
        totalItems: response.total_items || 0,
        totalPages: response.total_pages || 0,
      },
    };
  }

  /**
   * Activate a billing plan
   */
  private async activatePlan(context: ExecutionContext): Promise<NodeExecutionResult> {
    const planId = this.resolveValue(this.config.planId, context);

    if (!planId) {
      throw new Error('planId is required');
    }

    const payload = [{
      op: 'replace',
      path: '/state',
      value: 'ACTIVE',
    }];

    await this.callApi(`v1/payments/billing-plans/${planId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: planId,
        activated: true,
      },
    };
  }

  /**
   * Deactivate a billing plan
   */
  private async deactivatePlan(context: ExecutionContext): Promise<NodeExecutionResult> {
    const planId = this.resolveValue(this.config.planId, context);

    if (!planId) {
      throw new Error('planId is required');
    }

    const payload = [{
      op: 'replace',
      path: '/state',
      value: 'INACTIVE',
    }];

    await this.callApi(`v1/payments/billing-plans/${planId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: planId,
        deactivated: true,
      },
    };
  }

  /**
   * Create a product
   */
  private async createProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context);
    const type = this.config.type || 'SERVICE';
    const category = this.resolveValue(this.config.category, context);
    const image = this.resolveValue(this.config.image, context);
    const homeUrl = this.resolveValue(this.config.homeUrl, context);

    if (!name) {
      throw new Error('Product name is required');
    }

    if (!type) {
      throw new Error('Product type is required (PHYSICAL, DIGITAL, or SERVICE)');
    }

    const payload: any = {
      name,
      type,
    };

    if (description) payload.description = description;
    if (category) payload.category = category;
    if (image) payload.image_url = image;
    if (homeUrl) payload.home_url = homeUrl;

    const product = await this.callApi('v1/catalogs/products', 'POST', payload);

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        createTime: product.create_time,
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

    const product = await this.callApi(`v1/catalogs/products/${productId}`);

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        type: product.type,
        category: product.category,
        imageUrl: product.image_url,
        homeUrl: product.home_url,
        createTime: product.create_time,
        updateTime: product.update_time,
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
    const category = this.config.category;
    const image = this.config.image;
    const homeUrl = this.config.homeUrl;

    if (!productId) {
      throw new Error('productId is required');
    }

    const patches: any[] = [];
    if (name) patches.push({ op: 'replace', path: '/name', value: name });
    if (description) patches.push({ op: 'replace', path: '/description', value: description });
    if (category) patches.push({ op: 'replace', path: '/category', value: category });
    if (image) patches.push({ op: 'replace', path: '/image_url', value: image });
    if (homeUrl) patches.push({ op: 'replace', path: '/home_url', value: homeUrl });

    await this.callApi(`v1/catalogs/products/${productId}`, 'PATCH', patches);

    return {
      success: true,
      data: {
        id: productId,
        updated: true,
      },
    };
  }

  /**
   * List products
   */
  private async listProducts(): Promise<NodeExecutionResult> {
    const pageSize = this.config.pageSize || 20;
    const page = this.config.page || 1;
    const totalRequired = this.config.totalRequired || true;

    let url = `v1/catalogs/products?page=${page}&page_size=${pageSize}&total_required=${totalRequired}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        products: response.products || [],
        totalItems: response.total_items || 0,
        totalPages: response.total_pages || 0,
      },
    };
  }

  /**
   * Create an invoice
   */
  private async createInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const merchantInfo = this.config.merchantInfo;
    const billingInfo = this.config.billingInfo;
    const items = this.config.items;
    const detail = this.config.detail;
    const ccInfo = this.config.ccInfo;
    const paymentTerm = this.config.paymentTerm;
    const attachments = this.config.attachments;

    if (!merchantInfo || !merchantInfo.email) {
      throw new Error('merchantInfo.email is required');
    }

    if (!billingInfo || !billingInfo.emailAddress) {
      throw new Error('billingInfo.emailAddress is required');
    }

    if (!items || items.length === 0) {
      throw new Error('At least one item is required');
    }

    const payload: any = {
      merchant_info: merchantInfo,
      billing_info: billingInfo,
      items,
    };

    if (detail) payload.detail = detail;
    if (ccInfo) payload.cc_info = ccInfo;
    if (paymentTerm) payload.payment_term = paymentTerm;
    if (attachments) payload.attachments = attachments;

    const invoice = await this.callApi('v2/invoicing/invoices', 'POST', payload);

    return {
      success: true,
      data: {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        detail: invoice.detail,
        createTime: invoice.create_time,
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

    const invoice = await this.callApi(`v2/invoicing/invoices/${invoiceId}`);

    return {
      success: true,
      data: {
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        detail: invoice.detail,
        merchantInfo: invoice.merchant_info,
        billingInfo: invoice.billing_info,
        items: invoice.items,
        payments: invoice.payments,
        createTime: invoice.create_time,
        updateTime: invoice.update_time,
      },
    };
  }

  /**
   * Send an invoice
   */
  private async sendInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const invoiceId = this.resolveValue(this.config.invoiceId, context);
    const subject = this.resolveValue(this.config.subject, context);
    const note = this.resolveValue(this.config.note, context);
    const sendToRecipients = this.config.sendToRecipients !== false;
    const ccRecipients = this.config.ccRecipients || [];

    if (!invoiceId) {
      throw new Error('invoiceId is required');
    }

    const payload: any = {
      send_to_recipient: sendToRecipients,
    };

    if (subject) payload.subject = subject;
    if (note) payload.note = note;
    if (ccRecipients.length > 0) payload.cc_recipients = ccRecipients;

    await this.callApi(`v2/invoicing/invoices/${invoiceId}/send`, 'POST', payload);

    return {
      success: true,
      data: {
        id: invoiceId,
        sent: true,
      },
    };
  }

  /**
   * Delete an invoice
   */
  private async deleteInvoice(context: ExecutionContext): Promise<NodeExecutionResult> {
    const invoiceId = this.resolveValue(this.config.invoiceId, context);

    if (!invoiceId) {
      throw new Error('invoiceId is required');
    }

    await this.callApi(`v2/invoicing/invoices/${invoiceId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: invoiceId,
        deleted: true,
      },
    };
  }

  /**
   * List invoices
   */
  private async listInvoices(): Promise<NodeExecutionResult> {
    const pageSize = this.config.pageSize || 20;
    const page = this.config.page || 1;
    const totalRequired = this.config.totalRequired || true;

    let url = `v2/invoicing/invoices?page=${page}&page_size=${pageSize}&total_required=${totalRequired}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        invoices: response.items || [],
        totalItems: response.total_items || 0,
        totalPages: response.total_pages || 0,
      },
    };
  }

  /**
   * List invoices by invoice number
   */
  private async listInvoicesByInvoiceNumber(): Promise<NodeExecutionResult> {
    const invoiceNumber = this.config.invoiceNumber;
    const pageSize = this.config.pageSize || 20;
    const page = this.config.page || 1;

    if (!invoiceNumber) {
      throw new Error('invoiceNumber is required');
    }

    let url = `v2/invoicing/invoices?invoice_number=${invoiceNumber}&page=${page}&page_size=${pageSize}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        invoices: response.items || [],
        totalItems: response.total_items || 0,
      },
    };
  }

  /**
   * Create a payout
   */
  private async createPayout(context: ExecutionContext): Promise<NodeExecutionResult> {
    const senderBatchId = this.resolveValue(this.config.senderBatchId, context);
    const items = this.config.payoutItems;

    if (!items || items.length === 0) {
      throw new Error('At least one payout item is required');
    }

    const payload: any = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'You have a payout!',
        recipient_type: 'EMAIL',
      },
      items,
    };

    const payout = await this.callApi('v1/payments/payouts', 'POST', payload);

    return {
      success: true,
      data: {
        batchId: payout.batch_header.payout_batch_id,
        batchStatus: payout.batch_header.batch_status,
        links: payout.links,
        createTime: payout.create_time,
      },
    };
  }

  /**
   * Get a payout
   */
  private async getPayout(context: ExecutionContext): Promise<NodeExecutionResult> {
    const payoutBatchId = this.resolveValue(this.config.payoutBatchId, context);

    if (!payoutBatchId) {
      throw new Error('payoutBatchId is required');
    }

    const payout = await this.callApi(`v1/payments/payouts/${payoutBatchId}`);

    return {
      success: true,
      data: {
        batchId: payout.batch_header.payout_batch_id,
        batchStatus: payout.batch_header.batch_status,
        senderBatchId: payout.batch_header.sender_batch_id,
        items: payout.items,
        createTime: payout.create_time,
      },
    };
  }

  /**
   * List payouts
   */
  private async listPayouts(): Promise<NodeExecutionResult> {
    const pageSize = this.config.pageSize || 20;
    const page = this.config.page || 1;
    const totalRequired = this.config.totalRequired || true;
    const batchStatus = this.config.batchStatus;

    let url = `v1/payments/payouts?page=${page}&page_size=${pageSize}&total_required=${totalRequired}`;
    if (batchStatus) url += `&batch_status=${batchStatus}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        payouts: response.items || [],
        totalItems: response.total_items || 0,
        totalPages: response.total_pages || 0,
      },
    };
  }

  /**
   * Get a payout item
   */
  private async getPayoutItem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const payoutItemId = this.resolveValue(this.config.payoutItemId, context);

    if (!payoutItemId) {
      throw new Error('payoutItemId is required');
    }

    const item = await this.callApi(`v1/payments/payouts-item/${payoutItemId}`);

    return {
      success: true,
      data: {
        payoutItemId: item.payout_item_id,
        transactionId: item.transaction_id,
        transactionStatus: item.transaction_status,
        payoutBatchId: item.payout_batch_id,
        amount: item.payout_item.amount,
        receiver: item.payout_item.receiver,
        createTime: item.time_created,
      },
    };
  }

  /**
   * Create a webhook
   */
  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const url = this.resolveValue(this.config.url, context);
    const eventTypes = this.config.eventTypes || ['*'];

    if (!url) {
      throw new Error('Webhook URL is required');
    }

    if (!eventTypes || eventTypes.length === 0) {
      throw new Error('At least one event type is required');
    }

    const payload = {
      url,
      event_types: eventTypes.map((event: string) => ({
        name: event === '*' ? 'ALL' : event,
      })),
    };

    const webhook = await this.callApi('v1/notifications/webhooks', 'POST', payload);

    return {
      success: true,
      data: {
        id: webhook.id,
        url: webhook.url,
        eventTypes: webhook.event_types,
        createTime: webhook.create_time,
      },
    };
  }

  /**
   * Get a webhook
   */
  private async getWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    const webhook = await this.callApi(`v1/notifications/webhooks/${webhookId}`);

    return {
      success: true,
      data: {
        id: webhook.id,
        url: webhook.url,
        eventTypes: webhook.event_types,
        createTime: webhook.create_time,
      },
    };
  }

  /**
   * Delete a webhook
   */
  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    await this.callApi(`v1/notifications/webhooks/${webhookId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: webhookId,
        deleted: true,
      },
    };
  }

  /**
   * List webhooks
   */
  private async listWebhooks(): Promise<NodeExecutionResult> {
    const pageSize = this.config.pageSize || 20;
    const anchorType = this.config.anchorType;

    let url = `v1/notifications/webhooks?page_size=${pageSize}`;
    if (anchorType) url += `&anchor_type=${anchorType}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        webhooks: response.webhooks || [],
      },
    };
  }

  /**
   * Update a webhook
   */
  private async updateWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);
    const url = this.config.url;
    const eventTypes = this.config.eventTypes;

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    const patches: any[] = [];
    if (url) {
      patches.push({
        op: 'replace',
        path: '/url',
        value: url,
      });
    }
    if (eventTypes && eventTypes.length > 0) {
      patches.push({
        op: 'replace',
        path: '/event_types',
        value: eventTypes.map((event: string) => ({ name: event })),
      });
    }

    await this.callApi(`v1/notifications/webhooks/${webhookId}`, 'PATCH', patches);

    return {
      success: true,
      data: {
        id: webhookId,
        updated: true,
      },
    };
  }

  /**
   * Verify webhook signature
   */
  private async verifyWebhookSignature(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.config.webhookId;
    const headers = this.config.webhookHeaders;
    const body = this.resolveValue(this.config.webhookBody, context);
    const certId = this.config.certId;

    if (!headers) {
      throw new Error('webhookHeaders are required');
    }

    if (!body) {
      throw new Error('webhookBody is required');
    }

    if (!certId) {
      throw new Error('certId is required');
    }

    const payload = {
      auth_algo: headers['paypal-auth-algo'] || headers['PAYPAL-AUTH-ALGO'],
      cert_id: certId,
      transmission_id: headers['paypal-transmission-id'] || headers['PAYPAL-TRANSMISSION-ID'],
      transmission_sig: headers['paypal-transmission-sig'] || headers['PAYPAL-TRANSMISSION-SIG'],
      transmission_time: headers['paypal-transmission-time'] || headers['PAYPAL-TRANSMISSION-TIME'],
      webhook_id: webhookId,
      webhook_event: typeof body === 'string' ? JSON.parse(body) : body,
    };

    const response = await this.callApi('v1/notifications/verify-webhook-signature', 'POST', payload);

    return {
      success: true,
      data: {
        verificationStatus: response.verification_status === 'SUCCESS',
        verificationReason: response.verification_reason || null,
      },
    };
  }

  /**
   * Get account balance
   */
  private async getBalance(): Promise<NodeExecutionResult> {
    const response = await this.callApi('v1/payments/balances');

    return {
      success: true,
      data: {
        balances: response.balances || [],
        availableBalance: response.available_balance,
        primaryCurrency: response.primary_currency,
      },
    };
  }

  /**
   * Get transaction details
   */
  private async getTransaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const transactionId = this.resolveValue(this.config.transactionId, context);

    if (!transactionId) {
      throw new Error('transactionId is required');
    }

    const transaction = await this.callApi(`v1/payments/transactions/${transactionId}`);

    return {
      success: true,
      data: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        payer: transaction.payer,
        payee: transaction.payee,
        createTime: transaction.create_time,
        updateTime: transaction.update_time,
      },
    };
  }

  /**
   * List transactions
   */
  private async listTransactions(): Promise<NodeExecutionResult> {
    const pageSize = this.config.pageSize || 20;
    const page = this.config.page || 1;
    const startDate = this.config.startDate;
    const endDate = this.config.endDate;
    const transactionId = this.config.transactionId;
    const fields = this.config.fields || 'all';

    let url = `v1/payments/transactions?page_size=${pageSize}&page=${page}&fields=${fields}`;
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    if (transactionId) url += `&transaction_id=${transactionId}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        transactions: response.payment_transactions || [],
        totalItems: response.total_items || 0,
        totalPages: response.total_pages || 0,
      },
    };
  }

  /**
   * Search transactions
   */
  private async searchTransactions(context: ExecutionContext): Promise<NodeExecutionResult> {
    const startDate = this.config.startDate;
    const endDate = this.config.endDate;
    const pageSize = this.config.pageSize || 20;
    const page = this.config.page || 1;
    const currency = this.config.currency;
    const status = this.config.status;
    const amount = this.config.amount;

    if (!startDate) {
      throw new Error('startDate is required (ISO 8601 format)');
    }

    if (!endDate) {
      throw new Error('endDate is required (ISO 8601 format)');
    }

    let url = `v1/reporting/transactions?start_date=${startDate}&end_date=${endDate}&page_size=${pageSize}&page=${page}`;
    if (currency) url += `&currency_code=${currency}`;
    if (status) url += `&status=${status}`;
    if (amount) url += `&amount=${amount}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        transactions: response.transaction_details || [],
        totalItems: response.total_items || 0,
        totalPages: response.total_pages || 0,
      },
    };
  }

  /**
   * Call PayPal API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const token = await this.getAccessToken();
    const url = `${this.apiBaseUrl}/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    };

    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.details?.[0]?.description || response.statusText);
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
    if (error.name === 'AUTHENTICATION_FAILURE') {
      return 'Authentication failed. Check your Client ID and Secret.';
    }
    if (error.name === 'INVALID_REQUEST') {
      return `Invalid request: ${error.message}`;
    }
    if (error.name === 'PERMISSION_DENIED') {
      return 'Permission denied. Check your API permissions.';
    }
    if (error.name === 'INVALID_RESOURCE_ID') {
      return 'Resource not found. Check the ID.';
    }
    if (error.name === 'RATE_LIMIT_EXCEEDED') {
      return 'Rate limit exceeded. Please try again later.';
    }
    if (error.details?.[0]?.issue === 'INVALID_PARAMETER') {
      return `Invalid parameter: ${error.details[0].field}`;
    }
    if (error.details?.[0]?.issue === 'DUPLICATE_REQUEST_ID') {
      return 'Duplicate request. A request with this ID already exists.';
    }
    if (error.name === 'UNPROCESSABLE_ENTITY') {
      return `Unprocessable entity: ${error.message}`;
    }
    return `PayPal error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'payPal';
  }

  getIcon(): string {
    return '💰';
  }

  /**
   * Available currency codes
   */
  static readonly Currencies = {
    AUD: 'AUD',
    BRL: 'BRL',
    CAD: 'CAD',
    CZK: 'CZK',
    DKK: 'DKK',
    EUR: 'EUR',
    HKD: 'HKD',
    HUF: 'HUF',
    ILS: 'ILS',
    JPY: 'JPY',
    MYR: 'MYR',
    MXN: 'MXN',
    TWD: 'TWD',
    NZD: 'NZD',
    NOK: 'NOK',
    PHP: 'PHP',
    PLN: 'PLN',
    GBP: 'GBP',
    RUB: 'RUB',
    SGD: 'SGD',
    SEK: 'SEK',
    CHF: 'CHF',
    THB: 'THB',
    USD: 'USD',
  } as const;

  /**
   * Intent types
   */
  static readonly Intents = {
    SALE: 'SALE',
    AUTHORIZE: 'AUTHORIZE',
    ORDER: 'ORDER',
    CAPTURE: 'CAPTURE',
  } as const;

  /**
   * Event types for webhooks
   */
  static readonly WebhookEvents = {
    PaymentCaptureCompleted: 'PAYMENT.CAPTURE.COMPLETED',
    PaymentCaptureDenied: 'PAYMENT.CAPTURE.DENIED',
    PaymentCaptureRefunded: 'PAYMENT.CAPTURE.REFUNDED',
    PaymentSaleCompleted: 'PAYMENT.SALE.COMPLETED',
    PaymentSaleDenied: 'PAYMENT.SALE.DENIED',
    PaymentSaleRefunded: 'PAYMENT.SALE.REFUNDED',
    PaymentAuthorizationCreated: 'PAYMENT.AUTHORIZATION.CREATED',
    PaymentAuthorizationVoided: 'PAYMENT.AUTHORIZATION.VOIDED',
    MerchantOnboardingCompleted: 'MERCHANT.ONBOARDING.COMPLETED',
    BillingPlanCreated: 'BILLING.PLAN.CREATED',
    BillingPlanUpdated: 'BILLING.PLAN.UPDATED',
    BillingSubscriptionActivated: 'BILLING.SUBSCRIPTION.ACTIVATED',
    BillingSubscriptionCancelled: 'BILLING.SUBSCRIPTION.CANCELLED',
    InvoicePaid: 'INVOICE.PAID',
    InvoiceCancelled: 'INVOICE.CANCELLED',
    InvoiceSent: 'INVOICE.SENT',
    PayoutBatchCompleted: 'PAYOUT.BATCH.COMPLETED',
    PayoutBatchDenied: 'PAYOUT.BATCH.DENIED',
  } as const;
}
