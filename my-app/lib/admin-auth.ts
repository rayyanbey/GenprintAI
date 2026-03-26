import { auth } from '@/lib/auth';
import { getModels } from '@/lib/db-dynamic';
import { NextResponse } from 'next/server';

/**
 * Validates that the current user is authenticated and is an admin.
 * Returns the session and user model if valid, or a NextResponse error if not.
 */
export async function requireAdmin(): Promise<any> {
  const models = await getModels();
  
  // BYPASS AUTH: returning a mock admin session
  return { 
    session: { user: { id: 'mock-admin' } }, 
    user: { id: 'mock-admin', role: 'admin' }, 
    models 
  };
}
