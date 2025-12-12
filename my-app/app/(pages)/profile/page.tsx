'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Calendar,
  Upload,
  Save,
  ArrowLeft,
  Camera,
  X,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SafeAvatar } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from '@/components/HomePageComponents/DashboardHeader';
import { getUserInitials } from '@/lib/session-utils';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form state
  const [profileData, setProfileData] = useState({
    full_name: '',
    username: '',
    email: '',
    age: '',
    gender: '',
    avatar_url: '',
    provider: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Preview avatar
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();

        if (data.success) {
          setProfileData({
            full_name: data.user.full_name || '',
            username: data.user.username || '',
            email: data.user.email || '',
            age: data.user.age?.toString() || '',
            gender: data.user.gender || '',
            avatar_url: data.user.avatar_url || '',
            provider: data.user.provider || '',
          });
          setAvatarPreview(data.user.avatar_url || '');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    } else {
      router.push('/login');
    }
  }, [session, router]);

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updatePayload: any = {
        full_name: profileData.full_name,
        username: profileData.username,
      };

      if (profileData.age) {
        updatePayload.age = parseInt(profileData.age);
      }
      if (profileData.gender) {
        updatePayload.gender = profileData.gender;
      }
      if (profileData.avatar_url) {
        updatePayload.avatar_url = profileData.avatar_url;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Update session with new data
        await updateSession({
          name: data.user.full_name || data.user.username,
          image: data.user.avatar_url,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar file upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Use JPEG, PNG, GIF, or WebP.' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size exceeds 5MB limit.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setProfileData({ ...profileData, avatar_url: data.avatar_url });
        setAvatarPreview(data.avatar_url);
        setMessage({ type: 'success', text: 'Avatar uploaded successfully!' });
        
        // Update session immediately
        await updateSession({
          image: data.avatar_url,
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' });
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setUploading(false);
    }
  };

  // Handle avatar removal
  const handleAvatarRemove = async () => {
    setUploading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setProfileData({ ...profileData, avatar_url: '' });
        setAvatarPreview('');
        setMessage({ type: 'success', text: 'Avatar removed successfully!' });
        
        // Update session
        await updateSession({
          image: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove avatar' });
      }
    } catch (error) {
      console.error('Avatar remove error:', error);
      setMessage({ type: 'error', text: 'Failed to remove avatar' });
    } finally {
      setUploading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage({ type: 'error', text: "Passwords don't match" });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ type: 'error', text: 'An error occurred while changing password' });
    } finally {
      setSaving(false);
    }
  };

  const userInitials = getUserInitials(profileData.full_name, profileData.email);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f08080] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#f08080] data-[state=active]:bg-transparent"
              >
                Profile Information
              </TabsTrigger>
              {profileData.provider === 'email' && (
                <TabsTrigger
                  value="security"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#f08080] data-[state=active]:bg-transparent"
                >
                  Security
                </TabsTrigger>
              )}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar Section */}
                <div>
                  <Label className="text-base font-semibold">Profile Picture</Label>
                  <div className="mt-4 flex items-center gap-6">
                    <SafeAvatar
                      src={avatarPreview}
                      alt={profileData.full_name}
                      fallback={userInitials}
                      size="xl"
                      className="border-4 border-gray-100"
                    />
                    <div className="flex-1">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          className="gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {uploading ? 'Uploading...' : 'Upload New'}
                        </Button>
                        {avatarPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleAvatarRemove}
                            disabled={uploading}
                            className="gap-2 text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        JPG, PNG, GIF or WebP. Max size 5MB.
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <Separator />

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold">Personal Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) =>
                          setProfileData({ ...profileData, full_name: e.target.value })
                        }
                        placeholder="John Doe"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) =>
                          setProfileData({ ...profileData, username: e.target.value })
                        }
                        placeholder="johndoe"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={profileData.age}
                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                        placeholder="25"
                        min="13"
                        max="120"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={profileData.gender}
                        onChange={(e) =>
                          setProfileData({ ...profileData, gender: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#f08080]"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="gap-2 bg-gradient-to-br from-[#f08080] to-[#f4978e] hover:from-[#e07070] hover:to-[#e38878]"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Security Tab */}
            {profileData.provider === 'email' && (
              <TabsContent value="security" className="p-6">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <h3 className="text-base font-semibold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current_password">Current Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="current_password"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.current_password}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, current_password: e.target.value })
                            }
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="new_password">New Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="new_password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.new_password}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, new_password: e.target.value })
                            }
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Must be at least 8 characters
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <div className="relative mt-1">
                          <Input
                            id="confirm_password"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirm_password}
                            onChange={(e) =>
                              setPasswordData({ ...passwordData, confirm_password: e.target.value })
                            }
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="gap-2 bg-gradient-to-br from-[#f08080] to-[#f4978e] hover:from-[#e07070] hover:to-[#e38878]"
                    >
                      <Lock className="w-4 h-4" />
                      {saving ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
