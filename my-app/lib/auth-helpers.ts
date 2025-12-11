import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';


export async function requireAuth() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  return session;
}


export async function requireOnboarding() {
  const session = await requireAuth();
  const user = session.user as any;
  
  if (!user.onboardingCompleted) {
    redirect('/onboarding');
  }
  
  return session;
}

export async function getUserSession() {
  const session = await auth();
  return session;
}

export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}
