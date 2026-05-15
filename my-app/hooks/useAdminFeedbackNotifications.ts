'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface DesignSummary {
  id: string;
  admin_feedback?: string | null;
  admin_feedback_date?: string | null;
}

interface UseAdminFeedbackNotificationsResult {
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useAdminFeedbackNotifications(): UseAdminFeedbackNotificationsResult {
  const { data: session, status } = useSession();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      setCount(0);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/user/designs?page=1&limit=100', {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to load admin feedback notifications');
      }

      const designs: DesignSummary[] = Array.isArray(data.designs) ? data.designs : [];
      const feedbackCount = designs.filter(
        (design) => typeof design.admin_feedback === 'string' && design.admin_feedback.trim().length > 0
      ).length;

      setCount(feedbackCount);
    } catch (error) {
      console.error('Failed to load admin feedback notifications:', error);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [session?.user, status]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  return {
    count,
    loading,
    refresh: loadNotifications,
  };
}
