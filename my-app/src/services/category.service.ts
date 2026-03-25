'use server';

import { getModels } from '@/lib/db-dynamic';

export interface CategoryWithChildren {
  id: number;
  parent_id: number | null;
  title: string;
  image_url?: string;
  catalog_position?: number;
  size?: string;
  level?: number;
  children?: CategoryWithChildren[];
}

/**
 * Sync categories from Printful structured data
 */
export async function syncCategories(categoriesData: any[]) {
  try {
    const models = await getModels();
    const { Category } = models;

    console.log(`Syncing ${categoriesData.length} categories...`);

    // Build map of categories by id for hierarchy calculation
    const categoryMap = new Map();
    categoriesData.forEach(cat => {
      categoryMap.set(cat.id, cat);
    });

    // Sync each category
    const syncedCategories = [];

    for (const categoryData of categoriesData) {
      try {
        // Calculate level based on parent_id
        let level = 0;
        let parentId = categoryData.parent_id;
        while (parentId && parentId !== 0) {
          level++;
          const parent = categoryMap.get(parentId);
          if (parent) {
            parentId = parent.parent_id;
          } else {
            break;
          }
        }

        // Create path by traversing up the hierarchy
        let path = categoryData.id.toString();
        let currentParentId = categoryData.parent_id;
        const pathParts = [];

        while (currentParentId && currentParentId !== 0) {
          pathParts.unshift(currentParentId);
          const parent = categoryMap.get(currentParentId);
          if (parent) {
            currentParentId = parent.parent_id;
          } else {
            break;
          }
        }

        if (pathParts.length > 0) {
          path = pathParts.join('/') + '/' + path;
        }

        const [category, created] = await Category.upsert({
          id: categoryData.id,
          parent_id: categoryData.parent_id || 0,
          title: categoryData.title,
          image_url: categoryData.image_url,
          catalog_position: categoryData.catalog_position,
          size: categoryData.size,
          level,
          path,
        });

        syncedCategories.push({
          id: category.id,
          title: category.title,
          created,
        });

        console.log(`${created ? 'Created' : 'Updated'} category: ${categoryData.title}`);
      } catch (error) {
        console.error(`Error syncing category ${categoryData.id}:`, error);
      }
    }

    return {
      success: true,
      message: `Synced ${syncedCategories.length} categories`,
      count: syncedCategories.length,
    };
  } catch (error: any) {
    console.error('Error syncing categories:', error);
    throw new Error(`Failed to sync categories: ${error.message}`);
  }
}

/**
 * Get all root categories with their children recursively
 */
export async function getCategoryHierarchy(): Promise<CategoryWithChildren[]> {
  try {
    const models = await getModels();
    const { Category } = models;

    // Fetch all categories ordered by level and catalog_position
    const allCategories = await Category.findAll({
      order: [
        ['level', 'ASC'],
        ['catalog_position', 'ASC'],
      ],
      raw: true,
    });

    // Build hierarchy
    const categoryMap = new Map();
    const rootCategories: CategoryWithChildren[] = [];

    // Create map of all categories
    allCategories.forEach(cat => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
      });
    });

    // Build parent-child relationships
    allCategories.forEach(cat => {
      const catWithChildren = categoryMap.get(cat.id);
      if (!cat.parent_id || cat.parent_id === 0) {
        rootCategories.push(catWithChildren);
      } else {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children.push(catWithChildren);
        }
      }
    });

    return rootCategories;
  } catch (error: any) {
    console.error('Error fetching category hierarchy:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
}

/**
 * Get flat list of all categories
 */
export async function getAllCategories(): Promise<CategoryWithChildren[]> {
  try {
    const models = await getModels();
    const { Category } = models;

    const categories = await Category.findAll({
      order: [
        ['level', 'ASC'],
        ['catalog_position', 'ASC'],
      ],
      raw: true,
    });

    return categories;
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
}

/**
 * Get category by ID with parent chain
 */
export async function getCategoryWithParents(categoryId: number) {
  try {
    const models = await getModels();
    const { Category } = models;

    const category = await Category.findByPk(categoryId);

    if (!category) {
      return null;
    }

    // Fetch parent chain
    const parents = [];
    let currentParentId = category.parent_id;

    while (currentParentId && currentParentId !== 0) {
      const parent = await Category.findByPk(currentParentId);
      if (parent) {
        parents.unshift(parent);
        currentParentId = parent.parent_id;
      } else {
        break;
      }
    }

    return {
      ...category.toJSON(),
      parents,
    };
  } catch (error: any) {
    console.error('Error fetching category:', error);
    throw new Error(`Failed to fetch category: ${error.message}`);
  }
}

/**
 * Get all child categories for a parent (including grandchildren, etc.)
 */
export async function getCategoryChildren(parentId: number): Promise<CategoryWithChildren[]> {
  try {
    const models = await getModels();
    const { Category } = models;

    // Use path to get all descendants
    const categories = await Category.findAll({
      where: {
        path: {
          [require('sequelize').Op.like]: `%/${parentId}/%`,
        },
      },
      order: [['catalog_position', 'ASC']],
      raw: true,
    });

    return categories;
  } catch (error: any) {
    console.error('Error fetching category children:', error);
    throw new Error(`Failed to fetch category children: ${error.message}`);
  }
}
