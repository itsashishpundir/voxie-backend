'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';
import { Search, ShieldCheck, User } from 'lucide-react';

export default function UsersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', q],
    queryFn: () => adminApi.users({ q: q || undefined }),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.updateUser(id, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <div>
      <Header title="Users" subtitle={`${users.length} registered users`} />

      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input pl-8"
            placeholder="Search by name or email…"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Completions</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 font-bold text-sm flex items-center justify-center">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.role === 'ADMIN' ? 'badge-blue' : 'badge-gray'}>
                      {user.role === 'ADMIN' ? <><ShieldCheck size={11} /> Admin</> : <><User size={11} /> User</>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user._count?.completions ?? 0}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-secondary text-xs"
                      onClick={() => updateRole.mutate({
                        id: user.id,
                        role: user.role === 'ADMIN' ? 'USER' : 'ADMIN',
                      })}
                    >
                      {user.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
