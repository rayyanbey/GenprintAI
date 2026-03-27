'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface MockupGenerationState {
  taskKey: string | null;
  status: 'idle' | 'pending' | 'completed' | 'failed';
  mockupData: any | null;
  error: string | null;
  progress: number; // 0-100
}

interface UseMockupGenerationOptions {
  autoStart?: boolean;
  pollInterval?: number; // ms between polls (default: 3000)
  maxRetries?: number;
}

/**
 * Custom hook for handling async Printful mockup generation workflow
 *
 * Usage:
 * const { taskKey, status, mockupData, error, generateMockup, startPolling, stopPolling } = useMockupGeneration();
 *
 * // Step 1: Create mockup task (returns taskKey immediately)
 * await generateMockup({
 *   product_id: '123',
 *   design_id: 'design-456',
 *   design_image_url: 'https://...',
 *   placement: 'front'
 * });
 *
 * // Step 2: Polling starts automatically, or call startPolling manually
 * // Component re-renders as status updates
 *
 * // When status === 'completed', mockupData contains the mockup URLs
 */
export function useMockupGeneration(
  options: UseMockupGenerationOptions = {}
) {
  const {
    autoStart = true,
    pollInterval = 3000,
    maxRetries = 30,
  } = options;

  const [state, setState] = useState<MockupGenerationState>({
    taskKey: null,
    status: 'idle',
    mockupData: null,
    error: null,
    progress: 0,
  });

  const [retryCount, setRetryCount] = useState(0);
  const [pollAttemptCount, setPollAttemptCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const pollAttemptRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const incrementRetryCount = useCallback(() => {
    const next = retryCountRef.current + 1;
    retryCountRef.current = next;
    setRetryCount(next);
    return next;
  }, []);

  const incrementPollAttempt = useCallback(() => {
    const next = pollAttemptRef.current + 1;
    pollAttemptRef.current = next;
    setPollAttemptCount(next);
    return next;
  }, []);

  /**
   * Create a mockup generation task
   */
  const generateMockup = useCallback(
    async (params: {
      product_id: string;
      design_id: string;
      design_image_url: string;
      variant_ids?: Array<string | number>;
      placement?: string;
      format?: 'jpg' | 'png';
      width?: number;
      product_options?: Record<string, unknown>;
      option_groups?: string[];
      options?: string[];
      file_options?: Array<{ id: string; value: string }>;
      product_template_id?: number;
      position?: any;
    }) => {
      try {
        setState(prev => ({
          ...prev,
          status: 'pending',
          error: null,
          progress: 10,
        }));

        const response = await fetch('/api/mockups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to create mockup task (${response.status})`
          );
        }

        const data = await response.json();

        if (!data.success || !data.taskKey) {
          throw new Error(data.error || 'Invalid response from mockup API');
        }

        setState(prev => ({
          ...prev,
          taskKey: data.taskKey,
          progress: 15,
        }));

        retryCountRef.current = 0;
        pollAttemptRef.current = 0;
        setRetryCount(0);
        setPollAttemptCount(0);

        // Auto-start polling if enabled
        if (autoStart) {
          startPolling(data.taskKey);
        }

        return data.taskKey;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create mockup task';
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: errorMsg,
          progress: 0,
        }));
        throw error;
      }
    },
    [autoStart]
  );

  /**
   * Create multiple angle mockup tasks
   */
  const generateMultiAngleMockups = useCallback(
    async (params: {
      product_id: string;
      design_id: string;
      design_image_url: string;
      variant_ids?: Array<string | number>;
      placements?: string[];
    }) => {
      try {
        setState(prev => ({
          ...prev,
          status: 'pending',
          error: null,
          progress: 10,
        }));

        const response = await fetch(
          `/api/mockups/${params.product_id}/all`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to create mockup tasks (${response.status})`
          );
        }

        const data = await response.json();

        if (!data.success || !data.taskKeys || data.taskKeys.length === 0) {
          throw new Error(data.error || 'No mockup tasks created');
        }

        // Store first task key for single polling
        const firstTaskKey = data.taskKeys[0];
        setState(prev => ({
          ...prev,
          taskKey: firstTaskKey,
          mockupData: { taskKeys: data.taskKeys, totalTasks: data.totalTasks },
          progress: 15,
        }));

        retryCountRef.current = 0;
        pollAttemptRef.current = 0;
        setRetryCount(0);
        setPollAttemptCount(0);

        // Start polling all task keys
        if (autoStart && data.taskKeys.length > 0) {
          pollMultipleTasks(data.taskKeys);
        }

        return data.taskKeys;
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create mockup tasks';
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: errorMsg,
          progress: 0,
        }));
        throw error;
      }
    },
    [autoStart]
  );

  /**
   * Poll single task
   */
  const pollTask = useCallback(async (taskKey: string) => {
    const attempts = incrementPollAttempt();

    if (attempts >= maxRetries) {
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: `Mockup generation timeout after ${maxRetries} polling attempts`,
        progress: 0,
      }));
      return true;
    }

    try {
      const response = await fetch(`/api/mockups/status/${taskKey}`);

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (data?.status === 'failed') {
          setState(prev => ({
            ...prev,
            status: 'failed',
            error: data.error || 'Mockup generation failed',
            progress: 0,
          }));
          return true;
        }

        throw new Error(`API error: ${response.status}`);
      }

      if (data.status === 'completed') {
        setState(prev => ({
          ...prev,
          status: 'completed',
          mockupData: data,
          progress: 100,
          error: null,
        }));
        return true; // Signal completion
      } else if (data.status === 'failed') {
        throw new Error(data.error || 'Mockup generation failed');
      } else if (data.status === 'pending') {
        setState(prev => ({
          ...prev,
          progress: Math.min(90, prev.progress + 10),
        }));
        return false; // Still processing
      }
    } catch (error: any) {
      const retries = incrementRetryCount();
      console.error('Poll error:', error);

      if (retries >= maxRetries) {
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: `Mockup generation timeout after ${maxRetries} retries`,
          progress: 0,
        }));
        return true; // Stop polling
      }
    }

    return false;
  }, [incrementPollAttempt, incrementRetryCount, maxRetries]);

  /**
   * Poll multiple tasks in parallel
   */
  const pollMultipleTasks = useCallback(
    async (taskKeys: string[]) => {
      let completedCount = 0;

      const pollLoop = async () => {
        const results = await Promise.all(
          taskKeys.map(key => pollTask(key))
        );

        completedCount = results.filter(r => r).length;

        // Update progress based on completion ratio
        const progressRatio = (completedCount / taskKeys.length) * 100;
        setState(prev => ({
          ...prev,
          progress: Math.max(prev.progress, Math.min(95, progressRatio + 15)),
        }));

        if (completedCount >= taskKeys.length) {
          // All tasks completed
          setState(prev => ({
            ...prev,
            status: 'completed',
            progress: 100,
          }));
          stopPolling();
        }
      };

      stopPolling();
      intervalRef.current = setInterval(pollLoop, pollInterval);

      // Run first poll immediately
      await pollLoop();
    },
    [pollTask, pollInterval, stopPolling]
  );

  /**
   * Start polling a specific task
   */
  const startPolling = useCallback(
    (taskKey: string) => {
      // Clear any existing polling
      stopPolling();

      setState(prev => ({
        ...prev,
        taskKey,
        status: 'pending',
      }));

      retryCountRef.current = 0;
      pollAttemptRef.current = 0;
      setRetryCount(0);
      setPollAttemptCount(0);

      // Poll immediately
      const poll = async () => {
        const isComplete = await pollTask(taskKey);
        if (isComplete) {
          stopPolling();
        }
      };

      poll();

      // Set up interval polling
      intervalRef.current = setInterval(poll, pollInterval);
    },
    [pollTask, pollInterval, stopPolling]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    stopPolling();
    setState({
      taskKey: null,
      status: 'idle',
      mockupData: null,
      error: null,
      progress: 0,
    });
    retryCountRef.current = 0;
    pollAttemptRef.current = 0;
    setRetryCount(0);
    setPollAttemptCount(0);
  }, [stopPolling]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    // State
    taskKey: state.taskKey,
    status: state.status,
    mockupData: state.mockupData,
    error: state.error,
    progress: state.progress,
    retryCount,
    pollAttemptCount,

    // Methods
    generateMockup,
    generateMultiAngleMockups,
    startPolling,
    stopPolling,
    pollTask,
    pollMultipleTasks,
    reset,
  };
}

export type { MockupGenerationState };
