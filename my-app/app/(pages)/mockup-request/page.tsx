'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import MockupRequestPage from '@/components/MockupRequest/MockupRequestPage';

type InitialDesign = {
  id: string;
  title: string;
  description?: string;
  artwork_file_url?: string;
  created_at: string;
};

export default function MockupRequestRoute() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('productId') || undefined;
  const initialDesignImageUrl = searchParams.get('designImageUrl') || undefined;
  const initialDesignTitle = searchParams.get('designTitle') || undefined;
  const initialDesignDescription = searchParams.get('designDescription') || undefined;
  const initialDesignId = searchParams.get('designId') || undefined;

  const initialDesign: InitialDesign | null = initialDesignImageUrl && initialDesignTitle
    ? {
        id: initialDesignId || `community-${initialDesignTitle.toLowerCase().replace(/\s+/g, '-')}`,
        title: initialDesignTitle,
        description: initialDesignDescription || '',
        artwork_file_url: initialDesignImageUrl,
        created_at: new Date().toISOString(),
      }
    : null;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#f4978e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
    return null;
  }

  return <MockupRequestPage initialProductId={initialProductId} initialDesign={initialDesign} />;
}
