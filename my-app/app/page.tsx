'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-between px-16" style={{ backgroundColor: '#E8E2DC' }}>
      <div className="flex-1">
        <h1 className="text-7xl font-bold mb-6">
          <span style={{ color: '#EA7052' }}>Genprint</span>{' '}
          <span style={{ color: '#1A1A2E' }}>AI</span>
        </h1>
        <p className="text-xl" style={{ color: '#4A5568', maxWidth: '500px' }}>
          Unleash your creativity. We bring your unique designs to life on high-quality merchandise.
        </p>
      </div>

      <div className="flex-1 flex justify-end">
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

          <div className="space-y-4 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              style={{ borderColor: '#D1D5DB' }}
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
              Google
            </Button>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              style={{ borderColor: '#D1D5DB' }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
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

          <form className="space-y-4">
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
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold text-white"
              style={{
                backgroundColor: '#EA7052',
                boxShadow: '0 4px 6px rgba(234, 112, 82, 0.3)'
              }}
            >
              Sign Up
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{' '}
            <a href="#" className="font-semibold" style={{ color: '#EA7052' }}>
              Log in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
