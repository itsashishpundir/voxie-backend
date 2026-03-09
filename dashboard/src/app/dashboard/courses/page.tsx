'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { CourseForm } from '@/components/courses/CourseForm';
import { formatDate, slugify } from '@/lib/utils';
import Link from 'next/link';
import { Plus, Globe, Lock, Pencil, Trash2, ExternalLink } from 'lucide-react';

export default function CoursesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: coursesApi.list,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => coursesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setShowCreate(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => coursesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); setEditing(null); },
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? coursesApi.publish(id) : coursesApi.unpublish(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: coursesApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });

  function handleCreate(values: any) {
    createMutation.mutate({ ...values, slug: values.slug || slugify(values.title) });
  }

  function handleUpdate(values: any) {
    updateMutation.mutate({ id: editing.id, data: values });
  }

  function handleDelete(course: any) {
    if (confirm(`Delete "${course.title}"? This will delete all units, lessons, and exercises.`)) {
      deleteMutation.mutate(course.id);
    }
  }

  return (
    <div>
      <Header
        title="Courses"
        subtitle={`${courses.length} course${courses.length !== 1 ? 's' : ''}`}
        action={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Course
          </button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-500 text-sm">No courses yet. Create your first one.</p>
          <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {courses.map((course: any) => (
            <div key={course.id} className="card p-5 flex items-center gap-4">
              {/* Thumbnail / Flag */}
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl shrink-0">
                {course.targetLanguage === 'es' ? '🇪🇸' :
                 course.targetLanguage === 'fr' ? '🇫🇷' :
                 course.targetLanguage === 'de' ? '🇩🇪' : '🌍'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <span className={course.isPublished ? 'badge-green' : 'badge-yellow'}>
                    {course.isPublished ? '● Live' : '○ Draft'}
                  </span>
                  <span className="badge-blue">{course.level}</span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5 truncate">{course.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span>{course._count?.units ?? 0} units</span>
                  <span>{course.sourceLanguage.toUpperCase()} → {course.targetLanguage.toUpperCase()}</span>
                  <span>v{course.version}</span>
                  <span>Updated {formatDate(course.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/dashboard/courses/${course.id}`} className="btn-secondary text-xs">
                  <ExternalLink size={13} /> Manage
                </Link>
                <button
                  className={course.isPublished ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
                  onClick={() => publishMutation.mutate({ id: course.id, publish: !course.isPublished })}
                >
                  {course.isPublished ? <><Lock size={13} /> Unpublish</> : <><Globe size={13} /> Publish</>}
                </button>
                <button className="btn-ghost p-2" onClick={() => setEditing(course)}>
                  <Pencil size={14} />
                </button>
                <button className="btn-ghost p-2 text-red-500 hover:bg-red-50" onClick={() => handleDelete(course)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Course">
        <CourseForm
          onSubmit={handleCreate}
          loading={createMutation.isPending}
          error={createMutation.error as any}
        />
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Course">
        <CourseForm
          initial={editing}
          onSubmit={handleUpdate}
          loading={updateMutation.isPending}
          error={updateMutation.error as any}
        />
      </Modal>
    </div>
  );
}
