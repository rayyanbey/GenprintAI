'use server';

import { getModels } from '@/lib/db-dynamic';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get templates by category with pagination
 */
export async function getTemplatesByCategory(
  category: string,
  page: number = 1,
  limit: number = 12
) {
  try {
    const models = await getModels();
    const { Template } = models;

    const offset = (page - 1) * limit;

    const { count, rows: templates } = await Template.findAndCountAll({
      where: {
        category,
        approval_status: 'approved',
      },
      order: [['usage_count', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      templates: templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        color_variants: t.color_variants || [],
        usage_count: t.usage_count,
        is_community: t.is_community,
        metadata: t.metadata,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching templates by category:', error);
    return {
      success: false,
      error: error.message,
      templates: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}

/**
 * Get all approved templates (Printful + community)
 */
export async function getTemplates(page: number = 1, limit: number = 12) {
  try {
    const models = await getModels();
    const { Template } = models;

    const offset = (page - 1) * limit;

    const { count, rows: templates } = await Template.findAndCountAll({
      where: {
        approval_status: 'approved',
      },
      order: [['usage_count', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      templates: templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        color_variants: t.color_variants || [],
        usage_count: t.usage_count,
        is_community: t.is_community,
        metadata: t.metadata,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return {
      success: false,
      error: error.message,
      templates: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}

/**
 * Get single template details
 */
export async function getTemplateById(templateId: string) {
  try {
    const models = await getModels();
    const { Template, User } = models;

    const template = await Template.findByPk(templateId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'avatar_url'],
        },
      ],
    });

    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    return {
      success: true,
      template: {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        color_variants: template.color_variants || [],
        usage_count: template.usage_count,
        is_community: template.is_community,
        approval_status: template.approval_status,
        metadata: template.metadata,
        creator: template.dataValues.creator || null,
      },
    };
  } catch (error: any) {
    console.error('Error fetching template:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Create community template (user submission)
 */
export async function createCommunityTemplate(
  userId: string,
  templateData: {
    name: string;
    category: string;
    description?: string;
    color_variants?: { name: string; hex: string }[];
    design_data?: any;
    metadata?: any;
  }
) {
  try {
    const models = await getModels();
    const { Template } = models;

    const template = await Template.create({
      id: uuidv4(),
      name: templateData.name,
      category: templateData.category,
      description: templateData.description || '',
      color_variants: templateData.color_variants || [],
      is_community: true,
      created_by_user_id: userId,
      approval_status: 'pending', // Requires admin approval
      metadata: templateData.metadata || {},
    });

    return {
      success: true,
      template: {
        id: template.id,
        name: template.name,
        status: 'pending',
        message: 'Template submitted for approval',
      },
    };
  } catch (error: any) {
    console.error('Error creating community template:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Admin: Approve community template
 */
export async function approveTemplate(templateId: string) {
  try {
    const models = await getModels();
    const { Template } = models;

    const template = await Template.findByPk(templateId);

    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    await template.update({
      approval_status: 'approved',
    });

    return {
      success: true,
      message: 'Template approved',
      status: 'approved',
    };
  } catch (error: any) {
    console.error('Error approving template:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Admin: Reject community template
 */
export async function rejectTemplate(templateId: string) {
  try {
    const models = await getModels();
    const { Template } = models;

    const template = await Template.findByPk(templateId);

    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    await template.update({
      approval_status: 'rejected',
    });

    return {
      success: true,
      message: 'Template rejected',
      status: 'rejected',
    };
  } catch (error: any) {
    console.error('Error rejecting template:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get pending community templates (admin view)
 */
export async function getPendingCommunityTemplates(page: number = 1, limit: number = 10) {
  try {
    const models = await getModels();
    const { Template, User } = models;

    const offset = (page - 1) * limit;

    const { count, rows: templates } = await Template.findAndCountAll({
      where: {
        is_community: true,
        approval_status: 'pending',
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
      limit,
      offset,
    });

    return {
      success: true,
      pending: templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        color_variants: t.color_variants || [],
        createdAt: t.createdAt,
        creator: t.dataValues.creator,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching pending templates:', error);
    return {
      success: false,
      error: error.message,
      pending: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}

/**
 * Track template usage (when user saves/uses a template)
 */
export async function trackTemplateUsage(
  templateId: string,
  userId: string,
  designId?: string
) {
  try {
    const models = await getModels();
    const { Template, TemplateUsage } = models;

    // Record usage
    await TemplateUsage.create({
      id: uuidv4(),
      template_id: templateId,
      user_id: userId,
      used_in_design_id: designId || null,
    });

    // Increment usage count on template
    const template = await Template.findByPk(templateId);
    if (template) {
      await template.increment('usage_count');
    }

    const updatedTemplate = await Template.findByPk(templateId);

    return {
      success: true,
      usageCount: updatedTemplate?.dataValues.usage_count || 0,
    };
  } catch (error: any) {
    console.error('Error tracking template usage:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get template usage statistics
 */
export async function getTemplateUsageStats(templateId: string) {
  try {
    const models = await getModels();
    const { Template, TemplateUsage } = models;

    const template = await Template.findByPk(templateId);

    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    const usageCount = await TemplateUsage.count({
      where: { template_id: templateId },
    });

    return {
      success: true,
      stats: {
        id: template.id,
        name: template.name,
        usage_count: template.dataValues.usage_count || 0,
        unique_users: usageCount,
      },
    };
  } catch (error: any) {
    console.error('Error fetching template usage stats:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get community templates (approved only)
 */
export async function getCommunityTemplates(page: number = 1, limit: number = 12) {
  try {
    const models = await getModels();
    const { Template } = models;

    const offset = (page - 1) * limit;

    const { count, rows: templates } = await Template.findAndCountAll({
      where: {
        is_community: true,
        approval_status: 'approved',
      },
      order: [['usage_count', 'DESC'], ['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      templates: templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        color_variants: t.color_variants || [],
        usage_count: t.usage_count,
      })),
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error: any) {
    console.error('Error fetching community templates:', error);
    return {
      success: false,
      error: error.message,
      templates: [],
      pagination: { total: 0, page: 1, limit, totalPages: 0 },
    };
  }
}

/**
 * Sync templates from Printful (if available)
 * Note: Adjust based on actual Printful API response
 */
export async function syncPrintfulTemplates(printfulTemplates?: any[]) {
  try {
    const models = await getModels();
    const { Template } = models;

    // If no templates provided, would fetch from Printful
    // For now, this is a placeholder for future implementation
    const templates = printfulTemplates || [];

    const syncedTemplates = [];

    for (const printfulTemplate of templates) {
      const [template, created] = await Template.upsert({
        id: printfulTemplate.id || uuidv4(),
        name: printfulTemplate.name,
        description: printfulTemplate.description || '',
        category: printfulTemplate.category || 'general',
        color_variants: printfulTemplate.color_variants || [],
        is_community: false,
        approval_status: 'approved', // Printful templates are pre-approved
        printful_template_id: printfulTemplate.id,
      });

      syncedTemplates.push({
        id: template.id,
        name: template.name,
        created,
      });
    }

    return {
      success: true,
      synced: syncedTemplates.length,
      templates: syncedTemplates,
    };
  } catch (error: any) {
    console.error('Error syncing Printful templates:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
