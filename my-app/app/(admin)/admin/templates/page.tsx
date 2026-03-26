'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const res = await fetch('/api/admin/templates?limit=15');
        const data = await res.json();
        setTemplates(data.templates || []);
      } finally { setLoading(false); }
    }
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Template Library</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div> : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-xs font-semibold px-5 py-3 uppercase">Template Name</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Category</th>
                <th className="text-xs font-semibold px-4 py-3 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-5 py-4 font-bold text-sm text-gray-800">{t.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{t.category}</td>
                  <td className="px-4 py-4"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{t.status || 'Active'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
