'use client';

import { useState, useCallback, useEffect } from 'react';

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
  const [pollingIntervalId, setPollingIntervalId] = useState<NodeJS.Timeout | null>(null);

  /**
   * Create a mockup generation task
   */
  const generateMockup = useCallback(
    async (params: {
      product_id: string;
      design_id: string;
      design_image_url: string;
      variant_ids?: string[];
      placement?: string;
      format?: 'jpg' | 'png';
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

        setRetryCount(0);

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
      variant_ids?: string[];
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

        setRetryCount(0);

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
    try {
      const response = await fetch(`/api/mockups/status/${taskKey}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

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
      setRetryCount(prev => prev + 1);
      console.error('Poll error:', error);

      if (retryCount >= maxRetries) {
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
  }, [retryCount, maxRetries]);

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

      const intervalId = setInterval(pollLoop, pollInterval);
      setPollingIntervalId(intervalId);

      // Run first poll immediately
      await pollLoop();
    },
    [pollTask, pollInterval]
  );

  /**
   * Start polling a specific task
   */
  const startPolling = useCallback(
    (taskKey: string) => {
      // Clear any existing polling
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }

      setState(prev => ({
        ...prev,
        taskKey,
        status: 'pending',
      }));

      // Poll immediately
      const poll = async () => {
        const isComplete = await pollTask(taskKey);
        if (isComplete) {
          stopPolling();
        }
      };

      poll();

      // Set up interval polling
      const intervalId = setInterval(poll, pollInterval);
      setPollingIntervalId(intervalId);
    },
    [pollTask, pollInterval]
  );

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
      setPollingIntervalId(null);
    }
  }, [pollingIntervalId]);

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
    setRetryCount(0);
  }, [stopPolling]);

  return {
    // State
    taskKey: state.taskKey,
    status: state.status,
    mockupData: state.mockupData,
    error: state.error,
    progress: state.progress,
    retryCount,

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
