'use client';

import React, { useState, useCallback } from 'react';
import { RotateCcw, Loader2, AlertCircle, ChevronDown, Download, Eye, Save, X } from 'lucide-react';
import MockupPreviewModalAsync from '../Mockups/MockupPreviewModalAsync';
import { ChatBot } from '../ChatWidget/ChatBot';
import { DesignSuggestions } from './DesignSuggestions';
import { SuggestedPrompt } from '@/src/services/chat.service';

export default function DesignCanvas() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedDesignId, setGeneratedDesignId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTrend, setIsGeneratingTrend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMockupModal, setShowMockupModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('1'); // Default product

  // Handle prompt selection from ChatBot
  const handlePromptSelected = useCallback((prompt: SuggestedPrompt) => {
    setPrompt(prompt.text);
    // Optionally auto-generate design with the selected prompt
    // Uncomment the line below to auto-generate:
    // handleGenerateDesign();
  }, []);

  // Step 1: Extract trend from prompt using Groq
  const generateTrend = useCallback(async (text: string) => {
    try {
      setIsGeneratingTrend(true);
      const response = await fetch('http://localhost:8000/extract-trend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to extract trend');
      const data = await response.json();
      return data.trend;
    } catch (err: any) {
      console.error('Error extracting trend:', err);
      return null;
    } finally {
      setIsGeneratingTrend(false);
    }
  }, []);

  // Step 2: Generate design image using AI service
  const handleGenerateDesign = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a design prompt');
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      // Generate image using AI service
      const response = await fetch('http://localhost:8000/generate-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate design');
      }

      const data = await response.json();

      if (!data.image_url) {
        throw new Error('No image URL returned');
      }

      // Store design
      setGeneratedImage(data.image_url);
      setGeneratedDesignId(`design_${Date.now()}`);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate design');
      setGeneratedImage(null);
      console.error('Design generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  const handleRegenerateMockup = async () => {
    if (!generatedImage) {
      setError('Please generate a design first');
      return;
    }
    setShowMockupModal(true);
  };

  const handleSaveDesignClick = () => {
    if (!generatedImage) {
      setError('Please generate a design first');
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveDesignSubmit = async () => {
    if (!saveTitle.trim()) {
      setError('Please enter a design title');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: saveTitle.trim(),
          description: saveDescription.trim(),
          artwork_file_url: generatedImage,
          export_format: 'png',
          tags: ['ai-generated'],
          metadata: { prompt },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save design');
      }

      setSaveSuccess(true);
      setSaveTitle('');
      setSaveDescription('');
      setShowSaveModal(false);

      // Show success message briefly
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save design');
      console.error('Design save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-between p-8 overflow-y-auto">
        <div className="flex flex-col items-center w-full">
          {/* Title and Description */}
          <div className="text-center mb-8 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              AI Design Studio
            </h1>
            <p className="text-sm text-gray-600">
              Generate unique designs with AI and create mockups instantly
            </p>
          </div>

          {/* Action Buttons - Only show if image generated */}
          {generatedImage && (
            <div className="flex items-center gap-4 mb-8 flex-wrap justify-center">
              <button
                onClick={handleSaveDesignClick}
                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Save Design</span>
              </button>
              <button
                onClick={handleRegenerateMockup}
                className="flex items-center gap-2 px-4 py-2 text-white bg-[#f4978e] border border-[#f4978e] rounded-lg hover:bg-[#f08080] transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">Preview Mockup</span>
              </button>
              <button
                onClick={() => {
                  setGeneratedImage(null);
                  setGeneratedDesignId(null);
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm font-medium">New Design</span>
              </button>
            </div>
          )}

          {/* Canvas/Preview Area */}
          <div className="bg-white rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] p-8 w-full max-w-2xl aspect-[4/3] flex items-center justify-center mb-8 overflow-hidden">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-[#f4978e] animate-spin" />
                <p className="text-sm text-gray-600">Generating your design...</p>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated Design"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <p className="text-base">Your generated design will appear here</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full max-w-2xl mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Prompt Input - Fixed at Bottom */}
        <div className="w-full max-w-3xl pb-4">
          {/* Design Suggestions */}
          <DesignSuggestions
            productType={selectedProductId}
            onSuggestionClick={(suggestion) => {
              setPrompt(suggestion);
            }}
          />

          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  handleGenerateDesign();
                }
              }}
              placeholder="Describe your design... e.g., 'A cat astronaut on a vibrant background'"
              className="flex-1 px-5 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f4978e] focus:border-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateDesign}
              disabled={isGenerating || !prompt.trim()}
              className="px-8 py-3 bg-[#f4978e] text-white rounded-lg hover:bg-[#f08080] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm whitespace-nowrap shadow-sm flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>Generate</>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter or click Generate to create your design
          </p>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed bottom-4 right-4 p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg flex gap-3 items-center max-w-md">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <p className="text-sm text-green-700 font-medium">Design saved successfully! You can now request mockups.</p>
        </div>
      )}

      {/* Save Design Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Save Design</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Title *
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g., 'Cosmic Cat Design'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Add a description for this design..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDesignSubmit}
                  disabled={isSaving || !saveTitle.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Design
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mockup Preview Modal */}
      <MockupPreviewModalAsync
        isOpen={showMockupModal}
        onClose={() => setShowMockupModal(false)}
        productId={selectedProductId}
        productName="T-Shirt"
        price={24.99}
        designId={generatedDesignId || undefined}
        designImageUrl={generatedImage || undefined}
      />

      {/* Chat Widget */}
      <ChatBot
        onPromptSelected={handlePromptSelected}
        productType={selectedProductId}
      />
    </div>
  );
}
