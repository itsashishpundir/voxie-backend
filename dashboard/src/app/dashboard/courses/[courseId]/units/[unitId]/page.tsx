'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonsApi, coursesApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useForm } from 'react-hook-form';
import { slugify } from '@/lib/utils';
import Link from 'next/link';
import { Plus, GripVertical, Pencil, Trash2, ChevronRight } from 'lucide-react';

const LESSON_TYPES = [
  { value: 'mixed',          emoji: '🎲', label: 'Mixed',          desc: 'All exercise types combined' },
  { value: 'learning',       emoji: '📚', label: 'Learning',       desc: 'Teach vocabulary with cards first' },
  { value: 'mcq',            emoji: '🎯', label: 'Multiple Choice', desc: 'Pick the correct answer' },
  { value: 'fill_blank',     emoji: '✏️', label: 'Fill in Blank',  desc: 'Complete the missing word' },
  { value: 'build_sentence', emoji: '🧩', label: 'Build Sentence', desc: 'Arrange word tiles in order' },
  { value: 'listen',         emoji: '🎧', label: 'Listening',      desc: 'Hear and identify words' },
  { value: 'speak',          emoji: '🎤', label: 'Speaking',       desc: 'Pronunciation practice' },
  { value: 'match',          emoji: '🔗', label: 'Matching',       desc: 'Connect words to translations' },
  { value: 'story',          emoji: '📖', label: 'Story',          desc: 'Read and answer questions' },
  { value: 'conversation',   emoji: '💬', label: 'Conversation',   desc: 'Dialogue role-play' },
  { value: 'review',         emoji: '⭐', label: 'Review',         desc: 'Spaced repetition review' },
] as const;

type LessonTypeValue = typeof LESSON_TYPES[number]['value'];

function lessonTypeMeta(value: string) {
  return LESSON_TYPES.find(t => t.value === value) ?? LESSON_TYPES[0];
}

