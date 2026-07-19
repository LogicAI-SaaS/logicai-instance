import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * WooCommerce Node - WooCommerce REST API
 * n8n-compatible: Complete WooCommerce integration
 *
 * Configuration:
 * - operation: 'getOrder' | 'listOrders' | 'createOrder' | 'updateOrder' | 'deleteOrder' | 'getOrderStatuses' |
 *              'getProduct' | 'listProducts' | 'createProduct' | 'updateProduct' | 'deleteProduct' |
 *              'getCustomer' | 'listCustomers' | 'createCustomer' | 'updateCustomer' | 'deleteCustomer' |
 *              'getCoupon' | 'listCoupons' | 'createCoupon' | 'updateCoupon' | 'deleteCoupon' |
 *              'createRefund' | 'listRefunds' | 'getWebhook' | 'listWebhooks' | 'createWebhook' | 'deleteWebhook'
 * - url: Store URL (e.g., 'https://example.com')
 * - consumerKey: WooCommerce API consumer key
 * - consumerSecret: WooCommerce API consumer secret
 * - apiVersion: API version (default: 'wc/v3')
 *
 * Order Operations:
 * - orderId: Order ID
 * - status: Order status (pending, processing, completed, cancelled, refunded, failed)
 * - order: Order object with line items, billing, shipping
 *
 * Product Operations:
 * - productId: Product ID
 * - product: Product object with name, type, regular_price, sale_price, etc.
 *
 * Customer Operations:
 * - customerId: Customer ID
 * - customer: Customer object with email, first_name, last_name, etc.
 */
