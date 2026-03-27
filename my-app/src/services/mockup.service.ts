'use server';

import { getModels } from '@/lib/db-dynamic';
import { v4 as uuidv4 } from 'uuid';
import { printful } from '@/src/utils/printful';

const MOCKUP_URL_EXPIRY_HOURS = 72; // Mockup URLs expire in 72 hours

function toCleanNumericId(value: string | number): number {
  const cleaned = String(value).replace(/[^\d]/g, '');
  const parsed = Number.parseInt(cleaned, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric ID: ${value}`);
  }

  return parsed;
}

async function resolvePrintfulProductId(productId: string): Promise<number> {
  const models = await getModels();
  const { Product } = models;

  const requestedId = String(productId);
  const numericId = (() => {
    try {
      return toCleanNumericId(requestedId);
    } catch {
      return Number.NaN;
    }
  })();

  // First try PK lookup because product_id from UI is usually the local Product.id
  const byPk = await Product.findByPk(requestedId);
  if (byPk?.printful_id) {
    return toCleanNumericId(String(byPk.printful_id));
  }

  // If the incoming id already is a Printful ID, resolve it directly.
  if (!Number.isNaN(numericId)) {
    const byPrintfulId = await Product.findOne({
      where: { printful_id: numericId },
    });
    if (byPrintfulId?.printful_id) {
      return toCleanNumericId(String(byPrintfulId.printful_id));
    }

    // Last fallback: use numeric id as-is for direct Printful catalog usage.
    return toCleanNumericId(String(numericId));
  }

  throw new Error(`Unable to resolve Printful product ID for product: ${productId}`);
}

function extractVariantId(variant: any): number | null {
  if (typeof variant === 'number' && Number.isFinite(variant)) {
    return variant;
  }

  if (typeof variant === 'string') {
    const direct = Number.parseInt(variant, 10);
    if (!Number.isNaN(direct)) {
      return direct;
    }

    const match = variant.match(/variant_id=(\d+)/);
    if (match?.[1]) {
      return Number.parseInt(match[1], 10);
    }
  }

  if (variant && typeof variant === 'object') {
    const candidate = variant.variant_id ?? variant.id;
    const parsed = Number.parseInt(String(candidate), 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return null;
}

async function getPrintfulProductContext(printfulProductId: number): Promise<{
  productType?: string;
  validPlacements: string[];
}> {
  try {
    const productResponse = await printful(`/products/${printfulProductId}`);

    const product = productResponse?.result?.product;
    const files = Array.isArray(product?.files) ? product.files : [];
    const placementsFromFiles = files
      .map((file: any) => String(file?.type || file?.id || '').trim().toLowerCase())
      .filter((value: string) => value.length > 0 && value !== 'mockup' && value !== 'preview');

    const validPlacements: string[] = Array.from(new Set<string>(placementsFromFiles));

    return {
      productType: product?.type,
      validPlacements,
    };
  } catch (error: any) {
    console.warn(`Could not fetch product context for ${printfulProductId}:`, error.message);
    return {
      productType: undefined,
      validPlacements: [],
    };
  }
}

function resolvePlacement(
  requestedPlacement: string,
  validPlacements: string[],
  isCutSew: boolean
): string {
  const requested = String(requestedPlacement || 'front').toLowerCase();
  const validSet = new Set(validPlacements.map((p) => p.toLowerCase()));

  if (validSet.size === 0) {
    return isCutSew ? 'default' : requested;
  }

  if (validSet.has(requested)) {
    return requested;
  }

  const aliases: Record<string, string[]> = {
    front: ['default', 'front'],
    back: ['back'],
    left_sleeve: ['sleeve_left', 'left_sleeve'],
    right_sleeve: ['sleeve_right', 'right_sleeve'],
    sleeve_left: ['sleeve_left', 'left_sleeve'],
    sleeve_right: ['sleeve_right', 'right_sleeve'],
  };

  const candidates = aliases[requested] || [];
  for (const candidate of candidates) {
    if (validSet.has(candidate)) {
      return candidate;
    }
  }

  if (isCutSew && validSet.has('default')) {
    return 'default';
  }

  return validPlacements[0];
}

/**
 * Get print files and available placements for a product
 * This is STEP 1 before creating mockups
 */
export async function getPrintFilesForProduct(productId: string) {
  try {
    const printfulProductId = await resolvePrintfulProductId(productId);

    const response = await printful(
      `/mockup-generator/printfiles/${printfulProductId}`
    );

    if (response.code !== 200 || !response.result) {
      throw new Error(response.error || 'Failed to get print files');
    }

    const result = response.result;

    return {
      success: true,
      data: {
        productId: result.product_id,
        requestedProductId: productId,
        availablePlacements: result.available_placements || {},
        printfiles: result.printfiles || [],
        variantPrintfiles: result.variant_printfiles || [],
      },
    };
  } catch (error: any) {
    console.error('Error getting print files:', error);
    return {
      success: false,
      error: error.message || 'Failed to get print files',
    };
  }
}

/**
 * Get mockup generator templates for a product
 * Useful for client-side positioning and validating valid placements.
 */
export async function getMockupTemplatesForProduct(
  productId: string,
  query?: {
    orientation?: 'horizontal' | 'vertical';
    technique?: string;
  }
) {
  try {
    const printfulProductId = await resolvePrintfulProductId(productId);

    const params = new URLSearchParams();
    if (query?.orientation) {
      params.set('orientation', query.orientation);
    }
    if (query?.technique) {
      params.set('technique', query.technique);
    }

    const endpoint = `/mockup-generator/templates/${printfulProductId}${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    const response = await printful(endpoint);

    if (response.code !== 200 || !response.result) {
      throw new Error(response.error || 'Failed to get mockup templates');
    }

    const result = response.result;
    const templatePlacements = (result.templates || [])
      .map((template: any) => template?.placement || template?.template?.placement)
      .filter((placement: any) => typeof placement === 'string')
      .map((placement: string) => placement.toLowerCase());

    return {
      success: true,
      data: {
        productId: printfulProductId,
        requestedProductId: productId,
        version: result.version,
        minDpi: result.min_dpi,
        templates: result.templates || [],
        variantMapping: result.variant_mapping || [],
        conflictingPlacements: result.conflicting_placements || [],
        placements: Array.from(new Set(templatePlacements)),
      },
    };
  } catch (error: any) {
    console.error('Error getting mockup templates:', error);
    return {
      success: false,
      error: error.message || 'Failed to get mockup templates',
    };
  }
}

/**
 * Create a mockup generation task (STEP 2 - ASYNC)
 * This initiates mockup generation but doesn't wait for completion
 * Must store task_key and poll later via checkMockupStatus()
 */
export async function createMockupTask(
  productId: string,
  designId: string,
  designImageUrl: string,
  variantIds: Array<string | number> = [],
  placement: string = 'front',
  options?: {
    format?: 'jpg' | 'png';
    width?: number;
    productOptions?: Record<string, unknown>;
    optionGroups?: string[];
    options?: string[];
    fileOptions?: Array<{ id: string; value: string }>;
    productTemplateId?: number;
    position?: {
      area_width: number;
      area_height: number;
      width: number;
      height: number;
      top: number;
      left: number;
    };
  }
) {
  const logContext = {
    productId,
    designId,
    placement,
  };

  try {
    const models = await getModels();
    const { Mockup, ProductVariant } = models;

    const printfulProductId = await resolvePrintfulProductId(productId);
    const cleanId = toCleanNumericId(printfulProductId);
    const productContext = await getPrintfulProductContext(printfulProductId);
    const isCutSew = productContext.productType === 'CUT-SEW';
    const resolvedPlacement = resolvePlacement(
      placement,
      productContext.validPlacements,
      isCutSew
    );
    const createTaskEndpoint = `mockup-generator/create-task/${cleanId}`;
    const finalUrl = `https://api.printful.com/${createTaskEndpoint}`;

    // Convert variant IDs to integers
    let variantIdsInt = variantIds.length > 0 
      ? variantIds.map(id => parseInt(String(id), 10))
      : [];
    variantIdsInt = variantIdsInt.filter((id) => !Number.isNaN(id));

    // If no variants provided, fetch default variant IDs from Printful
    if (variantIdsInt.length === 0) {
      try {
        console.log(`Fetching variant IDs for product ${printfulProductId}`);
        const printFilesResponse = await printful(`/mockup-generator/printfiles/${printfulProductId}`);
        
        if (Array.isArray(printFilesResponse.result?.variant_printfiles)) {
          for (const variantPrintfile of printFilesResponse.result.variant_printfiles) {
            const extractedId = extractVariantId(variantPrintfile);
            if (extractedId) {
              variantIdsInt = [extractedId];
              console.log(`Using default variant ID from Printful: ${variantIdsInt[0]}`);
              break;
            }
          }
        }
      } catch (error) {
        console.warn('Could not fetch variant IDs:', (error as any).message);
      }

      // Fallback to Printful product variants endpoint
      if (variantIdsInt.length === 0) {
        try {
          const productResponse = await printful(`/products/${printfulProductId}`);
          const availableVariants = (productResponse?.result?.variants || [])
            .filter((variant: any) => variant?.in_stock !== false)
            .map((variant: any) => Number.parseInt(String(variant?.id), 10))
            .filter((id: number) => !Number.isNaN(id));

          if (availableVariants.length > 0) {
            variantIdsInt = [availableVariants[0]];
            console.log(`Using fallback variant ID from Printful product endpoint: ${variantIdsInt[0]}`);
          }
        } catch (error: any) {
          console.warn('Could not fetch fallback variants from /products/{id}:', error.message);
        }
      }

      // Fallback to locally synced product variants
      if (variantIdsInt.length === 0) {
        const localVariant = await ProductVariant.findOne({
          where: { product_id: productId, availability: true },
          order: [['createdAt', 'ASC']],
        });

        if (localVariant?.printful_variant_id) {
          variantIdsInt = [Number(localVariant.printful_variant_id)];
          console.log(`Using fallback variant ID from database: ${variantIdsInt[0]}`);
        }
      }

      if (variantIdsInt.length === 0) {
        throw new Error('No valid Printful variant IDs available for this product');
      }
    }

    // Build request body according to Printful API spec
    const requestBody: {
      variant_ids: number[];
      format: 'jpg' | 'png';
      files?: Array<{
        placement: string;
        image_url: string;
        position?: {
          area_width: number;
          area_height: number;
          width: number;
          height: number;
          top: number;
          left: number;
        };
        options?: Array<{ id: string; value: string }>;
      }>;
      width?: number;
      product_options?: Record<string, unknown>;
      option_groups?: string[];
      options?: string[];
      product_template_id?: number;
    } = {
      variant_ids: variantIdsInt,
      format: (options?.format || 'jpg') as 'jpg' | 'png',
    };

    if (options?.productTemplateId) {
      requestBody.product_template_id = options.productTemplateId;
    } else {
      requestBody.files = [
        {
          placement: resolvedPlacement,
          image_url: designImageUrl,
          // Position defines where on the garment to place the design.
          position: options?.position || {
            area_width: 1000,
            area_height: 1000,
            width: 800,
            height: 800,
            top: 100,
            left: 100,
          },
          ...(options?.fileOptions?.length
            ? { options: options.fileOptions }
            : {}),
        },
      ];
    }

    // Add width if provided
    if (typeof options?.width === 'number') {
      requestBody.width = Math.min(Math.max(options.width, 50), 2000); // Clamp to API limits
    }

    if (options?.productOptions) {
      requestBody.product_options = options.productOptions;
    }

    if (options?.optionGroups?.length) {
      requestBody.option_groups = options.optionGroups;
    }

    if (options?.options?.length) {
      requestBody.options = options.options;
    }

    console.log('Creating mockup task:', {
      ...logContext,
      productId: cleanId,
      designId,
      placement: resolvedPlacement,
      requestedPlacement: placement,
      productType: productContext.productType || 'unknown',
      endpoint: createTaskEndpoint,
      finalUrl,
      variantIds: variantIdsInt,
    });
    console.log('Request body for Printful:', JSON.stringify(requestBody, null, 2));
    console.log('Final Printful URL:', finalUrl);

    let response: any;
    try {
      response = await printful(createTaskEndpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
    } catch (error: any) {
      if (error?.status === 400 || error?.status === 404) {
        console.error('Printful rejected create-task request details:', {
          status: error.status,
          result: error.result,
          error: error.error,
          raw: error.raw,
          finalUrl,
        });
      }
      throw error;
    }

    if (response.code !== 200 || !response.result) {
      throw new Error(response.error || 'Failed to create mockup task');
    }

    const taskKey = response.result.task_key;
    const status = response.result.status;

    // Store mockup record with task tracking
    const mockup = await Mockup.create({
      id: uuidv4(),
      product_id: productId,
      design_id: designId,
      task_key: taskKey,
      status: status || 'pending',
      placement: resolvedPlacement,
      variant_id: String(variantIdsInt[0] || variantIds[0] || ''),
      expires_at: new Date(Date.now() + MOCKUP_URL_EXPIRY_HOURS * 60 * 60 * 1000),
      metadata: {
        created_at: new Date(),
        initial_status: status,
        printful_product_id: printfulProductId,
        printful_product_type: productContext.productType,
        requested_placement: placement,
        resolved_placement: resolvedPlacement,
      },
    });

    return {
      success: true,
      taskKey: taskKey,
      mockupId: mockup.id,
      status: status,
    };
  } catch (error: any) {
    console.error('Error creating mockup task:', {
      ...logContext,
      message: error?.message,
      stack: error?.stack,
      error,
    });
    return {
      success: false,
      error: error.message || 'Failed to create mockup task',
    };
  }
}

/**
 * Check status of a mockup generation task (STEP 3 - POLLING)
 * Poll this endpoint until status changes from "pending" to "completed"
 */
export async function checkMockupStatus(taskKey: string) {
  try {
    const response = await printful(
      `/mockup-generator/task?task_key=${taskKey}`
    );

    if (response.code !== 200 || !response.result) {
      throw new Error(response.error || 'Failed to check mockup status');
    }

    const result = response.result;
    const status = result.status;

    const models = await getModels();
    const { Mockup } = models;

    // Update mockup record with latest status
    let mockup = await Mockup.findOne({
      where: { task_key: taskKey },
    });

    if (!mockup) {
      return {
        success: false,
        error: 'Mockup task not found',
      };
    }

    // If completed, extract mockup URLs and update record
    if (status === 'completed' && result.mockups) {
      const firstMockup = result.mockups[0];
      const firstPrintfile = result.printfiles?.[0];

      await mockup.update({
        status: 'completed',
        image_url: firstMockup?.mockup_url,
        printfile_url: firstPrintfile?.url,
        metadata: {
          ...mockup.metadata,
          mockups: result.mockups,
          printfiles: result.printfiles,
          completed_at: new Date(),
        },
      });

      return {
        success: true,
        status: 'completed',
        mockupId: mockup.id,
        mockups: result.mockups,
        printfiles: result.printfiles,
      };
    } else if (status === 'failed') {
      await mockup.update({ status: 'failed' });

      return {
        success: false,
        status: 'failed',
        error: 'Mockup generation failed',
      };
    } else {
      // Still pending
      return {
        success: true,
        status: 'pending',
        mockupId: mockup.id,
      };
    }
  } catch (error: any) {
    console.error('Error checking mockup status:', error);
    return {
      success: false,
      error: error.message || 'Failed to check mockup status',
    };
  }
}
/**
 * Create multiple angle mockup tasks in parallel
 * This is an optimized approach for multi-angle mockups
 */
export async function createMultiAngleMockupTasks(
  productId: string,
  designId: string,
  designImageUrl: string,
  variantIds: string[] = [],
  placements: string[] = ['front', 'back', 'side', 'sleeve', 'neck']
) {
  try {
    const taskKeys: string[] = [];

    // Create tasks for each angle in parallel
    const tasks = placements.map(placement =>
      createMockupTask(
        productId,
        designId,
        designImageUrl,
        variantIds,
        placement
      )
    );

    const results = await Promise.all(tasks);

    // Collect successful task keys
    for (const result of results) {
      if (result.success && result.taskKey) {
        taskKeys.push(result.taskKey);
      }
    }

    return {
      success: taskKeys.length > 0,
      taskKeys,
      totalTasks: taskKeys.length,
      failedCount: results.length - taskKeys.length,
    };
  } catch (error: any) {
    console.error('Error creating multi-angle mockup tasks:', error);
    return {
      success: false,
      error: error.message || 'Failed to create multi-angle mockup tasks',
      taskKeys: [],
    };
  }
}

/**
 * Get mockup by ID
 */
export async function getMockupById(mockupId: string) {
  try {
    const models = await getModels();
    const { Mockup } = models;

    const mockup = await Mockup.findByPk(mockupId);

    if (!mockup) {
      return {
        success: false,
        error: 'Mockup not found',
      };
    }

    return {
      success: true,
      mockup: {
        id: mockup.id,
        taskKey: mockup.task_key,
        status: mockup.status,
        imageUrl: mockup.image_url,
        printfileUrl: mockup.printfile_url,
        placement: mockup.placement,
        expiresAt: mockup.expires_at,
        metadata: mockup.metadata,
        createdAt: mockup.createdAt,
      },
    };
  } catch (error: any) {
    console.error('Error fetching mockup:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get all mockups for a design
 */
export async function getDesignMockups(designId: string) {
  try {
    const models = await getModels();
    const { Mockup } = models;

    const mockups = await Mockup.findAll({
      where: { design_id: designId },
      order: [['createdAt', 'DESC']],
    });

    return {
      success: true,
      mockups: mockups.map((m: any) => ({
        id: m.id,
        taskKey: m.task_key,
        status: m.status,
        imageUrl: m.image_url,
        printfileUrl: m.printfile_url,
        placement: m.placement,
        expiresAt: m.expires_at,
        createdAt: m.createdAt,
      })),
      total: mockups.length,
    };
  } catch (error: any) {
    console.error('Error fetching design mockups:', error);
    return {
      success: false,
      error: error.message,
      mockups: [],
    };
  }
}

/**
 * Get completed mockups for a product+design combo
 */
export async function getCompletedMockups(
  productId: string,
  designId: string
) {
  try {
    const models = await getModels();
    const { Mockup } = models;

    const mockups = await Mockup.findAll({
      where: {
        product_id: productId,
        design_id: designId,
        status: 'completed',
      },
      order: [['placement', 'ASC']],
    });

    return {
      success: true,
      mockups: mockups.map((m: any) => ({
        id: m.id,
        placement: m.placement,
        imageUrl: m.image_url,
        printfileUrl: m.printfile_url,
        expiresAt: m.expires_at,
      })),
      total: mockups.length,
    };
  } catch (error: any) {
    console.error('Error fetching completed mockups:', error);
    return {
      success: false,
      error: error.message,
      mockups: [],
    };
  }
}

/**
 * Check and cleanup expired mockups (called periodically)
 */
export async function cleanupExpiredMockups() {
  try {
    const models = await getModels();
    const { Mockup } = models;

    const now = new Date();
    const result = await Mockup.destroy({
      where: {
        expires_at: {
          [require('sequelize').Op.lt]: now,
        },
      },
    });

    console.log(`Cleaned up ${result} expired mockups`);

    return {
      success: true,
      deletedCount: result,
    };
  } catch (error: any) {
    console.error('Error cleaning up expired mockups:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
