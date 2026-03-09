'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, unitsApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/ui/Modal';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { slugify } from '@/lib/utils';
import Link from 'next/link';
import { Plus, GripVertical, Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

// ── Sortable unit row ─────────────────────────────────────────────────────
function SortableUnit({ unit, onEdit, onDelete, courseId }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: unit.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const [expanded, setExpanded] = useState(false);

  return (
    <div ref={setNodeRef} style={style} className="card mb-3">
      {/* Unit header */}
      <div className="flex items-center gap-3 p-4">
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing">
          <GripVertical size={16} />
        </button>
        <span className="text-xl">{unit.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">{unit.title}</p>
            <span className="badge-gray">{unit._count?.lessons ?? 0} lessons</span>
            {!unit.isPublished && <span className="badge-yellow">Draft</span>}
          </div>
          <p className="text-xs text-gray-400 truncate">{unit.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/courses/${courseId}/units/${unit.id}`} className="btn-secondary text-xs">
            <ChevronRight size={13} /> Open
          </Link>
          <button className="btn-ghost p-2" onClick={() => onEdit(unit)}><Pencil size={14} /></button>
          <button className="btn-ghost p-2 text-red-500 hover:bg-red-50" onClick={() => onDelete(unit)}><Trash2 size={14} /></button>
          <button className="btn-ghost p-2" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* Lessons preview */}
      {expanded && unit.lessons && (
        <div className="border-t border-gray-50 px-4 pb-3 pt-2">
          {unit.lessons.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No lessons yet</p>
          ) : (
            <div className="space-y-1">
              {unit.lessons.map((l: any, i: number) => (
                <div key={l.id} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50">
                  <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                  <span className="text-sm text-gray-700 flex-1">{l.title}</span>
                  <span className="text-xs text-gray-400">{l._count?.exercises ?? 0} exercises</span>
                  <span className="badge-blue text-xs">{l.xpReward} XP</span>
                  <Link href={`/dashboard/courses/${courseId}/units/${unit.id}/lessons/${l.id}`}
                    className="text-xs text-brand-500 hover:underline">Edit</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const qc = useQueryClient();
  const [showUnit, setShowUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);

  // Fetch course metadata only (title, level, etc.)
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.get(courseId),
  });

  // Fetch units separately — this uses the admin-aware list endpoint
  // which correctly returns ALL units (including drafts) when authenticated as admin
  const { data: units = [], isLoading: unitsLoading } = useQuery({
    queryKey: ['units', courseId],
    queryFn: () => unitsApi.list(courseId),
    enabled: !!courseId,
  });

  const createUnit = useMutation({
    mutationFn: (data: any) => unitsApi.create(courseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units', courseId] });
      setShowUnit(false);
    },
  });

  const updateUnit = useMutation({
    mutationFn: ({ id, data }: any) => unitsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units', courseId] });
      setEditingUnit(null);
    },
  });

  const deleteUnit = useMutation({
    mutationFn: (id: string) => unitsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['units', courseId] });
    },
  });

  const reorderUnits = useMutation({
    mutationFn: (ids: string[]) => unitsApi.reorder(courseId, ids),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = units.findIndex((u: any) => u.id === active.id);
    const newIndex = units.findIndex((u: any) => u.id === over.id);
    const newOrder = arrayMove(units, oldIndex, newIndex);
    const newIds = newOrder.map((u: any) => u.id);
    // Optimistic update
    qc.setQueryData(['units', courseId], newOrder);
    reorderUnits.mutate(newIds);
  }

  const isLoading = courseLoading || unitsLoading;
  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Link href="/dashboard/courses" className="hover:text-brand-500">Courses</Link>
        <ChevronRight size={14} />
        <span className="text-gray-700 font-medium">{course?.title}</span>
      </div>

      <Header
        title={course?.title ?? ''}
        subtitle={`${units.length} units · ${course?.targetLanguage?.toUpperCase()} · ${course?.level}`}
        action={
          <button className="btn-primary" onClick={() => setShowUnit(true)}>
            <Plus size={16} /> Add Unit
          </button>
        }
      />

      {units.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-500 text-sm">No units yet. Add the first unit.</p>
          <button className="btn-primary mt-4" onClick={() => setShowUnit(true)}><Plus size={16} /> Add Unit</button>
        </div>
      ) : (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={units.map((u: any) => u.id)} strategy={verticalListSortingStrategy}>
            {units.map((unit: any) => (
              <SortableUnit
                key={unit.id}
                unit={unit}
                courseId={courseId}
                onEdit={setEditingUnit}
                onDelete={(u: any) => {
                  if (confirm(`Delete unit "${u.title}"?`)) deleteUnit.mutate(u.id);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Create Unit Modal */}
      <Modal open={showUnit} onClose={() => setShowUnit(false)} title="Add Unit">
        <UnitForm onSubmit={(d) => createUnit.mutate(d)} loading={createUnit.isPending} unitCount={units.length} />
      </Modal>

      {/* Edit Unit Modal */}
      <Modal open={!!editingUnit} onClose={() => setEditingUnit(null)} title="Edit Unit">
        <UnitForm initial={editingUnit} onSubmit={(d) => updateUnit.mutate({ id: editingUnit.id, data: d })} loading={updateUnit.isPending} unitCount={units.length} />
      </Modal>
    </div>
  );
}

function UnitForm({ initial, onSubmit, loading, unitCount }: any) {
  const { register, handleSubmit, watch, setValue } = useForm({ defaultValues: {
    title: initial?.title ?? '', slug: initial?.slug ?? '',
    description: initial?.description ?? '', icon: initial?.icon ?? '📚',
    color: initial?.color ?? '#4A90E2',
    tips: Array.isArray(initial?.tips) ? initial.tips.join('\n') : (initial?.tips ?? ''),
    isPublished: initial?.isPublished ?? true,
    orderIndex: initial?.orderIndex ?? unitCount,
  }});
  const title = watch('title');

  return (
    <form onSubmit={handleSubmit((d) => onSubmit({ ...d, orderIndex: Number(d.orderIndex), tips: d.tips ? d.tips.split('\n').filter(Boolean) : [] }))} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><label className="label">Title</label><input {...register('title')} onBlur={() => !initial && setValue('slug', slugify(title))} className="input" placeholder="Greetings" required /></div>
        <div><label className="label">Slug</label><input {...register('slug')} className="input font-mono text-xs" required /></div>
        <div><label className="label">Icon (emoji)</label><input {...register('icon')} className="input text-2xl text-center" maxLength={2} /></div>
        <div className="col-span-2"><label className="label">Description</label><textarea {...register('description')} className="input resize-none" rows={2} /></div>
        <div><label className="label">Color</label><input type="color" {...register('color')} className="input h-9 px-1 py-1 cursor-pointer" /></div>
        <div><label className="label">Order</label><input type="number" {...register('orderIndex')} className="input" min={0} /></div>
        <div className="col-span-2"><label className="label">Tips (one per line)</label><textarea {...register('tips')} className="input resize-none font-mono text-xs" rows={3} placeholder="Spanish has two genders: masculine and feminine." /></div>
        <div className="col-span-2 flex items-center gap-2"><input type="checkbox" {...register('isPublished')} id="pub" /><label htmlFor="pub" className="text-sm text-gray-700">Published</label></div>
      </div>
      <div className="flex justify-end"><button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : initial ? 'Update' : 'Create Unit'}</button></div>
    </form>
  );
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useForm } = require('react-hook-form');
