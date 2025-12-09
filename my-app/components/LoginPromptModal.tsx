'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  callbackUrl?: string;
}

/**
 * Modal that prompts user to login when trying to perform an action that requires authentication.
 * 
 * Usage:
 * const [showLoginPrompt, setShowLoginPrompt] = useState(false);
 * 
 * <LoginPromptModal 
 *   isOpen={showLoginPrompt}
 *   onClose={() => setShowLoginPrompt(false)}
 *   action="save your design"
 *   callbackUrl="/design"
 * />
 */
export default function LoginPromptModal({ isOpen, onClose, action, callbackUrl }: LoginPromptModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    const loginUrl = new URL('/login', window.location.origin);
    if (callbackUrl) {
      loginUrl.searchParams.set('callbackUrl', callbackUrl);
    }
    router.push(loginUrl.toString());
  };

  const handleSignup = () => {
    const signupUrl = new URL('/signup', window.location.origin);
    if (callbackUrl) {
      signupUrl.searchParams.set('callbackUrl', callbackUrl);
    }
    router.push(signupUrl.toString());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6" style={{ border: '3px solid #EA7052' }}>
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
            <svg
              className="h-6 w-6"
              style={{ color: '#EA7052' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
            Authentication Required
          </h2>
          <p className="text-gray-600">
            You need to be logged in to {action}.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-semibold text-white"
            style={{
              backgroundColor: '#EA7052',
              boxShadow: '0 4px 6px rgba(234, 112, 82, 0.3)',
            }}
          >
            Log In
          </Button>
          <Button
            onClick={handleSignup}
            variant="outline"
            className="w-full h-12 text-base font-semibold"
            style={{
              borderColor: '#EA7052',
              color: '#EA7052',
            }}
          >
            Create Account
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full h-12 text-base"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    </div>
  );
}
