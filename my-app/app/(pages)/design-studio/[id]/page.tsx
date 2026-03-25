'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DesignCanvasAdvanced from '@/components/DesignStudioComponents/DesignCanvasAdvanced';

export default function DesignStudioEditPage() {
  const params = useParams();
  const designId = params.id as string;
  const [designData, setDesignData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesign = async () => {
      try {
        const response = await fetch(`/api/designs/${designId}`);
        if (response.ok) {
          const data = await response.json();
          setDesignData(data.design);
        }
      } catch (error) {
        console.error('Error fetching design:', error);
      } finally {
        setLoading(false);
      }
    };

    if (designId) {
      fetchDesign();
    }
  }, [designId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading design...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <DesignCanvasAdvanced designId={designId} initialData={designData} />
    </div>
  );
}
