'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsApi, exercisesApi, exerciseTypesApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { ExerciseEditor } from '@/components/exercises/ExerciseEditor';
import { ExerciseCard } from '@/components/exercises/ExerciseCard';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { EXERCISE_TYPES } from '@/lib/utils';
import Link from 'next/link';
import { Plus, ChevronRight } from 'lucide-react';

export default function LessonDetailPage() {
  const { courseId, unitId, lessonId } = useParams<{ courseId: string; unitId: string; lessonId: string }>();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('translate');

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => lessonsApi.get(lessonId),
  });

  const { data: dynamicTypes } = useQuery({
    queryKey: ['exercise-types'],
    queryFn: () => exerciseTypesApi.list(true),
    staleTime: 5 * 60 * 1000,
  });

  // Use DB types if loaded, fall back to static list
  const exerciseTypes = dynamicTypes?.length
    ? dynamicTypes.map((t: any) => ({ value: t.slug, label: t.name, icon: t.icon, desc: t.description }))
    : EXERCISE_TYPES;

  const exercises: any[] = lesson?.exercises ?? [];

  const createEx = useMutation({
    mutationFn: (data: any) => exercisesApi.create(lessonId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lesson', lessonId] }); setShowAdd(false); },
  });

  const updateEx = useMutation({
    mutationFn: ({ id, data }: any) => exercisesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['lesson', lessonId] }); setEditing(null); },
  });

  const deleteEx = useMutation({
    mutationFn: (id: string) => exercisesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lesson', lessonId] }),
  });

  const reorderEx = useMutation({
    mutationFn: (ids: string[]) => exercisesApi.reorder(lessonId, ids),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = exercises.findIndex((e) => e.id === active.id);
    const newIndex = exercises.findIndex((e) => e.id === over.id);
    const newOrder = arrayMove(exercises, oldIndex, newIndex);
    reorderEx.mutate(newOrder.map((e) => e.id));
    qc.setQueryData(['lesson', lessonId], (old: any) => ({
      ...old,
      exercises: newOrder,
    }));
  }

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-4 flex-wrap">
        <Link href="/dashboard/courses" className="hover:text-brand-500">Courses</Link>
        <ChevronRight size={13} />
        <Link href={`/dashboard/courses/${courseId}`} className="hover:text-brand-500">{lesson?.unit?.course?.title}</Link>
        <ChevronRight size={13} />
        <span>{lesson?.unit?.title}</span>
        <ChevronRight size={13} />
        <span className="text-gray-700 font-medium">{lesson?.title}</span>
      </div>

      <Header
        title={lesson?.title ?? ''}
        subtitle={`${exercises.length} exercises · ${lesson?.xpReward} XP · ~${lesson?.estimatedMinutes} min`}
        action={
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Exercise
          </button>
        }
      />

      {/* Lesson meta */}
      <div className="card p-4 mb-6 grid grid-cols-4 gap-4 text-center">
        {[
          { label: 'XP Reward', value: `${lesson?.xpReward} XP` },
          { label: 'Difficulty', value: '⭐'.repeat(lesson?.difficulty ?? 1) },
          { label: 'Est. Time', value: `${lesson?.estimatedMinutes} min` },
          { label: 'Status', value: lesson?.isPublished ? '● Live' : '○ Draft' },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Exercise list — drag to reorder */}
      {exercises.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">✏️</p>
          <p className="text-gray-500 text-sm">No exercises yet. Add the first one.</p>
          <button className="btn-primary mt-4" onClick={() => setShowAdd(true)}><Plus size={16} /> Add Exercise</button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={exercises.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {exercises.map((ex, i) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  index={i}
                  onEdit={() => setEditing(ex)}
                  onDelete={() => {
                    if (confirm('Delete this exercise?')) deleteEx.mutate(ex.id);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Exercise Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Exercise" size="xl">
        {/* Type picker */}
        <div className="mb-5">
          <p className="label mb-2">Exercise Type</p>
          <div className="grid grid-cols-5 gap-2">
            {exerciseTypes.map((t: any) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedType(t.value)}
                className={`p-2.5 rounded-xl border-2 text-center transition-all ${selectedType === t.value ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <p className="text-xl">{t.icon}</p>
                <p className="text-xs font-semibold text-gray-700 mt-0.5">{t.label}</p>
              </button>
            ))}
          </div>
        </div>
        <ExerciseEditor
          type={selectedType}
          orderIndex={exercises.length}
          onSubmit={(data) => createEx.mutate(data)}
          loading={createEx.isPending}
          error={createEx.error}
        />
      </Modal>

      {/* Edit Exercise Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Exercise" size="xl">
        {editing && (
          <ExerciseEditor
            type={editing.type}
            initial={editing}
            orderIndex={editing.orderIndex}
            onSubmit={(data) => updateEx.mutate({ id: editing.id, data })}
            loading={updateEx.isPending}
            error={updateEx.error}
          />
        )}
      </Modal>
    </div>
  );
}
