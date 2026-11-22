import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { COURSE_SECTIONS, CourseSectionId } from '../data/courseContent';
import {
  CongestionTrajectoryExplorer,
  TcpHandshakeAndHeaderExplorer,
  UdpHeaderExplorer,
  WindowAndRtoExplorer,
} from './InteractiveExplorers';

interface LessonsViewProps {
  activeSection: CourseSectionId;
  onSelectSection: (id: CourseSectionId) => void;
  showArabicCues: boolean;
  onToggleArabicCues: () => void;
  onGoToPractice: (topic: CourseSectionId) => void;
}

export function LessonsView({
  activeSection,
  onSelectSection,
  showArabicCues,
  onToggleArabicCues,
  onGoToPractice,
}: LessonsViewProps) {
  const [expandedProblems, setExpandedProblems] = useState<Record<string, boolean>>({
    'wp-sec2-1': true,
    'wp-sec3-1': true,
    'wp-sec4-1': true,
    'wp-sec5-1': true,
  });

  const section =
    COURSE_SECTIONS.find((s) => s.id === activeSection) ?? COURSE_SECTIONS[0];

  const toggleProblem = (id: string) => {
    setExpandedProblems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] items-start">
      {/* Left Course Outline Sidebar */}
      <aside className="rounded-lg border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Sections 2–5 Outline</h2>
        </div>

        <nav className="space-y-1" aria-label="Course sections">
          {COURSE_SECTIONS.map((s) => {
            const isCurrent = s.id === section.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSection(s.id)}
                className={`w-full rounded-md px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  isCurrent
                    ? 'bg-blue-50 text-blue-900 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="text-xs text-slate-500">{s.code}</div>
                <div className="text-sm leading-snug">{s.title}</div>
                {showArabicCues && (
                  <div className="mt-0.5 text-xs text-slate-500" dir="rtl">
                    {s.arabicCue}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-slate-200 pt-4 space-y-3">
          <label className="flex items-center justify-between gap-2 text-xs text-slate-700 cursor-pointer">
            <span>Show brief Arabic cues</span>
            <input
              type="checkbox"
              checked={showArabicCues}
              onChange={onToggleArabicCues}
              className="h-4 w-4 rounded border-slate-300 accent-blue-700"
            />
          </label>
          <button
            type="button"
            onClick={() => onGoToPractice(section.id)}
            className="w-full rounded-md border border-blue-700 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            Practice {section.code} Questions
          </button>
        </div>
      </aside>

      {/* Main Lesson & Worked Problems Column */}
      <article className="space-y-8 min-w-0">
        <header className="space-y-2 border-b border-slate-200 pb-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>{section.code}</span>
            <span aria-hidden="true">·</span>
            <span>Primary Course PDF Coverage</span>
            {showArabicCues && (
              <>
                <span aria-hidden="true">·</span>
                <span dir="rtl">{section.arabicCue}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {section.title}
          </h1>
          <p className="max-w-3xl text-base text-slate-600 leading-relaxed">
            {section.summary}
          </p>
        </header>

        {/* Interactive Concept Explorer for the active section */}
        <section aria-label="Interactive explorer">
          {section.id === 'sec2' && <UdpHeaderExplorer />}
          {section.id === 'sec3' && <TcpHandshakeAndHeaderExplorer />}
          {section.id === 'sec4' && <WindowAndRtoExplorer />}
          {section.id === 'sec5' && <CongestionTrajectoryExplorer />}
        </section>

        {/* Core Topic Lessons */}
        <section className="space-y-6" aria-label="Core lessons">
          <h2 className="text-lg font-bold text-slate-900">Key Concepts & Exam Mechanics</h2>
          <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
            {section.concepts.map((concept) => (
              <div key={concept.heading} className="p-5 sm:p-6 space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">
                    {concept.heading}
                  </h3>
                  {showArabicCues && concept.arabicCue && (
                    <span className="text-xs text-slate-500" dir="rtl">
                      {concept.arabicCue}
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-[15px] text-slate-700 leading-relaxed max-w-[74ch]">
                  {concept.body.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {concept.keyFormula && (
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-xs text-slate-900 overflow-x-auto">
                    {concept.keyFormula}
                  </div>
                )}

                {concept.examWatchout && (
                  <div className="rounded-md border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-sm text-amber-950 leading-relaxed">
                    <span className="font-semibold">Accuracy Check: </span>
                    {concept.examWatchout}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Original Worked Problems */}
        <section className="space-y-4" aria-label="Worked problems">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Original Worked Problems (Step-by-Step with Assumptions)
            </h2>
            <span className="text-xs text-slate-500">
              Fresh examples · Not copied from slides
            </span>
          </div>

          <div className="space-y-4">
            {section.workedProblems.map((wp, index) => {
              const isOpen = !!expandedProblems[wp.id];
              return (
                <div
                  key={wp.id}
                  className="rounded-lg border border-slate-200 bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleProblem(wp.id)}
                    aria-expanded={isOpen}
                    className="flex w-full items-start justify-between gap-4 p-5 text-left hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-700"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>Worked Problem {index + 1}</span>
                        {showArabicCues && wp.arabicCue && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span dir="rtl">{wp.arabicCue}</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-slate-900">{wp.title}</h3>
                    </div>
                    <span className="mt-1 shrink-0 text-slate-500">
                      {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-200 p-5 space-y-4">
                      <p className="text-[15px] text-slate-800 leading-relaxed">{wp.prompt}</p>

                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-sm">
                        <div className="font-semibold text-slate-900 mb-1">Stated Assumptions</div>
                        <ul className="list-disc pl-5 space-y-1 text-slate-700">
                          {wp.assumptions.map((a, idx) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2.5">
                        <div className="text-xs font-semibold text-slate-600">
                          Step-by-Step Solution
                        </div>
                        <ol className="space-y-2">
                          {wp.steps.map((st, idx) => (
                            <li
                              key={idx}
                              className="rounded-md border border-slate-200 bg-white p-3 space-y-1"
                            >
                              <div className="text-xs font-semibold text-slate-800">
                                {st.label}
                              </div>
                              <div className="font-mono text-xs text-slate-900 tabular-nums overflow-x-auto">
                                {st.math}
                              </div>
                              {st.detail && (
                                <div className="text-xs text-slate-600">{st.detail}</div>
                              )}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="rounded-md border border-teal-200 bg-teal-50/60 p-3.5 text-sm text-teal-950">
                        <span className="font-semibold">Final Answer: </span>
                        {wp.finalAnswer}
                      </div>

                      <div className="rounded-md border border-amber-200 bg-amber-50/70 p-3.5 text-sm text-amber-950 leading-relaxed">
                        <span className="font-semibold">If Assumptions Change: </span>
                        {wp.ifAssumptionChanges}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </article>
    </div>
  );
}
