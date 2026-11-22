import { useState } from 'react';
import { Check, Eye, RotateCcw, X } from 'lucide-react';
import { calculateIpv4Subnet } from '../utils/networkMath';

interface SubnettingViewProps {
  showArabicCues: boolean;
}

interface SubnetDrillItem {
  id: string;
  cidr: string;
  ip: string;
  prefix: number;
  label: string;
}

const DRILL_ITEMS: SubnetDrillItem[] = [
  { id: 'drill-26-a', cidr: '192.168.84.105/26', ip: '192.168.84.105', prefix: 26, label: 'Practice A (/26 LAN)' },
  { id: 'drill-26-b', cidr: '10.12.30.202/26', ip: '10.12.30.202', prefix: 26, label: 'Practice B (/26 LAN)' },
  { id: 'drill-20-a', cidr: '172.18.54.210/20', ip: '172.18.54.210', prefix: 20, label: 'Practice C (/20 Block)' },
  { id: 'drill-20-b', cidr: '10.90.135.42/20', ip: '10.90.135.42', prefix: 20, label: 'Practice D (/20 Block)' },
];

const PRESETS = [
  { label: '192.168.45.150/26', ip: '192.168.45.150', prefix: 26 },
  { label: '172.20.73.19/20', ip: '172.20.73.19', prefix: 20 },
  { label: '10.0.12.6/31 (RFC 3021)', ip: '10.0.12.6', prefix: 31 },
  { label: '192.168.10.29/28', ip: '192.168.10.29', prefix: 28 },
];

type DrillField = 'mask' | 'network' | 'broadcast' | 'firstUsable' | 'lastUsable' | 'usableHosts';

