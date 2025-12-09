'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get messages from URL params
  const errorParam = searchParams.get('error');
  const messageParam = searchParams.get('message');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Check if onboarding is needed
      const response = await fetch('/api/user/onboarding');
      if (response.ok) {
        const data = await response.json();
        if (!data.user.onboarding_completed) {
          router.push('/onboarding');
        } else {
          router.push('/home');
        }
      } else {
        router.push('/home');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signIn('google', { 
        callbackUrl: '/onboarding',
        redirect: true 
      });
    } catch (error: any) {
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex gap-3 flex-col justify-between px-16 overflow-hidden" style={{ backgroundColor: '#E8E2DC' }}>
      <div className="flex-1 mt-5">
        <h1 className="text-5xl font-bold mb-6 mt-4">
          <span style={{ color: '#EA7052' }}>Genprint</span>{' '}
          <span style={{ color: '#1A1A2E' }}>AI</span>
        </h1>
        <p className="text-xl italic" style={{ color: '#4A5568', maxWidth: '500px' }}>
          Unleash your creativity. We bring your unique designs to life on high-quality merchandise.
        </p>
      </div>

      <div className="flex-1 flex justify-start mb-5">
        <div
          className="bg-white rounded-lg p-12 shadow-lg"
          style={{
            width: '480px',
            border: '3px solid #EA7052'
          }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
              Welcome Back
            </h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {(errorParam || messageParam) && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                errorParam ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}
            >
              {errorParam || messageParam}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              style={{ borderColor: '#D1D5DB' }}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-12"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-12"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold text-white"
              style={{
                backgroundColor: loading ? '#9CA3AF' : '#EA7052',
                boxShadow: '0 4px 6px rgba(234, 112, 82, 0.3)'
              }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="font-semibold" style={{ color: '#EA7052' }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
      
      {/* Right-side large image placeholder */}
      <div className="hidden lg:block absolute top-0 right-0 h-full w-1/2 pointer-events-none">
        <div
          className="h-full w-full bg-cover bg-center rounded-l-md"
          style={{
            backgroundImage: "url('/login.jpg')",
            backgroundColor: '#efe9e4'
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
