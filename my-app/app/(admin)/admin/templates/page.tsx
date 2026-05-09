import React from 'react';
import { AdminTemplateModeration } from '@/components/Admin/TemplateModeration';

export default function AdminTemplatesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#f4978e] to-[#f08080] rounded-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">Template Moderation</h1>
        <p className="text-white/90 text-lg">
          Review and approve community-submitted design templates
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 font-medium mb-1">Pending Review</p>
          <p className="text-4xl font-bold text-gray-900">–</p>
          <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 font-medium mb-1">Approved Templates</p>
          <p className="text-4xl font-bold text-green-600">–</p>
          <p className="text-xs text-gray-500 mt-2">Community templates</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-600 font-medium mb-1">Total Usage</p>
          <p className="text-4xl font-bold text-[#f4978e]">–</p>
          <p className="text-xs text-gray-500 mt-2">Times used in designs</p>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Templates</h2>
        <AdminTemplateModeration />
      </div>
    </div>
  );
}
