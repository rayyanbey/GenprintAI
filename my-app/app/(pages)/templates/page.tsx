'use client';

import React, { useState } from 'react';
import { TemplateBrowser } from '@/components/TemplateBrowser';
import { PageHero } from '@/components/PageHero';

export default function TemplatesPage() {
  const handleSelectTemplate = (templateId: string) => {
    console.log('Selected template:', templateId);
    // TODO: Save selected template to context or navigate to design studio with template
  };

  return (
    <>
      <PageHero
        title="Design Templates"
        description="Discover pre-made templates to kickstart your design. Browse by category or search for inspiration."
        subtitle="Choose from community-made and professionally designed templates."
      />
      
      <div className="bg-white">
        <TemplateBrowser onSelectTemplate={handleSelectTemplate} isStandalone={true} />
      </div>
    </>
  );
}
