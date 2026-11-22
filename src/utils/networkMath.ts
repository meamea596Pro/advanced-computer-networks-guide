export interface SubnetCalculation {
  inputIp: string;
  prefix: number;
  mask: string;
  maskBinary: string;
  ipBinary: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsable: string;
  lastUsable: string;
  totalAddresses: number;
  usableHosts: number;
  interestingOctetIndex: number; // 0..3
  maskOctetValue: number;
  blockSize: number;
  hostBits: number;
  isPointToPoint31: boolean;
  isHostRoute32: boolean;
  wildcardMask: string;
}

export function ipToUint32(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    value = ((value << 8) | n) >>> 0;
  }
  return value >>> 0;
}

export function uint32ToIp(val: number): string {
  const u = val >>> 0;
  return [
    (u >>> 24) & 255,
    (u >>> 16) & 255,
    (u >>> 8) & 255,
    u & 255,
  ].join('.');
}

export function uint32ToBinaryDotted(val: number): string {
  const u = val >>> 0;
  return [
    ((u >>> 24) & 255).toString(2).padStart(8, '0'),
    ((u >>> 16) & 255).toString(2).padStart(8, '0'),
    ((u >>> 8) & 255).toString(2).padStart(8, '0'),
    (u & 255).toString(2).padStart(8, '0'),
  ].join('.');
}

export function calculateIpv4Subnet(ip: string, prefix: number): SubnetCalculation | null {
  if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return null;
  const ipInt = ipToUint32(ip);
  if (ipInt === null) return null;

  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const hostBits = 32 - prefix;
  const totalAddresses = Math.pow(2, hostBits);

  let usableHosts: number;
  let firstUsable: string;
  let lastUsable: string;
  const isPointToPoint31 = prefix === 31;
  const isHostRoute32 = prefix === 32;

  if (isHostRoute32) {
    usableHosts = 1;
    firstUsable = uint32ToIp(networkInt);
    lastUsable = uint32ToIp(networkInt);
  } else if (isPointToPoint31) {
    // RFC 3021 point-to-point exception: both addresses are usable endpoints
    usableHosts = 2;
    firstUsable = uint32ToIp(networkInt);
    lastUsable = uint32ToIp(broadcastInt);
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsable = uint32ToIp((networkInt + 1) >>> 0);
    lastUsable = uint32ToIp((broadcastInt - 1) >>> 0);
  }

  const maskOctets = [
    (maskInt >>> 24) & 255,
    (maskInt >>> 16) & 255,
    (maskInt >>> 8) & 255,
    maskInt & 255,
  ];

  // Interesting octet is the first octet where mask < 255, or octet 3 for /32
  let interestingOctetIndex = maskOctets.findIndex((o) => o < 255);
  if (interestingOctetIndex === -1) {
    interestingOctetIndex = 3;
  }
  const maskOctetValue = maskOctets[interestingOctetIndex];
  const blockSize = prefix === 32 ? 1 : 256 - maskOctetValue;

  return {
    inputIp: uint32ToIp(ipInt),
    prefix,
    mask: uint32ToIp(maskInt),
    maskBinary: uint32ToBinaryDotted(maskInt),
    ipBinary: uint32ToBinaryDotted(ipInt),
    networkAddress: uint32ToIp(networkInt),
    broadcastAddress: uint32ToIp(broadcastInt),
    firstUsable,
    lastUsable,
    totalAddresses,
    usableHosts,
    interestingOctetIndex,
    maskOctetValue,
    blockSize,
    hostBits,
    isPointToPoint31,
    isHostRoute32,
    wildcardMask: uint32ToIp(wildcardInt),
  };
}

export interface WindowUtilizationResult {
  packetBits: number;
  transmissionMs: number;
  propagationRttMs: number;
  cycleMs: number;
  stopAndWaitUtil: number; // 0..1
  slidingWindowRawUtil: number;
  slidingWindowUtil: number; // 0..1 capped
  minWindowForFullPipe: number;
  stopAndWaitThroughputMbps: number;
  slidingWindowThroughputMbps: number;
}

export function calculateWindowUtilization(
  packetBytes: number,
  linkRateMbps: number,
  oneWayPropMs: number,
  windowSize: number
): WindowUtilizationResult {
  const packetBits = packetBytes * 8;
  // Using decimal Mbps (1 Mbps = 10^6 bits/s), standard in networking
  const transmissionMs = (packetBits / (linkRateMbps * 1_000_000)) * 1000;
  const propagationRttMs = 2 * oneWayPropMs;
  const cycleMs = transmissionMs + propagationRttMs;
  const stopAndWaitUtil = transmissionMs / cycleMs;
  const slidingWindowRawUtil = (windowSize * transmissionMs) / cycleMs;
  const slidingWindowUtil = Math.min(1, slidingWindowRawUtil);
  const minWindowForFullPipe = Math.ceil(cycleMs / transmissionMs);

  return {
    packetBits,
    transmissionMs,
    propagationRttMs,
    cycleMs,
    stopAndWaitUtil,
    slidingWindowRawUtil,
    slidingWindowUtil,
    minWindowForFullPipe,
    stopAndWaitThroughputMbps: stopAndWaitUtil * linkRateMbps,
    slidingWindowThroughputMbps: slidingWindowUtil * linkRateMbps,
  };
}

