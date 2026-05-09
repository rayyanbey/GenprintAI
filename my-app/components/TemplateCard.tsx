'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Zap } from 'lucide-react';

interface Creator {
  id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
}

interface TemplateCardProps {
  id: string;
  name: string;
  category: string;
  description?: string;
  usage_count?: number;
  creator?: Creator;
  image_url?: string;
  onUseTemplate?: (templateId: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  id,
  name,
  category,
  description,
  usage_count = 0,
  creator,
  image_url,
  onUseTemplate,
}) => {
  const handleUseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onUseTemplate) {
      onUseTemplate(id);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex items-center justify-center">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
            <Zap className="w-8 h-8" />
            <span className="text-xs font-medium">No Preview</span>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-[#f4978e] text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
          {category}
        </div>

        {/* Usage Count */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {usage_count}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{name}</h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">{description}</p>
        )}

        {/* Creator Info */}
        {creator && (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.full_name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#f4978e]/20 flex items-center justify-center">
                <span className="font-bold text-[#f4978e]">
                  {creator.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="truncate">by {creator.full_name || creator.username}</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Use Template Button */}
        <button
          onClick={handleUseClick}
          className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-[#f4978e] to-[#f08080] text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
        >
          Use Template
        </button>
      </div>
    </div>
  );
};
