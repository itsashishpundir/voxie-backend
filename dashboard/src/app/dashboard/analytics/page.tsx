'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AnalyticsPage() {
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['exercise-analytics'],
    queryFn: adminApi.exerciseAnalytics,
  });

  const chartData = analytics.map((item: any) => ({
    name: item.lessonTitle.length > 16 ? item.lessonTitle.slice(0, 16) + '…' : item.lessonTitle,
    accuracy: item.avgAccuracy,
    attempts: item.attempts,
    stars: parseFloat(item.avgStars ?? '0'),
  }));

  return (
    <div>
      <Header title="Analytics" subtitle="Lesson performance insights" />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : analytics.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500 text-sm">No data yet. Analytics appear once users complete lessons.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Accuracy chart */}
          <div className="card p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-1">Average Accuracy by Lesson</h2>
            <p className="text-xs text-gray-400 mb-4">Lower accuracy = harder lesson — consider adding hints or easier exercises</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -15, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v}%`, 'Avg Accuracy']} />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.accuracy < 50 ? '#ef4444' : entry.accuracy < 75 ? '#f59e0b' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-700">Lesson Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lesson</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Attempts</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Accuracy</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avg Stars</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {analytics.map((item: any) => (
                  <tr key={item.lessonId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{item.lessonTitle}</td>
                    <td className="px-5 py-3 text-gray-600">{item.attempts}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.avgAccuracy}%`,
                              backgroundColor: item.avgAccuracy < 50 ? '#ef4444' : item.avgAccuracy < 75 ? '#f59e0b' : '#22c55e',
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{item.avgAccuracy}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">{'⭐'.repeat(Math.round(parseFloat(item.avgStars ?? '0')))}</td>
                    <td className="px-5 py-3">
                      <span className={item.avgAccuracy < 50 ? 'badge-red' : item.avgAccuracy < 75 ? 'badge-yellow' : 'badge-green'}>
                        {item.avgAccuracy < 50 ? '⚠ Needs work' : item.avgAccuracy < 75 ? '~ Fair' : '✓ Good'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