export function SubnettingView({ showArabicCues }: SubnettingViewProps) {
  // Interactive Solver state
  const [solverIp, setSolverIp] = useState('192.168.45.150');
  const [solverPrefix, setSolverPrefix] = useState(26);
  const solved = calculateIpv4Subnet(solverIp, solverPrefix);

  // Multi-field fresh /26 & /20 drill state
  const [activeDrillId, setActiveDrillId] = useState(DRILL_ITEMS[0].id);
  const [inputs, setInputs] = useState<Record<string, Partial<Record<DrillField, string>>>>({});
  const [checkedDrills, setCheckedDrills] = useState<Record<string, boolean>>({});
  const [revealedDrills, setRevealedDrills] = useState<Record<string, boolean>>({});

  const activeDrill = DRILL_ITEMS.find((d) => d.id === activeDrillId) ?? DRILL_ITEMS[0];
  const expected = calculateIpv4Subnet(activeDrill.ip, activeDrill.prefix)!;
  const currentInputs = inputs[activeDrill.id] ?? {};
  const isChecked = !!checkedDrills[activeDrill.id];
  const isRevealed = !!revealedDrills[activeDrill.id];

  const updateDrillInput = (field: DrillField, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [activeDrill.id]: {
        ...(prev[activeDrill.id] ?? {}),
        [field]: value,
      },
    }));
  };

  const checkField = (field: DrillField): boolean => {
    const raw = (currentInputs[field] ?? '').trim().replace(/,/g, '');
    switch (field) {
      case 'mask':
        return raw === expected.mask;
      case 'network':
        return raw === expected.networkAddress;
      case 'broadcast':
        return raw === expected.broadcastAddress;
      case 'firstUsable':
        return raw === expected.firstUsable;
      case 'lastUsable':
        return raw === expected.lastUsable;
      case 'usableHosts':
        return raw === String(expected.usableHosts);
    }
  };

  const drillFields: { key: DrillField; label: string; placeholder: string; answer: string }[] = [
    { key: 'mask', label: 'Subnet Mask', placeholder: 'e.g. 255.255.255.192', answer: expected.mask },
    { key: 'network', label: 'Network Address', placeholder: 'e.g. 192.168.84.64', answer: expected.networkAddress },
    { key: 'broadcast', label: 'Broadcast Address', placeholder: 'e.g. 192.168.84.127', answer: expected.broadcastAddress },
    { key: 'firstUsable', label: 'First Usable Host', placeholder: 'Network + 1', answer: expected.firstUsable },
    { key: 'lastUsable', label: 'Last Usable Host', placeholder: 'Broadcast − 1', answer: expected.lastUsable },
    { key: 'usableHosts', label: 'Usable Host Count (LAN)', placeholder: 'e.g. 62 or 4094', answer: String(expected.usableHosts) },
  ];

  const correctFieldCount = drillFields.filter((f) => checkField(f.key)).length;

  return (
    <div className="space-y-8">
      {/* Unmistakable Supplemental Scope Banner */}
      <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-4 sm:p-5 space-y-1.5">
        <div className="text-xs font-semibold text-amber-900">
          Supplemental Practice Module · Separate from Sections 2–5 Course PDFs
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          IPv4 CIDR Subnetting Practice (/26, /20 & RFC 3021 /31)
        </h1>
        <p className="text-sm text-amber-950 leading-relaxed max-w-3xl">
          <strong>Source Scope Notice:</strong> The four attached Section 2–5 course PDFs cover only the Transport Layer (UDP, TCP, Stop-and-Wait, Sliding Windows, RTO, and Congestion Control) and do <strong>not</strong> contain IPv4 subnetting. This supplemental section is provided separately for subnetting exam practice using RFC 4632 (BCP 122), RFC 1878, RFC 3021, and Cisco’s IPv4 Subnetting Reference Chart.
        </p>
      </div>

      {/* 1. Core Method Lesson */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-base font-bold text-slate-900">
              5-Step Exam Method for Ordinary IPv4 LANs
            </h2>
            {showArabicCues && (
              <span className="text-xs text-slate-500" dir="rtl">
                تقسيم الشبكات الفرعية
              </span>
            )}
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700 leading-relaxed">
            <li>
              <strong>Prefix /n → Mask:</strong> Write <code className="font-mono text-slate-900">n</code> leading 1-bits followed by <code className="font-mono text-slate-900">32 − n</code> host 0-bits across four 8-bit octets.
            </li>
            <li>
              <strong>Interesting Octet & Block Size:</strong> Find the octet where the mask is neither 255 nor 0 (or octet 4 if /24). Compute <code className="font-mono text-slate-900">Block Size = 256 − mask_octet</code>.
            </li>
            <li>
              <strong>Network Address:</strong> Round the IP’s interesting octet DOWN to the nearest multiple of Block Size; set all octets to the right to <code className="font-mono text-slate-900">0</code>.
            </li>
            <li>
              <strong>Broadcast Address:</strong> Set the interesting octet to <code className="font-mono text-slate-900">network_octet + Block Size − 1</code>; set all octets to the right to <code className="font-mono text-slate-900">255</code>.
            </li>
            <li>
              <strong>Usable Range & Host Count:</strong> For ordinary Ethernet LANs (<code className="font-mono text-slate-900">/n ≤ /30</code>), reserve Network and Broadcast: First = Network + 1, Last = Broadcast − 1, Usable Hosts = <code className="font-mono text-slate-900">2^(32 − n) − 2</code>.
            </li>
          </ol>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            The RFC 3021 /31 Point-to-Point Exception
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Applying the ordinary LAN formula <code className="font-mono text-slate-900">2^(32 − 31) − 2</code> to a <code className="font-mono text-slate-900">/31</code> prefix yields <code className="font-mono text-slate-900">0</code> usable hosts. However, on a direct point-to-point link between two routers, there is no multi-host broadcast domain requiring a subnet-directed broadcast address.
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            <strong>RFC 3021</strong> authorizes <code className="font-mono text-slate-900">/31</code> (<code className="font-mono text-slate-900">255.255.255.254</code>) on point-to-point links so <strong>both</strong> addresses are assigned to the two router endpoints—providing <strong>2 usable hosts</strong> and halving IPv4 consumption compared with <code className="font-mono text-slate-900">/30</code>.
          </p>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 tabular-nums">
            Example: 10.0.12.6/31 → Router A = 10.0.12.6 · Router B = 10.0.12.7 · Usable = 2 (RFC 3021)
          </div>
          <p className="text-xs text-slate-600">
            Note: <code className="font-mono">/32</code> (<code className="font-mono">255.255.255.255</code>) denotes a single host route (1 address, such as a router loopback interface).
          </p>
        </div>
      </section>

      {/* 2. Original Worked Examples for /26 and /20 */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Original Worked Examples: /26 and /20 Prefixes
        </h2>
        <div className="grid gap-5 lg:grid-cols-2">
          {/* /26 Worked Example */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <div className="text-xs text-slate-500">Worked Example 1 · /26 Prefix (Ordinary LAN)</div>
            <h3 className="text-base font-bold text-slate-900 font-mono">192.168.45.150/26</h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>
                <strong>1. Mask & Host Bits:</strong> 26 network bits = <code className="font-mono text-slate-900">11111111.11111111.11111111.11000000</code> = <code className="font-mono font-semibold text-slate-900">255.255.255.192</code>; host bits = <code className="font-mono">32 − 26 = 6</code>.
              </li>
              <li>
                <strong>2. Block Size:</strong> Interesting 4th octet mask = <code className="font-mono">192</code> → Block Size = <code className="font-mono">256 − 192 = 64</code>. Multiples: <code className="font-mono">0, 64, 128, 192</code>.
              </li>
              <li>
                <strong>3. Locate 150:</strong> <code className="font-mono">128 ≤ 150 ≤ 191</code> → Network = <code className="font-mono font-semibold text-slate-900">192.168.45.128</code>.
              </li>
              <li>
                <strong>4. Broadcast:</strong> <code className="font-mono">128 + 64 − 1 = 191</code> → Broadcast = <code className="font-mono font-semibold text-slate-900">192.168.45.191</code>.
              </li>
              <li>
                <strong>5. Usable Range & Count:</strong> <code className="font-mono font-semibold text-slate-900">192.168.45.129 – 192.168.45.190</code>; Total = 2⁶ = 64; Usable = 64 − 2 = <strong>62 hosts</strong>.
              </li>
            </ul>
          </div>

          {/* /20 Worked Example */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
            <div className="text-xs text-slate-500">Worked Example 2 · /20 Prefix (3rd-Octet Split)</div>
            <h3 className="text-base font-bold text-slate-900 font-mono">172.20.73.19/20</h3>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>
                <strong>1. Mask & Host Bits:</strong> 20 network bits = <code className="font-mono text-slate-900">11111111.11111111.11110000.00000000</code> = <code className="font-mono font-semibold text-slate-900">255.255.240.0</code>; host bits = <code className="font-mono">32 − 20 = 12</code>.
              </li>
              <li>
                <strong>2. Block Size:</strong> Interesting 3rd octet mask = <code className="font-mono">240</code> → Block Size = <code className="font-mono">256 − 240 = 16</code>. Multiples: <code className="font-mono">0, 16, 32, 48, 64, 80...</code>
              </li>
              <li>
                <strong>3. Locate 73:</strong> <code className="font-mono">64 ≤ 73 ≤ 79</code>; 4th octet becomes <code className="font-mono">0</code> → Network = <code className="font-mono font-semibold text-slate-900">172.20.64.0</code>.
              </li>
              <li>
                <strong>4. Broadcast:</strong> 3rd octet = <code className="font-mono">64 + 16 − 1 = 79</code>, 4th octet = <code className="font-mono">255</code> → Broadcast = <code className="font-mono font-semibold text-slate-900">172.20.79.255</code>.
              </li>
              <li>
                <strong>5. Usable Range & Count:</strong> <code className="font-mono font-semibold text-slate-900">172.20.64.1 – 172.20.79.254</code>; Total = 2¹² = 4,096; Usable = 4,096 − 2 = <strong>4,094 hosts</strong>.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Interactive Step-by-Step CIDR Breakdown Tool */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900">
            Interactive IPv4 CIDR Breakdown Tool
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setSolverIp(p.ip);
                  setSolverPrefix(p.prefix);
                }}
                className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-700 hover:border-blue-700 hover:text-blue-800 transition-colors whitespace-nowrap"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
          <div>
            <label htmlFor="cidr-ip" className="block text-xs font-medium text-slate-700 mb-1">
              IPv4 Address
            </label>
            <input
              id="cidr-ip"
              type="text"
              value={solverIp}
              onChange={(e) => setSolverIp(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="cidr-prefix" className="block text-xs font-medium text-slate-700 mb-1">
              Prefix (/n)
            </label>
            <select
              id="cidr-prefix"
              value={solverPrefix}
              onChange={(e) => setSolverPrefix(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 tabular-nums focus:border-blue-700 focus:outline-none"
            >
              {Array.from({ length: 25 }, (_, i) => i + 8).map((n) => (
                <option key={n} value={n}>
                  /{n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {solved ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 font-mono text-xs tabular-nums">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="font-sans text-slate-500">Subnet Mask</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">{solved.mask}</div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="font-sans text-slate-500">
                  Block Size (Octet {solved.interestingOctetIndex + 1})
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">
                  {solved.blockSize} ({solved.hostBits} host bits)
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="font-sans text-slate-500">Network Address</div>
                <div className="mt-0.5 text-sm font-semibold text-blue-800">
                  {solved.networkAddress}/{solved.prefix}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="font-sans text-slate-500">
                  {solved.isPointToPoint31 ? 'Second Endpoint (No Broadcast)' : 'Broadcast Address'}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">
                  {solved.broadcastAddress}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="font-sans text-slate-500">Usable Host Range</div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">
                  {solved.firstUsable} – {solved.lastUsable}
                </div>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="font-sans text-slate-500">Total / Usable Hosts</div>
                <div className="mt-0.5 text-sm font-semibold text-teal-800">
                  {solved.totalAddresses.toLocaleString()} / {solved.usableHosts.toLocaleString()}
                  {solved.isPointToPoint31 && ' (RFC 3021)'}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700 space-y-1">
              <div>IP Binary:   {solved.ipBinary}</div>
              <div>Mask Binary: {solved.maskBinary}</div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800">
            Enter a valid dotted-decimal IPv4 address (four octets between 0 and 255).
          </div>
        )}
      </section>

      {/* 4. Fresh /26 and /20 Multi-Field Interactive Practice Drill */}
      <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Fresh /26 & /20 Interactive Practice Drill
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Solve all 6 fields for each ordinary IPv4 LAN address, then check or reveal steps.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 rounded-md bg-slate-100 p-1">
            {DRILL_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveDrillId(item.id)}
                className={`rounded px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  item.id === activeDrill.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-slate-700">
            Given host IP (ordinary IPv4 LAN):{' '}
            <strong className="font-mono text-base text-slate-900">{activeDrill.cidr}</strong>
          </div>
          <div className="text-xs text-slate-500">
            Prefix /{activeDrill.prefix} · {32 - activeDrill.prefix} host bits
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drillFields.map((f) => {
            const val = currentInputs[f.key] ?? '';
            const ok = checkField(f.key);
            return (
              <div key={f.key} className="space-y-1">
                <label
                  htmlFor={`drill-${f.key}`}
                  className="flex items-center justify-between text-xs font-medium text-slate-700"
                >
                  <span>{f.label}</span>
                  {isChecked &&
                    (ok ? (
                      <span className="inline-flex items-center gap-0.5 text-teal-800 font-semibold">
                        <Check className="h-3.5 w-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-red-700 font-semibold">
                        <X className="h-3.5 w-3.5" /> Check
                      </span>
                    ))}
                </label>
                <input
                  id={`drill-${f.key}`}
                  type="text"
                  value={val}
                  onChange={(e) => updateDrillInput(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={`w-full rounded-md border px-3 py-2 font-mono text-sm tabular-nums focus:outline-none ${
                    isChecked
                      ? ok
                        ? 'border-teal-600 bg-teal-50/40 text-slate-900'
                        : 'border-red-400 bg-red-50/40 text-slate-900'
                      : 'border-slate-300 bg-white text-slate-900 focus:border-blue-700'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCheckedDrills((prev) => ({ ...prev, [activeDrill.id]: true }))}
            className="rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
          >
            Check All Fields
          </button>
          <button
            type="button"
            onClick={() =>
              setRevealedDrills((prev) => ({ ...prev, [activeDrill.id]: !prev[activeDrill.id] }))
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5" />
            {isRevealed ? 'Hide Solution' : 'Reveal Steps'}
          </button>
          <button
            type="button"
            onClick={() => {
              setInputs((prev) => ({ ...prev, [activeDrill.id]: {} }));
              setCheckedDrills((prev) => ({ ...prev, [activeDrill.id]: false }));
              setRevealedDrills((prev) => ({ ...prev, [activeDrill.id]: false }));
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </button>

          {isChecked && (
            <span className="font-mono text-xs text-slate-700 tabular-nums">
              Score: <strong>{correctFieldCount} / 6</strong> fields correct
            </span>
          )}
        </div>

        {isRevealed && (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
            <div className="font-semibold text-slate-900">
              Complete Breakdown for {activeDrill.cidr}
            </div>
            <ol className="list-decimal pl-5 space-y-1 text-slate-800 font-mono tabular-nums">
              <li>
                Mask: /{expected.prefix} → {expected.mask} ({expected.hostBits} host bits)
              </li>
              <li>
                Block Size in Octet {expected.interestingOctetIndex + 1}: 256 −{' '}
                {expected.maskOctetValue} = {expected.blockSize}
              </li>
              <li>Network Address: {expected.networkAddress}</li>
              <li>Broadcast Address: {expected.broadcastAddress}</li>
              <li>
                Usable Host Range: {expected.firstUsable} – {expected.lastUsable}
              </li>
              <li>
                Usable Hosts (ordinary LAN): 2^{expected.hostBits} − 2 ={' '}
                {expected.totalAddresses.toLocaleString()} − 2 ={' '}
                {expected.usableHosts.toLocaleString()}
              </li>
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
