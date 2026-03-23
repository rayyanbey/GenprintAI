'use client';

import React from 'react';
import { Flame, Check, AlertCircle } from 'lucide-react';

export interface TemplateCardProps {
  id: string;
  name: string;
  category: string;
  description?: string;
  color_variants?: string[];
  usage_count?: number;
  is_community: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  onSelect?: (templateId: string) => void;
}

export default function TemplateCard({
  id,
  name,
  category,
  description,
  color_variants,
  usage_count,
  is_community,
  approval_status,
  onSelect,
}: TemplateCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(id);
    }
  };

  // Determine approval badge
  const getApprovalBadge = () => {
    if (!is_community) return null;
    
    switch (approval_status) {
      case 'approved':
        return (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
            <Check size={12} />
            Approved
          </div>
        );
      case 'pending':
        return (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
            <AlertCircle size={12} />
            Pending
          </div>
        );
      case 'rejected':
        return null; // Don't show rejected templates
      default:
        return null;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer flex flex-col h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden hover:scale-[1.02]"
    >
      {/* Preview Area with Color Swatches */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden p-6 flex items-center justify-center">
        {color_variants && color_variants.length > 0 ? (
          <div className="flex gap-3 flex-wrap justify-center">
            {color_variants.slice(0, 6).map((color, idx) => (
              <div
                key={idx}
                className="w-12 h-12 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {color_variants.length > 6 && (
              <div className="w-12 h-12 rounded-full bg-gray-400 border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold">
                +{color_variants.length - 6}
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-3xl mb-2">🎨</div>
            <p className="text-xs">Template</p>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize">
          {category}
        </div>

        {/* Approval Status Badge */}
        {getApprovalBadge()}

        {/* Usage Badge */}
        {usage_count && usage_count > 0 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-700">
            <Flame size={12} className="text-orange-500" />
            {usage_count} uses
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
          {name}
        </h3>
        {description && (
          <p className="text-gray-600 text-xs line-clamp-2 mb-3 flex-1">
            {description}
          </p>
        )}

        {/* Community Badge */}
        {is_community && (
          <div className="text-xs text-blue-600 font-medium mb-3">
            👥 Community
          </div>
        )}

        {/* Button */}
        <button
          className="w-full bg-gradient-to-r from-[#f08080] to-[#f4978e] hover:from-[#f08080]/90 hover:to-[#f4978e]/90 text-white font-medium py-2 rounded-lg transition-all text-sm"
        >
          Use Template
        </button>
      </div>
    </div>
  );
}
