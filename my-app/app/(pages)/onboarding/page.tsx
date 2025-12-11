'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    avatar_url: '',
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Fetch user data to pre-fill form (for Google OAuth users)
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/onboarding');
        if (response.ok) {
          const data = await response.json();
          setFormData({
            full_name: data.user.full_name || '',
            age: data.user.age?.toString() || '',
            gender: data.user.gender || '',
            avatar_url: data.user.avatar_url || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validate form
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      setSubmitting(false);
      return;
    }

    if (!formData.age || parseInt(formData.age) < 13) {
      setError('You must be at least 13 years old');
      setSubmitting(false);
      return;
    }

    if (!formData.gender) {
      setError('Please select your gender');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/user/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          age: parseInt(formData.age),
          gender: formData.gender,
          avatar_url: formData.avatar_url || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete onboarding');
      }

      // Update session to reflect onboarding completion
      await update({
        onboardingCompleted: true,
        name: formData.full_name,
        image: formData.avatar_url || session?.user?.image,
      });

      // Redirect to home page
      router.push('/home');
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E8E2DC' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#EA7052' }}></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#E8E2DC' }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span style={{ color: '#EA7052' }}>Genprint</span>{' '}
            <span style={{ color: '#1A1A2E' }}>AI</span>
          </h1>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#1A1A2E' }}>
            Complete Your Profile
          </h2>
          <p className="text-gray-600">Tell us a bit about yourself to get started</p>
        </div>

        <div
          className="bg-white rounded-lg p-8 shadow-lg"
          style={{ border: '3px solid #EA7052' }}
        >
          {error && (
            <div
              className="mb-6 p-4 rounded-lg text-white"
              style={{ backgroundColor: '#DC2626' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="full_name" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Full Name *
              </Label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 h-12"
                required
              />
            </div>

            <div>
              <Label htmlFor="age" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Age *
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="mt-1 h-12"
                min="13"
                max="120"
                required
              />
            </div>

            <div>
              <Label htmlFor="gender" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Gender *
              </Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1 h-12 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                required
              >
                <option value="">Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <Label htmlFor="avatar_url" className="text-sm font-medium" style={{ color: '#1A1A2E' }}>
                Avatar URL (Optional)
              </Label>
              <Input
                id="avatar_url"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="mt-1 h-12"
              />
              {formData.avatar_url && (
                <div className="mt-2">
                  <img
                    src={formData.avatar_url}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-base font-semibold text-white"
              style={{
                backgroundColor: submitting ? '#9CA3AF' : '#EA7052',
                boxShadow: '0 4px 6px rgba(234, 112, 82, 0.3)',
              }}
            >
              {submitting ? 'Completing...' : 'Complete Onboarding'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
