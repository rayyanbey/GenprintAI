'use client';

import React, { useState, useEffect } from 'react';
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

  // Fetch design suggestions
  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/suggest-designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_type: productType || 'hoodie',
          preferred_colors: preferredColors,
          design_style: designStyle,
          count: 6,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions on mount or when context changes
  useEffect(() => {
    fetchSuggestions();
  }, [productType, preferredColors, designStyle]);

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick(suggestion);
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Loading design ideas...</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-gray-700">
          Design Ideas (Click to use)
        </label>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Refresh suggestions"
          title="Get new suggestions"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium hover:from-blue-100 hover:to-indigo-100 hover:border-blue-400 transition-all duration-200 hover:shadow-md active:scale-95"
            >
              {suggestion}
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-400">No suggestions available</p>
        )}
      </div>

      {error && (
        <p className="text-xs text-amber-600 mt-2">
          {error} - showing default suggestions
        </p>
      )}
    </div>
  );
};
