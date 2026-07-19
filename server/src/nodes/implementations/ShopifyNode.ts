import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Shopify Node - Shopify Admin API
 * n8n-compatible: Complete Shopify REST Admin API integration
 *
 * Configuration:
 * - operation: 'getOrder' | 'listOrders' | 'createOrder' | 'updateOrder' | 'cancelOrder' | 'closeOrder' | 'openOrder' | 'deleteOrder' |
 *              'getProduct' | 'listProducts' | 'createProduct' | 'updateProduct' | 'deleteProduct' | 'getProductCount' |
 *              'getVariant' | 'listVariants' | 'createVariant' | 'updateVariant' | 'deleteVariant' |
 *              'getCustomer' | 'listCustomers' | 'createCustomer' | 'updateCustomer' | 'deleteCustomer' | 'getCustomerCount' | 'searchCustomers' |
 *              'getInventory' | 'updateInventory' | 'listInventoryLevels' | 'adjustInventory' |
 *              'getCollection' | 'listCollections' | 'createCollection' | 'updateCollection' | 'deleteCollection' | 'addProductToCollection' | 'removeProductFromCollection' |
 *              'getLocation' | 'listLocations' | 'getLocationCount' |
 *              'getFulfillment' | 'listFulfillments' | 'createFulfillment' | 'updateFulfillment' | 'cancelFulfillment' |
 *              'getTransaction' | 'listTransactions' | 'createTransaction' |
 *              'getRefund' | 'listRefunds' | 'createRefund' | 'calculateRefund' |
 *              'getWebhook' | 'listWebhooks' | 'createWebhook' | 'updateWebhook' | 'deleteWebhook' |
 *              'getShop' | 'updateShop' | 'getShopCount'
 * - shopDomain: Your Shopify store domain (e.g., 'store.myshopify.com')
 * - accessToken: Shopify Admin API access token
 * - apiVersion: Shopify API version (default: '2024-01')
 *
 * Order Operations:
 * - orderId: Order ID or order number
 * - status: 'open' | 'closed' | 'cancelled' | 'any'
 * - fulfillmentStatus: 'fulfilled' | 'partial' | 'unfulfilled' | 'any'
 * - financialStatus: 'paid' | 'pending' | 'authorized' | 'partially_paid' | 'voided' | 'any'
 *
 * Product Operations:
 * - product: { title, bodyHtml, productType, tags, vendor, status, variants }
 * - variant: { option1, option2, option3, price, compareAtPrice, sku, barcode, inventoryQuantity, weight, weightUnit }
 *
 * Customer Operations:
 * - customer: { firstName, lastName, email, phone, acceptsMarketing, tags, metafields }
 * - query: Search query string
 *
 * Inventory Operations:
 * - inventoryItemId: Inventory item ID
 * - locationId: Location ID
 * - availableAdjustment: Quantity change (+/-)
 */
