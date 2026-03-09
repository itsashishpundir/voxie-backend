'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseTypesApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const UI_PATTERNS = [
  { value: 'choice',        label: 'Multiple Choice' },
  { value: 'text_input',    label: 'Text Input' },
  { value: 'pair_match',    label: 'Pair Match' },
  { value: 'word_order',    label: 'Word Order' },
  { value: 'word_scramble', label: 'Word Scramble' },
  { value: 'voice',         label: 'Voice / Speak' },
  { value: 'dialogue',      label: 'Dialogue' },
  { value: 'crossword',     label: 'Crossword' },
  { value: 'speed_tap',     label: 'Speed Tap' },
  { value: 'flashcard',     label: 'Flashcard' },
  { value: 'category_sort', label: 'Category Sort' },
  { value: 'correction',    label: 'Sentence Correction' },
  { value: 'dictation',     label: 'Dictation' },
];

const BLANK_FORM = { slug: '', name: '', icon: '📝', description: '', uiPattern: 'choice', isActive: true };

export default function ExerciseTypesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(BLANK_FORM);

  const { data: types = [], isLoading } = useQuery({
    queryKey: ['exercise-types'],
    queryFn: () => exerciseTypesApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => exerciseTypesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercise-types'] }); setShowForm(false); setForm(BLANK_FORM); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ slug, data }: any) => exerciseTypesApi.update(slug, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exercise-types'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (slug: string) => exerciseTypesApi.delete(slug),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exercise-types'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (slugs: string[]) => exerciseTypesApi.reorder(slugs),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = types.findIndex((t: any) => t.slug === active.id);
    const newIndex = types.findIndex((t: any) => t.slug === over.id);
    const newOrder = arrayMove(types, oldIndex, newIndex);
    reorderMutation.mutate(newOrder.map((t: any) => t.slug));
    qc.setQueryData(['exercise-types'], newOrder);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ slug: editing.slug, data: form });
    } else {
      createMutation.mutate(form);
    }
  }

  function startEdit(type: any) {
    setEditing(type);
    setForm({ slug: type.slug, name: type.name, icon: type.icon, description: type.description, uiPattern: type.uiPattern, isActive: type.isActive });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditing(null);
    setForm(BLANK_FORM);
  }

  const active = types.filter((t: any) => t.isActive);
  const inactive = types.filter((t: any) => !t.isActive);

  return (
    <div>
      <Header
        title="Exercise Types"
        subtitle={`${active.length} active · ${inactive.length} inactive · drag to reorder`}
        action={
          <button className="btn-primary" onClick={() => { setEditing(null); setForm(BLANK_FORM); setShowForm(true); }}>
            <Plus size={16} /> Add Type
          </button>
        }
      />

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card p-6 mb-6 border-2 border-brand-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{editing ? 'Edit Exercise Type' : 'New Exercise Type'}</h3>
            <button className="btn-ghost p-2" onClick={cancelForm}><X size={16} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Slug (unique ID, e.g. word_scramble)</label>
              <input
                className="input font-mono"
                placeholder="my_exercise_type"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') })}
                disabled={!!editing}
                required
              />
            </div>
            <div>
              <label className="label">Display Name</label>
              <input className="input" placeholder="Word Scramble" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Icon (emoji)</label>
              <input className="input text-2xl" placeholder="🔀" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div>
              <label className="label">UI Pattern (Flutter widget family)</label>
              <select className="input" value={form.uiPattern} onChange={(e) => setForm({ ...form, uiPattern: e.target.value })}>
                {UI_PATTERNS.map((p) => <option key={p.value} value={p.value}>{p.value} — {p.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Description</label>
              <input className="input" placeholder="Short description shown to content creators" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ia" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label htmlFor="ia" className="text-sm text-gray-700">Active (visible in lesson builder)</label>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={cancelForm}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                <Check size={14} /> {editing ? 'Save Changes' : 'Create Type'}
              </button>
            </div>
          </form>
          {(createMutation.error || updateMutation.error) && (
            <p className="text-red-500 text-sm mt-3">{(createMutation.error as any)?.response?.data?.message ?? 'Error saving'}</p>
          )}
        </div>
      )}

      {isLoading && <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}

      {/* Active Types */}
      {active.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Active ({active.length})</p>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={types.map((t: any) => t.slug)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {active.map((type: any) => (
                  <TypeRow key={type.slug} type={type} onEdit={startEdit} onDelete={(slug) => { if (confirm(`Delete "${slug}"? This won't delete existing exercises.`)) deleteMutation.mutate(slug); }} onToggle={(slug) => updateMutation.mutate({ slug, data: { isActive: false } })} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Inactive Types */}
      {inactive.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Inactive ({inactive.length})</p>
          <div className="space-y-2">
            {inactive.map((type: any) => (
              <TypeRow key={type.slug} type={type} onEdit={startEdit} onDelete={(slug) => { if (confirm(`Delete "${slug}"?`)) deleteMutation.mutate(slug); }} onToggle={(slug) => updateMutation.mutate({ slug, data: { isActive: true } })} />
            ))}
          </div>
        </div>
      )}

      {types.length === 0 && !isLoading && (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-3">🧩</p>
          <p className="text-gray-500 text-sm">No exercise types yet. Run the seed or add one above.</p>
        </div>
      )}
    </div>
  );
}

function TypeRow({ type, onEdit, onDelete, onToggle }: { type: any; onEdit: (t: any) => void; onDelete: (s: string) => void; onToggle: (s: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: type.slug });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`card p-4 flex items-center gap-3 ${!type.isActive ? 'opacity-50' : ''}`}>
      {type.isActive && (
        <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical size={16} />
        </button>
      )}
      {!type.isActive && <div className="w-4 shrink-0" />}

      <div className="text-2xl shrink-0">{type.icon}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-900">{type.name}</span>
          <span className="badge-gray font-mono text-xs">{type.slug}</span>
          <span className="badge-blue text-xs">{type.uiPattern}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{type.description}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${type.isActive ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          onClick={() => onToggle(type.slug)}
          title={type.isActive ? 'Click to deactivate' : 'Click to activate'}
        >
          {type.isActive ? '● Active' : '○ Inactive'}
        </button>
        <button className="btn-ghost p-2" onClick={() => onEdit(type)}><Pencil size={14} /></button>
        <button className="btn-ghost p-2 text-red-500 hover:bg-red-50" onClick={() => onDelete(type.slug)}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
