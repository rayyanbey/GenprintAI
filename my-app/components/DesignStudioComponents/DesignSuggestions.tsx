'use client';

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface DesignSuggestionsProps {
  productType: string;
  preferredColors?: string[];
  designStyle?: string;
  onSuggestionClick: (suggestion: string) => void;
  isLoading?: boolean;
}

export const DesignSuggestions: React.FC<DesignSuggestionsProps> = ({
  productType,
  preferredColors = [],
  designStyle = '',
  onSuggestionClick,
  isLoading = false,
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevContextRef = useRef<string>('');
  
  const contextKey = useMemo(() => {
    return `${productType}|${preferredColors.join(',')}|${designStyle}`;
  }, [productType, preferredColors, designStyle]);

  // Fetch design suggestions
  const fetchSuggestions = useCallback(async () => {
    // Skip if already fetched with same context
    if (prevContextRef.current === contextKey && suggestions.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const aiBaseUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8000';
      const response = await fetch(`${aiBaseUrl}/suggest-designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: productType || 'hoodie',
          preferred_colors: preferredColors.length > 0 ? preferredColors : [],
          design_style: designStyle || '',
          count: 6,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      prevContextRef.current = contextKey;
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError('Failed to load suggestions');
      // Set default suggestions on error
      setSuggestions([
        'minimalist geometric',
        'vintage aesthetic',
        'cosmic abstract',
        'artistic watercolor',
        'bold typography',
        'neon vibes',
      ]);
      prevContextRef.current = contextKey;
    } finally {
      setLoading(false);
    }
  }, [contextKey, productType, preferredColors, designStyle, suggestions.length]);

  // Fetch suggestions only on mount or when context meaningfully changes
  useEffect(() => {
    fetchSuggestions();
  }, [contextKey]);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50/50 rounded-lg border border-gray-200/50 animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin text-[#f4978e]" />
        <p className="text-sm font-medium text-gray-600">Loading design ideas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          ✨ Suggested Designs
        </label>
        <button
          onClick={() => {
            prevContextRef.current = ''; // Force refresh
            fetchSuggestions();
          }}
          disabled={loading}
          className="group p-1.5 hover:bg-[#f4978e]/10 rounded-lg transition-all text-gray-400 hover:text-[#f4978e]"
          aria-label="Refresh suggestions"
          title="Get new suggestions"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <button
              key={`${contextKey}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="group relative px-3.5 py-2 bg-gradient-to-r from-[#f4978e]/90 via-[#f08080]/90 to-[#e8876a]/90 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:scale-95 border border-[#f4978e]/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#f08080] via-[#e8876a] to-[#da7b5f] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative z-10">{suggestion}</span>
            </button>
          ))
        ) : (
          <div className="w-full py-2 px-3 text-center bg-gray-50/50 rounded-lg">
            <p className="text-xs text-gray-500">No suggestions available</p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-xs text-amber-600 mt-2 flex items-center gap-1 px-2 py-1 bg-amber-50/50 rounded">
          <span>ℹ️</span> {error} - showing default suggestions
        </div>
      )}
    </div>
  );
};
