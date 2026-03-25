'use server';

import { getModels } from '@/lib/db-dynamic';
import { v4 as uuidv4 } from 'uuid';
import { printful } from '@/src/utils/printful';

const MOCKUP_URL_EXPIRY_HOURS = 72; // Mockup URLs expire in 72 hours

/**
 * Get print files and available placements for a product
 * This is STEP 1 before creating mockups
 */
export async function getPrintFilesForProduct(productId: string) {
  try {
    const response = await printful(
      `/mockup-generator/printfiles/${productId}`
    );

    if (response.code !== 200 || !response.result) {
      throw new Error(response.error || 'Failed to get print files');
    }

    const result = response.result;

    return {
      success: true,
      data: {
        productId: result.product_id,
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
 * Create a mockup generation task (STEP 2 - ASYNC)
 * This initiates mockup generation but doesn't wait for completion
 * Must store task_key and poll later via checkMockupStatus()
 */
export async function createMockupTask(
  productId: string,
  designId: string,
  designImageUrl: string,
  variantIds: string[] = [],
  placement: string = 'front',
  options?: {
    format?: 'jpg' | 'png';
    width?: number;
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
  try {
    const models = await getModels();
    const { Mockup } = models;

    // Build request body
    const requestBody: any = {
      variant_ids: variantIds.length > 0 ? variantIds : [productId],
      format: options?.format || 'jpg',
      files: [
        {
          placement: placement,
          image_url: designImageUrl,
        },
      ],
    };

    // Add advanced positioning if provided
    if (options?.position) {
      requestBody.width = options.width || 1000;
      requestBody.files[0].position = options.position;
    }

    console.log('Creating mockup task:', {
      productId,
      designId,
      placement,
      variantIds,
    });

    // Call Printful API to create task
    const response = await printful(
      `/mockup-generator/create-task/${productId}`,
      {
        method: 'POST',
        body: requestBody,
      }
    );

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
      placement: placement,
      variant_id: variantIds[0] || productId,
      expires_at: new Date(Date.now() + MOCKUP_URL_EXPIRY_HOURS * 60 * 60 * 1000),
      metadata: {
        created_at: new Date(),
        initial_status: status,
      },
    });

    return {
      success: true,
      taskKey: taskKey,
      mockupId: mockup.id,
      status: status,
    };
  } catch (error: any) {
    console.error('Error creating mockup task:', error);
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
