'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EXERCISE_TYPES } from '@/lib/utils';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

interface Props {
  exercise: any;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExerciseCard({ exercise, index, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exercise.id });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const typeMeta = EXERCISE_TYPES.find((t) => t.value === exercise.type);

  function getPreview() {
    const d = exercise.data as any;
    switch (exercise.type) {
      // Original 10
      case 'translate':           return `"${d.question}" → ${d.options?.[d.correctIndex] ?? '?'}`;
      case 'match':               return `${d.pairs?.length ?? 0} pairs`;
      case 'fill':                return d.sentence?.replace('___', `[${d.correctText}]`) ?? '';
      case 'build':               return d.correctOrder?.join(' ') ?? '';
      case 'listen':              return `Audio: ${d.audioUrl ? '✓' : '✗'} · "${d.correctText}"`;
      case 'speak':               return `"${d.targetText}"`;
      case 'type_answer':         return `"${d.question}" → ${d.acceptedAnswers?.[0] ?? '?'}`;
      case 'conversation':        return `${d.turns?.length ?? 0} turns · "${d.characterName}"`;
      case 'image_select':        return `${d.options?.length ?? 0} options · correct: "${d.options?.[d.correctIndex]}"`;
      case 'story':               return (d.storyText?.slice(0, 60) ?? '') + (d.storyText?.length > 60 ? '…' : '');
      // New 13
      case 'mcq':                 return `"${d.question}" → ${d.options?.[d.correctIndex] ?? '?'}`;
      case 'sentence_building':   return `"${d.correctSentence}" · ${d.wordBank?.length ?? 0} tiles`;
      case 'crossword':           return `${d.words?.length ?? 0} words · ${d.gridSize ?? 8}×${d.gridSize ?? 8} grid`;
      case 'word_scramble':       return `${d.scrambledWord} → ${d.correctWord}`;
      case 'voice_pronunciation': return `"${d.targetText}"`;
      case 'word_matching':       return `${d.pairs?.length ?? 0} pairs${d.timeLimit ? ` · ${d.timeLimit}s` : ''}`;
      case 'speed_tap':           return `"${d.instruction}" · ${d.wordList?.length ?? 0} words · ${d.timeLimit ?? 15}s`;
      case 'flashcard':           return `${d.front} → ${d.back?.slice(0, 40)}${(d.back?.length ?? 0) > 40 ? '…' : ''}`;
      case 'picture_word':        return `🖼 → "${d.correctWord}"${d.options ? ` · ${d.options.length} choices` : ' (type)'}`;
      case 'category_sort':       return `${d.categories?.length ?? 0} categories · ${d.items?.length ?? 0} items`;
      case 'fill_blank':          return d.sentence?.replace('___', `[${d.correctText}]`) ?? '';
      case 'sentence_correction': return `"${d.incorrectSentence?.slice(0, 40)}" → fix`;
      case 'word_order':          return d.correctOrder?.join(' ') ?? '';
      default:                    return '';
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="card p-4 flex items-center gap-3">
      <button {...attributes} {...listeners} className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0">
        <GripVertical size={16} />
      </button>

      <div className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center shrink-0">
        {index + 1}
      </div>

      <div className="shrink-0 text-xl">{typeMeta?.icon ?? '❓'}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{typeMeta?.label}</span>
          {exercise.difficulty > 1 && <span className="badge-yellow">{'⭐'.repeat(exercise.difficulty)}</span>}
        </div>
        <p className="text-sm text-gray-700 font-medium mt-0.5 truncate">{exercise.prompt}</p>
        <p className="text-xs text-gray-400 truncate">{getPreview()}</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {exercise.hint && <span className="badge-gray text-xs">Hint</span>}
        {exercise.explanation && <span className="badge-blue text-xs">Explanation</span>}
        <button className="btn-ghost p-2" onClick={onEdit}><Pencil size={14} /></button>
        <button className="btn-ghost p-2 text-red-500 hover:bg-red-50" onClick={onDelete}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}