export class ShopifyNode extends BaseNode {
  private apiBaseUrl: string;
  private accessToken: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    const shopDomain = config.shopDomain || '';
    const apiVersion = config.apiVersion || '2024-01';
    this.apiBaseUrl = `https://${shopDomain}/admin/api/${apiVersion}`;
    this.accessToken = config.accessToken || '';
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.apiBaseUrl.includes('.myshopify.com')) {
      throw new Error('Valid shopDomain is required (e.g., store.myshopify.com)');
    }

    if (!this.accessToken) {
      throw new Error('Shopify access token is required');
    }

    const validOperations = [
      'getOrder', 'listOrders', 'createOrder', 'updateOrder', 'cancelOrder', 'closeOrder', 'openOrder', 'deleteOrder', 'getOrderCount',
      'getProduct', 'listProducts', 'createProduct', 'updateProduct', 'deleteProduct', 'getProductCount',
      'getVariant', 'listVariants', 'createVariant', 'updateVariant', 'deleteVariant',
      'getCustomer', 'listCustomers', 'createCustomer', 'updateCustomer', 'deleteCustomer', 'getCustomerCount', 'searchCustomers',
      'getInventory', 'updateInventory', 'listInventoryLevels', 'adjustInventory', 'connectInventory', 'setInventory',
      'getCollection', 'listCollections', 'createCollection', 'updateCollection', 'deleteCollection', 'addProductToCollection', 'removeProductFromCollection',
      'getLocation', 'listLocations', 'getLocationCount',
      'getFulfillment', 'listFulfillments', 'createFulfillment', 'updateFulfillment', 'cancelFulfillment',
      'getTransaction', 'listTransactions', 'createTransaction',
      'getRefund', 'listRefunds', 'createRefund', 'calculateRefund',
      'getWebhook', 'listWebhooks', 'createWebhook', 'updateWebhook', 'deleteWebhook',
      'getShop', 'updateShop',
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
          return await this.listOrders();
        case 'createOrder':
          return await this.createOrder(context);
        case 'updateOrder':
          return await this.updateOrder(context);
        case 'cancelOrder':
          return await this.cancelOrder(context);
        case 'closeOrder':
          return await this.closeOrder(context);
        case 'openOrder':
          return await this.openOrder(context);
        case 'deleteOrder':
          return await this.deleteOrder(context);
        case 'getOrderCount':
          return await this.getOrderCount();

        // Product Operations
        case 'getProduct':
          return await this.getProduct(context);
        case 'listProducts':
          return await this.listProducts();
        case 'createProduct':
          return await this.createProduct(context);
        case 'updateProduct':
          return await this.updateProduct(context);
        case 'deleteProduct':
          return await this.deleteProduct(context);
        case 'getProductCount':
          return await this.getProductCount();

        // Variant Operations
        case 'getVariant':
          return await this.getVariant(context);
        case 'listVariants':
          return await this.listVariants();
        case 'createVariant':
          return await this.createVariant(context);
        case 'updateVariant':
          return await this.updateVariant(context);
        case 'deleteVariant':
          return await this.deleteVariant(context);

        // Customer Operations
        case 'getCustomer':
          return await this.getCustomer(context);
        case 'listCustomers':
          return await this.listCustomers();
        case 'createCustomer':
          return await this.createCustomer(context);
        case 'updateCustomer':
          return await this.updateCustomer(context);
        case 'deleteCustomer':
          return await this.deleteCustomer(context);
        case 'getCustomerCount':
          return await this.getCustomerCount();
        case 'searchCustomers':
          return await this.searchCustomers();

        // Inventory Operations
        case 'getInventory':
          return await this.getInventory(context);
        case 'updateInventory':
          return await this.updateInventory(context);
        case 'listInventoryLevels':
          return await this.listInventoryLevels();
        case 'adjustInventory':
          return await this.adjustInventory(context);
        case 'connectInventory':
          return await this.connectInventory(context);
        case 'setInventory':
          return await this.setInventory(context);

        // Collection Operations
        case 'getCollection':
          return await this.getCollection(context);
        case 'listCollections':
          return await this.listCollections();
        case 'createCollection':
          return await this.createCollection(context);
        case 'updateCollection':
          return await this.updateCollection(context);
        case 'deleteCollection':
          return await this.deleteCollection(context);
        case 'addProductToCollection':
          return await this.addProductToCollection(context);
        case 'removeProductFromCollection':
          return await this.removeProductFromCollection(context);

        // Location Operations
        case 'getLocation':
          return await this.getLocation(context);
        case 'listLocations':
          return await this.listLocations();
        case 'getLocationCount':
          return await this.getLocationCount();

        // Fulfillment Operations
        case 'getFulfillment':
          return await this.getFulfillment(context);
        case 'listFulfillments':
          return await this.listFulfillments(context);
        case 'createFulfillment':
          return await this.createFulfillment(context);
        case 'updateFulfillment':
          return await this.updateFulfillment(context);
        case 'cancelFulfillment':
          return await this.cancelFulfillment(context);

        // Transaction Operations
        case 'getTransaction':
          return await this.getTransaction(context);
        case 'listTransactions':
          return await this.listTransactions(context);
        case 'createTransaction':
          return await this.createTransaction(context);

        // Refund Operations
        case 'getRefund':
          return await this.getRefund(context);
        case 'listRefunds':
          return await this.listRefunds(context);
        case 'createRefund':
          return await this.createRefund(context);
        case 'calculateRefund':
          return await this.calculateRefund(context);

        // Webhook Operations
        case 'getWebhook':
          return await this.getWebhook(context);
        case 'listWebhooks':
          return await this.listWebhooks();
        case 'createWebhook':
          return await this.createWebhook(context);
        case 'updateWebhook':
          return await this.updateWebhook(context);
        case 'deleteWebhook':
          return await this.deleteWebhook(context);

        // Shop Operations
        case 'getShop':
          return await this.getShop();
        case 'updateShop':
          return await this.updateShop();

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

    const order = await this.callApi(`orders/${orderId}.json`);

    return {
      success: true,
      data: {
        id: order.order.id,
        orderNumber: order.order.order_number,
        email: order.order.email,
        createdAt: order.order.created_at,
        updatedAt: order.order.updated_at,
        closedAt: order.order.closed_at,
        processedAt: order.order.processed_at,
        currency: order.order.currency,
        total: order.order.total_price,
        subtotal: order.order.subtotal_price,
        tax: order.order.total_tax,
        financialStatus: order.order.financial_status,
        fulfillmentStatus: order.order.fulfillment_status,
        customer: order.order.customer,
        lineItems: order.order.line_items,
        shippingAddress: order.order.shipping_address,
        billingAddress: order.order.billing_address,
      },
    };
  }

  /**
   * List orders
   */
  private async listOrders(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 50;
    const status = this.config.status; // 'open' | 'closed' | 'cancelled' | 'any'
    const fulfillmentStatus = this.config.fulfillmentStatus;
    const financialStatus = this.config.financialStatus;
    const sinceId = this.config.sinceId;
    const createdAtMin = this.config.createdAtMin;
    const createdAtMax = this.config.createdAtMax;

    let url = `orders.json?limit=${limit}`;
    if (status) url += `&status=${status}`;
    if (fulfillmentStatus) url += `&fulfillment_status=${fulfillmentStatus}`;
    if (financialStatus) url += `&financial_status=${financialStatus}`;
    if (sinceId) url += `&since_id=${sinceId}`;
    if (createdAtMin) url += `&created_at_min=${createdAtMin}`;
    if (createdAtMax) url += `&created_at_max=${createdAtMax}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        orders: response.orders.map((o: any) => ({
          id: o.id,
          orderNumber: o.order_number,
          email: o.email,
          createdAt: o.created_at,
          currency: o.currency,
          total: o.total_price,
          financialStatus: o.financial_status,
          fulfillmentStatus: o.fulfillment_status,
        })),
        count: response.orders.length,
      },
    };
  }

  /**
   * Create an order
   */
  private async createOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const lineItems = this.config.lineItems;
    const customer = this.config.customer;
    const billingAddress = this.config.billingAddress;
    const shippingAddress = this.config.shippingAddress;
    const email = this.resolveValue(this.config.email, context);
    const tags = this.resolveValue(this.config.tags, context);
    const note = this.resolveValue(this.config.note, context);
    const financialStatus = this.config.financialStatus;
    const paymentPending = this.config.paymentPending;

    if (!lineItems || lineItems.length === 0) {
      throw new Error('At least one line item is required');
    }

    const payload: any = {
      order: {
        line_items: lineItems,
      },
    };

    if (customer) payload.order.customer = customer;
    if (billingAddress) payload.order.billing_address = billingAddress;
    if (shippingAddress) payload.order.shipping_address = shippingAddress;
    if (email) payload.order.email = email;
    if (tags) payload.order.tags = tags;
    if (note) payload.order.note = note;
    if (financialStatus) payload.order.financial_status = financialStatus;
    if (paymentPending) payload.order.payment_pending = paymentPending;

    const response = await this.callApi('orders.json', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.order.id,
        orderNumber: response.order.order_number,
        createdAt: response.order.created_at,
        total: response.order.total_price,
      },
    };
  }

  /**
   * Update an order
   */
  private async updateOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const email = this.config.email;
    const note = this.config.note;
    const tags = this.config.tags;
    const closed = this.config.closed;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const payload: any = {
      order: { id: orderId },
    };

    if (email !== undefined) payload.order.email = email;
    if (note !== undefined) payload.order.note = note;
    if (tags !== undefined) payload.order.tags = tags;
    if (closed !== undefined) payload.order.closed = closed;

    const response = await this.callApi(`orders/${orderId}.json`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.order.id,
        updatedAt: response.order.updated_at,
      },
    };
  }

  /**
   * Cancel an order
   */
  private async cancelOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const reason = this.resolveValue(this.config.reason, context);
    const email = this.config.email;
    const refund = this.config.refund !== false;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    let url = `orders/${orderId}/cancel.json`;
    const params: string[] = [];
    if (reason) params.push(`reason=${encodeURIComponent(reason)}`);
    if (email !== undefined) params.push(`email=${email}`);
    if (refund !== undefined) params.push(`refund=${refund}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const response = await this.callApi(url, 'POST');

    return {
      success: true,
      data: {
        id: response.order.id,
        cancelledAt: response.order.cancelled_at,
        cancelReason: response.order.cancel_reason,
      },
    };
  }

  /**
   * Close an order
   */
  private async closeOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const response = await this.callApi(`orders/${orderId}/close.json`, 'POST');

    return {
      success: true,
      data: {
        id: response.order.id,
        closedAt: response.order.closed_at,
      },
    };
  }

  /**
   * Reopen a closed order
   */
  private async openOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const response = await this.callApi(`orders/${orderId}/open.json`, 'POST');

    return {
      success: true,
      data: {
        id: response.order.id,
        openedAt: response.order.updated_at,
      },
    };
  }

  /**
   * Delete an order
   */
  private async deleteOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    await this.callApi(`orders/${orderId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        id: orderId,
        deleted: true,
      },
    };
  }

  /**
   * Get order count
   */
  private async getOrderCount(): Promise<NodeExecutionResult> {
    const status = this.config.status;
    const fulfillmentStatus = this.config.fulfillmentStatus;

    let url = 'orders/count.json';
    const params: string[] = [];
    if (status) params.push(`status=${status}`);
    if (fulfillmentStatus) params.push(`fulfillment_status=${fulfillmentStatus}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        count: response.count,
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

    const product = await this.callApi(`products/${productId}.json`);

    return {
      success: true,
      data: {
        id: product.product.id,
        title: product.product.title,
        bodyHtml: product.product.body_html,
        productType: product.product.product_type,
        vendor: product.product.vendor,
        status: product.product.status,
        tags: product.product.tags,
        createdAt: product.product.created_at,
        updatedAt: product.product.updated_at,
        variants: product.product.variants,
        images: product.product.images,
        options: product.product.options,
      },
    };
  }

  /**
   * List products
   */
  private async listProducts(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 50;
    const sinceId = this.config.sinceId;
    const collectionId = this.config.collectionId;
    const productType = this.config.productType;
    const vendor = this.config.vendor;
    const status = this.config.status || 'active';
    const updatedAtMin = this.config.updatedAtMin;

    let url = `products.json?limit=${limit}`;
    if (sinceId) url += `&since_id=${sinceId}`;
    if (collectionId) url += `&collection_id=${collectionId}`;
    if (productType) url += `&product_type=${encodeURIComponent(productType)}`;
    if (vendor) url += `&vendor=${encodeURIComponent(vendor)}`;
    if (status) url += `&status=${status}`;
    if (updatedAtMin) url += `&updated_at_min=${updatedAtMin}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        products: response.products.map((p: any) => ({
          id: p.id,
          title: p.title,
          productType: p.product_type,
          vendor: p.vendor,
          status: p.status,
          tags: p.tags,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        })),
        count: response.products.length,
      },
    };
  }

  /**
   * Create a product
   */
  private async createProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const title = this.resolveValue(this.config.title, context);
    const bodyHtml = this.resolveValue(this.config.bodyHtml, context);
    const productType = this.resolveValue(this.config.productType, context);
    const vendor = this.resolveValue(this.config.vendor, context);
    const tags = this.resolveValue(this.config.tags, context);
    const status = this.config.status || 'active';
    const variants = this.config.variants;
    const images = this.config.images;
    const options = this.config.options;

    if (!title) {
      throw new Error('Product title is required');
    }

    const payload: any = {
      product: {
        title,
        status,
      },
    };

    if (bodyHtml) payload.product.body_html = bodyHtml;
    if (productType) payload.product.product_type = productType;
    if (vendor) payload.product.vendor = vendor;
    if (tags) payload.product.tags = tags;
    if (variants) payload.product.variants = variants;
    if (images) payload.product.images = images;
    if (options) payload.product.options = options;

    const response = await this.callApi('products.json', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.product.id,
        title: response.product.title,
        createdAt: response.product.created_at,
      },
    };
  }

  /**
   * Update a product
   */
  private async updateProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);
    const title = this.config.title;
    const bodyHtml = this.config.bodyHtml;
    const productType = this.config.productType;
    const vendor = this.config.vendor;
    const tags = this.config.tags;
    const status = this.config.status;

    if (!productId) {
      throw new Error('productId is required');
    }

    const payload: any = {
      product: { id: productId },
    };

    if (title !== undefined) payload.product.title = title;
    if (bodyHtml !== undefined) payload.product.body_html = bodyHtml;
    if (productType !== undefined) payload.product.product_type = productType;
    if (vendor !== undefined) payload.product.vendor = vendor;
    if (tags !== undefined) payload.product.tags = tags;
    if (status !== undefined) payload.product.status = status;

    const response = await this.callApi(`products/${productId}.json`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.product.id,
        updatedAt: response.product.updated_at,
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

    await this.callApi(`products/${productId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        id: productId,
        deleted: true,
      },
    };
  }

  /**
   * Get product count
   */
  private async getProductCount(): Promise<NodeExecutionResult> {
    const vendor = this.config.vendor;
    const productType = this.config.productType;
    const collectionId = this.config.collectionId;
    const createdAtMin = this.config.createdAtMin;

    let url = 'products/count.json';
    const params: string[] = [];
    if (vendor) params.push(`vendor=${encodeURIComponent(vendor)}`);
    if (productType) params.push(`product_type=${encodeURIComponent(productType)}`);
    if (collectionId) params.push(`collection_id=${collectionId}`);
    if (createdAtMin) params.push(`created_at_min=${createdAtMin}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        count: response.count,
      },
    };
  }

  /**
   * Get a variant
   */
  private async getVariant(context: ExecutionContext): Promise<NodeExecutionResult> {
    const variantId = this.resolveValue(this.config.variantId, context);

    if (!variantId) {
      throw new Error('variantId is required');
    }

    const variant = await this.callApi(`variants/${variantId}.json`);

    return {
      success: true,
      data: {
        id: variant.variant.id,
        productId: variant.variant.product_id,
        title: variant.variant.title,
        option1: variant.variant.option1,
        option2: variant.variant.option2,
        option3: variant.variant.option3,
        price: variant.variant.price,
        compareAtPrice: variant.variant.compare_at_price,
        sku: variant.variant.sku,
        barcode: variant.variant.barcode,
        inventoryQuantity: variant.variant.inventory_quantity,
        weight: variant.variant.weight,
        weightUnit: variant.variant.weight_unit,
        createdAt: variant.variant.created_at,
        updatedAt: variant.variant.updated_at,
      },
    };
  }

  /**
   * List variants for a product
   */
  private async listVariants(): Promise<NodeExecutionResult> {
    const productId = this.config.productId;

    if (!productId) {
      throw new Error('productId is required');
    }

    const response = await this.callApi(`products/${productId}/variants.json`);

    return {
      success: true,
      data: {
        variants: response.variants.map((v: any) => ({
          id: v.id,
          title: v.title,
          option1: v.option1,
          option2: v.option2,
          option3: v.option3,
          price: v.price,
          sku: v.sku,
          inventoryQuantity: v.inventory_quantity,
        })),
        count: response.variants.length,
      },
    };
  }

  /**
   * Create a variant for a product
   */
  private async createVariant(context: ExecutionContext): Promise<NodeExecutionResult> {
    const productId = this.resolveValue(this.config.productId, context);
    const option1 = this.resolveValue(this.config.option1, context);
    const option2 = this.resolveValue(this.config.option2, context);
    const option3 = this.resolveValue(this.config.option3, context);
    const price = this.resolveValue(this.config.price, context);
    const compareAtPrice = this.config.compareAtPrice;
    const sku = this.resolveValue(this.config.sku, context);
    const barcode = this.resolveValue(this.config.barcode, context);
    const inventoryQuantity = this.config.inventoryQuantity || 0;
    const weight = this.config.weight;
    const weightUnit = this.config.weightUnit;

    if (!productId) {
      throw new Error('productId is required');
    }

    if (!price) {
      throw new Error('price is required');
    }

    const payload: any = {
      variant: {
        price,
      },
    };

    if (option1) payload.variant.option1 = option1;
    if (option2) payload.variant.option2 = option2;
    if (option3) payload.variant.option3 = option3;
    if (compareAtPrice) payload.variant.compare_at_price = compareAtPrice;
    if (sku) payload.variant.sku = sku;
    if (barcode) payload.variant.barcode = barcode;
    if (inventoryQuantity !== undefined) payload.variant.inventory_quantity = inventoryQuantity;
    if (weight) payload.variant.weight = weight;
    if (weightUnit) payload.variant.weight_unit = weightUnit;

    const response = await this.callApi(`products/${productId}/variants.json`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.variant.id,
        productId: response.variant.product_id,
        createdAt: response.variant.created_at,
      },
    };
  }

  /**
   * Update a variant
   */
  private async updateVariant(context: ExecutionContext): Promise<NodeExecutionResult> {
    const variantId = this.resolveValue(this.config.variantId, context);
    const option1 = this.config.option1;
    const option2 = this.config.option2;
    const option3 = this.config.option3;
    const price = this.config.price;
    const compareAtPrice = this.config.compareAtPrice;
    const sku = this.config.sku;
    const barcode = this.config.barcode;
    const inventoryQuantity = this.config.inventoryQuantity;

    if (!variantId) {
      throw new Error('variantId is required');
    }

    const payload: any = {
      variant: { id: variantId },
    };

    if (option1 !== undefined) payload.variant.option1 = option1;
    if (option2 !== undefined) payload.variant.option2 = option2;
    if (option3 !== undefined) payload.variant.option3 = option3;
    if (price !== undefined) payload.variant.price = price;
    if (compareAtPrice !== undefined) payload.variant.compare_at_price = compareAtPrice;
    if (sku !== undefined) payload.variant.sku = sku;
    if (barcode !== undefined) payload.variant.barcode = barcode;
    if (inventoryQuantity !== undefined) payload.variant.inventory_quantity = inventoryQuantity;

    const response = await this.callApi(`variants/${variantId}.json`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.variant.id,
        updatedAt: response.variant.updated_at,
      },
    };
  }

  /**
   * Delete a variant
   */
  private async deleteVariant(context: ExecutionContext): Promise<NodeExecutionResult> {
    const variantId = this.resolveValue(this.config.variantId, context);

    if (!variantId) {
      throw new Error('variantId is required');
    }

    await this.callApi(`variants/${variantId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        id: variantId,
        deleted: true,
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

    const customer = await this.callApi(`customers/${customerId}.json`);

    return {
      success: true,
      data: {
        id: customer.customer.id,
        email: customer.customer.email,
        firstName: customer.customer.first_name,
        lastName: customer.customer.last_name,
        phone: customer.customer.phone,
        acceptsMarketing: customer.customer.accepts_marketing,
        tags: customer.customer.tags,
        createdAt: customer.customer.created_at,
        updatedAt: customer.customer.updated_at,
        addresses: customer.customer.addresses,
        ordersCount: customer.customer.orders_count,
        totalSpent: customer.customer.total_spent,
      },
    };
  }

  /**
   * List customers
   */
  private async listCustomers(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 50;
    const sinceId = this.config.sinceId;
    const createdAtMin = this.config.createdAtMin;
    const createdAtMax = this.config.createdAtMax;

    let url = `customers.json?limit=${limit}`;
    if (sinceId) url += `&since_id=${sinceId}`;
    if (createdAtMin) url += `&created_at_min=${createdAtMin}`;
    if (createdAtMax) url += `&created_at_max=${createdAtMax}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        customers: response.customers.map((c: any) => ({
          id: c.id,
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          phone: c.phone,
          acceptsMarketing: c.accepts_marketing,
          tags: c.tags,
          createdAt: c.created_at,
          ordersCount: c.orders_count,
          totalSpent: c.total_spent,
        })),
        count: response.customers.length,
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
    const phone = this.resolveValue(this.config.phone, context);
    const acceptsMarketing = this.config.acceptsMarketing;
    const tags = this.resolveValue(this.config.tags, context);
    const addresses = this.config.addresses;

    if (!email) {
      throw new Error('email is required');
    }

    const payload: any = {
      customer: {
        email,
      },
    };

    if (firstName) payload.customer.first_name = firstName;
    if (lastName) payload.customer.last_name = lastName;
    if (phone) payload.customer.phone = phone;
    if (acceptsMarketing !== undefined) payload.customer.accepts_marketing = acceptsMarketing;
    if (tags) payload.customer.tags = tags;
    if (addresses) payload.customer.addresses = addresses;

    const response = await this.callApi('customers.json', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.customer.id,
        email: response.customer.email,
        createdAt: response.customer.created_at,
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
    const phone = this.config.phone;
    const acceptsMarketing = this.config.acceptsMarketing;
    const tags = this.config.tags;

    if (!customerId) {
      throw new Error('customerId is required');
    }

    const payload: any = {
      customer: { id: customerId },
    };

    if (email !== undefined) payload.customer.email = email;
    if (firstName !== undefined) payload.customer.first_name = firstName;
    if (lastName !== undefined) payload.customer.last_name = lastName;
    if (phone !== undefined) payload.customer.phone = phone;
    if (acceptsMarketing !== undefined) payload.customer.accepts_marketing = acceptsMarketing;
    if (tags !== undefined) payload.customer.tags = tags;

    const response = await this.callApi(`customers/${customerId}.json`, 'PUT', payload);

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

    await this.callApi(`customers/${customerId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        id: customerId,
        deleted: true,
      },
    };
  }

  /**
   * Get customer count
   */
  private async getCustomerCount(): Promise<NodeExecutionResult> {
    const response = await this.callApi('customers/count.json');

    return {
      success: true,
      data: {
        count: response.count,
      },
    };
  }

  /**
   * Search customers
   */
  private async searchCustomers(): Promise<NodeExecutionResult> {
    const query = this.config.query;

    if (!query) {
      throw new Error('Search query is required');
    }

    const response = await this.callApi(`customers/search.json?query=${encodeURIComponent(query)}`);

    return {
      success: true,
      data: {
        customers: response.customers.map((c: any) => ({
          id: c.id,
          email: c.email,
          firstName: c.first_name,
          lastName: c.last_name,
          phone: c.phone,
        })),
        count: response.customers.length,
      },
    };
  }

  /**
   * Get inventory levels
   */
  private async getInventory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const inventoryItemId = this.resolveValue(this.config.inventoryItemId, context);

    if (!inventoryItemId) {
      throw new Error('inventoryItemId is required');
    }

    const levels = await this.callApi(`inventory_levels.json?inventory_item_ids=${inventoryItemId}`);

    return {
      success: true,
      data: {
        levels: levels.inventory_levels.map((l: any) => ({
          inventoryItemId: l.inventory_item_id,
          locationId: l.location_id,
          available: l.available,
          updatedAt: l.updated_at,
        })),
      },
    };
  }

  /**
   * Update inventory level at location
   */
  private async updateInventory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const inventoryItemId = this.resolveValue(this.config.inventoryItemId, context);
    const locationId = this.resolveValue(this.config.locationId, context);
    const available = this.config.available;

    if (!inventoryItemId) {
      throw new Error('inventoryItemId is required');
    }

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (available === undefined || available < 0) {
      throw new Error('available is required and must be >= 0');
    }

    const payload = {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available,
    };

    const response = await this.callApi('inventory_levels/set.json', 'POST', payload);

    return {
      success: true,
      data: {
        inventoryItemId: response.inventory_level.inventory_item_id,
        locationId: response.inventory_level.location_id,
        available: response.inventory_level.available,
        updatedAt: response.inventory_level.updated_at,
      },
    };
  }

  /**
   * List inventory levels
   */
  private async listInventoryLevels(): Promise<NodeExecutionResult> {
    const locationIds = this.config.locationIds;
    const limit = this.config.limit || 50;
    const inventoryItemIds = this.config.inventoryItemIds;

    let url = `inventory_levels.json?limit=${limit}`;
    if (locationIds) url += `&location_ids=${locationIds}`;
    if (inventoryItemIds) url += `&inventory_item_ids=${inventoryItemIds}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        levels: response.inventory_levels.map((l: any) => ({
          inventoryItemId: l.inventory_item_id,
          locationId: l.location_id,
          available: l.available,
          updatedAt: l.updated_at,
        })),
        count: response.inventory_levels.length,
      },
    };
  }

  /**
   * Adjust inventory
   */
  private async adjustInventory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const inventoryItemId = this.resolveValue(this.config.inventoryItemId, context);
    const locationId = this.resolveValue(this.config.locationId, context);
    const availableAdjustment = this.config.availableAdjustment;

    if (!inventoryItemId) {
      throw new Error('inventoryItemId is required');
    }

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (availableAdjustment === undefined) {
      throw new Error('availableAdjustment is required');
    }

    const payload = {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available_adjustment: availableAdjustment,
    };

    const response = await this.callApi('inventory_levels/adjust.json', 'POST', payload);

    return {
      success: true,
      data: {
        inventoryItemId: response.inventory_level.inventory_item_id,
        locationId: response.inventory_level.location_id,
        available: response.inventory_level.available,
      },
    };
  }

  /**
   * Connect inventory item to location
   */
  private async connectInventory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const inventoryItemId = this.resolveValue(this.config.inventoryItemId, context);
    const locationId = this.resolveValue(this.config.locationId, context);
    const relocateIfNecessary = this.config.relocateIfNecessary || false;

    if (!inventoryItemId) {
      throw new Error('inventoryItemId is required');
    }

    if (!locationId) {
      throw new Error('locationId is required');
    }

    const payload = {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      relocate_if_necessary: relocateIfNecessary,
    };

    const response = await this.callApi('inventory_levels/connect.json', 'POST', payload);

    return {
      success: true,
      data: {
        inventoryItemId: response.inventory_level.inventory_item_id,
        locationId: response.inventory_level.location_id,
        connected: true,
      },
    };
  }

  /**
   * Set inventory level
   */
  private async setInventory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const inventoryItemId = this.resolveValue(this.config.inventoryItemId, context);
    const locationId = this.resolveValue(this.config.locationId, context);
    const available = this.config.available;

    if (!inventoryItemId) {
      throw new Error('inventoryItemId is required');
    }

    if (!locationId) {
      throw new Error('locationId is required');
    }

    if (available === undefined || available < 0) {
      throw new Error('available is required and must be >= 0');
    }

    const payload = {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available,
    };

    const response = await this.callApi('inventory_levels/set.json', 'POST', payload);

    return {
      success: true,
      data: {
        inventoryItemId: response.inventory_level.inventory_item_id,
        locationId: response.inventory_level.location_id,
        available: response.inventory_level.available,
      },
    };
  }

  /**
   * Get a collection
   */
  private async getCollection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const collectionId = this.resolveValue(this.config.collectionId, context);

    if (!collectionId) {
      throw new Error('collectionId is required');
    }

    const collection = await this.callApi(`collections/${collectionId}.json`);

    return {
      success: true,
      data: {
        id: collection.collection.id,
        title: collection.collection.title,
        handle: collection.collection.handle,
        collectionType: collection.collection.collection_type,
        publishedAt: collection.collection.published_at,
        updatedAt: collection.collection.updated_at,
        bodyHtml: collection.collection.body_html,
      },
    };
  }

  /**
   * List collections
   */
  private async listCollections(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 50;
    const collectionType = this.config.collectionType; // 'smart' | 'custom'

    let url = `collections.json?limit=${limit}`;
    if (collectionType) url += `&collection_type=${collectionType}`;

    const response = await this.callApi(url);

    return {
      success: true,
      data: {
        collections: response.collections.map((c: any) => ({
          id: c.id,
          title: c.title,
          handle: c.handle,
          collectionType: c.collection_type,
          publishedAt: c.published_at,
          updatedAt: c.updated_at,
        })),
        count: response.collections.length,
      },
    };
  }

  /**
   * Create a custom collection
   */
  private async createCollection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const title = this.resolveValue(this.config.title, context);
    const bodyHtml = this.resolveValue(this.config.bodyHtml, context);
    const handle = this.resolveValue(this.config.handle, context);
    const published = this.config.published !== false;
    const collects = this.config.collects; // Array of { product_id, sort_value }

    if (!title) {
      throw new Error('title is required');
    }

    const payload: any = {
      custom_collection: {
        title,
        published,
      },
    };

    if (bodyHtml) payload.custom_collection.body_html = bodyHtml;
    if (handle) payload.custom_collection.handle = handle;

    const response = await this.callApi('custom_collections.json', 'POST', payload);

    // Add products to collection if provided
    if (collects && collects.length > 0) {
      const collectionId = response.custom_collection.id;
      for (const collect of collects) {
        await this.callApi('collects.json', 'POST', {
          collect: {
            product_id: collect.product_id,
            collection_id: collectionId,
            sort_value: collect.sort_value || 'manual',
          },
        });
      }
    }

    return {
      success: true,
      data: {
        id: response.custom_collection.id,
        title: response.custom_collection.title,
        handle: response.custom_collection.handle,
        createdAt: response.custom_collection.created_at,
      },
    };
  }

  /**
   * Update a collection
   */
  private async updateCollection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const collectionId = this.resolveValue(this.config.collectionId, context);
    const title = this.config.title;
    const bodyHtml = this.config.bodyHtml;
    const published = this.config.published;

    if (!collectionId) {
      throw new Error('collectionId is required');
    }

    const payload: any = {
      custom_collection: { id: collectionId },
    };

    if (title !== undefined) payload.custom_collection.title = title;
    if (bodyHtml !== undefined) payload.custom_collection.body_html = bodyHtml;
    if (published !== undefined) payload.custom_collection.published = published;

    const response = await this.callApi(`custom_collections/${collectionId}.json`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.custom_collection.id,
        updatedAt: response.custom_collection.updated_at,
      },
    };
  }

  /**
   * Delete a collection
   */
  private async deleteCollection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const collectionId = this.resolveValue(this.config.collectionId, context);

    if (!collectionId) {
      throw new Error('collectionId is required');
    }

    await this.callApi(`custom_collections/${collectionId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        id: collectionId,
        deleted: true,
      },
    };
  }

  /**
   * Add product to collection
   */
  private async addProductToCollection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const collectionId = this.resolveValue(this.config.collectionId, context);
    const productId = this.resolveValue(this.config.productId, context);
    const sortValue = this.config.sortValue || 'manual';

    if (!collectionId) {
      throw new Error('collectionId is required');
    }

    if (!productId) {
      throw new Error('productId is required');
    }

    const payload = {
      collect: {
        product_id: productId,
        collection_id: collectionId,
        sort_value: sortValue,
      },
    };

    const response = await this.callApi('collects.json', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.collect.id,
        productId: response.collect.product_id,
        collectionId: response.collect.collection_id,
        added: true,
      },
    };
  }

  /**
   * Remove product from collection
   */
  private async removeProductFromCollection(context: ExecutionContext): Promise<NodeExecutionResult> {
    const collectId = this.resolveValue(this.config.collectId, context);

    if (!collectId) {
      throw new Error('collectId is required');
    }

    await this.callApi(`collects/${collectId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        id: collectId,
        removed: true,
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

    const location = await this.callApi(`locations/${locationId}.json`);

    return {
      success: true,
      data: {
        id: location.location.id,
        name: location.location.name,
        address1: location.location.address1,
        city: location.location.city,
        zip: location.location.zip,
        province: location.location.province,
        country: location.location.country,
        phone: location.location.phone,
        createdAt: location.location.created_at,
        updatedAt: location.location.updated_at,
      },
    };
  }

  /**
   * List locations
   */
  private async listLocations(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 50;

    const response = await this.callApi(`locations.json?limit=${limit}`);

    return {
      success: true,
      data: {
        locations: response.locations.map((l: any) => ({
          id: l.id,
          name: l.name,
          address1: l.address1,
          city: l.city,
          zip: l.zip,
          province: l.province,
          country: l.country,
          phone: l.phone,
        })),
        count: response.locations.length,
      },
    };
  }

  /**
   * Get location count
   */
  private async getLocationCount(): Promise<NodeExecutionResult> {
    const response = await this.callApi('locations/count.json');

    return {
      success: true,
      data: {
        count: response.count,
      },
    };
  }

  /**
   * Get a fulfillment
   */
  private async getFulfillment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const fulfillmentId = this.resolveValue(this.config.fulfillmentId, context);

    if (!orderId || !fulfillmentId) {
      throw new Error('orderId and fulfillmentId are required');
    }

    const fulfillment = await this.callApi(`orders/${orderId}/fulfillments/${fulfillmentId}.json`);

    return {
      success: true,
      data: {
        id: fulfillment.fulfillment.id,
        orderId: fulfillment.fulfillment.order_id,
        status: fulfillment.fulfillment.status,
        trackingCompany: fulfillment.fulfillment.tracking_company,
        trackingNumbers: fulfillment.fulfillment.tracking_numbers,
        trackingUrls: fulfillment.fulfillment.tracking_urls,
        createdAt: fulfillment.fulfillment.created_at,
        updatedAt: fulfillment.fulfillment.updated_at,
      },
    };
  }

  /**
   * List fulfillments for an order
   */
  private async listFulfillments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const response = await this.callApi(`orders/${orderId}/fulfillments.json`);

    return {
      success: true,
      data: {
        fulfillments: response.fulfillments.map((f: any) => ({
          id: f.id,
          status: f.status,
          trackingCompany: f.tracking_company,
          trackingNumbers: f.tracking_numbers,
          createdAt: f.created_at,
        })),
        count: response.fulfillments.length,
      },
    };
  }

  /**
   * Create a fulfillment
   */
  private async createFulfillment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const locationId = this.resolveValue(this.config.locationId, context);
    const trackingNumber = this.resolveValue(this.config.trackingNumber, context);
    const trackingCompany = this.resolveValue(this.config.trackingCompany, context);
    const notifyCustomer = this.config.notifyCustomer !== false;
    const lineItems = this.config.lineItems;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const payload: any = {
      fulfillment: {
        notify_customer: notifyCustomer,
      },
    };

    if (locationId) payload.fulfillment.location_id = locationId;
    if (trackingNumber) payload.fulfillment.tracking_number = trackingNumber;
    if (trackingCompany) payload.fulfillment.tracking_company = trackingCompany;
    if (lineItems) payload.fulfillment.line_items = lineItems;

    const response = await this.callApi(`orders/${orderId}/fulfillments.json`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.fulfillment.id,
        createdAt: response.fulfillment.created_at,
        trackingNumbers: response.fulfillment.tracking_numbers,
      },
    };
  }

  /**
   * Update a fulfillment
   */
  private async updateFulfillment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const fulfillmentId = this.resolveValue(this.config.fulfillmentId, context);
    const trackingCompany = this.config.trackingCompany;
    const trackingNumbers = this.config.trackingNumbers;
    const notifyCustomer = this.config.notifyCustomer;

    if (!orderId || !fulfillmentId) {
      throw new Error('orderId and fulfillmentId are required');
    }

    const payload: any = {
      fulfillment: { id: fulfillmentId },
    };

    if (trackingCompany) payload.fulfillment.tracking_company = trackingCompany;
    if (trackingNumbers) payload.fulfillment.tracking_numbers = trackingNumbers;
    if (notifyCustomer !== undefined) payload.fulfillment.notify_customer = notifyCustomer;

    const response = await this.callApi(`orders/${orderId}/fulfillments/${fulfillmentId}.json`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.fulfillment.id,
        updatedAt: response.fulfillment.updated_at,
      },
    };
  }

  /**
   * Cancel a fulfillment
   */
  private async cancelFulfillment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const fulfillmentId = this.resolveValue(this.config.fulfillmentId, context);

    if (!orderId || !fulfillmentId) {
      throw new Error('orderId and fulfillmentId are required');
    }

    const response = await this.callApi(`orders/${orderId}/fulfillments/${fulfillmentId}/cancel.json`, 'POST');

    return {
      success: true,
      data: {
        id: response.fulfillment.id,
        status: response.fulfillment.status,
        canceled: true,
      },
    };
  }

  /**
   * Get a transaction
   */
  private async getTransaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const transactionId = this.resolveValue(this.config.transactionId, context);

    if (!orderId || !transactionId) {
      throw new Error('orderId and transactionId are required');
    }

    const transaction = await this.callApi(`orders/${orderId}/transactions/${transactionId}.json`);

    return {
      success: true,
      data: {
        id: transaction.transaction.id,
        orderId: transaction.transaction.order_id,
        kind: transaction.transaction.kind,
        gateway: transaction.transaction.gateway,
        status: transaction.transaction.status,
        amount: transaction.transaction.amount,
        currency: transaction.transaction.currency,
        createdAt: transaction.transaction.created_at,
      },
    };
  }

  /**
   * List transactions for an order
   */
  private async listTransactions(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const response = await this.callApi(`orders/${orderId}/transactions.json`);

    return {
      success: true,
      data: {
        transactions: response.transactions.map((t: any) => ({
          id: t.id,
          kind: t.kind,
          gateway: t.gateway,
          status: t.status,
          amount: t.amount,
          currency: t.currency,
          createdAt: t.created_at,
        })),
        count: response.transactions.length,
      },
    };
  }

  /**
   * Create a transaction
   */
  private async createTransaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const kind = this.config.kind; // 'authorization' | 'capture' | 'refund' | 'sale'
    const gateway = this.resolveValue(this.config.gateway, context);
    const amount = this.config.amount;
    const currency = this.config.currency;
    const test = this.config.test || false;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    if (!kind) {
      throw new Error('kind is required (authorization, capture, refund, or sale)');
    }

    const payload: any = {
      transaction: {
        kind,
        test,
      },
    };

    if (gateway) payload.transaction.gateway = gateway;
    if (amount) payload.transaction.amount = amount;
    if (currency) payload.transaction.currency = currency;

    const response = await this.callApi(`orders/${orderId}/transactions.json`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.transaction.id,
        kind: response.transaction.kind,
        status: response.transaction.status,
        createdAt: response.transaction.created_at,
      },
    };
  }

  /**
   * Get a refund
   */
  private async getRefund(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const refundId = this.resolveValue(this.config.refundId, context);

    if (!orderId || !refundId) {
      throw new Error('orderId and refundId are required');
    }

    const refund = await this.callApi(`orders/${orderId}/refunds/${refundId}.json`);

    return {
      success: true,
      data: {
        id: refund.refund.id,
        orderId: refund.refund.order_id,
        createdAt: refund.refund.created_at,
        note: refund.refund.note,
        restock: refund.refund.restock,
        refundLineItems: refund.refund.refund_line_items,
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

    const response = await this.callApi(`orders/${orderId}/refunds.json`);

    return {
      success: true,
      data: {
        refunds: response.refunds.map((r: any) => ({
          id: r.id,
          createdAt: r.created_at,
          note: r.note,
          restock: r.restock,
        })),
        count: response.refunds.length,
      },
    };
  }

  /**
   * Create a refund
   */
  private async createRefund(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const amount = this.config.amount;
    const shipping = this.config.shipping;
    const restock = this.config.restock !== false;
    const note = this.resolveValue(this.config.note, context);
    const refundLineItems = this.config.refundLineItems;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const payload: any = {
      refund: {
        restock,
      },
    };

    if (amount) payload.refund.amount = amount;
    if (shipping !== undefined) payload.refund.shipping = shipping;
    if (note) payload.refund.note = note;
    if (refundLineItems) payload.refund.refund_line_items = refundLineItems;

    const response = await this.callApi(`orders/${orderId}/refunds.json`, 'POST', payload);

    return {
      success: true,
      data: {
        id: response.refund.id,
        createdAt: response.refund.created_at,
      },
    };
  }

  /**
   * Calculate refund
   */
  private async calculateRefund(context: ExecutionContext): Promise<NodeExecutionResult> {
    const orderId = this.resolveValue(this.config.orderId, context);
    const shipping = this.config.shipping;
    const refundLineItems = this.config.refundLineItems;

    if (!orderId) {
      throw new Error('orderId is required');
    }

    const payload: any = {};
    if (shipping !== undefined) payload.shipping = shipping;
    if (refundLineItems) payload.refund_line_items = refundLineItems;

    const response = await this.callApi(`orders/${orderId}/refunds/calculate.json`, 'POST', payload);

    return {
      success: true,
      data: {
        refund: response.refund,
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

    const webhook = await this.callApi(`webhooks/${webhookId}.json`);

    return {
      success: true,
      data: {
        id: webhook.webhook.id,
        topic: webhook.webhook.topic,
        address: webhook.webhook.address,
        createdAt: webhook.webhook.created_at,
        updatedAt: webhook.webhook.updated_at,
        format: webhook.webhook.format,
        fields: webhook.webhook.fields,
      },
    };
  }

  /**
   * List webhooks
   */
  private async listWebhooks(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 50;

    const response = await this.callApi(`webhooks.json?limit=${limit}`);

    return {
      success: true,
      data: {
        webhooks: response.webhooks.map((w: any) => ({
          id: w.id,
          topic: w.topic,
          address: w.address,
          createdAt: w.created_at,
          updatedAt: w.updated_at,
        })),
        count: response.webhooks.length,
      },
    };
  }

  /**
   * Create a webhook
   */
  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const topic = this.resolveValue(this.config.topic, context);
    const address = this.resolveValue(this.config.address, context);
    const format = this.config.format || 'json';
    const fields = this.config.fields;

    if (!topic) {
      throw new Error('topic is required');
    }

    if (!address) {
      throw new Error('address (webhook URL) is required');
    }

    const payload: any = {
      webhook: {
        topic,
        address,
        format,
      },
    };

    if (fields) payload.webhook.fields = fields;

    const response = await this.callApi('webhooks.json', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.webhook.id,
        topic: response.webhook.topic,
        address: response.webhook.address,
        createdAt: response.webhook.created_at,
      },
    };
  }

  /**
   * Update a webhook
   */
  private async updateWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);
    const address = this.config.address;
    const topic = this.config.topic;

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    const payload: any = {
      webhook: { id: webhookId },
    };

    if (address) payload.webhook.address = address;
    if (topic) payload.webhook.topic = topic;

    const response = await this.callApi(`webhooks/${webhookId}.json`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: response.webhook.id,
        updatedAt: response.webhook.updated_at,
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

    await this.callApi(`webhooks/${webhookId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        id: webhookId,
        deleted: true,
      },
    };
  }

  /**
   * Get shop information
   */
  private async getShop(): Promise<NodeExecutionResult> {
    const shop = await this.callApi('shop.json');

    return {
      success: true,
      data: {
        id: shop.shop.id,
        name: shop.shop.name,
        email: shop.shop.email,
        domain: shop.shop.domain,
        myshopifyDomain: shop.shop.myshopify_domain,
        currency: shop.shop.currency,
        timezone: shop.shop.timezone,
        createdAt: shop.shop.created_at,
        enabledPresentmentCurrencies: shop.shop.enabled_presentment_currencies,
      },
    };
  }

  /**
   * Update shop information
   */
  private async updateShop(): Promise<NodeExecutionResult> {
    // Limited fields can be updated
    throw new Error('Update shop operation is not implemented. Use the Shopify Admin dashboard for shop settings.');
  }

  /**
   * Call Shopify API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'X-Shopify-Access-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors || error.error || response.statusText);
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
    if (typeof error === 'string') {
      if (error.includes('Not Found')) return 'Resource not found. Check the ID.';
      if (error.includes('Unauthorized')) return 'Unauthorized. Check your access token.';
      if (error.includes('rate limit')) return 'Rate limit exceeded. Please try again later.';
    }

    return `Shopify error: ${error || 'Unknown error'}`;
  }

  getType(): string {
    return 'shopify';
  }

  getIcon(): string {
    return '🛒';
  }

  /**
   * Available webhook topics
   */
  static readonly WebhookTopics = {
    // Orders
    OrdersCreate: 'orders/create',
    OrdersUpdated: 'orders/updated',
    OrdersCancelled: 'orders/cancelled',
    OrdersFulfilled: 'orders/fulfilled',
    OrdersPaid: 'orders/paid',
    OrdersPartiallyFulfilled: 'orders/partially_fulfilled',
    // Products
    ProductsCreate: 'products/create',
    ProductsUpdate: 'products/update',
    ProductsDelete: 'products/delete',
    // Customers
    CustomersCreate: 'customers/create',
    CustomersUpdate: 'customers/update',
    CustomersDelete: 'customers/delete',
    CustomersEnable: 'customers/enable',
    CustomersDisable: 'customers/disable',
    // Collections
    CollectionsCreate: 'collections/create',
    CollectionsUpdate: 'collections/update',
    CollectionsDelete: 'collections/delete',
    // Other
    AppUninstalled: 'app/uninstalled',
    ShopUpdate: 'shop/update',
  } as const;

  /**
   * Order statuses
   */
  static readonly OrderStatus = {
    Open: 'open',
    Closed: 'closed',
    Cancelled: 'cancelled',
    Any: 'any',
  } as const;

  /**
   * Financial statuses
   */
  static readonly FinancialStatus = {
    Paid: 'paid',
    PartiallyPaid: 'partially_paid',
    Authorized: 'authorized',
    PartiallyAuthorized: 'partially_authorized',
    Voided: 'voided',
    Pending: 'pending',
    Any: 'any',
  } as const;

  /**
   * Fulfillment statuses
   */
  static readonly FulfillmentStatus = {
    Fulfilled: 'fulfilled',
    Partial: 'partial',
    Unfulfilled: 'unfulfilled',
    Restocked: 'restocked',
    Any: 'any',
  } as const;
}
