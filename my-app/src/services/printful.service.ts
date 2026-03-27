'use server';

/**
 * Centralized Printful API Client
 * Wraps all Printful API calls with error handling
 */

const PRINTFUL_API_BASE = 'https://api.printful.com';

function resolvePrintfulApiKey(): string {
  // Prefer the same env used by other Printful integrations in this repo.
  const rawKey =
    process.env.PRINTFUL ||
    process.env.PRINTFUL_API_KEY ||
    process.env.POD ||
    '';

  return rawKey.replace(/^Bearer\s+/i, '').trim();
}

interface PrintfulAPIOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  timeout?: number;
}

/**
 * Make authenticated request to Printful API
 */
async function makePrintfulRequest(
  endpoint: string,
  options: PrintfulAPIOptions = {}
) {
  const { method = 'GET', body, timeout = 30000 } = options;
  const printfulApiKey = resolvePrintfulApiKey();

  if (!printfulApiKey) {
    throw {
      status: 401,
      statusText: 'Unauthorized',
      message:
        'Printful API key is missing. Set PRINTFUL (preferred) or PRINTFUL_API_KEY in environment.',
    };
  }

  const headers: any = {
    'Authorization': `Bearer ${printfulApiKey}`,
    'Content-Type': 'application/json',
  };

  const url = `${PRINTFUL_API_BASE}${endpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal as any,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        status: response.status,
        statusText: response.statusText,
        message: errorData.error || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw {
        code: 'TIMEOUT',
        message: 'Printful API request timeout',
      };
    }

    throw error;
  }
}

/**
 * Format Printful API error into user-friendly message
 */
function formatPrintfulError(error: any): string {
  if (error.code === 'TIMEOUT') {
    return 'Request timeout - Printful service is slow, please try again';
  }

  if (error.code === 'ECONNREFUSED') {
    return 'Network error - unable to reach Printful service';
  }

  if (error.status === 429) {
    return 'Rate limited - too many requests to Printful, please wait';
  }

  if (error.status === 404) {
    return 'Product or resource not found in Printful';
  }

  if (error.status === 400) {
    return 'Invalid request to Printful API';
  }

  if (error.status >= 500) {
    return 'Printful service error - please try again later';
  }

  return error.message || 'Unknown error from Printful API';
}

/**
 * Get all products from Printful
 */
export async function getProducts(limit: number = 100, offset: number = 0) {
  try {
    const response = await makePrintfulRequest(
      `/v2/products?limit=${limit}&offset=${offset}`
    );

    return {
      success: true,
      data: response.result || response.data || [],
      paging: response.paging || {},
    };
  } catch (error: any) {
    console.error('Error fetching Printful products:', error);
    return {
      success: false,
      error: formatPrintfulError(error),
      data: [],
    };
  }
}

/**
 * Get single product details from Printful
 */
export async function getProduct(productId: number) {
  try {
    const response = await makePrintfulRequest(`/v2/products/${productId}`);

    return {
      success: true,
      data: response.result || response.data,
    };
  } catch (error: any) {
    console.error(`Error fetching Printful product ${productId}:`, error);
    return {
      success: false,
      error: formatPrintfulError(error),
    };
  }
}

/**
 * Get product variants from Printful
 */
export async function getProductVariants(productId: number) {
  try {
    // Primary endpoint used by current Printful catalog API.
    // Response shape: { result: { product: {...}, variants: [...] } }
    const response = await makePrintfulRequest(`/products/${productId}`);

    const variants =
      response?.result?.variants || response?.variants || response?.data || [];

    return {
      success: true,
      data: variants,
    };
  } catch (error: any) {
    // Compatibility fallback for accounts/environments still on v2 variants endpoint.
    try {
      const fallbackResponse = await makePrintfulRequest(
        `/v2/products/${productId}/variants`
      );

      return {
        success: true,
        data: fallbackResponse.result || fallbackResponse.data || [],
      };
    } catch (fallbackError: any) {
      console.error(
        `Error fetching variants for product ${productId}:`,
        fallbackError
      );
      return {
        success: false,
        error: formatPrintfulError(fallbackError),
        data: [],
      };
    }
  }
}

/**
 * Generate mockup from Printful API
 * Note: Requires design/file to be uploaded first
 */
export async function generateMockup(options: {
  productId: number;
  designId?: string; // Your design ID
  printfulFileId?: number; // Or Printful file ID
  layer?: string; // front, back, side, etc.
  displaySize?: string;
}) {
  try {
    const { productId, printfulFileId, layer = 'front' } = options;

    // Mockup endpoint - adjust based on actual Printful API
    const body = {
      product_id: productId,
      file_id: printfulFileId,
      placement: layer,
    };

    const response = await makePrintfulRequest('/v2/mockups', {
      method: 'POST',
      body,
    });

    return {
      success: true,
      imageUrl: response.result?.mockup_url || response.result,
      printfulFileId: response.result?.file_id,
    };
  } catch (error: any) {
    console.error('Error generating mockup:', error);
    return {
      success: false,
      error: formatPrintfulError(error),
    };
  }
}

/**
 * Generate 360 video mockup from Printful API
 */
export async function generateVideoMockup(options: {
  productId: number;
  printfulFileId?: number;
}) {
  try {
    const { productId, printfulFileId } = options;

    // Video mockup endpoint - adjust based on actual Printful API
    const body = {
      product_id: productId,
      file_id: printfulFileId,
      type: 'video',
    };

    const response = await makePrintfulRequest('/v2/mockups/video', {
      method: 'POST',
      body,
    });

    return {
      success: true,
      videoUrl: response.result?.video_url || response.result,
      duration: response.result?.duration,
    };
  } catch (error: any) {
    console.error('Error generating video mockup:', error);
    return {
      success: false,
      error: formatPrintfulError(error),
    };
  }
}

/**
 * Get templates from Printful (if endpoint exists)
 */
export async function getTemplates() {
  try {
    const response = await makePrintfulRequest('/v2/templates');

    return {
      success: true,
      data: response.result || response.data || [],
    };
  } catch (error: any) {
    console.error('Error fetching Printful templates:', error);
    return {
      success: false,
      error: formatPrintfulError(error),
      data: [],
    };
  }
}

/**
 * Router function: dispatch to appropriate API call
 */
export async function callPrintfulAPI(
  action: string,
  options: any
): Promise<any> {
  switch (action) {
    case 'getProducts':
      return getProducts(options.limit, options.offset);

    case 'getProduct':
      return getProduct(options.productId);

    case 'getProductVariants':
      return getProductVariants(options.productId);

    case 'generateMockup':
      return generateMockup(options);

    case 'generateVideoMockup':
      return generateVideoMockup(options);

    case 'getTemplates':
      return getTemplates();

    default:
      return {
        success: false,
        error: `Unknown Printful API action: ${action}`,
      };
  }
}

/**
 * Health check - verify Printful API connectivity
 */
export async function checkPrintfulHealth() {
  try {
    const response = await makePrintfulRequest('/v2/info');

    return {
      success: true,
      status: 'healthy',
      data: response.result || response.data,
    };
  } catch (error: any) {
    console.error('Printful health check failed:', error);
    return {
      success: false,
      status: 'unhealthy',
      error: formatPrintfulError(error),
    };
  }
}
