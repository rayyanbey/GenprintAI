'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TemplateBrowser } from '@/components/TemplateBrowser';
import { PageHero } from '@/components/PageHero';
import CommunityPosts, { CommunityPostCardData } from '@/components/HomePageComponents/CommunityPosts';

export default function TemplatesPage() {
  const router = useRouter();

  const handleSelectTemplate = (templateId: string) => {
    console.log('Selected template:', templateId);
    // TODO: Save selected template to context or navigate to design studio with template
  };

  const handleUseCommunityDesign = (post: CommunityPostCardData) => {
    const design = post.design;
    if (!design?.artwork_file_url) {
      return;
    }

    const params = new URLSearchParams({
      designId: design.id,
      designTitle: design.title || post.title,
      designDescription: design.description || post.content || '',
      designImageUrl: design.artwork_file_url,
    });

    router.push(`/mockup-request?${params.toString()}`);
  };

  return (
    <>
      <PageHero
        title="Design Templates"
        description="Discover pre-made templates to kickstart your design. Browse by category or search for inspiration."
        subtitle="Choose from community-made and professionally designed templates."
      />
      
   

      <section className="bg-gray-50 border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Community Posts</h2>
            <p className="mt-2 text-sm text-gray-600">
              Browse community-made designs and send any of them directly to the mockups page.
            </p>
          </div>

          <CommunityPosts showAll onUseDesign={handleUseCommunityDesign} />
        </div>
      </section>
    </>
  );
}
