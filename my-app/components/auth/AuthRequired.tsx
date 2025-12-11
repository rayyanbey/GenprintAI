'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface AuthRequiredProps {
  children: ReactNode;
  action: string; // e.g., "save this design", "place an order", "post to community"
  fallback?: ReactNode;
}

/**
 * Wraps content that requires authentication.
 * Shows a login prompt if user is not authenticated.
 * 
 * Usage:
 * <AuthRequired action="save this design">
 *   <button onClick={handleSave}>Save Design</button>
 * </AuthRequired>
 */
export function AuthRequired({ children, action, fallback }: AuthRequiredProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return fallback || (
      <div className="opacity-50 cursor-not-allowed">
        {children}
      </div>
    );
  }

  if (!session) {
    return fallback || (
      <div className="relative group">
        <div className="opacity-50 cursor-not-allowed pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white shadow-lg rounded-lg p-4 border-2" style={{ borderColor: '#EA7052' }}>
            <p className="text-sm text-gray-700 mb-2">
              Please log in to {action}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => router.push('/login')}
                style={{ backgroundColor: '#EA7052' }}
                className="text-white"
              >
                Log In
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/signup')}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Hook to check if user is authenticated and prompt login if needed.
 * 
 * Usage:
 * const { isAuthenticated, promptLogin } = useAuthRequired();
 * 
 * const handleSave = () => {
 *   if (!isAuthenticated) {
 *     promptLogin('save this design');
 *     return;
 *   }
 *   // ... proceed with save
 * };
 */
export function useAuthRequired() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = !!session?.user;
  const isLoading = status === 'loading';

  const promptLogin = (action?: string, redirectAfter?: string) => {
    const loginUrl = new URL('/login', window.location.origin);
    if (redirectAfter) {
      loginUrl.searchParams.set('callbackUrl', redirectAfter);
    }
    if (action) {
      loginUrl.searchParams.set('action', action);
    }
    router.push(loginUrl.toString());
  };

  return {
    isAuthenticated,
    isLoading,
    session,
    promptLogin,
  };
}
