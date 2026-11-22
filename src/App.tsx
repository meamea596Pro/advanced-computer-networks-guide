import { useState } from 'react';
import { ExternalLink, Menu, X } from 'lucide-react';
import {
  COVERAGE_NOTE,
  CourseSectionId,
  REFERENCE_SOURCES,
} from './data/courseContent';
import { PracticeTopic } from './data/practiceQuestions';
import { LessonsView } from './components/LessonsView';
import { QuickRefView } from './components/QuickRefView';
import { PracticeView } from './components/PracticeView';
import { SubnettingView } from './components/SubnettingView';
import { SourcesView } from './components/SourcesView';

type AppTab = 'lessons' | 'quickref' | 'practice' | 'subnetting' | 'sources';

const NAV_ITEMS: { id: AppTab; label: string }[] = [
  { id: 'lessons', label: 'Lessons' },
  { id: 'quickref', label: 'Quick Sheet' },
  { id: 'practice', label: 'Practice' },
  { id: 'subnetting', label: 'Subnetting' },
  { id: 'sources', label: 'Sources' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('lessons');
  const [activeSection, setActiveSection] = useState<CourseSectionId>('sec2');
  const [practiceFilter, setPracticeFilter] = useState<PracticeTopic | 'all'>('all');
  const [showArabicCues, setShowArabicCues] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const navigateTo = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToPracticeTopic = (topic: PracticeTopic) => {
    setPracticeFilter(topic);
    setActiveTab('practice');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Strict 3-Zone Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3 sm:px-6">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => navigateTo('lessons')}
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            ACN Study Guide
          </button>

          {/* Zone 2: 5 Concise Single-Line Text Nav Links */}
          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium"
            aria-label="Primary navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isActive
                      ? 'text-blue-700 underline underline-offset-8 decoration-2'
                      : 'text-slate-600 hover:text-slate-900 hover:underline underline-offset-8 decoration-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action (+ mobile menu toggle on small screens) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setPracticeFilter('all');
                navigateTo('practice');
              }}
              className="rounded-md bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Start Practice
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="md:hidden rounded-md border border-slate-200 p-2 text-slate-700 hover:bg-slate-50"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            className="md:hidden border-t border-slate-200 bg-white px-4 py-2 space-y-1"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm font-medium ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Persistent Visible Coverage Note */}
      <div className="no-print border-b border-amber-200 bg-amber-50/70">
        <div className="mx-auto max-w-6xl px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-950">
          <p className="leading-relaxed">
            <strong>Coverage Caveat (Sections 2–5 Draft):</strong> Built only from Sections 2–5 course PDFs (UDP, TCP, Stop-and-Wait/Sliding Windows, RTO, Congestion Control) because the full Moodle inventory is unavailable—this does not cover the entire course. IPv4 Subnetting is a separate supplemental practice section.
          </p>
          <button
            type="button"
            onClick={() => navigateTo('sources')}
            className="font-semibold text-amber-900 underline underline-offset-2 hover:text-slate-900 whitespace-nowrap shrink-0"
          >
            Scope & Sources
          </button>
        </div>
      </div>

      {/* Main Study Workspace */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6 sm:py-8">
        {activeTab === 'lessons' && (
          <LessonsView
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            showArabicCues={showArabicCues}
            onToggleArabicCues={() => setShowArabicCues((v) => !v)}
            onGoToPractice={handleGoToPracticeTopic}
          />
        )}
        {activeTab === 'quickref' && <QuickRefView showArabicCues={showArabicCues} />}
        {activeTab === 'practice' && (
          <PracticeView
            key={practiceFilter}
            initialFilter={practiceFilter}
            showArabicCues={showArabicCues}
          />
        )}
        {activeTab === 'subnetting' && <SubnettingView showArabicCues={showArabicCues} />}
        {activeTab === 'sources' && <SourcesView />}
      </main>

      {/* Compact Persistent Sources Panel Footer */}
      <footer className="border-t border-slate-200 bg-white mt-10">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xs font-semibold text-slate-900">
              Primary Technical References (RFC Editor · Wireshark · Cisco Learning Network)
            </h2>
            <span className="text-xs text-slate-500">
              {COVERAGE_NOTE.title} · Static client-only draft
            </span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {REFERENCE_SOURCES.map((ref) => (
              <a
                key={ref.id}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:underline whitespace-nowrap"
              >
                <span>{ref.title.split(' — ')[0]}</span>
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