function SortableLesson({ lesson, courseId, unitId, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="card p-4 flex items-center gap-3">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 text-sm font-bold flex items-center justify-center shrink-0">
        {lesson.orderIndex + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900">{lesson.title}</p>
          {!lesson.isPublished && <span className="badge-yellow">Draft</span>}
          <span className="badge-blue">{lesson.xpReward} XP</span>
          <span className="badge-gray">{lesson._count?.exercises ?? 0} exercises</span>
          {lesson.lessonType && lesson.lessonType !== 'mixed' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              {lessonTypeMeta(lesson.lessonType).emoji} {lessonTypeMeta(lesson.lessonType).label}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{'⭐'.repeat(lesson.difficulty)} · ~{lesson.estimatedMinutes} min</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href={`/dashboard/courses/${courseId}/units/${unitId}/lessons/${lesson.id}`} className="btn-secondary text-xs">
          <ChevronRight size={13} /> Edit Exercises
        </Link>
        <button className="btn-ghost p-2" onClick={() => onEdit(lesson)}><Pencil size={14} /></button>
        <button className="btn-ghost p-2 text-red-500 hover:bg-red-50" onClick={() => onDelete(lesson)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export default function UnitDetailPage() {
  const { courseId, unitId } = useParams<{ courseId: string; unitId: string }>();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const { data: course } = useQuery({ queryKey: ['course', courseId], queryFn: () => coursesApi.get(courseId) });
  const unit = course?.units?.find((u: any) => u.id === unitId);
  const lessons: any[] = unit?.lessons ?? [];

  const createLesson = useMutation({
    mutationFn: (data: any) => lessonsApi.create(unitId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['course', courseId] }); setShowCreate(false); },
  });

  const updateLesson = useMutation({
    mutationFn: ({ id, data }: any) => lessonsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['course', courseId] }); setEditing(null); },
  });

  const deleteLesson = useMutation({
    mutationFn: (id: string) => lessonsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['course', courseId] }),
  });

  const reorderLessons = useMutation({
    mutationFn: (ids: string[]) => lessonsApi.reorder(unitId, ids),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    const newOrder = arrayMove(lessons, oldIndex, newIndex);
    reorderLessons.mutate(newOrder.map((l) => l.id));
    qc.setQueryData(['course', courseId], (old: any) => ({
      ...old,
      units: old.units.map((u: any) => u.id === unitId ? { ...u, lessons: newOrder } : u),
    }));
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-4">
        <Link href="/dashboard/courses" className="hover:text-brand-500">Courses</Link>
        <ChevronRight size={13} />
        <Link href={`/dashboard/courses/${courseId}`} className="hover:text-brand-500">{course?.title}</Link>
        <ChevronRight size={13} />
        <span className="text-gray-700 font-medium">{unit?.title}</span>
      </div>

      <Header
        title={unit?.title ?? ''}
        subtitle={`${lessons.length} lessons · ${unit?.icon}`}
        action={
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Add Lesson
          </button>
        }
      />

      {lessons.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500 text-sm">No lessons yet. Add the first lesson.</p>
          <button className="btn-primary mt-4" onClick={() => setShowCreate(true)}><Plus size={16} /> Add Lesson</button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <SortableLesson key={lesson.id} lesson={lesson} courseId={courseId} unitId={unitId}
                  onEdit={setEditing}
                  onDelete={(l: any) => { if (confirm(`Delete "${l.title}"?`)) deleteLesson.mutate(l.id); }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Lesson">
        <LessonForm onSubmit={(d: any) => createLesson.mutate(d)} loading={createLesson.isPending} lessonCount={lessons.length} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Lesson">
        <LessonForm initial={editing} onSubmit={(d: any) => updateLesson.mutate({ id: editing.id, data: d })} loading={updateLesson.isPending} lessonCount={lessons.length} />
      </Modal>
    </div>
  );
}

function LessonForm({ initial, onSubmit, loading, lessonCount }: any) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug ?? '',
      lessonType: (initial?.lessonType ?? 'mixed') as LessonTypeValue,
      xpReward: initial?.xpReward ?? 50,
      difficulty: initial?.difficulty ?? 1,
      estimatedMinutes: initial?.estimatedMinutes ?? 5,
      isPublished: initial?.isPublished ?? true,
      tips: initial?.tips ?? '',
      orderIndex: initial?.orderIndex ?? lessonCount,
    },
  });
  const title = watch('title');
  const selectedType = watch('lessonType');

  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSubmit({
          ...d,
          xpReward: Number(d.xpReward),
          difficulty: Number(d.difficulty),
          estimatedMinutes: Number(d.estimatedMinutes),
          orderIndex: Number(d.orderIndex),
        })
      )}
      className="space-y-5"
    >
      {/* Lesson Type Picker */}
      <div>
        <label className="label mb-2">Lesson Type</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LESSON_TYPES.map((t) => {
            const active = selectedType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('lessonType', t.value)}
                className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                  active
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <span className="text-xl leading-none mt-0.5">{t.emoji}</span>
                <div>
                  <p className={`text-xs font-bold leading-tight ${active ? 'text-purple-700' : 'text-gray-800'}`}>
                    {t.label}
                  </p>
                  <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{t.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register('lessonType')} />
      </div>

      {/* Core fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Title</label>
          <input
            {...register('title')}
            onBlur={() => !initial && setValue('slug', slugify(title))}
            className="input"
            placeholder="Hello & Goodbye"
            required
          />
        </div>
        <div>
          <label className="label">Slug</label>
          <input {...register('slug')} className="input font-mono text-xs" required />
        </div>
        <div>
          <label className="label">Order</label>
          <input type="number" {...register('orderIndex')} className="input" min={0} />
        </div>
        <div>
          <label className="label">XP Reward</label>
          <input type="number" {...register('xpReward')} className="input" min={0} />
        </div>
        <div>
          <label className="label">Difficulty (1–5)</label>
          <select {...register('difficulty')} className="input">
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} {'⭐'.repeat(n)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Est. Minutes</label>
          <input type="number" {...register('estimatedMinutes')} className="input" min={1} />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" {...register('isPublished')} id="lpub" />
          <label htmlFor="lpub" className="text-sm text-gray-700">Published</label>
        </div>
        <div className="col-span-2">
          <label className="label">Tips (shown in lesson path)</label>
          <input {...register('tips')} className="input" placeholder="In Spanish, adjectives follow nouns." />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Lesson' : 'Create Lesson'}
        </button>
      </div>
    </form>
  );
}
