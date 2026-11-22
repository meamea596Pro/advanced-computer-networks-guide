export type PracticeTopic = 'sec2' | 'sec3' | 'sec4' | 'sec5' | 'subnetting';

export interface PracticeQuestion {
  id: string;
  topic: PracticeTopic;
  topicLabel: string;
  isSupplemental?: boolean;
  type: 'mcq' | 'numeric';
  prompt: string;
  arabicCue?: string;
  options?: string[];
  correctOptionIndex?: number;
  acceptedAnswers?: string[]; // normalized strings for numeric/text check
  unitHint?: string;
  hint: string;
  steps: string[];
  assumptionNote: string;
}

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // SECTION 2: UDP
  {
    id: 'q-sec2-1',
    topic: 'sec2',
    topicLabel: 'Section 2 · UDP',
    type: 'numeric',
    prompt:
      'A captured UDP datagram reports a UDP Length field of 148 bytes. How many bytes of application payload does this datagram carry?',
    arabicCue: 'طول UDP = الترويسة + البيانات',
    acceptedAnswers: ['140', '140 bytes', '140 b'],
    unitHint: 'bytes',
    hint: 'Per RFC 768, the UDP Length field includes the fixed 8-byte UDP header plus the payload.',
    steps: [
      'UDP header size = 8 bytes (Source Port 2 B, Destination Port 2 B, Length 2 B, Checksum 2 B).',
      'Payload = UDP Length − 8 bytes = 148 − 8 = 140 bytes.',
    ],
    assumptionNote:
      'UDP header length is always fixed at 8 bytes (no options field exists in UDP), so IPv4/IPv6 header size does not change this subtraction.',
  },
  {
    id: 'q-sec2-2',
    topic: 'sec2',
    topicLabel: 'Section 2 · UDP',
    type: 'mcq',
    prompt:
      'Assuming a standard 20-byte IPv4 header (no options) and allowing IP fragmentation up to the 16-bit IPv4 Total Length maximum (65,535 bytes), what is the maximum UDP payload size?',
    options: [
      '65,535 bytes',
      '65,527 bytes',
      '65,507 bytes',
      '1,472 bytes',
    ],
    correctOptionIndex: 2,
    hint: 'Subtract both the 20-byte IPv4 header and the 8-byte UDP header from 65,535 bytes.',
    steps: [
      'Maximum IPv4 Total Length = 2¹⁶ − 1 = 65,535 bytes.',
      'Subtract 20-byte IPv4 header (no options) and 8-byte UDP header: 65,535 − 20 − 8 = 65,507 bytes.',
    ],
    assumptionNote:
      'If you instead ask for the UDP-layer theoretical limit ignoring IPv4, it is 65,527 bytes (65,535 − 8). If you require NO fragmentation on 1,500-byte Ethernet MTU, the limit drops to 1,500 − 20 − 8 = 1,472 bytes.',
  },
  {
    id: 'q-sec2-3',
    topic: 'sec2',
    topicLabel: 'Section 2 · UDP',
    type: 'mcq',
    prompt:
      'A client sends a DNS query from ephemeral port 58410 to a resolver on UDP port 53. If bit corruption is detected by the UDP checksum at the resolver, what does UDP itself do?',
    arabicCue: 'كشف الخطأ بدون استرجاع',
    options: [
      'Sends a NACK back to port 58410 requesting retransmission',
      'Discards the corrupted datagram silently; any retry must come from the application (DNS client)',
      'Buffers the datagram and waits for a duplicate copy with a matching sequence number',
      'Switches the transaction automatically to TCP port 53',
    ],
    correctOptionIndex: 1,
    hint: 'UDP has error detection (checksum) but zero transport-layer error recovery.',
    steps: [
      'UDP is connectionless and has no sequence numbers, ACKs, NACKs, or retransmission timers.',
      'When the checksum fails, UDP drops the datagram; the DNS client application retries after its own timeout.',
    ],
    assumptionNote:
      'In IPv4, the UDP checksum can be disabled (set to 0); in IPv6, the UDP checksum is mandatory.',
  },

  // SECTION 3: TCP & WIRESHARK
  {
    id: 'q-sec3-1',
    topic: 'sec3',
    topicLabel: 'Section 3 · TCP & Wireshark',
    type: 'numeric',
    prompt:
      'In a TCP segment, the 4-bit Data Offset field equals 9 (binary 1001). What is the total TCP header length in bytes?',
    arabicCue: 'إزاحة البيانات تُحسب بكلمات 32-بت',
    acceptedAnswers: ['36', '36 bytes', '36 b'],
    unitHint: 'bytes',
    hint: 'Per RFC 9293, Data Offset counts 32-bit (4-byte) words.',
    steps: [
      'Each 32-bit word equals 4 bytes.',
      'TCP Header Length = Data Offset × 4 = 9 × 4 = 36 bytes (20-byte fixed header + 16 bytes of TCP options).',
    ],
    assumptionNote:
      'Valid Data Offset values range from 5 (20 bytes minimum, no options) to 15 (60 bytes maximum, 40 bytes of options).',
  },
  {
    id: 'q-sec3-2',
    topic: 'sec3',
    topicLabel: 'Section 3 · TCP & Wireshark',
    type: 'numeric',
    prompt:
      'A client opens a TCP connection with raw ISN = 12,000. After completing the 3-way handshake, the client sends a single segment carrying 350 bytes of data. Assuming the segment arrives intact, what raw Acknowledgment Number will the server return?',
    arabicCue: 'SYN يستهلك رقم تسلسل واحد',
    acceptedAnswers: ['12351', '12,351'],
    unitHint: 'raw ACK number',
    hint: 'Remember that SYN consumes 1 sequence number before the first data byte is numbered!',
    steps: [
      'Client SYN has Seq = 12,000 and consumes 1 sequence number, so the server SYN-ACK sends Ack = 12,001.',
      'Client’s 350-byte data segment starts at Seq = 12,001 (bytes 12,001..12,350).',
      'Server’s ACK gives the next byte expected: 12,001 + 350 = 12,351.',
    ],
    assumptionNote:
      'In Wireshark default relative sequence numbering (ISN normalized to 0), the same ACK displays as Relative Ack = 351 (1 for SYN + 350 data bytes).',
  },
  {
    id: 'q-sec3-3',
    topic: 'sec3',
    topicLabel: 'Section 3 · TCP & Wireshark',
    type: 'mcq',
    prompt:
      'While inspecting a trace, you see Wireshark mark a packet with "[TCP Previous segment not captured]" followed by "[TCP Out-Of-Order]". Which statement is most accurate?',
    options: [
      'It is definitive proof that an intermediate router dropped the missing packet',
      'It is a heuristic interpretation of what reached the capture point; local capture drops or packet reordering can cause these labels without true network loss',
      'It means the TCP checksum failed on the previous segment',
      'It proves the receiver advertised rwnd = 0',
    ],
    correctOptionIndex: 1,
    hint: 'Think about where Wireshark sits—it only sees frames that survived capture into pcap.',
    steps: [
      'Wireshark’s TCP analysis compares observed sequence numbers against prior captured frames using heuristics.',
      'If the capturing NIC/buffer drops a frame (capture gap) or multipath routing reorders packets, Wireshark flags missing/out-of-order labels even if the receiver got every byte.',
    ],
    assumptionNote:
      'Always correlate with receiver ACKs: if the receiver advances its ACK across the "missing" bytes without duplicate ACKs, the gap was likely a capture drop rather than wire loss.',
  },
  {
    id: 'q-sec3-4',
    topic: 'sec3',
    topicLabel: 'Section 3 · TCP & Wireshark',
    type: 'mcq',
    prompt:
      'Which combination accurately describes a valid TCP 3-way handshake in Wireshark relative sequence numbering (assuming no data piggybacking)?',
    options: [
      'SYN (Seq=1, Ack=1) → SYN-ACK (Seq=1, Ack=1) → ACK (Seq=1, Ack=1)',
      'SYN (Seq=0) → SYN-ACK (Seq=0, Ack=1) → ACK (Seq=1, Ack=1)',
      'SYN (Seq=0) → SYN-ACK (Seq=1, Ack=0) → ACK (Seq=1, Ack=2)',
      'SYN (Seq=0, Ack=0, ACK flag=1) → SYN-ACK (Seq=0, Ack=0) → ACK (Seq=0, Ack=0)',
    ],
    correctOptionIndex: 1,
    hint: 'Each SYN starts at relative Seq=0, has no valid ACK on Packet 1, and consumes 1 sequence number.',
    steps: [
      'Packet 1 (SYN): Relative Seq = 0, ACK flag not set; consumes 1 sequence number.',
      'Packet 2 (SYN, ACK): Server Relative Seq = 0, Ack = 1; server SYN consumes 1 sequence number.',
      'Packet 3 (ACK): Client Relative Seq = 1, Ack = 1; pure ACK consumes 0 sequence numbers.',
    ],
    assumptionNote:
      'On the wire, raw ISNs are pseudo-random 32-bit numbers (RFC 9293), not literally zero; Wireshark subtracts ISN for readability.',
  },

  // SECTION 4: STOP-AND-WAIT, SLIDING WINDOW & RTO
  {
    id: 'q-sec4-1',
    topic: 'sec4',
    topicLabel: 'Section 4 · Stop-and-Wait & Windows',
    type: 'numeric',
    prompt:
      'A Stop-and-Wait link transmits 1,500-byte frames at 4 Mbps with a one-way propagation delay of 13.5 ms. Assuming negligible ACK transmission time, negligible processing delay, and zero loss, what is the link utilization as a percentage?',
    arabicCue: 'كفاءة التوقف والانتظار',
    acceptedAnswers: ['10', '10%', '10.0', '10.0%', '0.1', '0.10'],
    unitHint: '% (e.g., 10%)',
    hint: 'Compute T_trans = (1,500 × 8) / (4 × 10⁶), RTT = 2 × 13.5 ms, then T_trans / (T_trans + RTT).',
    steps: [
      'L = 1,500 bytes × 8 = 12,000 bits.',
      'T_trans = 12,000 bits / (4 × 10⁶ bits/s) = 0.003 s = 3 ms.',
      'RTT = 2 × 13.5 ms = 27 ms.',
      'U = 3 ms / (3 ms + 27 ms) = 3 / 30 = 0.10 = 10%.',
    ],
    assumptionNote:
      'Uses decimal Mbps (10⁶ bps), zero ACK transmission time, and 0% loss. Including a non-zero ACK transmission time or processing delay increases the denominator and lowers utilization slightly.',
  },
  {
    id: 'q-sec4-2',
    topic: 'sec4',
    topicLabel: 'Section 4 · Stop-and-Wait & Windows',
    type: 'numeric',
    prompt:
      'A sliding-window link has frame transmission time T_trans = 2 ms and propagation RTT = 38 ms (ACK time negligible). What is the MINIMUM window size W (in frames) required to reach 100% channel utilization?',
    acceptedAnswers: ['20', '20 frames'],
    unitHint: 'frames',
    hint: 'Set (W × T_trans) / (T_trans + RTT) ≥ 1 and solve for W.',
    steps: [
      'Full cycle time = T_trans + RTT = 2 ms + 38 ms = 40 ms.',
      'To keep the transmitter busy for the entire 40 ms cycle: W × 2 ms ≥ 40 ms.',
      'W_min = ⌈40 / 2⌉ = 20 frames.',
    ],
    assumptionNote:
      'Assumes RTT = 38 ms is propagation-only (excluding T_trans). If 38 ms were already total cycle time, W_min would be ⌈38 / 2⌉ = 19 frames. For Selective Repeat, sequence space must be at least 2 × W = 40 (6-bit seq numbers).',
  },
  {
    id: 'q-sec4-3',
    topic: 'sec4',
    topicLabel: 'Section 4 · Stop-and-Wait & Windows',
    type: 'mcq',
    prompt:
      'In a sliding-window protocol with W = 4 and 3-bit sequence numbers (0–7), frames 0, 1, 2, and 3 are sent. All four frames arrive intact at the receiver, but ONLY the ACK for frame 0 is lost while ACKs for frames 1, 2, and 3 return promptly before any timeout. What happens?',
    options: [
      'Both Go-Back-N and Selective Repeat retransmit frame 0 after timeout',
      'Under Go-Back-N (cumulative ACKs), ACK 1/2/3 confirms frame 0 so no retransmission occurs; under Selective Repeat (individual ACKs), frame 0 times out and only frame 0 is retransmitted',
      'Under Go-Back-N, only frame 0 is retransmitted; under Selective Repeat, all 4 frames are retransmitted',
      'The protocol fails because W = 4 is illegal for 3-bit sequence numbers in both GBN and SR',
    ],
    correctOptionIndex: 1,
    hint: 'Distinguish cumulative ACKs (GBN) from individual per-frame ACKs (SR).',
    steps: [
      '3-bit sequence numbers give 2³ = 8 numbers: GBN allows W ≤ 7, SR allows W ≤ 4 (so W = 4 is valid for both).',
      'GBN uses cumulative ACKs: receiving ACK 1 (or 2 or 3) implies frame 0 was received, advancing the window with 0 retransmissions.',
      'SR uses individual ACKs: ACK 1, 2, 3 do not acknowledge frame 0, so frame 0’s individual timer expires and only frame 0 is retransmitted (discarded as duplicate by receiver, which resends ACK 0).',
    ],
    assumptionNote:
      'This shows why exam questions about a "sliding window protocol" MUST specify cumulative vs. individual ACKs—leaving that assumption unstated changes whether any retransmission occurs at all.',
  },
  {
    id: 'q-sec4-4',
    topic: 'sec4',
    topicLabel: 'Section 4 · RTO & Timers',
    type: 'numeric',
    prompt:
      'Currently SRTT = 160 ms and RTTVAR = 20 ms. A new valid (non-retransmitted) RTT sample R = 240 ms arrives. Using RFC 6298 (α = 1/8, β = 1/4, K = 4), what is the UNCLAMPED formula value of SRTT + 4 × RTTVAR (in ms)?',
    arabicCue: 'احسب RTTVAR ثم SRTT ثم RTO',
    acceptedAnswers: ['310', '310 ms', '310ms'],
    unitHint: 'ms (unclamped formula value)',
    hint: 'Update RTTVAR first using |160 − 240| = 80 ms, then update SRTT, then compute SRTT + 4 × RTTVAR.',
    steps: [
      'Error = |SRTT − R| = |160 − 240| = 80 ms.',
      'RTTVAR_new = 0.75 × 20 + 0.25 × 80 = 15 + 20 = 35 ms.',
      'SRTT_new = 0.875 × 160 + 0.125 × 240 = 140 + 30 = 170 ms.',
      'Unclamped formula RTO = 170 + 4 × 35 = 170 + 140 = 310 ms.',
    ],
    assumptionNote:
      'Important RFC 6298 check: While the unclamped formula equals 310 ms, RFC 6298 Section 2.4 enforces a 1-second (1,000 ms) lower bound, so a strict RFC 6298 implementation rounds 310 ms up to 1,000 ms! Also assumes R was NOT measured from a retransmitted segment (Karn’s rule).',
  },
  {
    id: 'q-sec4-5',
    topic: 'sec4',
    topicLabel: 'Section 4 · RTO & Timers',
    type: 'mcq',
    prompt:
      'Which statement correctly matches RFC 5681 on TCP Delayed ACKs and RFC 6298 on Karn’s Rule / Timeout Backoff?',
    options: [
      'RFC 5681 mandates waiting a fixed 1 second before sending an ACK; RFC 6298 averages retransmitted RTT samples into SRTT',
      'RFC 5681 calls for an ACK at least every second full-sized segment and within 500 ms of the first unacked packet; Karn’s rule excludes retransmitted segments from RTT updates and timeouts double RTO',
      'RFC 5681 forbids delaying ACKs during Slow Start; RFC 6298 halves RTO after each timeout',
      'RFC 5681 requires an ACK for every single segment immediately; RFC 6298 sets RTO minimum to 50 ms',
    ],
    correctOptionIndex: 1,
    hint: 'Check the 500 ms bound (not 1 second!) and remember retransmission ambiguity.',
    steps: [
      'RFC 5681 Section 4.2: ACK at least every 2nd full-sized segment, and within 500 ms of the first unacknowledged packet.',
      'RFC 6298 + Karn’s rule: ignore RTT samples from retransmissions and apply exponential backoff (RTO ← 2 × RTO) on timeout.',
    ],
    assumptionNote:
      'If TCP Timestamps (RFC 7323) are negotiated, echoing timestamps resolves retransmission ambiguity; without them, Karn’s rule is mandatory.',
  },

  // SECTION 5: CONGESTION CONTROL
  {
    id: 'q-sec5-1',
    topic: 'sec5',
    topicLabel: 'Section 5 · Congestion Control',
    type: 'numeric',
    prompt:
      'A classic TCP Reno connection has cwnd = 14 MSS, ssthresh = 10 MSS, and rwnd = 20 MSS. After 2 clean RTTs in Congestion Avoidance (no loss), an RTO timeout occurs. What is the new ssthresh (in MSS) right after the timeout?',
    arabicCue: 'حساب ssthresh بعد انتهاء المهلة',
    acceptedAnswers: ['8', '8 mss'],
    unitHint: 'MSS',
    hint: 'First advance cwnd linearly by +1 MSS/RTT for 2 RTTs, then take half of FlightSize.',
    steps: [
      'Currently cwnd = 14 MSS ≥ ssthresh (10 MSS), so TCP is in Congestion Avoidance (+1 MSS per RTT).',
      'After 2 clean RTTs: cwnd = 14 + 2 = 16 MSS (≤ rwnd = 20 MSS, so FlightSize = 16 MSS).',
      'On RTO timeout: ssthresh = max(16 / 2, 2) = 8 MSS, and cwnd resets to 1 MSS (Slow Start).',
    ],
    assumptionNote:
      'Assumes 1 MSS linear increment per RTT and FlightSize = cwnd. If rwnd had been 12 MSS, FlightSize would be capped at 12 MSS and ssthresh would become 6 MSS instead of 8 MSS.',
  },
  {
    id: 'q-sec5-2',
    topic: 'sec5',
    topicLabel: 'Section 5 · Congestion Control',
    type: 'mcq',
    prompt:
      'In TCP Reno, cwnd is currently 16 MSS (with rwnd = 32 MSS). How does cwnd after recovery differ between (A) 3 Duplicate ACKs and (B) an RTO Timeout?',
    options: [
      'Both cut cwnd to 8 MSS and enter Congestion Avoidance',
      '3 Duplicate ACKs set ssthresh = 8 MSS and cwnd settles at 8 MSS (Congestion Avoidance); RTO Timeout sets ssthresh = 8 MSS and resets cwnd = 1 MSS (Slow Start)',
      '3 Duplicate ACKs reset cwnd = 1 MSS; RTO Timeout cuts cwnd to 8 MSS',
      'Both reset cwnd = 1 MSS and ssthresh = 16 MSS',
    ],
    correctOptionIndex: 1,
    hint: '3 duplicate ACKs show packets are still reaching the receiver; a timeout signals severe congestion.',
    steps: [
      '3 Duplicate ACKs trigger Fast Retransmit and Fast Recovery: ssthresh = 16 / 2 = 8 MSS, cwnd deflates to 8 MSS when recovery completes.',
      'RTO Timeout sets ssthresh = 16 / 2 = 8 MSS and resets cwnd = 1 MSS to probe conservatively via Slow Start.',
    ],
    assumptionNote:
      'This is the TCP Reno model (RFC 5681). In older TCP Tahoe, both events reset cwnd = 1 MSS. In modern TCP CUBIC (RFC 9438), loss cuts cwnd to 0.7 × 16 = 11.2 MSS rather than halving.',
  },
  {
    id: 'q-sec5-3',
    topic: 'sec5',
    topicLabel: 'Section 5 · Congestion Control',
    type: 'mcq',
    prompt:
      'Which statement accurately positions the lecture’s Reno congestion exercises relative to modern Internet standards?',
    options: [
      'RFC 6928 makes IW = 10 MSS an Internet Standard required for every TCP host, and Reno is still the Linux default',
      'Reno AIMD is a foundational teaching model; RFC 6928 is an Experimental IW10 proposal, and RFC 9438 specifies TCP CUBIC (β = 0.7), widely used as today’s default',
      'CUBIC (RFC 9438) disables Slow Start and fixes cwnd at 10 MSS permanently',
      'RFC 5681 prohibits using any congestion control algorithm other than Tahoe',
    ],
    correctOptionIndex: 1,
    hint: 'Recall the standards status of RFC 6928 and the algorithm defined in RFC 9438.',
    steps: [
      'Classic Reno exercises teach AIMD fundamentals (Slow Start, linear CA, Fast Retransmit/Recovery, Timeout reset).',
      'RFC 6928 is formally Experimental (proposing IW10). RFC 9438 standardizes CUBIC, which uses β = 0.7 and cubic time-based growth.',
    ],
    assumptionNote:
      'On an exam, default to the Reno rules unless the question explicitly names Tahoe, IW10, or CUBIC—and state your model assumption in one short line.',
  },

  // SUPPLEMENTAL: IPv4 SUBNETTING (/26, /20, /31) — NOT FROM SECTIONS 2–5 PDFs
  {
    id: 'q-sub-1',
    topic: 'subnetting',
    topicLabel: 'Supplemental · IPv4 Subnetting (/26)',
    isSupplemental: true,
    type: 'numeric',
    prompt:
      '[Supplemental — not in Sections 2–5 PDFs] What is the NETWORK ADDRESS of the subnet containing host 192.168.77.211/26?',
    arabicCue: 'عنوان الشبكة لقناع /26',
    acceptedAnswers: ['192.168.77.192', '192.168.77.192/26'],
    unitHint: 'IPv4 address (e.g., x.x.x.x)',
    hint: '/26 = 255.255.255.192 → block size = 256 − 192 = 64 in the 4th octet. Find the multiple of 64 ≤ 211.',
    steps: [
      'Prefix /26 → Mask 255.255.255.192 (6 host bits).',
      'Block size in 4th octet = 256 − 192 = 64. Subnets start at 0, 64, 128, 192.',
      '211 falls inside [192, 255], so Network = 192.168.77.192 (Broadcast = 192.168.77.255, Usable = .193–.254, 62 usable hosts).',
    ],
    assumptionNote:
      'Uses standard IPv4 LAN convention (network and broadcast addresses reserved: 2⁶ − 2 = 62 usable hosts).',
  },
  {
    id: 'q-sub-2',
    topic: 'subnetting',
    topicLabel: 'Supplemental · IPv4 Subnetting (/20)',
    isSupplemental: true,
    type: 'numeric',
    prompt:
      '[Supplemental — not in Sections 2–5 PDFs] What is the BROADCAST ADDRESS of the subnet containing host 10.44.118.25/20?',
    arabicCue: 'عنوان البث لقناع /20',
    acceptedAnswers: ['10.44.127.255'],
    unitHint: 'IPv4 address (e.g., x.x.x.x)',
    hint: '/20 = 255.255.240.0 → block size = 256 − 240 = 16 in the 3rd octet. Find the block containing 118.',
    steps: [
      'Prefix /20 → Mask 255.255.240.0 (12 host bits; interesting octet is the 3rd octet).',
      'Block size in 3rd octet = 256 − 240 = 16. Multiples of 16: ..., 96, 112, 128.',
      '118 falls in [112, 127]. Network = 10.44.112.0; Broadcast = 10.44.127.255.',
      'Usable range = 10.44.112.1 – 10.44.127.254; Usable hosts = 2¹² − 2 = 4,094.',
    ],
    assumptionNote:
      'In a /20 subnet, all 8 bits of the 4th octet are host bits, so the broadcast address always ends in .255.',
  },
  {
    id: 'q-sub-3',
    topic: 'subnetting',
    topicLabel: 'Supplemental · IPv4 Subnetting (/31 Exception)',
    isSupplemental: true,
    type: 'mcq',
    prompt:
      '[Supplemental — not in Sections 2–5 PDFs] Under RFC 3021, how many usable host addresses does a /31 prefix (e.g., 10.9.4.14/31) provide on a point-to-point router link, and why?',
    options: [
      '0 usable hosts, because 2¹ − 2 = 0 always applies without exception',
      '2 usable hosts (10.9.4.14 and 10.9.4.15), because RFC 3021 eliminates the network and broadcast reservation on 2-endpoint point-to-point links',
      '1 usable host, because .14 is always reserved as the network ID',
      '4 usable hosts, because /31 has 2 host bits',
    ],
    correctOptionIndex: 1,
    hint: 'On a direct point-to-point link between two routers, there is no multi-host broadcast domain needing a dedicated broadcast address.',
    steps: [
      'Ordinary IPv4 LANs reserve network + broadcast addresses (usable = 2^(32−n) − 2).',
      'RFC 3021 allows /31 on point-to-point links so both addresses (.14 and .15) serve as the two router interface endpoints, saving 50% of address space vs. /30.',
    ],
    assumptionNote:
      'Keep the conventional 2^(32−n) − 2 rule for ordinary Ethernet LAN exercises (like /26 and /20), and cite RFC 3021 explicitly when asked about /31 point-to-point links.',
  },
];
