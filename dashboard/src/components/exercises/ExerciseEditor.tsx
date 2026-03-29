'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  type: string;
  initial?: any;
  orderIndex: number;
  onSubmit: (data: any) => void;
  loading?: boolean;
  error?: any;
}

export function ExerciseEditor({ type, initial, orderIndex, onSubmit, loading, error }: Props) {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      prompt: initial?.prompt ?? '',
      difficulty: initial?.difficulty ?? 1,
      hint: initial?.hint ?? '',
      explanation: initial?.explanation ?? '',
      note: initial?.note ?? '',
      ...(initial?.data ?? getDefaultData(type)),
    },
  });

  const pairsField    = useFieldArray({ control, name: 'pairs' });
  const turnsField    = useFieldArray({ control, name: 'turns' });
  const answersField  = useFieldArray({ control, name: 'acceptedAnswers' });
  const wordBankField = useFieldArray({ control, name: 'wordBank' });
  const cluesField    = useFieldArray({ control, name: 'words' }); // crossword
  const itemsField    = useFieldArray({ control, name: 'items' }); // category_sort
  const catsField     = useFieldArray({ control, name: 'categories' }); // category_sort
  const wordListField = useFieldArray({ control, name: 'wordList' }); // speed_tap

  function handleFormSubmit(values: any) {
    const { prompt, difficulty, hint, explanation, note, ...rest } = values;
    const data = buildData(type, rest);
    onSubmit({ type, prompt, difficulty: Number(difficulty), hint: hint || null, explanation: explanation || null, note: note || null, orderIndex, data });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Common fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Prompt (instruction shown to user)</label>
          <input {...register('prompt')} className="input" placeholder="What does this mean?" required />
        </div>
        <div>
          <label className="label">Difficulty (1–5)</label>
          <select {...register('difficulty')} className="input">
            {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} {'⭐'.repeat(n)}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Hint (optional)</label>
          <input {...register('hint')} className="input" placeholder="Shown when wrong" />
        </div>
        <div className="col-span-2">
          <label className="label">Explanation (shown in feedback overlay)</label>
          <input {...register('explanation')} className="input" placeholder="Why is this the correct answer?" />
        </div>
        <div className="col-span-2">
          <label className="label">Internal Note (not shown to users)</label>
          <input {...register('note')} className="input text-xs text-gray-500" placeholder="e.g. audio missing" />
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Type-specific fields */}
      <div>
        <p className="label mb-3">Exercise Content</p>

        {/* ── Original 10 ── */}
        {type === 'translate'           && <TranslateFields register={register} watch={watch} />}
        {type === 'match'               && <MatchFields register={register} pairsField={pairsField} />}
        {type === 'fill'                && <FillFields register={register} watch={watch} />}
        {type === 'build'               && <BuildFields register={register} />}
        {type === 'listen'              && <ListenFields register={register} watch={watch} />}
        {type === 'speak'               && <SpeakFields register={register} />}
        {type === 'type_answer'         && <TypeAnswerFields register={register} answersField={answersField} />}
        {type === 'conversation'        && <ConversationFields register={register} turnsField={turnsField} watch={watch} />}
        {type === 'image_select'        && <ImageSelectFields register={register} watch={watch} />}
        {type === 'story'               && <StoryFields register={register} watch={watch} />}

        {/* ── New 13 ── */}
        {type === 'mcq'                 && <McqFields register={register} watch={watch} />}
        {type === 'sentence_building'   && <SentenceBuildingFields register={register} wordBankField={wordBankField} />}
        {type === 'crossword'           && <CrosswordFields register={register} cluesField={cluesField} />}
        {type === 'word_scramble'       && <WordScrambleFields register={register} />}
        {type === 'voice_pronunciation' && <VoicePronunciationFields register={register} />}
        {type === 'word_matching'       && <WordMatchingFields register={register} pairsField={pairsField} />}
        {type === 'speed_tap'           && <SpeedTapFields register={register} wordListField={wordListField} watch={watch} />}
        {type === 'flashcard'           && <FlashcardFields register={register} />}
        {type === 'picture_word'        && <PictureWordFields register={register} watch={watch} />}
        {type === 'category_sort'       && <CategorySortFields register={register} catsField={catsField} itemsField={itemsField} watch={watch} />}
        {type === 'fill_blank'          && <FillBlankFields register={register} watch={watch} />}
        {type === 'sentence_correction' && <SentenceCorrectionFields register={register} />}
        {type === 'word_order'          && <WordOrderFields register={register} />}
      </div>

      {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg p-3">{(error as any)?.response?.data?.message ?? 'Something went wrong'}</p>}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Exercise' : 'Add Exercise'}
        </button>
      </div>
    </form>
  );
}

