'use client';

import React from 'react';
import { Sparkles, Upload, FileText } from 'lucide-react';

export default function AIToolsSection() {
  const tools = [
    {
      icon: <Sparkles className="w-6 h-6 text-[#ef4444]" />,
      title: 'AI Image Generator',
      description: 'Generate unique images with AI based on your prompts.',
    },
    {
      icon: <Upload className="w-6 h-6 text-[#ef4444]" />,
      title: 'Image Upload',
      description: 'Upload your own images to customize your products.',
    },
    {
      icon: <FileText className="w-6 h-6 text-[#ef4444]" />,
      title: 'Text Customization',
      description: 'Add custom text and messages to your designs.',
    },
  ];

  return (
    <section className="w-full px-6 py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
          AI Tools
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                {tool.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {tool.title}
              </h3>
              <p className="text-gray-600">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
