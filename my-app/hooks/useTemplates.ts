import { useState, useEffect } from 'react';

export interface Template {
  id: string;
  name: string;
  category: string;
  description?: string;
  color_variants?: string[];
  usage_count: number;
  is_community: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_by_user_id?: string;
  printful_template_id?: string;
}

export interface SearchFilters {
  category?: string;
  search?: string;
  sort?: 'newest' | 'popular' | 'trending';
  page?: number;
  limit?: number;
  includePrivate?: boolean;
}

interface UseTemplatesResult {
  templates: Template[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    totalCount: number;
  };
}

export function useTemplates(filters: SearchFilters = {}): UseTemplatesResult {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0,
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams();
        if (filters.category) query.append('category', filters.category);
        if (filters.search) query.append('search', filters.search);
        if (filters.sort) query.append('sort', filters.sort);
        query.append('page', (filters.page || 1).toString());
        query.append('limit', (filters.limit || 12).toString());

        const response = await fetch(`/api/templates?${query.toString()}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch templates');
        }

        setTemplates(data.templates || []);
        setPagination({
          page: data.pagination?.page || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalCount: data.pagination?.total || 0,
        });
      } catch (err: any) {
        setError(err.message || 'Error fetching templates');
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [filters.category, filters.search, filters.sort, filters.page, filters.limit]);

  return { templates, loading, error, pagination };
}
