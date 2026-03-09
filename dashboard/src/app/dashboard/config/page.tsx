'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Save } from 'lucide-react';

const CONFIG_DEFINITIONS = [
  { key: 'hearts_per_refill', label: 'Hearts Refilled per Interval', type: 'number', desc: 'How many hearts regenerate each interval' },
  { key: 'heart_refill_minutes', label: 'Heart Refill Interval (minutes)', type: 'number', desc: 'Minutes between each heart refill' },
  { key: 'max_hearts', label: 'Max Hearts', type: 'number', desc: 'Maximum hearts a user can have' },
  { key: 'daily_challenge_enabled', label: 'Daily Challenge Enabled', type: 'boolean', desc: 'Show the daily challenge card on home screen' },
  { key: 'double_xp_weekend', label: 'Double XP Weekend', type: 'boolean', desc: 'Enable 2x XP for all lessons this weekend' },
  { key: 'min_app_version', label: 'Minimum App Version', type: 'string', desc: 'Force update if app is below this version' },
];

export default function ConfigPage() {
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ['app-config'],
    queryFn: adminApi.getConfig,
    onSuccess: (d: any) => setValues(d ?? {}),
  } as any);

  const saveMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: any }) => adminApi.setConfig(key, value),
    onSuccess: (_, { key }) => {
      qc.invalidateQueries({ queryKey: ['app-config'] });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    },
  });

  function handleSave(key: string, type: string) {
    let value = values[key];
    if (type === 'number') value = Number(value);
    if (type === 'boolean') value = Boolean(value);
    saveMutation.mutate({ key, value });
  }

  return (
    <div>
      <Header title="App Config" subtitle="Live settings pushed to the Flutter app" />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {CONFIG_DEFINITIONS.map((def) => (
            <div key={def.key} className="card p-5 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm">{def.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{def.desc}</p>
                <p className="text-xs font-mono text-gray-300 mt-1">{def.key}</p>
              </div>

              <div className="flex items-center gap-3">
                {def.type === 'boolean' ? (
                  <button
                    onClick={() => setValues((v) => ({ ...v, [def.key]: !v[def.key] }))}
                    className={`w-11 h-6 rounded-full transition-colors relative ${values[def.key] ? 'bg-brand-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${values[def.key] ? 'translate-x-5' : ''}`} />
                  </button>
                ) : (
                  <input
                    type={def.type}
                    value={values[def.key] ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [def.key]: e.target.value }))}
                    className="input w-36 text-center"
                  />
                )}

                <button
                  className={`btn-primary text-xs ${saved === def.key ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  onClick={() => handleSave(def.key, def.type)}
                  disabled={saveMutation.isPending}
                >
                  <Save size={13} />
                  {saved === def.key ? 'Saved!' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
