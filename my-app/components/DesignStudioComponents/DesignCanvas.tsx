'use client';

import React, { useState, useCallback } from 'react';
import { RotateCcw, Loader2, AlertCircle, ChevronDown, Download, Eye, Save, X } from 'lucide-react';
import MockupPreviewModalAsync from '../Mockups/MockupPreviewModalAsync';
import { ChatBot } from '../ChatWidget/ChatBot';
import { DesignSuggestions } from './DesignSuggestions';
import { SuggestedPrompt } from '@/src/services/chat.service';
import { chatService } from '@/src/services/chat.service';
import VoiceInputButton from '@/components/VoiceAssistant/VoiceInputButton';

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
      const aiBaseUrl = process.env.FASTAPI_URL || 'http://localhost:8001';
      const response = await fetch(`${aiBaseUrl}/extract-trend`, {
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
      const validation = await chatService.validatePrompt(prompt);
      if (!validation.valid) {
        throw new Error(validation.explanation || 'Prompt was rejected by the validator');
      }

      // Generate image using AI service
      const aiBaseUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
      const response = await fetch(`${aiBaseUrl}/generate-design`, {
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

  const handleDownloadDesign = useCallback(async () => {
    if (!generatedImage) {
      setError('Please generate a design first');
      return;
    }

    try {
      // If the design is saved with an ID, download from API with proper headers
      if (generatedDesignId) {
        const response = await fetch(`/api/templates/download?id=${generatedDesignId}`);
        if (!response.ok) throw new Error('Failed to download design');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // Otherwise, download directly from the image URL
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `design-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to download design');
      console.error('Download error:', err);
    }
  }, [generatedImage, generatedDesignId]);

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
    <div className="flex-1 bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col h-screen">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f4978e]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f4978e]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 md:p-8 overflow-hidden relative z-10 gap-6">
        {/* Top Section - Title and Controls */}
        <div className="flex flex-col items-center w-full">
          {/* Title and Description */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-[#f4978e]/10 rounded-full border border-[#f4978e]/20">
              <div className="w-2 h-2 bg-[#f4978e] rounded-full"></div>
              <span className="text-xs font-semibold text-[#f4978e] uppercase tracking-wide">AI Powered</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
              Design Studio
            </h1>
            <p className="text-sm text-gray-600">
              Create stunning designs in seconds with AI
            </p>
          </div>

          {/* Action Buttons - Only show if image generated */}
          {generatedImage && (
            <div className="flex items-center gap-2 flex-wrap justify-center mt-4">
              <button
                onClick={handleDownloadDesign}
                className="group relative flex items-center gap-2 px-4 py-2 bg-white text-[#f4978e] rounded-lg font-medium text-sm border-2 border-[#f4978e] overflow-hidden hover:bg-[#f4978e]/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <Download className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Download</span>
              </button>
              <button
                onClick={handleSaveDesignClick}
                className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f4978e] to-[#f08080] text-white rounded-lg font-medium text-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#f08080] to-[#e8876a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Save className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Save Design</span>
              </button>
              <button
                onClick={handleRegenerateMockup}
                className="group relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f4978e] to-[#f08080] text-white rounded-lg font-medium text-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#f08080] to-[#e8876a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Eye className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Preview Mockup</span>
              </button>
              <button
                onClick={() => {
                  setGeneratedImage(null);
                  setGeneratedDesignId(null);
                }}
                className="group relative flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg font-medium text-sm border border-gray-200 overflow-hidden hover:bg-gray-50 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Design</span>
              </button>
            </div>
          )}
        </div>

        {/* Middle Section - Canvas and Suggestions Side by Side */}
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Canvas Area - Left Side, Takes Most Space */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Canvas/Preview Area */}
            <div className="group relative flex-1 bg-white rounded-2xl border border-gray-200/50 shadow-xl hover:shadow-2xl transition-shadow duration-300 p-6 flex items-center justify-center overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: "radial-gradient(#e5e7eb 1px,transparent 1px)",
                  backgroundSize: "16px 16px"
                }}></div>
              </div>

              <div className="relative w-full h-full flex items-center justify-center">
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                      <Loader2 className="w-16 h-16 text-[#f4978e] animate-spin" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#f4978e] to-[#f08080] rounded-full opacity-20 blur-xl animate-pulse"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900 text-sm">Creating your masterpiece</p>
                      <p className="text-xs text-gray-500 mt-1">This usually takes 10-20 seconds</p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated Design"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#f4978e]/10 to-[#f08080]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#f4978e] to-[#f08080] rounded-lg opacity-30"></div>
                    </div>
                    <p className="font-semibold text-gray-900">Ready to create</p>
                    <p className="text-sm text-gray-500 mt-1">Describe your design to get started</p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl flex gap-3 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900 text-sm">Generation Error</p>
                  <p className="text-xs text-red-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Designs - Right Side */}
          <div className="w-64 flex-shrink-0 bg-white rounded-2xl border border-gray-200 p-5 shadow-lg overflow-y-auto">
            <div className="sticky top-0 bg-white pb-3 border-b border-gray-200/50 mb-4">
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <span>✨</span> Suggested Designs
              </p>
            </div>
            <div>
              <DesignSuggestions
                productType={selectedProductId}
                onSuggestionClick={(suggestion) => {
                  setPrompt(suggestion);
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section - Input Area (Full Width) */}
        <div className="flex-shrink-0 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 p-5 shadow-lg">
          {/* Input Section */}
          <div className="space-y-3">
            <div className="flex gap-2 items-center">
              <div className="flex-1 relative group">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isGenerating) {
                      handleGenerateDesign();
                    }
                  }}
                  placeholder="Describe your vision... e.g., 'Dark hoodie with minimalist cat design'"
                  className="w-full px-5 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-[#f4978e] outline-none text-sm text-gray-900 placeholder:text-gray-400 transition-colors duration-200 font-medium"
                  disabled={isGenerating}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity text-[#f4978e] pointer-events-none">
                  <div className="w-1 h-1 bg-[#f4978e] rounded-full"></div>
                </div>
              </div>
                <VoiceInputButton
                  onTranscript={(text) => setPrompt(text)}
                  disabled={isGenerating}
                  className="h-[52px] w-[52px]"
                />
              <button
                onClick={handleGenerateDesign}
                disabled={isGenerating || !prompt.trim()}
                className="group relative px-7 py-3.5 bg-gradient-to-r from-[#f4978e] to-[#f08080] text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 transition-all duration-200 font-semibold text-sm flex items-center gap-2 whitespace-nowrap overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#f08080] to-[#e8876a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                    <span className="relative z-10">Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">✨ Generate</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>💡</span> Press Enter, click Generate, or use the mic to dictate your design
            </p>
          </div>
        </div>
      </div>

      {/* Success Message - Modern Toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 animate-in slide-in-from-bottom-4 fade-in-0 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-[#f4978e]/30 p-4 flex gap-3 items-center max-w-md backdrop-blur-sm bg-white/95">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-[#f4978e] rounded-full blur-md animate-pulse opacity-50"></div>
              <div className="relative w-3 h-3 bg-[#f4978e] rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-sm">Design saved successfully!</p>
              <p className="text-xs text-gray-600 mt-0.5">You can now request mockups</p>
            </div>
          </div>
        </div>
      )}

      {/* Save Design Modal - Modern */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in-0">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 border border-gray-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Save Design</h2>
                <p className="text-sm text-gray-500 mt-1">Store your creation for future mockups</p>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Design Title <span className="text-[#f4978e]">*</span>
                </label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g., 'Cosmic Cat Design'"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f4978e] focus:ring-0 outline-none text-sm font-medium bg-gray-50/50 transition-colors hover:border-gray-300"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Add details about your design, style, inspiration..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#f4978e] focus:ring-0 outline-none text-sm resize-none bg-gray-50/50 font-medium transition-colors hover:border-gray-300"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDesignSubmit}
                  disabled={isSaving || !saveTitle.trim()}
                  className="group relative flex-1 px-4 py-3 bg-gradient-to-r from-[#f4978e] to-[#f08080] text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 transition-all font-semibold text-sm flex items-center justify-center gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f08080] to-[#e8876a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                      <span className="relative z-10">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Save Design</span>
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
