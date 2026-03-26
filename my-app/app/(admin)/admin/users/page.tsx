'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, ShieldAlert, UserX, Loader2 } from 'lucide-react';

const roleColors: Record<string, string> = {
  admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  designer: 'bg-violet-50 text-violet-700 border-violet-200',
  customer: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ page: page.toString(), limit: '15', search, role: roleFilter, status: statusFilter });
      const res = await fetch(`/api/admin/users?${qs.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
    } catch (err: any) { setError(err.message); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, statusFilter]);
  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const updateUser = async (id: string, updates: any) => {
    setUpdatingId(id); setActiveMenu(null);
    try {
      const res = await fetch('/api/admin/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...updates }) });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    } catch (err: any) { alert(err.message); } 
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">User Management</h1></div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div> : error ? <div className="text-red-500 p-5">{error}</div> : users.length === 0 ? <div className="p-10 text-center">No users found</div> : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold px-5 py-3 uppercase">User</th>
                  <th className="text-left text-xs font-semibold px-4 py-3 uppercase">Role</th>
                  <th className="text-left text-xs font-semibold px-4 py-3 uppercase">Status</th>
                  <th className="text-left text-xs font-semibold px-4 py-3 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4"><p className="text-sm font-bold text-gray-800">{user.name}</p><p className="text-xs text-gray-500">{user.email}</p></td>
                    <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded text-xs font-semibold ${roleColors[user.role] || roleColors.customer}`}>{user.role}</span></td>
                    <td className="px-4 py-4">{user.status}</td>
                    <td className="px-4 py-4 text-center relative">
                      {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" /> : (
                        <div>
                          <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} className="p-1.5"><MoreVertical className="w-4 h-4" /></button>
                          {activeMenu === user.id && (
                            <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl py-1.5 z-20 text-left">
                              <button onClick={() => updateUser(user.id, { role: 'admin' })} className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">Make admin</button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
