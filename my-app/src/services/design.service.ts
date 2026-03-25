'use server';

import { getModels } from '@/lib/db-dynamic';
import { v4 as uuidv4 } from 'uuid';

export async function saveDesign(
  userId: string,
  designData: {
    title: string;
    description?: string;
    template_id?: string;
    canvas_data?: any;
    artwork_file_url?: string;
    export_format?: string;
    tags?: string[];
    metadata?: any;
  },
  designId?: string
) {
  try {
    const models = await getModels();
    const { Design } = models;

    if (designId) {
      // Update existing design
      const design = await Design.findByPk(designId);
      if (!design) {
        throw new Error('Design not found');
      }

      if (design.user_id !== userId) {
        throw new Error('Unauthorized');
      }

      // Increment version on update
      const updated = await design.update({
        title: designData.title,
        description: designData.description || design.description,
        template_id: designData.template_id || design.template_id,
        canvas_data: designData.canvas_data || design.canvas_data,
        artwork_file_url: designData.artwork_file_url || design.artwork_file_url,
        export_format: designData.export_format || design.export_format,
        version_number: (design.version_number || 1) + 1,
        tags: designData.tags || design.tags,
        metadata: designData.metadata || design.metadata,
      });

      console.log(`Design ${designId} updated to version ${updated.version_number}`);
      return updated;
    } else {
      // Create new design
      const newDesign = await Design.create({
        id: uuidv4(),
        user_id: userId,
        title: designData.title,
        description: designData.description || '',
        template_id: designData.template_id || null,
        canvas_data: designData.canvas_data || null,
        artwork_file_url: designData.artwork_file_url || null,
        export_format: designData.export_format || 'png',
        version_number: 1,
        tags: designData.tags || [],
        metadata: designData.metadata || null,
      });

      console.log(`New design created: ${newDesign.id}`);
      return newDesign;
    }
  } catch (error) {
    console.error('Error saving design:', error);
    throw error;
  }
}

export async function getDesignById(designId: string, userId?: string) {
  try {
    const models = await getModels();
    const { Design } = models;

    const design = await Design.findByPk(designId);
    if (!design) {
      return null;
    }

    // Check ownership if userId provided
    if (userId && design.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    return design;
  } catch (error) {
    console.error('Error fetching design:', error);
    throw error;
  }
}

export async function getUserDesigns(
  userId: string,
  options: { limit?: number; offset?: number; includeArchived?: boolean } = {}
) {
  try {
    const models = await getModels();
    const { Design } = models;

    const where: any = { user_id: userId };
    if (!options.includeArchived) {
      where.is_archived = false;
    }

    const designs = await Design.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: options.limit || 50,
      offset: options.offset || 0,
      attributes: [
        'id',
        'title',
        'description',
        'template_id',
        'artwork_file_url',
        'version_number',
        'created_at',
        'updated_at',
      ],
    });

    return designs;
  } catch (error) {
    console.error('Error fetching user designs:', error);
    throw error;
  }
}

export async function updateDesignArtworkUrl(
  designId: string,
  artworkUrl: string,
  userId: string
) {
  try {
    const models = await getModels();
    const { Design } = models;

    const design = await Design.findByPk(designId);
    if (!design) {
      throw new Error('Design not found');
    }

    if (design.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    await design.update({
      artwork_file_url: artworkUrl,
    });

    console.log(`Design ${designId} artwork URL updated`);
    return design;
  } catch (error) {
    console.error('Error updating design artwork URL:', error);
    throw error;
  }
}

export async function deleteDesign(designId: string, userId: string) {
  try {
    const models = await getModels();
    const { Design } = models;

    const design = await Design.findByPk(designId);
    if (!design) {
      throw new Error('Design not found');
    }

    if (design.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    // Soft delete: archive instead of hard delete
    await design.update({
      is_archived: true,
    });

    console.log(`Design ${designId} archived`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting design:', error);
    throw error;
  }
}

export async function getDesignVersionHistory(designId: string, userId: string) {
  try {
    const models = await getModels();
    const { Design } = models;

    // Get the parent design
    const parentDesign = await Design.findByPk(designId);
    if (!parentDesign) {
      throw new Error('Design not found');
    }

    if (parentDesign.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    // Find all versions of this design (including child versions)
    const versions = await Design.findAll({
      where: {
        $or: [
          { id: designId },
          { parent_design_id: designId },
        ],
      },
      order: [['version_number', 'ASC']],
      attributes: [
        'id',
        'title',
        'version_number',
        'created_at',
        'updated_at',
      ],
    });

    return versions;
  } catch (error) {
    console.error('Error fetching design version history:', error);
    throw error;
  }
}