export interface RtoStep {
  stepIndex: number;
  sampleRttMs: number;
  srttMs: number;
  rttvarMs: number;
  formulaRtoMs: number;
  rfc6298RtoMs: number; // clamped at >= 1000 ms
  isInitialSample: boolean;
}

export function calculateRfc6298Steps(
  samplesMs: number[],
  clockGranularityMs = 10
): RtoStep[] {
  const alpha = 0.125; // 1/8
  const beta = 0.25;   // 1/4
  const K = 4;

  const steps: RtoStep[] = [];
  let srtt = 0;
  let rttvar = 0;

  samplesMs.forEach((sample, idx) => {
    if (idx === 0) {
      srtt = sample;
      rttvar = sample / 2;
    } else {
      rttvar = (1 - beta) * rttvar + beta * Math.abs(srtt - sample);
      srtt = (1 - alpha) * srtt + alpha * sample;
    }
    const formulaRtoMs = srtt + Math.max(clockGranularityMs, K * rttvar);
    const rfc6298RtoMs = Math.max(1000, formulaRtoMs);

    steps.push({
      stepIndex: idx + 1,
      sampleRttMs: sample,
      srttMs: Number(srtt.toFixed(3)),
      rttvarMs: Number(rttvar.toFixed(3)),
      formulaRtoMs: Number(formulaRtoMs.toFixed(3)),
      rfc6298RtoMs: Number(rfc6298RtoMs.toFixed(3)),
      isInitialSample: idx === 0,
    });
  });

  return steps;
}

export interface RenoPoint {
  rtt: number;
  cwnd: number;
  ssthresh: number;
  effectiveWindow: number;
  phase: 'Slow Start' | 'Congestion Avoidance' | 'Fast Recovery' | 'Timeout Reset';
  note: string;
}

export function simulateRenoTrajectory(options: {
  initialCwnd: number;
  initialSsthresh: number;
  rwnd: number;
  tripleDupAckRtt: number;
  timeoutRtt: number;
  totalRtts: number;
}): RenoPoint[] {
  const {
    initialCwnd,
    initialSsthresh,
    rwnd,
    tripleDupAckRtt,
    timeoutRtt,
    totalRtts,
  } = options;

  const points: RenoPoint[] = [];
  let cwnd = initialCwnd;
  let ssthresh = initialSsthresh;

  points.push({
    rtt: 0,
    cwnd,
    ssthresh,
    effectiveWindow: Math.min(cwnd, rwnd),
    phase: cwnd < ssthresh ? 'Slow Start' : 'Congestion Avoidance',
    note: `Initial state: cwnd = ${cwnd} MSS, ssthresh = ${ssthresh} MSS, rwnd = ${rwnd} MSS.`,
  });

  for (let rtt = 1; rtt <= totalRtts; rtt++) {
    if (rtt === tripleDupAckRtt) {
      const flight = Math.min(cwnd, rwnd);
      ssthresh = Math.max(Math.floor(flight / 2), 2);
      cwnd = ssthresh;
      points.push({
        rtt,
        cwnd,
        ssthresh,
        effectiveWindow: Math.min(cwnd, rwnd),
        phase: 'Fast Recovery',
        note: `3 Dup ACKs detected: Fast Retransmit triggered. ssthresh = max(floor(${flight}/2), 2) = ${ssthresh} MSS; after Fast Recovery, cwnd = ${cwnd} MSS.`,
      });
    } else if (rtt === timeoutRtt) {
      const flight = Math.min(cwnd, rwnd);
      ssthresh = Math.max(Math.floor(flight / 2), 2);
      cwnd = 1;
      points.push({
        rtt,
        cwnd,
        ssthresh,
        effectiveWindow: Math.min(cwnd, rwnd),
        phase: 'Timeout Reset',
        note: `RTO Timeout: ssthresh = max(floor(${flight}/2), 2) = ${ssthresh} MSS; cwnd resets to 1 MSS (Slow Start).`,
      });
    } else if (cwnd < ssthresh) {
      const next = Math.min(cwnd * 2, ssthresh);
      const reachedThreshold = next >= ssthresh;
      cwnd = next;
      points.push({
        rtt,
        cwnd,
        ssthresh,
        effectiveWindow: Math.min(cwnd, rwnd),
        phase: reachedThreshold ? 'Congestion Avoidance' : 'Slow Start',
        note: reachedThreshold
          ? `Slow Start reaches ssthresh (${ssthresh} MSS); transitions to Congestion Avoidance.`
          : `Slow Start doubles cwnd to ${cwnd} MSS (assuming 1 ACK per segment).`,
      });
    } else {
      cwnd = cwnd + 1;
      const eff = Math.min(cwnd, rwnd);
      points.push({
        rtt,
        cwnd,
        ssthresh,
        effectiveWindow: eff,
        phase: 'Congestion Avoidance',
        note:
          cwnd > rwnd
            ? `Congestion Avoidance increments cwnd to ${cwnd} MSS, but receiver rwnd caps flight size at ${rwnd} MSS.`
            : `Congestion Avoidance increases cwnd linearly by +1 MSS to ${cwnd} MSS.`,
      });
    }
  }

  return points;
}
