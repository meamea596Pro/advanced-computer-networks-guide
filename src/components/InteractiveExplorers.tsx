import { useState } from 'react';
import {
  calculateRfc6298Steps,
  calculateWindowUtilization,
  simulateRenoTrajectory,
} from '../utils/networkMath';

interface HeaderFieldInfo {
  id: string;
  label: string;
  bits: string;
  span: string;
  summary: string;
  rfcNote: string;
}

const UDP_FIELDS: HeaderFieldInfo[] = [
  {
    id: 'src',
    label: 'Source Port',
    bits: '16 bits (2 B)',
    span: 'col-span-6',
    summary: 'Identifies the sending application socket (e.g., client ephemeral port 51842). Optional in RFC 768 (0 if no reply expected).',
    rfcNote: 'RFC 768 · Bytes 0–1',
  },
  {
    id: 'dst',
    label: 'Destination Port',
    bits: '16 bits (2 B)',
    span: 'col-span-6',
    summary: 'Identifies the receiving service socket on the target host (e.g., 53 for DNS). Swaps with Source Port on the reply.',
    rfcNote: 'RFC 768 · Bytes 2–3',
  },
  {
    id: 'len',
    label: 'Length',
    bits: '16 bits (2 B)',
    span: 'col-span-6',
    summary: 'Total UDP datagram length in bytes: 8-byte header PLUS application data. Minimum valid value is 8; payload = Length − 8.',
    rfcNote: 'RFC 768 · Bytes 4–5',
  },
  {
    id: 'csum',
    label: 'Checksum',
    bits: '16 bits (2 B)',
    span: 'col-span-6',
    summary: 'Error detection over IP pseudo-header + UDP header + data. Optional in IPv4, mandatory in IPv6. Detects corruption only—no retransmission.',
    rfcNote: 'RFC 768 · Bytes 6–7',
  },
];

