'use server';

import { getModels } from '@/lib/db-dynamic';
import { v4 as uuidv4 } from 'uuid';
import { callPrintfulAPI } from '@/src/services/printful.service';

/**
 * Generate a single mockup design on a product
 * @param productId - ID of the product
 * @param designId - ID of the design to overlay
 * @param layer - Layer position (front, back, side, sleeve, neck, etc.)
 * @param displaySize - Image size (thumbnail, medium, high_res)
 */
export async function generateMockup(
  productId: string,
  designId: string,
  layer: string = 'front',
  displaySize: 'thumbnail' | 'medium' | 'high_res' = 'medium'
) {
  try {
    // Call Printful API to generate mockup
    const mockupData = await callPrintfulAPI('generateMockup', {
      productId,
      designId,
      layer,
      displaySize,
    });

    const models = await getModels();
    const { Mockup } = models;

    // Store mockup record in database
    const mockup = await Mockup.create({
      id: uuidv4(),
      product_id: productId,
      design_id: designId,
      image_url: mockupData.imageUrl,
      layer_position: layer,
      display_size: displaySize,
      printful_file_id: mockupData.printfulFileId || null,
      metadata: {
        generated_at: new Date(),
        source: 'printful',
      },
    });

    return {
      success: true,
      mockup: {
        id: mockup.id,
        imageUrl: mockup.image_url,
        layer: layer,
        displaySize: displaySize,
        generatedAt: mockup.createdAt,
      },
    };
  } catch (error: any) {
    console.error('Error generating mockup:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate mockup',
    };
  }
}

/**
 * Get all mockup viewing angles for a product+design combination
 */
export async function getMockupVariants(productId: string, designId: string) {
  try {
    const layers = ['front', 'back', 'side', 'sleeve', 'neck'];
    const mockups = [];

    for (const layer of layers) {
      const result = await generateMockup(
        productId,
        designId,
        layer,
        'medium'
      );

      if (result.success) {
        mockups.push(result.mockup);
      }
    }

    return {
      success: true,
      mockups,
      total: mockups.length,
    };
  } catch (error: any) {
    console.error('Error getting mockup variants:', error);
    return {
      success: false,
      error: error.message,
      mockups: [],
    };
  }
}

/**
 * Generate 360-degree video mockup
 */
export async function generateVideoMockup(productId: string, designId: string) {
  try {
    // Call Printful API for video generation
    const videoData = await callPrintfulAPI('generateVideoMockup', {
      productId,
      designId,
    });

    const models = await getModels();
    const { Mockup } = models;

    const mockup = await Mockup.create({
      id: uuidv4(),
      product_id: productId,
      design_id: designId,
      image_url: videoData.videoUrl,
      layer_position: '360',
      display_size: 'high_res',
      metadata: {
        type: 'video',
        video_url: videoData.videoUrl,
        duration: videoData.duration || null,
      },
    });

    return {
      success: true,
      mockup: {
        id: mockup.id,
        videoUrl: mockup.image_url,
        type: 'video',
        generatedAt: mockup.createdAt,
      },
    };
  } catch (error: any) {
    console.error('Error generating video mockup:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate video mockup',
    };
  }
}

/**
 * Get stored mockup by ID
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

    const isVideo = mockup.metadata?.type === 'video';

    return {
      success: true,
      mockup: {
        id: mockup.id,
        imageUrl: mockup.image_url,
        layer: mockup.layer_position,
        displaySize: mockup.display_size,
        generatedAt: mockup.createdAt,
        isVideo,
        metadata: mockup.metadata,
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
 * Get all mockups for a specific design
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
        productId: m.product_id,
        imageUrl: m.image_url,
        layer: m.layer_position,
        displaySize: m.display_size,
        generatedAt: m.createdAt,
      })),
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
 * Generate mockup with multiple display sizes
 */
export async function generateMockupSizes(
  productId: string,
  designId: string,
  layer: string = 'front'
) {
  try {
    const sizes: ('thumbnail' | 'medium' | 'high_res')[] = [
      'thumbnail',
      'medium',
      'high_res',
    ];
    const mockups = [];

    for (const size of sizes) {
      const result = await generateMockup(
        productId,
        designId,
        layer,
        size
      );

      if (result.success) {
        mockups.push(result.mockup);
      }
    }

    return {
      success: true,
      mockups,
      total: mockups.length,
    };
  } catch (error: any) {
    console.error('Error generating mockup sizes:', error);
    return {
      success: false,
      error: error.message,
      mockups: [],
    };
  }
}

/**
 * Invalidate/delete mockups for a design (when design is updated)
 */
export async function invalidateDesignMockups(designId: string) {
  try {
    const models = await getModels();
    const { Mockup } = models;

    const result = await Mockup.destroy({
      where: { design_id: designId },
    });

    return {
      success: true,
      deleted: result,
    };
  } catch (error: any) {
    console.error('Error invalidating mockups:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
