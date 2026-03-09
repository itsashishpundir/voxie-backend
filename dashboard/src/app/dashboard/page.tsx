'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';

export default function OverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.stats,
  });

  const { data: analytics } = useQuery({
    queryKey: ['exercise-analytics'],
    queryFn: adminApi.exerciseAnalytics,
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.users ?? 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Courses', value: stats?.courses ?? 0, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Lessons', value: stats?.lessons ?? 0, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Completions', value: stats?.completions ?? 0, icon: CheckCircle, color: 'bg-orange-500' },
  ];

  const chartData = (analytics ?? []).slice(0, 10).map((item: any) => ({
    name: item.lessonTitle.length > 14 ? item.lessonTitle.slice(0, 14) + '…' : item.lessonTitle,
    accuracy: item.avgAccuracy,
    attempts: item.attempts,
  }));

  return (
    <div>
      <Header title="Overview" subtitle="Your platform at a glance" />

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card p-5 flex items-center gap-4">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lesson accuracy chart */}
        <div className="card p-5 col-span-2">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Lesson Accuracy (hardest first)</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Avg Accuracy']} />
                <Bar dataKey="accuracy" fill="#4A90E2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No completion data yet</div>
          )}
        </div>

        {/* Recent completions */}
        <div className="card p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Recent Completions</h2>
          <div className="space-y-3">
            {(stats?.recentCompletions ?? []).length === 0 && (
              <p className="text-gray-400 text-sm">No completions yet</p>
            )}
            {(stats?.recentCompletions ?? []).map((c: any) => (
              <div key={c.id} className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {c.user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{c.user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{c.lesson.title}</p>
                  <p className="text-xs text-gray-300">{formatDate(c.completedAt)}</p>
                </div>
                <div className="ml-auto shrink-0">
                  {'⭐'.repeat(c.stars)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