export function UdpHeaderExplorer() {
  const [selectedId, setSelectedId] = useState<string>('len');
  const active = UDP_FIELDS.find((f) => f.id === selectedId) ?? UDP_FIELDS[0];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">
          Interactive 8-Byte UDP Header Inspector (RFC 768)
        </h4>
        <span className="text-xs text-slate-500">Click a field to inspect size & rule</span>
      </div>

      <div className="mb-2 flex justify-between font-mono text-[11px] text-slate-500 tabular-nums">
        <span>Bit 0</span>
        <span>Bit 15 | Bit 16</span>
        <span>Bit 31</span>
      </div>

      <div className="grid grid-cols-12 gap-1.5">
        {UDP_FIELDS.map((field) => {
          const isSelected = field.id === active.id;
          return (
            <button
              key={field.id}
              type="button"
              onClick={() => setSelectedId(field.id)}
              className={`${field.span} rounded-md border px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                isSelected
                  ? 'border-blue-700 bg-blue-50 text-slate-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="text-sm font-semibold">{field.label}</div>
              <div className="font-mono text-xs text-slate-600 tabular-nums">{field.bits}</div>
            </button>
          );
        })}
        <div className="col-span-12 rounded-md border border-dashed border-slate-300 bg-slate-50/70 px-3 py-2.5 text-center font-mono text-xs text-slate-600">
          Application Data / Payload (Length − 8 bytes)
        </div>
      </div>

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3.5 text-sm">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <span className="font-semibold text-slate-900">{active.label}</span>
          <span className="font-mono text-xs text-slate-500">{active.rfcNote}</span>
        </div>
        <p className="text-slate-700 leading-relaxed">{active.summary}</p>
      </div>
    </div>
  );
}

const TCP_FIELDS: HeaderFieldInfo[] = [
  {
    id: 'src',
    label: 'Source Port',
    bits: '16 bits',
    span: 'col-span-6',
    summary: '16-bit sending port (typically ephemeral 49152–65535 for a client initiating a connection).',
    rfcNote: 'RFC 9293 · Bytes 0–1',
  },
  {
    id: 'dst',
    label: 'Destination Port',
    bits: '16 bits',
    span: 'col-span-6',
    summary: '16-bit target port (e.g., 80 HTTP, 443 HTTPS, 21 FTP control, 22 SSH).',
    rfcNote: 'RFC 9293 · Bytes 2–3',
  },
  {
    id: 'seq',
    label: 'Sequence Number',
    bits: '32 bits',
    span: 'col-span-12',
    summary: 'Byte offset of the first payload byte in this segment. If SYN=1, holds the Initial Sequence Number (ISN) and consumes 1 sequence number.',
    rfcNote: 'RFC 9293 · Bytes 4–7',
  },
  {
    id: 'ack',
    label: 'Acknowledgment Number',
    bits: '32 bits',
    span: 'col-span-12',
    summary: 'Valid only when ACK flag = 1. Holds the NEXT byte sequence number expected from the peer (cumulative ACK).',
    rfcNote: 'RFC 9293 · Bytes 8–11',
  },
  {
    id: 'doff',
    label: 'Data Offset',
    bits: '4 bits',
    span: 'col-span-3',
    summary: 'Header length measured in 32-bit (4-byte) words. Minimum = 5 (20 bytes); maximum = 15 (60 bytes). Tells the stack where payload begins.',
    rfcNote: 'RFC 9293 · Header Bytes = Offset × 4',
  },
  {
    id: 'flags',
    label: 'Res + Flags (CWR..FIN)',
    bits: '12 bits',
    span: 'col-span-4',
    summary: 'Control bits: classic 6 flags (URG, ACK, PSH, RST, SYN, FIN) plus ECN/reserved bits (RFC 9293). SYN and FIN each consume 1 sequence number.',
    rfcNote: 'RFC 9293 · Control Bits',
  },
  {
    id: 'win',
    label: 'Window (rwnd)',
    bits: '16 bits',
    span: 'col-span-5',
    summary: 'Receiver-advertised flow-control window (rwnd) indicating how many bytes the receiver buffer can accept (scaled if Window Scale option was negotiated).',
    rfcNote: 'RFC 9293 · Bytes 14–15',
  },
  {
    id: 'csum',
    label: 'Checksum',
    bits: '16 bits',
    span: 'col-span-6',
    summary: 'Mandatory end-to-end checksum covering IP pseudo-header, TCP header, and TCP payload.',
    rfcNote: 'RFC 9293 · Bytes 16–17',
  },
  {
    id: 'urg',
    label: 'Urgent Pointer',
    bits: '16 bits',
    span: 'col-span-6',
    summary: 'Offset from Sequence Number marking the end of urgent data when the URG flag is set (rarely used in modern apps).',
    rfcNote: 'RFC 9293 · Bytes 18–19',
  },
  {
    id: 'opt',
    label: 'Options & Padding (Optional)',
    bits: '0–40 bytes',
    span: 'col-span-12',
    summary: 'Variable-length options padded to a 32-bit boundary: MSS, Window Scale, SACK Permitted (RFC 2018), SACK blocks, Timestamps.',
    rfcNote: 'RFC 9293 · Bytes 20–59',
  },
];

interface HandshakeStep {
  step: number;
  dir: 'Client → Server' | 'Server → Client';
  flags: string;
  rawSeq: number;
  rawAck: string;
  relSeq: number;
  relAck: string;
  len: number;
  explanation: string;
}

const HANDSHAKE_STEPS: HandshakeStep[] = [
  {
    step: 1,
    dir: 'Client → Server',
    flags: '[SYN]',
    rawSeq: 4000,
    rawAck: 'N/A (ACK=0)',
    relSeq: 0,
    relAck: '—',
    len: 0,
    explanation: 'Client picks ISN = 4000. ACK flag is unset. SYN consumes 1 sequence number even though Len = 0.',
  },
  {
    step: 2,
    dir: 'Server → Client',
    flags: '[SYN, ACK]',
    rawSeq: 9500,
    rawAck: '4001',
    relSeq: 0,
    relAck: '1',
    len: 0,
    explanation: 'Server picks ISN = 9500 and acknowledges client SYN with Ack = 4001. Server SYN also consumes 1 sequence number.',
  },
  {
    step: 3,
    dir: 'Client → Server',
    flags: '[ACK]',
    rawSeq: 4001,
    rawAck: '9501',
    relSeq: 1,
    relAck: '1',
    len: 0,
    explanation: 'Handshake complete! Client acknowledges server SYN (Ack = 9501). A pure ACK consumes 0 sequence numbers.',
  },
  {
    step: 4,
    dir: 'Client → Server',
    flags: '[PSH, ACK]',
    rawSeq: 4001,
    rawAck: '9501',
    relSeq: 1,
    relAck: '1',
    len: 240,
    explanation: 'Client sends 240 bytes (byte offsets 4001..4240). Notice Seq stays 4001 because Packet 3 carried no data.',
  },
  {
    step: 5,
    dir: 'Server → Client',
    flags: '[PSH, ACK]',
    rawSeq: 9501,
    rawAck: '4241',
    relSeq: 1,
    relAck: '241',
    len: 600,
    explanation: 'Server confirms all 240 client bytes (Ack = 4001 + 240 = 4241) and returns 600 bytes (9501..10100).',
  },
  {
    step: 6,
    dir: 'Client → Server',
    flags: '[ACK]',
    rawSeq: 4241,
    rawAck: '10101',
    relSeq: 241,
    relAck: '601',
    len: 0,
    explanation: 'Client confirms all 600 server bytes (Ack = 9501 + 600 = 10101).',
  },
];

export function TcpHandshakeAndHeaderExplorer() {
  const [tab, setTab] = useState<'handshake' | 'header'>('handshake');
  const [selectedField, setSelectedField] = useState<string>('doff');
  const [stepIdx, setStepIdx] = useState<number>(0);

  const activeField = TCP_FIELDS.find((f) => f.id === selectedField) ?? TCP_FIELDS[0];
  const currentStep = HANDSHAKE_STEPS[stepIdx];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">
          Interactive TCP Explorer (RFC 9293)
        </h4>
        <div className="inline-flex rounded-md bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('handshake')}
            className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              tab === 'handshake'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3-Way Handshake & Seq/ACK
          </button>
          <button
            type="button"
            onClick={() => setTab('header')}
            className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              tab === 'header'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            20-Byte+ Header Inspector
          </button>
        </div>
      </div>

      {tab === 'handshake' ? (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs text-slate-600">
              Original trace: Client ISN <code className="font-mono font-medium text-slate-900">4000</code> · Server ISN <code className="font-mono font-medium text-slate-900">9500</code>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                disabled={stepIdx === 0}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
              >
                Previous
              </button>
              <span className="font-mono text-xs text-slate-700 tabular-nums">
                Packet {stepIdx + 1} / {HANDSHAKE_STEPS.length}
              </span>
              <button
                type="button"
                onClick={() => setStepIdx((i) => Math.min(HANDSHAKE_STEPS.length - 1, i + 1))}
                disabled={stepIdx === HANDSHAKE_STEPS.length - 1}
                className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 disabled:opacity-40 whitespace-nowrap"
              >
                Next Packet
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Direction</th>
                  <th className="px-3 py-2 font-medium">Flags</th>
                  <th className="px-3 py-2 font-medium">Raw Seq / Ack</th>
                  <th className="px-3 py-2 font-medium">Wireshark Relative</th>
                  <th className="px-3 py-2 font-medium text-right">Len</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {HANDSHAKE_STEPS.map((row, idx) => {
                  const isActive = idx === stepIdx;
                  const isPast = idx < stepIdx;
                  return (
                    <tr
                      key={row.step}
                      onClick={() => setStepIdx(idx)}
                      className={`cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-slate-900 font-semibold'
                          : isPast
                          ? 'bg-white text-slate-700 hover:bg-slate-50'
                          : 'bg-white text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-3 py-2">{row.step}</td>
                      <td className="px-3 py-2 font-sans">{row.dir}</td>
                      <td className="px-3 py-2">{row.flags}</td>
                      <td className="px-3 py-2">
                        Seq={row.rawSeq}, Ack={row.rawAck}
                      </td>
                      <td className="px-3 py-2">
                        Seq={row.relSeq}, Ack={row.relAck}
                      </td>
                      <td className="px-3 py-2 text-right">{row.len} B</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-800">
            <span className="font-semibold text-slate-900">
              Packet {currentStep.step} ({currentStep.flags}):{' '}
            </span>
            {currentStep.explanation}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex justify-between font-mono text-[11px] text-slate-500 tabular-nums">
            <span>Bit 0</span>
            <span>Bit 15 | Bit 16</span>
            <span>Bit 31</span>
          </div>
          <div className="grid grid-cols-12 gap-1.5">
            {TCP_FIELDS.map((field) => {
              const isSelected = field.id === activeField.id;
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => setSelectedField(field.id)}
                  className={`${field.span} rounded-md border px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    isSelected
                      ? 'border-blue-700 bg-blue-50 text-slate-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-xs font-semibold leading-snug">{field.label}</div>
                  <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {field.bits}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3.5 text-sm">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-slate-900">{activeField.label}</span>
              <span className="font-mono text-xs text-slate-500">{activeField.rfcNote}</span>
            </div>
            <p className="text-slate-700 leading-relaxed">{activeField.summary}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function WindowAndRtoExplorer() {
  const [mode, setMode] = useState<'window' | 'rto'>('window');

  // Window calculator state
  const [packetBytes, setPacketBytes] = useState(1250);
  const [linkMbps, setLinkMbps] = useState(2);
  const [propMs, setPropMs] = useState(15);
  const [windowSize, setWindowSize] = useState(5);

  const util = calculateWindowUtilization(packetBytes, linkMbps, propMs, windowSize);

  // RTO calculator state
  const [r1, setR1] = useState(80);
  const [r2, setR2] = useState(120);
  const [r3, setR3] = useState(205);
  const [timeouts, setTimeouts] = useState(0);

  const rtoSteps = calculateRfc6298Steps([r1, r2, r3]);
  const lastStep = rtoSteps[rtoSteps.length - 1];
  const backedOffRto = Math.min(60000, lastStep.rfc6298RtoMs * Math.pow(2, timeouts));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-slate-900">
          Interactive Section 4 Calculators
        </h4>
        <div className="inline-flex rounded-md bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('window')}
            className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              mode === 'window'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stop-and-Wait & Window Utilization
          </button>
          <button
            type="button"
            onClick={() => setMode('rto')}
            className={`rounded px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              mode === 'rto'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            RFC 6298 RTO Estimator
          </button>
        </div>
      </div>

      {mode === 'window' ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">
                <label htmlFor="sw-bytes">Frame Size (L)</label>
                <span className="font-mono tabular-nums text-slate-900">{packetBytes} bytes</span>
              </div>
              <input
                id="sw-bytes"
                type="range"
                min={250}
                max={2000}
                step={250}
                value={packetBytes}
                onChange={(e) => setPacketBytes(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">
                <label htmlFor="sw-rate">Link Rate (R, decimal Mbps)</label>
                <span className="font-mono tabular-nums text-slate-900">{linkMbps} Mbps</span>
              </div>
              <input
                id="sw-rate"
                type="range"
                min={1}
                max={10}
                step={1}
                value={linkMbps}
                onChange={(e) => setLinkMbps(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">
                <label htmlFor="sw-prop">One-Way Propagation Delay (T_prop)</label>
                <span className="font-mono tabular-nums text-slate-900">{propMs} ms</span>
              </div>
              <input
                id="sw-prop"
                type="range"
                min={5}
                max={60}
                step={5}
                value={propMs}
                onChange={(e) => setPropMs(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>

            <div>
              <div className="mb-1 flex justify-between text-xs font-medium text-slate-700">
                <label htmlFor="sw-win">Sliding Window Size (W)</label>
                <span className="font-mono tabular-nums text-slate-900">{windowSize} frames</span>
              </div>
              <input
                id="sw-win"
                type="range"
                min={1}
                max={30}
                step={1}
                value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                className="w-full accent-blue-700"
              />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs space-y-3">
            <div className="font-sans text-xs text-slate-600">
              Assumptions: ACK transmission ≈ 0, processing/queuing ≈ 0, 0% loss, 1 Mbps = 10⁶ bps.
            </div>
            <div className="grid grid-cols-2 gap-3 font-mono tabular-nums">
              <div className="rounded border border-slate-200 bg-white p-2.5">
                <div className="font-sans text-[11px] text-slate-500">T_trans = L / R</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">
                  {util.transmissionMs.toFixed(2)} ms
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2.5">
                <div className="font-sans text-[11px] text-slate-500">RTT = 2 × T_prop</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">
                  {util.propagationRttMs.toFixed(1)} ms
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2.5">
                <div className="font-sans text-[11px] text-slate-500">Stop-and-Wait (W = 1)</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">
                  {(util.stopAndWaitUtil * 100).toFixed(2)}%
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-white p-2.5">
                <div className="font-sans text-[11px] text-slate-500">
                  Sliding Window (W = {windowSize})
                </div>
                <div className="mt-0.5 text-sm font-semibold text-blue-700">
                  {(util.slidingWindowUtil * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Link utilization bar (capped at 100%)</span>
                <span className="font-mono tabular-nums">
                  Full pipe needs W ≥ {util.minWindowForFullPipe}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-blue-700 transition-transform duration-150 origin-left"
                  style={{ transform: `scaleX(${util.slidingWindowUtil})` }}
                />
              </div>
              <div className="font-mono text-[11px] text-slate-600 tabular-nums">
                Effective throughput: {util.slidingWindowThroughputMbps.toFixed(3)} Mbps (vs.{' '}
                {util.stopAndWaitThroughputMbps.toFixed(3)} Mbps for Stop-and-Wait)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Sample 1 (R₁, ms)', value: r1, set: setR1 },
              { label: 'Sample 2 (R₂, ms)', value: r2, set: setR2 },
              { label: 'Sample 3 (R₃, ms)', value: r3, set: setR3 },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {item.label}
                </label>
                <input
                  type="number"
                  min={1}
                  max={5000}
                  value={item.value}
                  onChange={(e) => item.set(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 font-mono text-sm text-slate-900 tabular-nums focus:border-blue-700 focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-3 py-2 font-medium">Sample</th>
                  <th className="px-3 py-2 font-medium text-right">R (ms)</th>
                  <th className="px-3 py-2 font-medium text-right">SRTT (ms)</th>
                  <th className="px-3 py-2 font-medium text-right">RTTVAR (ms)</th>
                  <th className="px-3 py-2 font-medium text-right">Formula RTO</th>
                  <th className="px-3 py-2 font-medium text-right">RFC 6298 RTO (≥ 1 s)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-800">
                {rtoSteps.map((s) => (
                  <tr key={s.stepIndex}>
                    <td className="px-3 py-2 font-sans text-slate-700">
                      Sample {s.stepIndex} {s.isInitialSample ? '(init)' : ''}
                    </td>
                    <td className="px-3 py-2 text-right">{s.sampleRttMs}</td>
                    <td className="px-3 py-2 text-right">{s.srttMs}</td>
                    <td className="px-3 py-2 text-right">{s.rttvarMs}</td>
                    <td className="px-3 py-2 text-right">{s.formulaRtoMs} ms</td>
                    <td className="px-3 py-2 text-right font-semibold text-blue-700">
                      {s.rfc6298RtoMs} ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <div className="space-y-1 text-slate-700">
              <div>
                <span className="font-semibold text-slate-900">Exponential Backoff (Karn’s Rule):</span>{' '}
                Consecutive timeouts after Sample 3 double RTO without updating SRTT from retransmitted segments.
              </div>
              <div className="font-mono tabular-nums text-slate-900">
                Timeouts: {timeouts} → Active RFC 6298 RTO ={' '}
                <strong>{backedOffRto} ms ({(backedOffRto / 1000).toFixed(2)} s)</strong>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTimeouts((t) => Math.min(5, t + 1))}
                className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-800 whitespace-nowrap"
              >
                Simulate Timeout (×2)
              </button>
              <button
                type="button"
                onClick={() => setTimeouts(0)}
                disabled={timeouts === 0}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 whitespace-nowrap"
              >
                Reset Backoff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function CongestionTrajectoryExplorer() {
  const [initialCwnd, setInitialCwnd] = useState(1);
  const [initialSsthresh, setInitialSsthresh] = useState(8);
  const [rwnd, setRwnd] = useState(12);
  const [selectedRtt, setSelectedRtt] = useState(7);

  const points = simulateRenoTrajectory({
    initialCwnd,
    initialSsthresh,
    rwnd,
    tripleDupAckRtt: 8,
    timeoutRtt: 11,
    totalRtts: 13,
  });

  const activePoint = points[selectedRtt] ?? points[0];
  const maxY = Math.max(16, rwnd + 2, ...points.map((p) => p.cwnd + 2));

  // SVG layout coordinates
  const width = 620;
  const height = 220;
  const padL = 42;
  const padR = 20;
  const padT = 18;
  const padB = 30;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const xPos = (rtt: number) => padL + (rtt / 13) * innerW;
  const yPos = (val: number) => padT + innerH - (val / maxY) * innerH;

  const cwndPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPos(p.rtt).toFixed(1)} ${yPos(p.cwnd).toFixed(1)}`)
    .join(' ');
  const ssthreshPath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${xPos(p.rtt).toFixed(1)} ${yPos(p.ssthresh).toFixed(1)}`)
    .join(' ');

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">
          Interactive TCP Reno Congestion Control Model (3 Dup ACKs at RTT 8 · Timeout at RTT 11)
        </h4>
        <span className="text-xs text-slate-500">Click any RTT point to inspect state</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-700">
            <label htmlFor="cc-iw">Initial cwnd</label>
            <span className="font-mono tabular-nums font-medium">{initialCwnd} MSS</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 4, 10].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setInitialCwnd(v)}
                className={`flex-1 rounded border py-1 font-mono text-xs tabular-nums transition-colors ${
                  initialCwnd === v
                    ? 'border-blue-700 bg-blue-50 font-semibold text-blue-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {v === 10 ? '10*' : v}
              </button>
            ))}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">*10 MSS = RFC 6928 (Experimental IW10)</div>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-700">
            <label htmlFor="cc-ss">Initial ssthresh</label>
            <span className="font-mono tabular-nums font-medium">{initialSsthresh} MSS</span>
          </div>
          <input
            id="cc-ss"
            type="range"
            min={4}
            max={16}
            step={2}
            value={initialSsthresh}
            onChange={(e) => setInitialSsthresh(Number(e.target.value))}
            className="w-full accent-blue-700"
          />
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-700">
            <label htmlFor="cc-rwnd">Receiver Window (rwnd)</label>
            <span className="font-mono tabular-nums font-medium">{rwnd} MSS</span>
          </div>
          <input
            id="cc-rwnd"
            type="range"
            min={6}
            max={20}
            step={2}
            value={rwnd}
            onChange={(e) => setRwnd(Number(e.target.value))}
            className="w-full accent-blue-700"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50/70 p-3">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[460px] h-auto"
          role="img"
          aria-label="TCP Reno cwnd and ssthresh trajectory across RTTs"
        >
          {/* Horizontal grid lines */}
          {[0, 4, 8, 12, 16].filter((v) => v <= maxY).map((v) => (
            <g key={v}>
              <line
                x1={padL}
                y1={yPos(v)}
                x2={width - padR}
                y2={yPos(v)}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={yPos(v) + 4}
                textAnchor="end"
                className="fill-slate-500 font-mono text-[10px]"
              >
                {v}
              </text>
            </g>
          ))}

          {/* rwnd cap line */}
          <line
            x1={padL}
            y1={yPos(rwnd)}
            x2={width - padR}
            y2={yPos(rwnd)}
            stroke="#0f766e"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x={width - padR - 4}
            y={yPos(rwnd) - 5}
            textAnchor="end"
            className="fill-teal-800 font-mono text-[10px] font-medium"
          >
            rwnd = {rwnd} MSS
          </text>

          {/* ssthresh dashed line */}
          <path
            d={ssthreshPath}
            fill="none"
            stroke="#b45309"
            strokeWidth="1.75"
            strokeDasharray="5 3"
          />

          {/* cwnd solid line */}
          <path d={cwndPath} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />

          {/* Interactive RTT points */}
          {points.map((p) => {
            const isSel = p.rtt === selectedRtt;
            return (
              <g
                key={p.rtt}
                onClick={() => setSelectedRtt(p.rtt)}
                className="cursor-pointer"
              >
                <circle
                  cx={xPos(p.rtt)}
                  cy={yPos(p.cwnd)}
                  r={isSel ? 6 : 4}
                  fill={
                    p.phase === 'Timeout Reset'
                      ? '#b91c1c'
                      : p.phase === 'Fast Recovery'
                      ? '#b45309'
                      : '#1d4ed8'
                  }
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                <text
                  x={xPos(p.rtt)}
                  y={height - 10}
                  textAnchor="middle"
                  className={`font-mono text-[10px] ${
                    isSel ? 'fill-slate-900 font-semibold' : 'fill-slate-500'
                  }`}
                >
                  {p.rtt}
                </text>
              </g>
            );
          })}

          <text x={padL} y={12} className="fill-slate-500 font-sans text-[10px]">
            MSS
          </text>
          <text
            x={width / 2}
            y={height - 1}
            textAnchor="middle"
            className="fill-slate-500 font-sans text-[10px]"
          >
            Transmission Round (RTT)
          </text>
        </svg>

        <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-600">
          <span>Solid blue: cwnd</span>
          <span>Dashed amber: ssthresh</span>
          <span>Dashed teal: rwnd cap</span>
          <span>Amber dot (RTT 8): 3 Dup ACKs</span>
          <span>Red dot (RTT 11): RTO Timeout</span>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3.5 text-sm">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular-nums">
          <span className="font-semibold text-slate-900">
            RTT {activePoint.rtt} · {activePoint.phase}
          </span>
          <span className="text-slate-700">
            cwnd = {activePoint.cwnd} MSS · ssthresh = {activePoint.ssthresh} MSS · Effective ={' '}
            {activePoint.effectiveWindow} MSS
          </span>
        </div>
        <p className="text-slate-700 text-xs leading-relaxed">{activePoint.note}</p>
      </div>
    </div>
  );
}
