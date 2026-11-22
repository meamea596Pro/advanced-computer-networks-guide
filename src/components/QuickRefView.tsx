import { Printer } from 'lucide-react';

interface QuickRefViewProps {
  showArabicCues: boolean;
}

export function QuickRefView({ showArabicCues }: QuickRefViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="text-xs text-slate-500">
            Exam Cram Sheet · Sections 2–5 Primary + Separate Supplemental IPv4 Strip
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Compact Quick-Reference Sheet
          </h1>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
        >
          <Printer className="h-4 w-4" />
          Print / Save PDF
        </button>
      </div>

      {/* 1. UDP vs TCP Comparison */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          1. UDP (Section 2 · RFC 768) vs. TCP (Section 3 · RFC 9293)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-4 py-2.5">Property</th>
                <th className="px-4 py-2.5">UDP (RFC 768)</th>
                <th className="px-4 py-2.5">TCP (RFC 9293)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Service Model</td>
                <td className="px-4 py-2.5">Connectionless datagrams (no handshake)</td>
                <td className="px-4 py-2.5">Connection-oriented ordered byte stream (3-way handshake)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Header Size</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">Fixed 8 bytes (4 × 16-bit fields)</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">20 bytes min – 60 bytes max (Data Offset × 4 B)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Length / Offset Field</td>
                <td className="px-4 py-2.5">Length = header (8 B) + payload</td>
                <td className="px-4 py-2.5">4-bit Data Offset counts 32-bit (4-byte) words (5..15)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Reliability & Ordering</td>
                <td className="px-4 py-2.5">None (checksum detects corruption & drops; no recovery)</td>
                <td className="px-4 py-2.5">Seq/ACK numbers, retransmissions, cumulative ACK = next byte expected</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Flow / Congestion Control</td>
                <td className="px-4 py-2.5">None at transport layer</td>
                <td className="px-4 py-2.5">Flow control (rwnd) + Congestion control (cwnd); Flight ≤ min(cwnd, rwnd)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Common Ports (16-bit)</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">DNS 53, DHCP 67/68, NTP 123</td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">HTTP 80, HTTPS 443, FTP 21/20, SSH 22, SMTP 25, IMAP 143/993</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="rounded-md border border-slate-200 bg-white p-3.5 space-y-1">
            <div className="font-semibold text-slate-900">Port Ranges (16-bit: 0–65,535)</div>
            <div className="font-mono text-slate-700 tabular-nums">
              Well-known: 0–1023 · Registered: 1024–49151 · Ephemeral: 49152–65535
            </div>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-3.5 space-y-1">
            <div className="font-semibold text-slate-900">TCP Handshake & Wireshark Caveat</div>
            <div className="text-slate-700">
              SYN consumes 1 seq number (SYN Seq=0 → SYN-ACK Seq=0, Ack=1 → ACK Seq=1, Ack=1). Wireshark labels are heuristic—check for capture gaps and reordering.
            </div>
          </div>
        </div>
      </section>

      {/* 2. Reliability, Sliding Windows & Timers */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          2. Stop-and-Wait, Sliding Windows, RTO & Delayed ACKs (Section 4)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-4 py-2.5">Topic</th>
                <th className="px-4 py-2.5">Formula / Rule</th>
                <th className="px-4 py-2.5">Critical Assumption / RFC Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Stop-and-Wait Utilization
                  {showArabicCues && <div className="text-xs text-slate-500 font-normal" dir="rtl">التوقف والانتظار</div>}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  T_trans = L / R<br />
                  U = T_trans / (T_trans + 2·T_prop)
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-700">
                  Assumes ACK transmission ≈ 0, processing ≈ 0, 0% loss, decimal Mbps (10⁶ bps).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  Sliding Window Utilization
                </td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  U = min(1, W·T_trans / (T_trans + RTT))<br />
                  W_min = ⌈(T_trans + RTT) / T_trans⌉
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-700">
                  Always cap U ≤ 1 (100%). GBN requires W ≤ 2^k − 1; Selective Repeat requires W ≤ 2^(k−1).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  GBN vs. Selective Repeat
                </td>
                <td className="px-4 py-2.5 text-xs">
                  GBN: cumulative ACKs, 1 timer, retransmits from base onward.<br />
                  SR: individual ACKs, per-frame timers, retransmits lost frame only.
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-700">
                  If ACK 0 is lost while frames 1–3 arrive: GBN needs 0 retransmissions (cumulative ACK); SR retransmits frame 0 only.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  RFC 6298 RTO Estimation
                  {showArabicCues && <div className="text-xs text-slate-500 font-normal" dir="rtl">مهلة إعادة الإرسال</div>}
                </td>
                <td className="px-4 py-2.5 font-mono text-xs tabular-nums">
                  Init: SRTT = R₁, RTTVAR = R₁/2<br />
                  RTTVAR ← 0.75·RTTVAR + 0.25·|SRTT − R|<br />
                  SRTT ← 0.875·SRTT + 0.125·R<br />
                  RTO = max(1 s, SRTT + max(G, 4·RTTVAR))
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-700">
                  K = 4, 1-second lower bound (RFC 6298 §2.4). Karn’s rule: ignore RTT samples from retransmissions; double RTO on each timeout (backoff).
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">
                  RFC 5681 Delayed ACKs
                </td>
                <td className="px-4 py-2.5 text-xs">
                  ACK at least every 2nd full-sized segment, and within 500 ms of first unacked packet.
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-700">
                  Do NOT use a mythical "fixed 1-second delayed ACK rule." Out-of-order segments trigger immediate duplicate ACKs.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Congestion Control */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          3. TCP Congestion Control Models (Section 5 · RFC 5681, 6928, 9438)
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="px-4 py-2.5">Phase / Variant</th>
                <th className="px-4 py-2.5">Rule / Behavior</th>
                <th className="px-4 py-2.5">Exam & Real-World Distinction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Slow Start (cwnd &lt; ssthresh)</td>
                <td className="px-4 py-2.5 font-mono text-xs">+1 MSS per new ACK (≈ 2× per RTT with 1 ACK/seg)</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">With delayed ACKs (1 per 2 segs) & ACK counting, grows ≈ 1.5×/RTT.</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">Congestion Avoidance (cwnd ≥ ssthresh)</td>
                <td className="px-4 py-2.5 font-mono text-xs">Linear Additive Increase: +1 MSS per RTT</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">Effective window is always capped by min(cwnd, rwnd).</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">3 Duplicate ACKs (Reno Fast Retransmit)</td>
                <td className="px-4 py-2.5 font-mono text-xs">ssthresh = max(Flight/2, 2·MSS); cwnd → ssthresh</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">Stays in Congestion Avoidance (avoids dropping to 1 MSS).</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">RTO Timeout (Reno)</td>
                <td className="px-4 py-2.5 font-mono text-xs">ssthresh = max(Flight/2, 2·MSS); cwnd = 1 MSS</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">Restarts Slow Start! (In older Tahoe, 3 dup ACKs also reset to 1 MSS.)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-slate-900">RFC 6928 (IW10) & RFC 9438 (CUBIC)</td>
                <td className="px-4 py-2.5 text-xs">IW10: Experimental 10 MSS start. CUBIC: β = 0.7 (30% cut) + cubic time growth.</td>
                <td className="px-4 py-2.5 text-xs text-slate-700">Lecture Reno exercises are a teaching model, not universal modern TCP.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Separate Supplemental IPv4 Subnetting Reference */}
      <section className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/40 p-5">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-amber-900">
            Supplemental Reference · Not Drawn from Sections 2–5 Course PDFs
          </div>
          <h2 className="text-base font-bold text-slate-900">
            4. IPv4 CIDR Subnetting Quick Strip (RFC 4632, RFC 1878, RFC 3021)
          </h2>
        </div>

        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-sans text-slate-600">
                <th className="px-3 py-2 font-semibold">Prefix</th>
                <th className="px-3 py-2 font-semibold">Subnet Mask</th>
                <th className="px-3 py-2 font-semibold">Block Size</th>
                <th className="px-3 py-2 font-semibold text-right">Total IPs</th>
                <th className="px-3 py-2 font-semibold text-right">Usable Hosts</th>
                <th className="px-3 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr className="bg-blue-50/50">
                <td className="px-3 py-2 font-semibold">/20</td>
                <td className="px-3 py-2">255.255.240.0</td>
                <td className="px-3 py-2">16 (3rd octet)</td>
                <td className="px-3 py-2 text-right">4,096</td>
                <td className="px-3 py-2 text-right">4,094</td>
                <td className="px-3 py-2 font-sans text-slate-600">12 host bits · Broadcast ends in .255</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold">/24</td>
                <td className="px-3 py-2">255.255.255.0</td>
                <td className="px-3 py-2">1 (3rd) / 256 (4th)</td>
                <td className="px-3 py-2 text-right">256</td>
                <td className="px-3 py-2 text-right">254</td>
                <td className="px-3 py-2 font-sans text-slate-600">8 host bits · Standard LAN</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold">/25</td>
                <td className="px-3 py-2">255.255.255.128</td>
                <td className="px-3 py-2">128 (4th octet)</td>
                <td className="px-3 py-2 text-right">128</td>
                <td className="px-3 py-2 text-right">126</td>
                <td className="px-3 py-2 font-sans text-slate-600">7 host bits</td>
              </tr>
              <tr className="bg-blue-50/50">
                <td className="px-3 py-2 font-semibold">/26</td>
                <td className="px-3 py-2">255.255.255.192</td>
                <td className="px-3 py-2">64 (4th octet)</td>
                <td className="px-3 py-2 text-right">64</td>
                <td className="px-3 py-2 text-right">62</td>
                <td className="px-3 py-2 font-sans text-slate-600">6 host bits · Multiples: 0, 64, 128, 192</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold">/28</td>
                <td className="px-3 py-2">255.255.255.240</td>
                <td className="px-3 py-2">16 (4th octet)</td>
                <td className="px-3 py-2 text-right">16</td>
                <td className="px-3 py-2 text-right">14</td>
                <td className="px-3 py-2 font-sans text-slate-600">4 host bits</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold">/30</td>
                <td className="px-3 py-2">255.255.255.252</td>
                <td className="px-3 py-2">4 (4th octet)</td>
                <td className="px-3 py-2 text-right">4</td>
                <td className="px-3 py-2 text-right">2</td>
                <td className="px-3 py-2 font-sans text-slate-600">Classic 2-host link (50% overhead)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-semibold">/31</td>
                <td className="px-3 py-2">255.255.255.254</td>
                <td className="px-3 py-2">2 (4th octet)</td>
                <td className="px-3 py-2 text-right">2</td>
                <td className="px-3 py-2 text-right">2 (RFC 3021)</td>
                <td className="px-3 py-2 font-sans text-slate-600">Point-to-point exception: no net/bcast loss</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