export class WooCommerceNode extends BaseNode {
  private apiBaseUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    const url = config.url || '';
    const apiVersion = config.apiVersion || 'wc/v3';
    this.apiBaseUrl = `${url}/wp/${apiVersion}`;
    this.consumerKey = config.consumerKey || '';
    this.consumerSecret = config.consumerSecret || '';
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.apiBaseUrl.includes('http')) {
      throw new Error('Valid store URL is required (e.g., https://example.com)');
    }

    if (!this.consumerKey) {
      throw new Error('consumerKey is required');
    }

    if (!this.consumerSecret) {
      throw new Error('consumerSecret is required');
    }

    const validOperations = [
      'getOrder', 'listOrders', 'createOrder', 'updateOrder', 'deleteOrder', 'getOrderStatuses', 'batchUpdateOrders',
      'getProduct', 'listProducts', 'createProduct', 'updateProduct', 'deleteProduct', 'updateProductStock',
      'getCustomer', 'listCustomers', 'createCustomer', 'updateCustomer', 'deleteCustomer', 'getCustomerDownloads',
      'getCoupon', 'listCoupons', 'createCoupon', 'updateCoupon', 'deleteCoupon', 'getCouponByCode',
      'createRefund', 'listRefunds', 'deleteRefund',
      'getWebhook', 'listWebhooks', 'createWebhook', 'deleteWebhook', 'updateWebhook',
      'getTax', 'listTaxes', 'createTax', 'updateTax', 'deleteTax',
      'getShippingZone', 'listShippingZones', 'createShippingZone', 'updateShippingZone', 'deleteShippingZone',
    ];

    const operation = this.config.operation || 'listOrders';

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'listOrders';

      switch (operation) {
        // Order Operations
        case 'getOrder':
          return await this.getOrder(context);
        case 'listOrders':
          return await this.listOrders(context);
        case 'createOrder':
          return await this.createOrder(context);
        case 'updateOrder':
          return await this.updateOrder(context);
        case 'deleteOrder':
          return await this.deleteOrder(context);
        case 'getOrderStatuses':
          return await this.getOrderStatuses(context);
        case 'batchUpdateOrders':
          return await this.batchUpdateOrders(context);

        // Product Operations
        case 'getProduct':
          return await this.getProduct(context);
        case 'listProducts':
          return await this.listProducts(context);
        case 'createProduct':
          return await this.createProduct(context);
        case 'updateProduct':
          return await this.updateProduct(context);
        case 'deleteProduct':
          return await this.deleteProduct(context);
        case 'updateProductStock':
          return await this.updateProductStock(context);

        // Customer Operations
        case 'getCustomer':
          return await this.getCustomer(context);
        case 'listCustomers':
          return await this.listCustomers(context);
        case 'createCustomer':
          return await this.createCustomer(context);
        case 'updateCustomer':
          return await this.updateCustomer(context);
        case 'deleteCustomer':
          return await this.deleteCustomer(context);
        case 'getCustomerDownloads':
          return await this.getCustomerDownloads(context);

        // Coupon Operations
        case 'getCoupon':
          return await this.getCoupon(context);
        case 'listCoupons':
          return await this.listCoupons();
        case 'createCoupon':
          return await this.createCoupon(context);
        case 'updateCoupon':
          return await this.updateCoupon(context);
        case 'deleteCoupon':
          return await this.deleteCoupon(context);
        case 'getCouponByCode':
          return await this.getCouponByCode(context);

        // Refund Operations
        case 'createRefund':
          return await this.createRefund(context);
        case 'listRefunds':
          return await this.listRefunds(context);
        case 'deleteRefund':
          return await this.deleteRefund(context);

        // Webhook Operations
        case 'getWebhook':
          return await this.getWebhook(context);
        case 'listWebhooks':
          return await this.listWebhooks(context);
        case 'createWebhook':
          return await this.createWebhook(context);
        case 'deleteWebhook':
          return await this.deleteWebhook(context);
        case 'updateWebhook':
          return await this.updateWebhook(context);

        // Tax Operations
        case 'getTax':
          return await this.getTax(context);
        case 'listTaxes':
          return await this.listTaxes(context);
        case 'createTax':
          return await this.createTax(context);
        case 'updateTax':
          return await this.updateTax(context);
        case 'deleteTax':
          return await this.deleteTax(context);

        // Shipping Zone Operations
        case 'getShippingZone':
          return await this.getShippingZone(context);
        case 'listShippingZones':
          return await this.listShippingZones(context);
        case 'createShippingZone':
          return await this.createShippingZone(context);
        case 'updateShippingZone':
          return await this.updateShippingZone(context);
        case 'deleteShippingZone':
          return await this.deleteShippingZone(context);

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
   * Get an order
   */
  private async getOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const order = await this.callApi(`orders/${orderId}`);

    return {
      success: true,
      data: {
        id: order.id,
        status: order.status,
        currency: order.currency,
        total: order.total,
        subtotal: order.total_line_items_quantity || order.subtotal,
        totalTax: order.total_tax,
        totalShipping: order.total_shipping,
        paymentMethod: order.payment_method,
        dateCreated: order.date_created,
        dateModified: order.date_modified,
        customer: order.customer,
        lineItems: order.line_items,
        billing: order.billing,
        shipping: order.shipping,
      },
    };
  }

  /**
   * List orders
   */
  private async listOrders(context: ExecutionContext): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const status = this.config.status;
    const customer = this.config.customer;
    const product = this.config.product;
    const page = this.config.page || 1;
    const orderBy = this.config.orderBy || 'date';
    const order = this.config.order || 'desc';
    const after = this.config.after;
    const before = this.config.before;

    let url = `orders?per_page=${limit}&page=${page}&orderby=${orderBy}&order=${order}`;
    if (status) url += `&status=${status}`;
    if (customer) url += `&customer=${customer}`;
    if (product) url += `&product=${product}`;
    if (after) url += `&after=${after}`;
    if (before) url += `&before=${before}`;

    const response = await this.callApi(url);
    const orders = response.headers ? (response as any).headers.get('X-WP-TotalPages') : response;

    return {
      success: true,
      data: {
        orders: response.map((o: any) => ({
          id: o.id,
          status: o.status,
          currency: o.currency,
          total: o.total,
          paymentMethod: o.payment_method,
          dateCreated: o.date_created,
          customer: o.customer,
          lineItems: o.line_items,
        })),
        totalPages: parseInt(orders || '1'),
        page,
      },
    };
  }

  /**
   * Create an order
   */
  private async createOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const paymentMethod = this.resolveValue(this.config.paymentMethod, context);
    const paymentMethodTitle = this.resolveValue(this.config.paymentMethodTitle, context);
    const setPaid = this.config.setPaid || false;
    const billing = this.config.billing;
    const shipping = this.config.shipping;
    const lineItems = this.config.lineItems;
    const customerId = this.resolveValue(this.config.customerId, context);
    const feeLines = this.config.feeLines;
    const couponLines = this.config.couponLines;
    const meta = this.config.meta;

    if (!lineItems || lineItems.length === 0) {
      throw new Error('lineItems array is required');
    }

    const orderData: any = {
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: setPaid,
    };

    if (billing) orderData.billing = billing;
    if (shipping) orderData.shipping = shipping;
    if (lineItems) orderData.line_items = lineItems;
    if (customerId) orderData.customer_id = customerId;
    if (feeLines) orderData.fee_lines = feeLines;
    if (couponLines) orderData.coupon_lines = couponLines;
    if (meta) orderData.meta = meta;

    const order = await this.callApi('orders', 'POST', orderData);

    return {
      success: true,
      data: {
        id: order.id,
        status: order.status,
        total: order.total,
        dateCreated: order.date_created,
      },
    };
  }

  /**
   * Update an order
   */
  private async updateOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const status = this.config.status;
    const customerId = this.config.customerId;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const orderData: any = {};

    if (status) orderData.status = status;
    if (customerId) orderData.customer_id = customerId;

    const order = await this.callApi(`orders/${orderId}`, 'PUT', orderData);

    return {
      success: true,
      data: {
        id: order.id,
        status: order.status,
        dateModified: order.date_modified,
      },
    };
  }

  /**
   * Delete an order
   */
  private async deleteOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const force = this.config.force || true;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    await this.callApi(`orders/${orderId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: orderId,
        deleted: true,
      },
    };
  }

  /**
   * Get order statuses
   */
  private async getOrderStatuses(context: ExecutionContext): Promise<NodeExecutionResult> {
    const response = await this.callApi('orders/statuses');

    return {
      success: true,
      data: {
        statuses: response,
      },
    };
  }

  /**
   * Batch update orders
   */
  private async batchUpdateOrders(context: ExecutionContext): Promise<NodeExecutionResult> {
    const updates = this.config.updates;

    if (!updates || updates.length === 0) {
      throw new Error('updates array is required');
    }

    const response = await this.callApi('orders/batch', 'PUT', { updates });

    return {
      success: true,
      data: {
        updated: response.updated,
        errors: response.errors || [],
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
        type: product.type,
        status: product.status,
        regularPrice: product.regular_price,
        salePrice: product.sale_price,
        stockQuantity: product.stock_quantity,
        manageStock: product.manage_stock,
        categories: product.categories,
        images: product.images,
        attributes: product.attributes,
        dateCreated: product.date_created,
        dateModified: product.date_modified,
      },
    };
  }

  /**
   * List products
   */
  private async listProducts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const status = this.config.status;
    const type = this.config.type;
    const category = this.config.category;
    const featured = this.config.featured;
    const page = this.config.page || 1;
    const stockStatus = this.config.stockStatus; // instock, outofstock
    const orderBy = this.config.orderBy || 'date';
    const order = this.config.order || 'desc';
    const search = this.config.search;
    const sku = this.config.sku;

    let url = `products?per_page=${limit}&page=${page}&orderby=${orderBy}&order=${order}`;
    if (status) url += `&status=${status}`;
    if (type) url += `&type=${type}`;
    if (category) url += `&category=${category}`;
    if (featured !== undefined) url += `&featured=${featured}`;
    if (stockStatus) url += `&stock_status=${stockStatus}`;
    if (search) url += `&search=${search}`;
    if (sku) url += `&sku=${sku}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        products: response.map((p: any) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          status: p.status,
          regularPrice: p.regular_price,
          salePrice: p.sale_price,
          stockQuantity: p.stock_quantity,
          images: p.images,
          categories: p.categories,
          dateCreated: p.date_created,
        })),
        totalPages: response.headers ? (response as any).headers.get('X-WP-TotalPages') : '1',
        page,
      },
    };
  }

  /**
   * Create a product
   */
  private async createProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const type = this.config.type || 'simple';
    const regularPrice = this.config.regularPrice;
    const salePrice = this.config.salePrice;
    const description = this.resolveValue(this.config.description, context);
    const shortDescription = this.resolveValue(this.config.shortDescription, context);
    const categories = this.config.categories; // Array of IDs
    const images = this.config.images; // Array of { src, alt, name }
    const attributes = this.config.attributes;
    const stockQuantity = this.config.stockQuantity || 0;
    const manageStock = this.config.manageStock || false;
    const sku = this.resolveValue(this.config.sku, context);

    if (!name) {
      throw new Error('name is required');
    }

    const productData: any = {
      name,
      type,
      regular_price: regularPrice,
      manage_stock: manageStock,
    };

    if (salePrice) productData.sale_price = salePrice;
    if (description) productData.description = description;
    if (shortDescription) productData.short_description = shortDescription;
    if (categories && categories.length > 0) productData.categories = categories;
    if (images && images.length > 0) productData.images = images;
    if (attributes) productData.attributes = attributes;
    if (stockQuantity) productData.stock_quantity = stockQuantity;
    if (sku) productData.sku = sku;

    const product = await this.callApi('products', 'POST', productData);

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        type: product.type,
        dateCreated: product.date_created,
      },
    };
  }

  /**
   * Update a product
   */
  private async updateProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);
    const name = this.config.name;
    const regularPrice = this.config.regularPrice;
    const salePrice = this.config.salePrice;
    const description = this.config.description;
    const stockQuantity = this.config.stockQuantity;
    const manageStock = this.config.manageStock;

    if (!productId) {
      throw new Error('productId is required');
    }

    const productData: any = {};

    if (name) productData.name = name;
    if (regularPrice) productData.regular_price = regularPrice;
    if (salePrice) productData.sale_price = salePrice;
    if (description) productData.description = description;
    if (stockQuantity !== undefined) productData.stock_quantity = stockQuantity;
    if (manageStock !== undefined) productData.manage_stock = manageStock;

    const product = await this.callApi(`products/${productId}`, 'PUT', productData);

    return {
      success: true,
      data: {
        id: product.id,
        dateModified: product.date_modified,
      },
    };
  }

  /**
   * Delete a product
   */
  private async deleteProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);
    const force = this.config.force || true;

    if (!productId) {
      throw new Error('productId is required');
    }

    await this.callApi(`products/${productId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: productId,
        deleted: true,
      },
    };
  }

  /**
   * Update product stock
   */
  private async updateProductStock(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);
    const stockQuantity = this.config.stockQuantity;
    const manageStock = this.config.manageStock;

    if (!productId) {
      throw new Error('productId is required');
    }

    const productData: any = {};

    if (stockQuantity !== undefined) productData.stock_quantity = stockQuantity;
    if (manageStock !== undefined) productData.manage_stock = manageStock;

    const product = await this.callApi(`products/${productId}`, 'PUT', productData);

    return {
      success: true,
      data: {
        id: product.id,
        stockQuantity: product.stock_quantity,
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

    const customer = await this.callApi(`customers/${customerId}`);

    return {
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        role: customer.role,
        username: customer.username,
        billing: customer.billing,
        shipping: customer.shipping,
        dateCreated: customer.date_created,
      },
    };
  }

  /**
   * List customers
   */
  private async listCustomers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const role = this.config.role;
    const page = this.config.page || 1;
    const orderBy = this.config.orderBy || 'registered_date';
    const order = this.config.order || 'desc';

    let url = `customers?per_page=${limit}&page=${page}&orderby=${orderBy}&order=${order}`;
    if (role) url += `&role=${role}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        customers: response.map((c: any) => ({
          id: c.id,
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          role: c.role,
          username: c.username,
          dateCreated: c.date_created,
        })),
        totalPages: response.headers ? (response as any).headers.get('X-WP-TotalPages') : '1',
        page,
      },
    };
  }

  /**
   * Create a customer
   */
  private async createCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);
    const firstName = this.resolveValue(this.config.firstName, context);
    const lastName = this.resolveValue(this.config.lastName, context);
    const username = this.resolveValue(this.config.username, context);
    const password = this.resolveValue(this.config.password, context);
    const billing = this.config.billing;
    const shipping = this.config.shipping;

    if (!email) {
      throw new Error('email is required');
    }

    const customerData: any = {
      email,
    };

    if (firstName) customerData.first_name = firstName;
    if (lastName) customerData.last_name = lastName;
    if (username) customerData.username = username;
    if (password) customerData.password = password;
    if (billing) customerData.billing = billing;
    if (shipping) customerData.shipping = shipping;

    const customer = await this.callApi('customers', 'POST', customerData);

    return {
      success: true,
      data: {
        id: customer.id,
        email: customer.email,
        dateCreated: customer.date_created,
      },
    };
  }

  /**
   * Update a customer
   */
  private async updateCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context);
    const email = this.config.email;
    const firstName = this.config.firstName;
    const lastName = this.config.lastName;
    const shipping = this.config.shipping;
    const billing = this.config.billing;

    if (!customerId) {
      throw new Error('customerId is required');
    }

    const customerData: any = {};

    if (email) customerData.email = email;
    if (firstName) customerData.first_name = firstName;
    if (lastName) customerData.last_name = lastName;
    if (shipping) customerData.shipping = shipping;
    if (billing) customerData.billing = billing;

    const customer = await this.callApi(`customers/${customerId}`, 'PUT', customerData);

    return {
      success: true,
      data: {
        id: customer.id,
        dateModified: customer.date_modified,
      },
    };
  }

  /**
   * Delete a customer
   */
  private async deleteCustomer(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context);
    const force = this.config.force || true;

    if (!customerId) {
      throw new Error('customerId is required');
    }

    await this.callApi(`customers/${customerId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: customerId,
        deleted: true,
      },
    };
  }

  /**
   * Get customer downloads
   */
  private async getCustomerDownloads(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customerId = this.resolveValue(this.config.customerId, context);
    const downloadId = this.config.downloadId;

    if (!customerId) {
      throw new Error('customerId is required');
    }

    let url = `customers/${customerId}/downloads`;
    if (downloadId) url += `/${downloadId}`;

    const response = downloadId
      ? await this.callApi(url)
      : await this.callApi(url);

    if (downloadId) {
      return {
        success: true,
        data: {
          download: response,
        },
      };
    }

    return {
      success: true,
      data: {
        downloads: response,
      },
    };
  }

  /**
   * Get a coupon
   */
  private async getCoupon(context: ExecutionContext): Promise<NodeExecutionResult> {
    const couponId = this.resolveValue(this.config.couponId, context);

    if (!couponId) {
      throw new Error('couponId is required');
    }

    const coupon = await this.callApi(`coupons/${couponId}`);

    return {
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        amount: coupon.amount,
        discountType: coupon.discount_type,
        description: coupon.description,
        dateExpires: coupon.date_expires,
        usageCount: coupon.usage_count,
        usageLimit: coupon.usage_limit,
      },
    };
  }

  /**
   * List coupons
   */
  private async listCoupons(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 10;
    const page = this.config.page || 1;
    const code = this.config.code;
    const exclude = this.config.exclude;

    let url = `coupons?per_page=${limit}&page=${page}`;
    if (code) url += `&code=${code}`;
    if (exclude) url += `&exclude=${exclude}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        coupons: response.map((c: any) => ({
          id: c.id,
          code: c.code,
          amount: c.amount,
          discountType: c.discount_type,
          dateExpires: c.date_expires,
          usageCount: c.usage_count,
        })),
        totalPages: response.headers ? (response as any).headers.get('X-WP-TotalPages') : '1',
      },
    };
  }

  /**
   * Create a coupon
   */
  private async createCoupon(context: ExecutionContext): Promise<NodeExecutionResult> {
    const code = this.resolveValue(this.config.code, context);
    const discountType = this.config.discountType || 'fixed_cart'; // percent, fixed_cart, fixed_product
    const amount = this.config.amount;
    const description = this.resolveValue(this.config.description, context);
    const discountTypeProductIds = this.config.discountTypeProductIds;
    const productId = this.config.productId;
    const productIds = this.config.productIds;
    const limit = this.config.usageLimit;
    const dateExpires = this.config.dateExpires;
    const emailRestrictions = this.config.emailRestrictions;
    const minimumAmount = this.config.minimumAmount;
    const maximumAmount = this.config.maximumAmount;

    if (!code) {
      throw new Error('code is required');
    }

    const couponData: any = {
      code,
      discount_type: discountType,
    };

    if (amount) couponData.amount = amount;
    if (description) couponData.description = description;
    if (limit) couponData.usage_limit = limit;
    if (dateExpires) couponData.date_expires = dateExpires;
    if (emailRestrictions) couponData.email_restrictions = emailRestrictions;
    if (minimumAmount) couponData.minimum_amount = minimumAmount;
    if (maximumAmount) couponData.maximum_amount = maximumAmount;

    if (productId) {
      couponData.product_ids = [productId];
    } else if (productIds && productIds.length > 0) {
      couponData.product_ids = productIds;
    }

    if (discountTypeProductIds) {
      couponData.discount_type_product_ids = discountTypeProductIds;
    }

    const coupon = await this.callApi('coupons', 'POST', couponData);

    return {
      success: true,
      data: {
        id: coupon.id,
        code: coupon.code,
        dateCreated: coupon.date_created,
      },
    };
  }

  /**
   * Update a coupon
   */
  private async updateCoupon(context: ExecutionContext): Promise<NodeExecutionResult> {
    const couponId = this.resolveValue(this.config.couponId, context);
    const amount = this.config.amount;
    const description = this.config.description;
    const dateExpires = this.config.dateExpires;

    if (!couponId) {
      throw new Error('couponId is required');
    }

    const couponData: any = {};

    if (amount) couponData.amount = amount;
    if (description) couponData.description = description;
    if (dateExpires) couponData.date_expires = dateExpires;

    const coupon = await this.callApi(`coupons/${couponId}`, 'PUT', couponData);

    return {
      success: true,
      data: {
        id: coupon.id,
        dateModified: coupon.date_modified,
      },
    };
  }

  /**
   * Delete a coupon
   */
  private async deleteCoupon(context: ExecutionContext): Promise<NodeExecutionResult> {
    const couponId = this.resolveValue(this.config.couponId, context);
    const force = this.config.force || true;

    if (!couponId) {
      throw new Error('couponId is required');
    }

    await this.callApi(`coupons/${couponId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: couponId,
        deleted: true,
      },
    };
  }

  /**
   * Get coupon by code
   */
  private async getCouponByCode(context: ExecutionContext): Promise<NodeExecutionResult> {
    const code = this.resolveValue(this.config.code, context);

    if (!code) {
      throw new Error('code is required');
    }

    const response = await this.callApi(`coupons/code/${code}`);

    return {
      success: true,
      data: {
        coupon: response.coupon || response,
      },
    };
  }

  /**
   * Create a refund
   */
  private async createRefund(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const amount = this.config.amount;
    const reason = this.resolveValue(this.config.reason, context);
    const apiRefund = this.config.apiRefund; // true to use API refund
    const apiRefundApplicationId = this.config.apiRefundApplicationId; // Gateway transaction ID

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const refundData: any = {};

    if (amount) refundData.amount = amount;
    if (reason) refundData.reason = reason;
    if (apiRefund !== undefined) refundData.api_refund = apiRefund;
    if (apiRefundApplicationId) refundData.api_refund_application_id = apiRefundApplicationId;

    const refund = await this.callApi(`orders/${orderId}/refunds`, 'POST', refundData);

    return {
      success: true,
      data: {
        id: refund.id,
        amount: refund.amount,
        reason: refund.reason,
        createdAt: refund.created_at,
      },
    };
  }

  /**
   * List refunds for an order
   */
  private async listRefunds(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const response = await this.callApi(`orders/${orderId}/refunds`);

    return {
      success: true,
      data: {
        refunds: response.map((r: any) => ({
          id: r.id,
          amount: r.amount,
          reason: r.reason,
          createdAt: r.created_at,
        })),
      },
    };
  }

  /**
   * Delete a refund
   */
  private async deleteRefund(context: ExecutionContext): Promise<NodeExecutionResult> {
    const refundId = this.resolveValue(this.config.refundId, context);
    const force = this.config.force || true;

    if (!refundId) {
      throw new Error('refundId is required');
    }

    await this.callApi(`orders/refunds/${refundId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: refundId,
        deleted: true,
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

    const webhook = await this.callApi(`webhooks/${webhookId}`);

    return {
      success: true,
      data: {
        id: webhook.id,
        name: webhook.name,
        topic: webhook.topic,
        resource: webhook.resource,
        event: webhook.event,
        hooks: webhook.hooks,
        deliveryUrl: webhook.delivery_url,
      },
    };
  }

  /**
   * List webhooks
   */
  private async listWebhooks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const response = await this.callApi('webhooks');

    return {
      success: true,
      data: {
        webhooks: response.map((w: any) => ({
          id: w.id,
          name: w.name,
          topic: w.topic,
          resource: w.resource,
          event: w.event,
          deliveryUrl: w.delivery_url,
        })),
      },
    };
  }

  /**
   * Create a webhook
   */
  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const topic = this.config.topic;
    const deliveryUrl = this.resolveValue(this.config.deliveryUrl, context);
    const secret = this.resolveValue(this.config.secret, context);
    const actions = this.config.actions; // created, updated, deleted

    if (!name) {
      throw new Error('name is required');
    }

    if (!topic) {
      throw new Error('topic is required');
    }

    if (!deliveryUrl) {
      throw new Error('deliveryUrl is required');
    }

    const webhookData: any = {
      name,
      topic,
      delivery_url: deliveryUrl,
    };

    if (secret) webhookData.secret = secret;
    if (actions) webhookData.actions = actions;

    const webhook = await this.callApi('webhooks', 'POST', webhookData);

    return {
      success: true,
      data: {
        id: webhook.id,
        name: webhook.name,
        secret: webhook.secret,
        topic: webhook.topic,
      },
    };
  }

  /**
   * Delete a webhook
   */
  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);
    const force = this.config.force || true;

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    await this.callApi(`webhooks/${webhookId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: webhookId,
        deleted: true,
      },
    };
  }

  /**
   * Update a webhook
   */
  private async updateWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);
    const name = this.config.name;
    const deliveryUrl = this.config.deliveryUrl;
    const secret = this.config.secret;
    const actions = this.config.actions;

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    const webhookData: any = {};

    if (name) webhookData.name = name;
    if (deliveryUrl) webhookData.delivery_url = deliveryUrl;
    if (secret) webhookData.secret = secret;
    if (actions) webhookData.actions = actions;

    const webhook = await this.callApi(`webhooks/${webhookId}`, 'PUT', webhookData);

    return {
      success: true,
      data: {
        id: webhook.id,
        name: webhook.name,
        updatedAt: webhook.updated_at,
      },
    };
  }

  /**
   * Get a tax class
   */
  private async getTax(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taxId = this.resolveValue(this.config.taxId, context);

    if (!taxId) {
      throw new Error('taxId is required');
    }

    const tax = await this.callApi(`taxes/${taxId}`);

    return {
      success: true,
      data: {
        id: tax.id,
        country: tax.country,
        state: tax.state,
        cities: tax.cities,
        postcodes: tax.postcodes,
        rate: tax.rate,
        name: tax.name,
        priority: tax.priority,
        compound: tax.compound,
        shipping: tax.shipping,
        class: tax.class,
      },
    };
  }

  /**
   * List tax classes
   */
  private async listTaxes(context: ExecutionContext): Promise<NodeExecutionResult> {
    const response = await this.callApi('taxes');

    return {
      success: true,
      data: {
        taxes: response.map((t: any) => ({
          id: t.id,
          country: t.country,
          state: t.state,
          name: t.name,
          rate: t.rate,
          priority: t.priority,
          class: t.class,
        })),
      },
    };
  }

  /**
   * Create a tax class
   */
  private async createTax(context: ExecutionContext): Promise<NodeExecutionResult> {
    const country = this.resolveValue(this.config.country, context);
    const state = this.resolveValue(this.config.state, context);
    const cities = this.config.cities;
    const postcodes = this.config.postcodes;
    const rate = this.config.rate;
    const name = this.resolveValue(this.config.name, context);
    const priority = this.config.priority;
    const compound = this.config.compound || false;
    const shipping = this.config.shipping || false;
    const taxClass = this.config.taxClass;

    if (!country) {
      throw new Error('country is required');
    }

    if (rate === undefined || rate === null) {
      throw new Error('rate is required');
    }

    const taxData: any = {
      country,
      rate,
      compound,
      shipping,
    };

    if (state) taxData.state = state;
    if (name) taxData.name = name;
    if (priority !== undefined) taxData.priority = priority;
    if (cities && cities.length > 0) taxData.cities = cities;
    if (postcodes && postcodes.length > 0) taxData.postcodes = postcodes;
    if (taxClass) taxData.class = taxClass;

    const tax = await this.callApi('taxes', 'POST', taxData);

    return {
      success: true,
      data: {
        id: tax.id,
        name: tax.name,
        rate: tax.rate,
      },
    };
  }

  /**
   * Update a tax class
   */
  private async updateTax(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taxId = this.resolveValue(this.config.taxId, context);
    const name = this.config.name;
    const priority = this.config.priority;
    const compound = this.config.compound;

    if (!taxId) {
      throw new Error('taxId is required');
    }

    const taxData: any = {};

    if (name) taxData.name = name;
    if (priority !== undefined) taxData.priority = priority;
    if (compound !== undefined) taxData.compound = compound;

    const tax = await this.callApi(`taxes/${taxId}`, 'PUT', taxData);

    return {
      success: true,
      data: {
        id: tax.id,
        updatedAt: tax.updated_at,
      },
    };
  }

  /**
   * Delete a tax class
   */
  private async deleteTax(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taxId = this.resolveValue(this.config.taxId, context);
    const force = this.config.force || true;

    if (!taxId) {
      throw new Error('taxId is required');
    }

    await this.callApi(`taxes/${taxId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: taxId,
        deleted: true,
      },
    };
  }

  /**
   * Get a shipping zone
   */
  private async getShippingZone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const zoneId = this.resolveValue(this.config.zoneId, context);

    if (!zoneId) {
      throw new Error('zoneId is required');
    }

    const zone = await this.callApi(`shipping/zones/${zoneId}`);

    return {
      success: true,
      data: {
        id: zone.id,
        name: zone.name,
        order: zone.order,
        locations: zone.locations,
        methods: zone.methods,
      },
    };
  }

  /**
   * List shipping zones
   */
  private async listShippingZones(context: ExecutionContext): Promise<NodeExecutionResult> {
    const response = await this.callApi('shipping/zones');

    return {
      success: true,
      data: {
        zones: response.map((z: any) => ({
          id: z.id,
          name: z.name,
          order: z.order,
          locations: z.locations,
        })),
      },
    };
  }

  /**
   * Create a shipping zone
   */
  private async createShippingZone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const order = this.config.order || 0;
    const locations = this.config.locations;

    if (!name) {
      throw new Error('name is required');
    }

    if (!locations || locations.length === 0) {
      throw new Error('locations array is required');
    }

    const zoneData = {
      name,
      order,
      locations,
    };

    const zone = await this.callApi('shipping/zones', 'POST', zoneData);

    return {
      success: true,
      data: {
        id: zone.id,
        name: zone.name,
      },
    };
  }

  /**
   * Update a shipping zone
   */
  private async updateShippingZone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const zoneId = this.resolveValue(this.config.zoneId, context);
    const name = this.config.name;
    const order = this.config.order;
    const locations = this.config.locations;

    if (!zoneId) {
      throw new Error('zoneId is required');
    }

    const zoneData: any = {};

    if (name) zoneData.name = name;
    if (order !== undefined) zoneData.order = order;
    if (locations) zoneData.locations = locations;

    const zone = await this.callApi(`shipping/zones/${zoneId}`, 'PUT', zoneData);

    return {
      success: true,
      data: {
        id: zone.id,
        updatedAt: zone.updated_at,
      },
    };
  }

  /**
   * Delete a shipping zone
   */
  private async deleteShippingZone(context: ExecutionContext): Promise<NodeExecutionResult> {
    const zoneId = this.resolveValue(this.config.zoneId, context);
    const force = this.config.force || true;

    if (!zoneId) {
      throw new Error('zoneId is required');
    }

    await this.callApi(`shipping/zones/${zoneId}?force=${force}`, 'DELETE');

    return {
      success: true,
      data: {
        id: zoneId,
        deleted: true,
      },
    };
  }

  /**
   * Call WooCommerce API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}/${endpoint}`;
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.code || response.statusText);
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
    if (error.code === 'woocommerce_rest_authentication_error') {
      return 'Authentication failed. Check your consumer key and secret.';
    }
    if (error.code === 'woocommerce_rest_invalid_id') {
      return 'Invalid resource ID. Check the ID.';
    }
    if (error.code === 'woocommerce_rest_shop_invalid_id') {
      return 'Invalid shop ID.';
    }
    if (error.code === 'woocommerce_rest_product_invalid_sku') {
      return 'Invalid product SKU.';
    }
    if (error.code === 'woocommerce_rest_product_out_of_stock') {
      return 'Product is out of stock.';
    }
    if (error.code === 'woocommerce_rest_invalid_coupon') {
      return 'Invalid coupon code.';
    }
    if (error.code === 'woocommerce_rest_coupon_expired') {
      return 'Coupon has expired.';
    }
    if (error.code === 'woocommerce_rest_order_invalid_id') {
      return 'Invalid order ID.';
    }
    return `WooCommerce error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'wooCommerce';
  }

  getIcon(): string {
    return '🛍️';
  }

  /**
   * Order statuses
   */
  static readonly OrderStatuses = {
    Pending: 'pending',
    Processing: 'processing',
    Completed: 'completed',
    Cancelled: 'cancelled',
    Refunded: 'refunded',
    Failed: 'failed',
    Trash: 'trash',
  } as const;

  /**
   * Product types
   */
  static readonly ProductTypes = {
    Simple: 'simple',
    Variable: 'variable',
    Grouped: 'grouped',
    External: 'external',
  } as const;

  /**
   * Coupon types
   */
  static readonly CouponTypes = {
    Percent: 'percent',
    FixedCart: 'fixed_cart',
    FixedProduct: 'fixed_product',
  } as const;
}
