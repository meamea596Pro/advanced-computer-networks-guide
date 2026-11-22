import { useState } from 'react';
import { Check, Eye, HelpCircle, RotateCcw, X } from 'lucide-react';
import {
  PRACTICE_QUESTIONS,
  PracticeQuestion,
  PracticeTopic,
} from '../data/practiceQuestions';

interface PracticeViewProps {
  initialFilter?: PracticeTopic | 'all';
  showArabicCues: boolean;
}

type FilterOption = 'all' | PracticeTopic;

const FILTER_TABS: { id: FilterOption; label: string }[] = [
  { id: 'all', label: 'All Topics (18)' },
  { id: 'sec2', label: 'Sec 2: UDP' },
  { id: 'sec3', label: 'Sec 3: TCP' },
  { id: 'sec4', label: 'Sec 4: Windows & RTO' },
  { id: 'sec5', label: 'Sec 5: Congestion' },
  { id: 'subnetting', label: 'Supplemental: Subnetting' },
];

function normalizeInput(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function PracticeView({ initialFilter = 'all', showArabicCues }: PracticeViewProps) {
  const [filter, setFilter] = useState<FilterOption>(initialFilter);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [typedAnswers, setTypedAnswers] = useState<Record<string, string>>({});
  const [checkedStatus, setCheckedStatus] = useState<Record<string, 'correct' | 'incorrect'>>({});
  const [showHint, setShowHint] = useState<Record<string, boolean>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const visibleQuestions =
    filter === 'all'
      ? PRACTICE_QUESTIONS
      : PRACTICE_QUESTIONS.filter((q) => q.topic === filter);

  const answeredCount = visibleQuestions.filter((q) => checkedStatus[q.id]).length;
  const correctCount = visibleQuestions.filter((q) => checkedStatus[q.id] === 'correct').length;

  const checkQuestion = (q: PracticeQuestion) => {
    if (q.type === 'mcq') {
      const choice = selectedChoices[q.id];
      if (choice === undefined) return;
      const isRight = choice === q.correctOptionIndex;
      setCheckedStatus((prev) => ({ ...prev, [q.id]: isRight ? 'correct' : 'incorrect' }));
      setRevealed((prev) => ({ ...prev, [q.id]: true }));
    } else {
      const raw = typedAnswers[q.id] ?? '';
      if (!raw.trim()) return;
      const norm = normalizeInput(raw);
      const isRight = (q.acceptedAnswers ?? []).some((ans) => normalizeInput(ans) === norm);
      setCheckedStatus((prev) => ({ ...prev, [q.id]: isRight ? 'correct' : 'incorrect' }));
      if (isRight) {
        setRevealed((prev) => ({ ...prev, [q.id]: true }));
      }
    }
  };

  const resetSession = () => {
    setSelectedChoices({});
    setTypedAnswers({});
    setCheckedStatus({});
    setShowHint({});
    setRevealed({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500">
            Active Recall & Checking · Original Exam-Style Questions
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Practice Mode
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="font-mono text-xs text-slate-700 tabular-nums">
            Checked: <strong>{answeredCount}/{visibleQuestions.length}</strong> · Correct:{' '}
            <strong className="text-teal-800">{correctCount}</strong>
          </div>
          <button
            type="button"
            onClick={resetSession}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Answers
          </button>
        </div>
      </div>

      {/* Topic Filter Bar */}
      <div
        className="flex flex-wrap items-center gap-1.5 rounded-lg bg-slate-100 p-1.5"
        role="tablist"
        aria-label="Filter practice questions by topic"
      >
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700 ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {filter === 'subnetting' && (
        <div className="rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-950">
          <strong>Supplemental Topic Notice:</strong> These IPv4 subnetting questions are supplemental practice and are not drawn from the Section 2–5 course PDFs. For full /26 and /20 multi-field drills, also visit the dedicated Subnetting tab.
        </div>
      )}

      {/* Question Cards */}
      <div className="space-y-5">
        {visibleQuestions.map((q, idx) => {
          const status = checkedStatus[q.id];
          const isRevealed = !!revealed[q.id];
          const isHintOpen = !!showHint[q.id];

          return (
            <article
              key={q.id}
              className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-700">Question {idx + 1}</span>
                  <span aria-hidden="true">·</span>
                  <span className={q.isSupplemental ? 'text-amber-800 font-medium' : ''}>
                    {q.topicLabel}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{q.type === 'mcq' ? 'Multiple Choice' : 'Typed Calculation'}</span>
                </div>
                {showArabicCues && q.arabicCue && (
                  <span dir="rtl" className="text-slate-500">
                    {q.arabicCue}
                  </span>
                )}
              </div>

              <h2 className="text-[15px] font-medium text-slate-900 leading-relaxed">
                {q.prompt}
              </h2>

              {/* Answer Input Area */}
              {q.type === 'mcq' && q.options ? (
                <div className="space-y-2" role="radiogroup" aria-label={`Options for question ${idx + 1}`}>
                  {q.options.map((opt, optIdx) => {
                    const picked = selectedChoices[q.id] === optIdx;
                    const isCorrectOpt = optIdx === q.correctOptionIndex;
                    let borderStyle = 'border-slate-200 bg-white hover:border-slate-300';
                    if (isRevealed && isCorrectOpt) {
                      borderStyle = 'border-teal-600 bg-teal-50/70';
                    } else if (status === 'incorrect' && picked && !isCorrectOpt) {
                      borderStyle = 'border-red-500 bg-red-50/70';
                    } else if (picked) {
                      borderStyle = 'border-blue-700 bg-blue-50/60';
                    }

                    return (
                      <label
                        key={optIdx}
                        className={`flex items-start gap-3 rounded-md border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${borderStyle}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          checked={picked}
                          onChange={() => {
                            setSelectedChoices((prev) => ({ ...prev, [q.id]: optIdx }));
                            if (checkedStatus[q.id]) {
                              setCheckedStatus((prev) => {
                                const next = { ...prev };
                                delete next[q.id];
                                return next;
                              });
                            }
                          }}
                          className="mt-0.5 h-4 w-4 accent-blue-700 shrink-0"
                        />
                        <span className="text-slate-800 leading-snug">{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="text"
                    value={typedAnswers[q.id] ?? ''}
                    onChange={(e) => {
                      setTypedAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') checkQuestion(q);
                    }}
                    placeholder={`Enter answer (${q.unitHint ?? 'value'})`}
                    aria-label={`Answer input for question ${idx + 1}`}
                    className="w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-blue-700 focus:outline-none"
                  />
                  {q.unitHint && (
                    <span className="text-xs text-slate-500">Expected format: {q.unitHint}</span>
                  )}
                </div>
              )}

              {/* Action Controls */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => checkQuestion(q)}
                  disabled={
                    q.type === 'mcq'
                      ? selectedChoices[q.id] === undefined
                      : !(typedAnswers[q.id] ?? '').trim()
                  }
                  className="rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-40 transition-colors whitespace-nowrap"
                >
                  Check Answer
                </button>

                <button
                  type="button"
                  onClick={() => setShowHint((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  {isHintOpen ? 'Hide Hint' : 'Hint'}
                </button>

                <button
                  type="button"
                  onClick={() => setRevealed((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                  className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {isRevealed ? 'Hide Solution' : 'Reveal Solution'}
                </button>

                {status === 'correct' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800">
                    <Check className="h-4 w-4" /> Correct
                  </span>
                )}
                {status === 'incorrect' && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                    <X className="h-4 w-4" /> Not quite — review the steps or try again
                  </span>
                )}
              </div>

              {isHintOpen && (
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-700">
                  <strong className="text-slate-900">Hint: </strong>
                  {q.hint}
                </div>
              )}

              {isRevealed && (
                <div className="space-y-2.5 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs">
                  <div className="font-semibold text-slate-900">
                    Answer & Step-by-Step Solution
                    {q.type === 'numeric' && q.acceptedAnswers && (
                      <span className="ml-2 font-mono text-teal-800">
                        ({q.acceptedAnswers[0]} {q.unitHint === 'bytes' || q.unitHint === 'MSS' || q.unitHint === 'frames' ? q.unitHint : ''})
                      </span>
                    )}
                  </div>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-800 leading-relaxed">
                    {q.steps.map((st, sIdx) => (
                      <li key={sIdx}>{st}</li>
                    ))}
                  </ol>
                  <div className="rounded border border-amber-200 bg-amber-50/70 px-3 py-2 text-amber-950 leading-relaxed">
                    <strong>Assumption & Standard Check: </strong>
                    {q.assumptionNote}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
