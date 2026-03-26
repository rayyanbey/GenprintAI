'use client';

import { useContext } from 'react';
import { ToastContext } from '@/contexts/ToastContext';

/**
 * Safe version of useToast that provides fallback behavior
 * if used outside of ToastProvider
 */
export function useSafeToast() {
  const context = useContext(ToastContext);
  
  return {
    addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration = 3000) => {
      try {
        if (context?.addToast) {
          context.addToast(message, type, duration);
        } else {
          // Fallback to console and alert
          console.log(`[${type.toUpperCase()}] ${message}`);
        }
      } catch (error) {
        console.error('Toast error:', error);
      }
    },
    removeToast: (id: string) => {
      try {
        if (context?.removeToast) {
          context.removeToast(id);
        }
      } catch (error) {
        console.error('Toast remove error:', error);
      }
    },
    toasts: context?.toasts || [],
  };
}
