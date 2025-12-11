'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signIn('google', { 
        callbackUrl: '/onboarding',
        redirect: true 
      });
    } catch (error: any) {
      setError('Failed to sign up with Google. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E8E2DC' }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4">
              <span style={{ color: '#EA7052' }}>Genprint</span>{' '}
              <span style={{ color: '#1A1A2E' }}>AI</span>
            </h1>
          </div>

          <div
            className="bg-white rounded-lg p-8 shadow-lg text-center"
            style={{ border: '3px solid #EA7052' }}
          >
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1A1A2E' }}>
              Check Your Email!
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a verification link to <strong>{formData.email}</strong>.
              Please check your inbox and click the link to verify your account.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              The verification link will expire in 24 hours. If you don't see the email,
              please check your spam folder.
            </p>

            <Button
              onClick={() => router.push('/login')}
              className="w-full h-12 text-base font-semibold text-white"
              style={{
                backgroundColor: '#EA7052',
                boxShadow: '0 4px 6px rgba(234, 112, 82, 0.3)',
              }}
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
              Create Your Account
            </h2>
            <p className="text-gray-600">Join the future of custom merch.</p>
          </div>

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
              onClick={handleGoogleSignup}
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
              Sign up with Google
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 h-12"
                required
                disabled={loading}
                minLength={3}
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 h-12"
                required
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-gray-500 mt-1">
                At least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-semibold" style={{ color: '#EA7052' }}>
              Log in
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