// ── Original type forms ───────────────────────────────────────────────────

function TranslateFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div><label className="label">Question (word/phrase in target language)</label><input {...register('question')} className="input" placeholder="Hola" required /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" placeholder="https://cdn.../hola.mp3" /></div>
      <div>
        <label className="label">Options (mark correct)</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} defaultChecked={i === 0} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} required />
              {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchFields({ register, pairsField }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0">Pairs</label>
        <button type="button" className="btn-secondary text-xs" onClick={() => pairsField.append({ left: '', right: '' })}><Plus size={12} /> Add Pair</button>
      </div>
      <div className="space-y-2">
        {pairsField.fields.map((field: any, i: number) => (
          <div key={field.id} className="flex items-center gap-2">
            <input {...register(`pairs.${i}.left`)} className="input" placeholder="Hola" required />
            <span className="text-gray-400">↔</span>
            <input {...register(`pairs.${i}.right`)} className="input" placeholder="Hello" required />
            <button type="button" className="btn-ghost p-2 text-red-500" onClick={() => pairsField.remove(i)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FillFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div><label className="label">Sentence (use ___ for blank)</label><input {...register('sentence')} className="input font-mono" placeholder="El ___ es rojo." required /></div>
      <div><label className="label">Translation hint (optional)</label><input {...register('translation')} className="input" placeholder="The ___ is red." /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
      <div>
        <label className="label">Options (mark the correct one)</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} defaultChecked={i === 0} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} required />
              {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuildFields({ register }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">English Translation (shown to user as the goal)</label><input {...register('translation')} className="input" placeholder="My name is Carlos" required /></div>
      <div><label className="label">Correct word order (space-separated)</label><input {...register('correctOrder')} className="input font-mono" placeholder="Yo me llamo Carlos" required /></div>
      <div><label className="label">Shuffled words (space-separated, include distractors)</label><input {...register('words')} className="input font-mono" placeholder="me Carlos llamo Yo soy" required /></div>
      <p className="text-xs text-gray-400">Both fields accept space-separated words. Stored as arrays.</p>
    </div>
  );
}

function ListenFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div><label className="label">Audio URL</label><input {...register('audioUrl')} className="input" placeholder="https://cdn.../buenos-dias.mp3" required /></div>
      <div><label className="label">Correct Text (what is heard)</label><input {...register('correctText')} className="input" placeholder="Buenos días" required /></div>
      <div>
        <label className="label">Options</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} defaultChecked={i === 0} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} required />
              {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpeakFields({ register }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Target Text (what the user should say)</label><input {...register('targetText')} className="input" placeholder="Buenos días" required /></div>
      <div><label className="label">Target Audio URL (optional)</label><input {...register('targetAudioUrl')} className="input" /></div>
      <div><label className="label">Accepted Pronunciations (comma-separated)</label><input {...register('acceptedPronunciations')} className="input" placeholder="buenos dias, buenos días" /></div>
    </div>
  );
}

function TypeAnswerFields({ register, answersField }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Question</label><input {...register('question')} className="input" placeholder="Good morning" required /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Accepted Answers</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => answersField.append('')}><Plus size={12} /> Add</button>
        </div>
        <div className="space-y-2">
          {answersField.fields.map((field: any, i: number) => (
            <div key={field.id} className="flex gap-2">
              <input {...register(`acceptedAnswers.${i}`)} className="input" placeholder="Buenos días" required />
              <button type="button" className="btn-ghost p-2 text-red-500" onClick={() => answersField.remove(i)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2"><input type="checkbox" {...register('caseSensitive')} id="cs" /><label htmlFor="cs" className="text-sm text-gray-700">Case sensitive</label></div>
    </div>
  );
}

function ConversationFields({ register, turnsField, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Character Name</label><input {...register('characterName')} className="input" placeholder="Sofia" required /></div>
        <div><label className="label">Character Avatar URL</label><input {...register('characterAvatar')} className="input" /></div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Conversation Turns</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => turnsField.append({ speaker: 'char', text: '', audioUrl: '' })}><Plus size={12} /> Add Turn</button>
        </div>
        <div className="space-y-2">
          {turnsField.fields.map((field: any, i: number) => (
            <div key={field.id} className="flex items-center gap-2">
              <select {...register(`turns.${i}.speaker`)} className="input w-24 shrink-0">
                <option value="char">Char</option>
                <option value="user">User</option>
              </select>
              <input {...register(`turns.${i}.text`)} className="input" placeholder="Turn text" required />
              <input {...register(`turns.${i}.audioUrl`)} className="input" placeholder="Audio URL" />
              <button type="button" className="btn-ghost p-2 text-red-500 shrink-0" onClick={() => turnsField.remove(i)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div><label className="label">User's Turn Index (0-based)</label><input type="number" {...register('userTurnIndex', { valueAsNumber: true })} className="input" min={0} /></div>
      <div>
        <label className="label">Response Options (mark correct)</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} />
              {Number(correctIndex) === i && <span className="badge-green">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageSelectFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div><label className="label">Image URL</label><input {...register('imageUrl')} className="input" placeholder="https://cdn.../apple.jpg" required /></div>
      <div>
        <label className="label">Options (mark correct)</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} />
              {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div><label className="label">Story Text</label><textarea {...register('storyText')} className="input resize-none" rows={4} placeholder="María va al mercado..." required /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
      <div><label className="label">Comprehension Question</label><input {...register('question')} className="input" placeholder="Where does María go?" required /></div>
      <div>
        <label className="label">Options (mark correct)</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} />
              {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── New type forms ────────────────────────────────────────────────────────

function McqFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div><label className="label">Question</label><input {...register('question')} className="input" placeholder="Which of these is a greeting?" required /></div>
      <div><label className="label">Image URL (optional)</label><input {...register('imageUrl')} className="input" /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
      <div>
        <label className="label">Options (mark correct)</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} defaultChecked={i === 0} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} required />
              {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SentenceBuildingFields({ register, wordBankField }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Prompt</label><input {...register('prompt_text')} className="input" placeholder="Build a sentence about greeting someone" /></div>
      <div><label className="label">Correct Sentence</label><input {...register('correctSentence')} className="input font-mono" placeholder="Buenos días, ¿cómo estás?" required /></div>
      <div><label className="label">Translation (optional)</label><input {...register('translation')} className="input" placeholder="Good morning, how are you?" /></div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Word Bank (tap tiles)</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => wordBankField.append('')}><Plus size={12} /> Add Word</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Include the correct words + distractor words.</p>
        <div className="flex flex-wrap gap-2">
          {wordBankField.fields.map((field: any, i: number) => (
            <div key={field.id} className="flex items-center gap-1">
              <input {...register(`wordBank.${i}`)} className="input w-28 text-sm" placeholder="word" required />
              <button type="button" className="btn-ghost p-1 text-red-400" onClick={() => wordBankField.remove(i)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CrosswordFields({ register, cluesField }: any) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label">Grid Size (4–15)</label><input type="number" {...register('gridSize', { valueAsNumber: true })} className="input" min={4} max={15} defaultValue={8} /></div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Clues & Words</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => cluesField.append({ word: '', clue: '', direction: 'across', startRow: 0, startCol: 0 })}><Plus size={12} /> Add Word</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Add words with their clues and grid positions.</p>
        <div className="space-y-3">
          {cluesField.fields.map((field: any, i: number) => (
            <div key={field.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1"><label className="label text-xs">Word</label><input {...register(`words.${i}.word`)} className="input" placeholder="HOLA" required /></div>
                <div className="flex-1"><label className="label text-xs">Direction</label>
                  <select {...register(`words.${i}.direction`)} className="input">
                    <option value="across">Across →</option>
                    <option value="down">Down ↓</option>
                  </select>
                </div>
                <button type="button" className="btn-ghost p-2 text-red-500 mt-4 shrink-0" onClick={() => cluesField.remove(i)}><Trash2 size={14} /></button>
              </div>
              <div><label className="label text-xs">Clue</label><input {...register(`words.${i}.clue`)} className="input" placeholder="Spanish greeting" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="label text-xs">Start Row</label><input type="number" {...register(`words.${i}.startRow`, { valueAsNumber: true })} className="input" min={0} /></div>
                <div><label className="label text-xs">Start Col</label><input type="number" {...register(`words.${i}.startCol`, { valueAsNumber: true })} className="input" min={0} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WordScrambleFields({ register }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Scrambled Word (jumbled letters)</label><input {...register('scrambledWord')} className="input font-mono text-lg tracking-widest" placeholder="LOAH" required /></div>
      <div><label className="label">Correct Word</label><input {...register('correctWord')} className="input font-mono" placeholder="HOLA" required /></div>
      <div><label className="label">Hint (optional)</label><input {...register('hint')} className="input" placeholder="A Spanish greeting" /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
      <p className="text-xs text-gray-400">The scrambled word should be the same letters as the correct word, just reordered.</p>
    </div>
  );
}

function VoicePronunciationFields({ register }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Target Text (what the user should pronounce)</label><input {...register('targetText')} className="input" placeholder="Buenos días" required /></div>
      <div><label className="label">Reference Audio URL (optional)</label><input {...register('targetAudioUrl')} className="input" /></div>
      <div><label className="label">Accepted Pronunciations (comma-separated variants)</label><input {...register('acceptedPronunciations')} className="input" placeholder="buenos dias, buenos días, bwenos dias" /></div>
      <div><label className="label">Language Code (optional, e.g. es-ES)</label><input {...register('language')} className="input" placeholder="es-ES" /></div>
    </div>
  );
}

function WordMatchingFields({ register, pairsField }: any) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded">All pairs are shown at once as a grid — user taps to match each word to its pair.</p>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Word Pairs</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => pairsField.append({ word: '', match: '' })}><Plus size={12} /> Add Pair</button>
        </div>
        <div className="space-y-2">
          {pairsField.fields.map((field: any, i: number) => (
            <div key={field.id} className="flex items-center gap-2">
              <input {...register(`pairs.${i}.word`)} className="input" placeholder="Hola" required />
              <span className="text-gray-400">↔</span>
              <input {...register(`pairs.${i}.match`)} className="input" placeholder="Hello" required />
              <button type="button" className="btn-ghost p-2 text-red-500" onClick={() => pairsField.remove(i)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div><label className="label">Time Limit in seconds (optional)</label><input type="number" {...register('timeLimit', { valueAsNumber: true })} className="input" placeholder="60" /></div>
    </div>
  );
}

function SpeedTapFields({ register, wordListField, watch }: any) {
  const correctIndices: number[] = watch('correctIndices') ?? [];
  return (
    <div className="space-y-3">
      <div><label className="label">Instruction</label><input {...register('instruction')} className="input" placeholder="Tap all Spanish greetings" required /></div>
      <div><label className="label">Time Limit (seconds, 5–60)</label><input type="number" {...register('timeLimit', { valueAsNumber: true })} className="input" min={5} max={60} defaultValue={15} /></div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Word List</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => wordListField.append('')}><Plus size={12} /> Add Word</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Enter all words. Then enter the 0-based indices of correct words below.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {wordListField.fields.map((field: any, i: number) => (
            <div key={field.id} className="flex items-center gap-1">
              <span className="text-xs text-gray-400 w-4">{i}</span>
              <input {...register(`wordList.${i}`)} className="input w-24 text-sm" placeholder="word" required />
              <button type="button" className="btn-ghost p-1 text-red-400" onClick={() => wordListField.remove(i)}><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        <div><label className="label">Correct Indices (comma-separated, 0-based)</label><input {...register('correctIndicesRaw')} className="input font-mono" placeholder="0, 2, 4" /></div>
      </div>
    </div>
  );
}

function FlashcardFields({ register }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Front (e.g. the word in target language)</label><input {...register('front')} className="input text-lg" placeholder="Hola" required /></div>
      <div><label className="label">Back (e.g. translation + example)</label><textarea {...register('back')} className="input resize-none" rows={3} placeholder="Hello&#10;Example: ¡Hola! ¿Cómo estás?" required /></div>
      <div><label className="label">Front Audio URL (optional)</label><input {...register('frontAudioUrl')} className="input" /></div>
      <div><label className="label">Back Audio URL (optional)</label><input {...register('backAudioUrl')} className="input" /></div>
      <div><label className="label">Image URL (optional)</label><input {...register('imageUrl')} className="input" /></div>
    </div>
  );
}

function PictureWordFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  const hasOptions = watch('hasOptions');
  return (
    <div className="space-y-3">
      <div><label className="label">Image URL</label><input {...register('imageUrl')} className="input" placeholder="https://cdn.../apple.jpg" required /></div>
      <div><label className="label">Correct Word</label><input {...register('correctWord')} className="input" placeholder="manzana" required /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
      <div className="flex items-center gap-2 mb-2">
        <input type="checkbox" {...register('hasOptions')} id="po" />
        <label htmlFor="po" className="text-sm text-gray-700">Show multiple choice options (otherwise user types the answer)</label>
      </div>
      {hasOptions && (
        <div>
          <label className="label">Options (mark correct)</label>
          <div className="space-y-2">
            {[0,1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} />
                <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} />
                {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CategorySortFields({ register, catsField, itemsField, watch }: any) {
  const cats = watch('categories') ?? [];
  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Categories</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => catsField.append({ name: '', color: '' })}><Plus size={12} /> Add Category</button>
        </div>
        <div className="space-y-2">
          {catsField.fields.map((field: any, i: number) => (
            <div key={field.id} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4">{i}</span>
              <input {...register(`categories.${i}.name`)} className="input" placeholder="Animals" required />
              <input {...register(`categories.${i}.color`)} className="input w-28" placeholder="#4A90E2" />
              <button type="button" className="btn-ghost p-2 text-red-500" onClick={() => catsField.remove(i)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Items to Sort</label>
          <button type="button" className="btn-secondary text-xs" onClick={() => itemsField.append({ text: '', categoryIndex: 0 })}><Plus size={12} /> Add Item</button>
        </div>
        <p className="text-xs text-gray-400 mb-2">Each item belongs to a category (by index above).</p>
        <div className="space-y-2">
          {itemsField.fields.map((field: any, i: number) => (
            <div key={field.id} className="flex items-center gap-2">
              <input {...register(`items.${i}.text`)} className="input" placeholder="perro" required />
              <select {...register(`items.${i}.categoryIndex`, { valueAsNumber: true })} className="input w-36 shrink-0">
                {cats.map((c: any, ci: number) => <option key={ci} value={ci}>{c.name || `Cat ${ci}`}</option>)}
              </select>
              <button type="button" className="btn-ghost p-2 text-red-500" onClick={() => itemsField.remove(i)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FillBlankFields({ register, watch }: any) {
  const correctIndex = watch('correctIndex');
  return (
    <div className="space-y-3">
      <div><label className="label">Sentence (use ___ for blank)</label><input {...register('sentence')} className="input font-mono" placeholder="El ___ es rojo." required /></div>
      <div><label className="label">Translation hint (optional)</label><input {...register('translation')} className="input" placeholder="The ___ is red." /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
      <div>
        <label className="label">Options (mark the correct one)</label>
        <div className="space-y-2">
          {[0,1,2,3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" {...register('correctIndex', { valueAsNumber: true })} value={i} defaultChecked={i === 0} />
              <input {...register(`options.${i}`)} className="input" placeholder={`Option ${i + 1}`} required />
              {Number(correctIndex) === i && <span className="badge-green">✓ Correct</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SentenceCorrectionFields({ register }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Incorrect Sentence (contains the error)</label><textarea {...register('incorrectSentence')} className="input resize-none font-mono" rows={2} placeholder="Yo soy llamo Carlos." required /></div>
      <div><label className="label">Correct Sentence (the fixed version)</label><textarea {...register('correctSentence')} className="input resize-none font-mono" rows={2} placeholder="Yo me llamo Carlos." required /></div>
      <div><label className="label">English Meaning (shown to user as context)</label><input {...register('translation')} className="input" placeholder="My name is Carlos." /></div>
      <div><label className="label">Error Type (optional)</label>
        <select {...register('errorType')} className="input">
          <option value="">— select —</option>
          <option value="grammar">Grammar</option>
          <option value="spelling">Spelling</option>
          <option value="word_order">Word Order</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="accent">Accent / Diacritic</option>
        </select>
      </div>
      <div><label className="label">Explanation (optional)</label><input {...register('explanation')} className="input" placeholder='Use "me llamo" (reflexive verb), not "soy llamo".' /></div>
    </div>
  );
}

function WordOrderFields({ register }: any) {
  return (
    <div className="space-y-3">
      <div><label className="label">Correct word order (space-separated)</label><input {...register('correctOrder')} className="input font-mono" placeholder="Me gusta el café" required /></div>
      <div><label className="label">Shuffled words (space-separated, include distractors)</label><input {...register('words')} className="input font-mono" placeholder="café el gusta Me" required /></div>
      <div><label className="label">Translation (optional)</label><input {...register('translation')} className="input" placeholder="I like coffee" /></div>
      <div><label className="label">Audio URL (optional)</label><input {...register('audioUrl')} className="input" /></div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getDefaultData(type: string): any {
  switch (type) {
    // Original 10
    case 'translate':           return { question: '', options: ['', '', '', ''], correctIndex: 0 };
    case 'match':               return { pairs: [{ left: '', right: '' }, { left: '', right: '' }] };
    case 'fill':                return { sentence: '', options: ['', '', '', ''], correctIndex: 0 };
    case 'build':               return { translation: '', correctOrder: '', words: '' };
    case 'listen':              return { audioUrl: '', options: ['', '', '', ''], correctIndex: 0, correctText: '' };
    case 'speak':               return { targetText: '', acceptedPronunciations: '' };
    case 'type_answer':         return { question: '', acceptedAnswers: [''] };
    case 'conversation':        return { characterName: '', turns: [{ speaker: 'char', text: '' }], userTurnIndex: 1, options: ['', '', '', ''], correctIndex: 0 };
    case 'image_select':        return { imageUrl: '', options: ['', '', '', ''], correctIndex: 0 };
    case 'story':               return { storyText: '', question: '', options: ['', '', '', ''], correctIndex: 0 };
    // New 13
    case 'mcq':                 return { question: '', options: ['', '', '', ''], correctIndex: 0 };
    case 'sentence_building':   return { correctSentence: '', wordBank: ['', ''], translation: '' };
    case 'crossword':           return { gridSize: 8, words: [{ word: '', clue: '', direction: 'across', startRow: 0, startCol: 0 }] };
    case 'word_scramble':       return { scrambledWord: '', correctWord: '' };
    case 'voice_pronunciation': return { targetText: '', acceptedPronunciations: '' };
    case 'word_matching':       return { pairs: [{ word: '', match: '' }, { word: '', match: '' }] };
    case 'speed_tap':           return { instruction: '', wordList: ['', '', '', ''], correctIndicesRaw: '0', timeLimit: 15 };
    case 'flashcard':           return { front: '', back: '' };
    case 'picture_word':        return { imageUrl: '', correctWord: '', hasOptions: false, options: ['', '', '', ''], correctIndex: 0 };
    case 'category_sort':       return { categories: [{ name: '' }, { name: '' }], items: [{ text: '', categoryIndex: 0 }] };
    case 'fill_blank':          return { sentence: '', options: ['', '', '', ''], correctIndex: 0 };
    case 'sentence_correction': return { incorrectSentence: '', correctSentence: '' };
    case 'word_order':          return { correctOrder: '', words: '' };
    default:                    return {};
  }
}

function buildData(type: string, values: any): any {
  switch (type) {
    // Original 10
    case 'translate':
      return { question: values.question, options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex), audioUrl: values.audioUrl || undefined };
    case 'match':
      return { pairs: values.pairs?.filter((p: any) => p.left && p.right) };
    case 'fill':
      return { sentence: values.sentence, options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex), translation: values.translation || undefined, audioUrl: values.audioUrl || undefined };
    case 'build':
      return {
        translation: values.translation || undefined,
        correctOrder: (values.correctOrder || '').split(/\s+/).filter(Boolean),
        words: (values.words || '').split(/\s+/).filter(Boolean),
      };
    case 'listen':
      return { audioUrl: values.audioUrl, options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex), correctText: values.correctText };
    case 'speak':
      return { targetText: values.targetText, targetAudioUrl: values.targetAudioUrl || undefined, acceptedPronunciations: values.acceptedPronunciations ? values.acceptedPronunciations.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined };
    case 'type_answer':
      return { question: values.question, acceptedAnswers: (values.acceptedAnswers || []).filter(Boolean), audioUrl: values.audioUrl || undefined, caseSensitive: !!values.caseSensitive };
    case 'conversation':
      return { characterName: values.characterName, characterAvatar: values.characterAvatar || undefined, turns: values.turns, userTurnIndex: Number(values.userTurnIndex), options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex) };
    case 'image_select':
      return { imageUrl: values.imageUrl, options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex) };
    case 'story':
      return { storyText: values.storyText, audioUrl: values.audioUrl || undefined, question: values.question, options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex) };

    // New 13
    case 'mcq':
      return { question: values.question, options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex), imageUrl: values.imageUrl || undefined, audioUrl: values.audioUrl || undefined };
    case 'sentence_building':
      return { prompt: values.prompt_text || '', wordBank: (values.wordBank || []).filter(Boolean), correctSentence: values.correctSentence, translation: values.translation || undefined };
    case 'crossword':
      return { gridSize: Number(values.gridSize) || 8, words: (values.words || []).filter((w: any) => w.word && w.clue).map((w: any) => ({ ...w, startRow: Number(w.startRow), startCol: Number(w.startCol) })) };
    case 'word_scramble':
      return { scrambledWord: values.scrambledWord, correctWord: values.correctWord, hint: values.hint || undefined, audioUrl: values.audioUrl || undefined };
    case 'voice_pronunciation':
      return { targetText: values.targetText, targetAudioUrl: values.targetAudioUrl || undefined, acceptedPronunciations: values.acceptedPronunciations ? values.acceptedPronunciations.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, language: values.language || undefined };
    case 'word_matching':
      return { pairs: (values.pairs || []).filter((p: any) => p.word && p.match), timeLimit: values.timeLimit ? Number(values.timeLimit) : undefined };
    case 'speed_tap':
      return { instruction: values.instruction, wordList: (values.wordList || []).filter(Boolean), correctIndices: (values.correctIndicesRaw || '').split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n)), timeLimit: Number(values.timeLimit) || 15 };
    case 'flashcard':
      return { front: values.front, back: values.back, frontAudioUrl: values.frontAudioUrl || undefined, backAudioUrl: values.backAudioUrl || undefined, imageUrl: values.imageUrl || undefined };
    case 'picture_word': {
      const base: any = { imageUrl: values.imageUrl, correctWord: values.correctWord, audioUrl: values.audioUrl || undefined };
      if (values.hasOptions) { base.options = values.options?.filter(Boolean); }
      return base;
    }
    case 'category_sort':
      return { categories: (values.categories || []).filter((c: any) => c.name).map((c: any) => ({ name: c.name, color: c.color || undefined })), items: (values.items || []).filter((it: any) => it.text).map((it: any) => ({ text: it.text, categoryIndex: Number(it.categoryIndex), imageUrl: it.imageUrl || undefined })) };
    case 'fill_blank':
      return { sentence: values.sentence, options: values.options?.filter(Boolean), correctIndex: Number(values.correctIndex), translation: values.translation || undefined, audioUrl: values.audioUrl || undefined };
    case 'sentence_correction':
      return { incorrectSentence: values.incorrectSentence, correctSentence: values.correctSentence, translation: values.translation || undefined, errorType: values.errorType || undefined, explanation: values.explanation || undefined };
    case 'word_order':
      return { correctOrder: (values.correctOrder || '').split(/\s+/).filter(Boolean), words: (values.words || '').split(/\s+/).filter(Boolean), translation: values.translation || undefined, audioUrl: values.audioUrl || undefined };
    default:
      return values;
  }
}
