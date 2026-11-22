import { ExternalLink } from 'lucide-react';
import { COVERAGE_NOTE, REFERENCE_SOURCES } from '../data/courseContent';

export function SourcesView() {
  const courseRefs = REFERENCE_SOURCES.filter((r) => r.scope === 'Sections 2–5');
  const subnetRefs = REFERENCE_SOURCES.filter((r) => r.scope === 'Supplemental Subnetting');

  return (
    <div className="space-y-8">
      <div className="space-y-1 border-b border-slate-200 pb-4">
        <div className="text-xs text-slate-500">
          Verification & Scope · Primary Standards & Documentation
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sources & Course Coverage Scope
        </h1>
      </div>

      {/* Explicit Coverage Breakdown */}
      <section className="rounded-lg border border-amber-300 bg-amber-50/70 p-5 space-y-3">
        <h2 className="text-base font-bold text-slate-900">{COVERAGE_NOTE.title}</h2>
        <p className="text-sm text-amber-950 leading-relaxed max-w-3xl">
          {COVERAGE_NOTE.summary}
        </p>
        <p className="text-sm text-amber-950 leading-relaxed max-w-3xl">
          {COVERAGE_NOTE.subnettingNote}
        </p>
        <div className="grid gap-4 pt-2 sm:grid-cols-2 text-xs">
          <div className="rounded-md border border-slate-200 bg-white p-3.5 space-y-1.5">
            <div className="font-semibold text-slate-900">Included from Sections 2–5 PDFs</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Section 2: UDP vs. TCP, 8-byte UDP header, ports, DNS capture concepts</li>
              <li>Section 3: TCP byte stream, 20-byte+ header, 3-way handshake, ports, Wireshark</li>
              <li>Section 4: Stop-and-Wait, Sliding Windows (GBN vs. SR), RTO timers, Delayed & Dup ACKs</li>
              <li>Section 5: TCP Congestion Control (cwnd, rwnd, ssthresh, Slow Start, CA, loss reaction)</li>
            </ul>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3.5 space-y-1.5">
            <div className="font-semibold text-slate-900">Not Claimed / Separate Supplemental</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>Full Moodle course inventory is unavailable (Section 1 or Sections 6+ may be missing)</li>
              <li>IPv4 CIDR Subnetting (/26, /20, /31) is supplemental and NOT from these PDFs</li>
              <li>All examples and practice questions are original—no source PDFs, slides, or personal data are embedded</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sections 2–5 Technical References */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Transport Layer References (Sections 2–5 Verification)
        </h2>
        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {courseRefs.map((src) => (
            <div
              key={src.id}
              className="flex flex-wrap items-start justify-between gap-3 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1 max-w-2xl">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
                <p className="text-xs text-slate-600 leading-relaxed">{src.verifies}</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">{src.organization}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Supplemental IPv4 Subnetting References */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          Supplemental IPv4 Subnetting References (Separate from Sections 2–5 PDFs)
        </h2>
        <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {subnetRefs.map((src) => (
            <div
              key={src.id}
              className="flex flex-wrap items-start justify-between gap-3 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1 max-w-2xl">
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  <span>{src.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </a>
                <p className="text-xs text-slate-600 leading-relaxed">{src.verifies}</p>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">{src.organization}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
