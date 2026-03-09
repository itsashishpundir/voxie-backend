'use client';

import { useForm } from 'react-hook-form';
import { slugify } from '@/lib/utils';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' }, { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' }, { code: 'pt', name: 'Portuguese' },
  { code: 'ja', name: 'Japanese' }, { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' }, { code: 'ar', name: 'Arabic' },
];

interface CourseFormProps {
  initial?: any;
  onSubmit: (data: any) => void;
  loading?: boolean;
  error?: any;
}

export function CourseForm({ initial, onSubmit, loading, error }: CourseFormProps) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      description: initial?.description ?? '',
      sourceLanguage: initial?.sourceLanguage ?? 'en',
      targetLanguage: initial?.targetLanguage ?? 'es',
      level: initial?.level ?? 'A1',
      difficulty: initial?.difficulty ?? 'beginner',
      tags: initial?.tags?.join(', ') ?? '',
    },
  });

  const title = watch('title');

  function handleTitleBlur() {
    if (!initial && title) {
      setValue('slug', slugify(title));
    }
  }

  function handleFormSubmit(data: any) {
    onSubmit({
      ...data,
      tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Course Title</label>
          <input {...register('title')} onBlur={handleTitleBlur} className="input" placeholder="Spanish Basics" required />
        </div>
        <div className="col-span-2">
          <label className="label">Slug</label>
          <input {...register('slug')} className="input font-mono text-xs" placeholder="spanish-basics" required />
        </div>
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea {...register('description')} className="input resize-none" rows={3} placeholder="What will learners achieve?" required />
        </div>
        <div>
          <label className="label">Source Language</label>
          <select {...register('sourceLanguage')} className="input">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Target Language</label>
          <select {...register('targetLanguage')} className="input">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">CEFR Level</label>
          <select {...register('level')} className="input">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Difficulty</label>
          <select {...register('difficulty')} className="input capitalize">
            {DIFFICULTIES.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <label className="label">Tags (comma-separated)</label>
          <input {...register('tags')} className="input" placeholder="spanish, beginner, travel" />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{error?.response?.data?.message ?? 'Something went wrong'}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Course' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}
