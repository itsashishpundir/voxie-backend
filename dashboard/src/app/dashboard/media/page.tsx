'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mediaApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { formatDate } from '@/lib/utils';
import { Upload, Trash2, Copy, Music, Image } from 'lucide-react';

export default function MediaPage() {
  const qc = useQueryClient();
  const [type, setType] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['media', type],
    queryFn: () => mediaApi.list(type || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: mediaApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await mediaApi.upload(file);
      qc.invalidateQueries({ queryKey: ['media'] });
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div>
      <Header
        title="Media Library"
        subtitle={`${files.length} files`}
        action={
          <label className={`btn-primary cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload File'}
            <input ref={fileRef} type="file" className="hidden" accept="image/*,audio/*" onChange={handleUpload} />
          </label>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {[
          { value: '', label: 'All' },
          { value: 'audio', label: '🎵 Audio' },
          { value: 'image', label: '🖼️ Images' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setType(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${type === tab.value ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📁</p>
          <p className="text-gray-500 text-sm">No files yet. Upload an image or audio file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {files.map((file: any) => (
            <div key={file.id} className="card p-4">
              {/* Preview */}
              <div className="w-full h-28 rounded-lg bg-gray-50 flex items-center justify-center mb-3 overflow-hidden">
                {file.type === 'image' ? (
                  <img src={file.url} alt={file.filename} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Music size={32} className="text-brand-400" />
                    <audio controls className="w-full scale-75 origin-center">
                      <source src={file.url} />
                    </audio>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{file.filename}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatSize(file.size)} · {formatDate(file.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                <button
                  className="btn-secondary text-xs flex-1"
                  onClick={() => copyUrl(file.url)}
                >
                  <Copy size={12} />
                  {copied === file.url ? 'Copied!' : 'Copy URL'}
                </button>
                <button
                  className="btn-ghost p-2 text-red-500 hover:bg-red-50"
                  onClick={() => { if (confirm('Delete this file?')) deleteMutation.mutate(file.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
