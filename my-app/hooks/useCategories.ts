import { useState, useEffect } from 'react';

export interface Category {
  id: number;
  parent_id: number | null;
  title: string;
  image_url?: string;
  catalog_position?: number;
  size?: string;
  level?: number;
  children?: Category[];
}

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  error: string | null;
  hierarchy: Category[];
}

export function useCategories(
  useHierarchy: boolean = false,
  parentId?: number
): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [hierarchy, setHierarchy] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = '/api/categories?';
        
        if (useHierarchy) {
          url += 'hierarchy=true';
        }
        
        if (parentId) {
          url += `${useHierarchy ? '&' : ''}parentId=${parentId}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch categories');
        }

        const cats = data.categories || [];
        setCategories(cats);
        
        if (useHierarchy) {
          setHierarchy(cats);
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching categories');
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [useHierarchy, parentId]);

  return { categories, hierarchy, loading, error };
}
