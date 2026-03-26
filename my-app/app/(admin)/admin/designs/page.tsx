'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function DesignsPage() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch('/api/admin/designs?limit=50');
        const data = await res.json();
        setDesigns(data.designs || []);
      } finally { setLoading(false); }
    }
    init();
  }, []);

  if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Design Management</h1>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {designs.map(design => (
          <div key={design.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="aspect-[4/3] bg-gray-100 relative">
               <img src={design.image || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" />
               <div className="absolute top-3 left-3">
                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[design.status] || statusColors.pending}`}>{design.status}</span>
               </div>
             </div>
             <div className="p-4"><p className="font-bold text-sm truncate">{design.title}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
