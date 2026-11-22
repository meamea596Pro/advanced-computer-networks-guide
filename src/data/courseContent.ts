export type CourseSectionId = 'sec2' | 'sec3' | 'sec4' | 'sec5';

export interface LessonConcept {
  heading: string;
  arabicCue?: string;
  body: string[];
  keyFormula?: string;
  examWatchout?: string;
}

export interface WorkedProblem {
  id: string;
  sectionId: CourseSectionId;
  title: string;
  arabicCue?: string;
  prompt: string;
  assumptions: string[];
  steps: { label: string; math: string; detail?: string }[];
  finalAnswer: string;
  ifAssumptionChanges: string;
}

export interface CourseSection {
  id: CourseSectionId;
  code: string;
  title: string;
  arabicCue: string;
  summary: string;
  concepts: LessonConcept[];
  workedProblems: WorkedProblem[];
}

export interface ReferenceSource {
  id: string;
  title: string;
  organization: 'RFC Editor' | 'Wireshark' | 'Cisco Learning Network';
  url: string;
  scope: 'Sections 2–5' | 'Supplemental Subnetting';
  verifies: string;
}

export const COVERAGE_NOTE = {
  title: 'Coverage Note — Partial Course Draft (Sections 2–5 Only)',
  summary:
    'This study draft uses only Sections 2–5 (UDP, TCP & ports/handshake, Stop-and-Wait & Sliding Windows, RTO/timers, and Congestion Control) because the full Moodle course inventory is not currently available. It may not cover all topics on your exam and does not claim completeness.',
  subnettingNote:
    'IPv4 Subnetting is included as a separate supplemental practice section because it was requested; it is not drawn from the Section 2–5 PDFs.',
};

export const COURSE_SECTIONS: CourseSection[] = [
  {
    id: 'sec2',
    code: 'Section 2',
    title: 'UDP, Header Length, Ports & Demultiplexing',
    arabicCue: 'بروتوكول UDP والمنافذ',
    summary:
      'Connectionless transport delivery (RFC 768): minimal 8-byte header, port-based demultiplexing, error detection without recovery, and framing limits.',
    concepts: [
      {
        heading: 'Why UDP Exists (UDP vs. TCP)',
        arabicCue: 'نقل بدون تأسيس اتصال',
        body: [
          'User Datagram Protocol (UDP) provides minimal, message-oriented transport directly over IP. Unlike TCP, it establishes no connection state, performs no handshake, sends no acknowledgments, guarantees neither delivery nor ordering, and applies no flow or congestion control.',
          'Applications choose UDP when low latency or small transaction overhead matters more than transport-layer recovery—for example, DNS lookups (UDP port 53), real-time voice/video streams, or protocols like QUIC that implement reliability and congestion control at a higher layer.',
        ],
        examWatchout:
          'Exam distinction: UDP does NOT have error recovery. Its checksum provides error detection only—a corrupted datagram is silently dropped rather than retransmitted.',
      },
      {
        heading: 'UDP Header Fields & Length Rule (RFC 768)',
        arabicCue: 'ترويسة UDP (8 بايت)',
        body: [
          'Every UDP header is fixed at exactly 8 bytes (64 bits), divided into four 16-bit (2-byte) fields: Source Port, Destination Port, Length, and Checksum.',
          'The 16-bit Length field records the total size of the UDP datagram in bytes—meaning the 8-byte header PLUS the application payload. Therefore, the minimum valid UDP Length is 8 bytes (zero-byte payload), and Payload Bytes = UDP Length − 8.',
          'Under IPv4 (RFC 768), the UDP checksum is optional (setting it to 0 disables checking), though modern stacks generally enable it. Under IPv6 (RFC 8200), the UDP checksum is mandatory because IPv6 omits a network-layer header checksum.',
        ],
        keyFormula: 'UDP Payload = UDP Length − 8 bytes   |   Minimum UDP Length = 8 bytes',
      },
      {
        heading: 'Ports, Multiplexing & Request/Reply Reversal',
        arabicCue: 'توجيه البيانات عبر أرقام المنافذ',
        body: [
          'Ports are 16-bit unsigned integers (0–65,535) that let a host multiplex and demultiplex traffic across concurrent processes. Well-known server ports occupy 0–1023 (such as DNS on UDP 53), registered ports 1024–49151, and ephemeral client ports 49152–65535 (IANA recommendation).',
          'In a request/reply exchange (such as DNS), the client picks a temporary ephemeral Source Port and targets Destination Port 53. When the server replies, the ports swap: Source Port becomes 53 and Destination Port becomes the client’s ephemeral port so the client OS hands the reply to the right socket.',
        ],
      },
      {
        heading: 'Maximum UDP Payload Size (Always State the Layer Assumption)',
        arabicCue: 'أقصى حجم للبيانات حسب الطبقة',
        body: [
          'A classic exam trap asks for "the maximum UDP payload size" without stating whether IPv4 headers or link MTU are included. Always state your assumption explicitly:',
          '1) At the UDP Length field alone (16-bit max = 65,535 bytes): 65,535 − 8 = 65,527 bytes.',
          '2) Inside a single IPv4 packet with a standard 20-byte header (no IP options; IPv4 Total Length max = 65,535 bytes): 65,535 − 20 − 8 = 65,507 bytes.',
          '3) Without IP fragmentation on standard Ethernet (MTU = 1,500 bytes, 20-byte IPv4 header): 1,500 − 20 − 8 = 1,472 bytes.',
        ],
        keyFormula: 'IPv4 Max UDP Payload = 65,535 − 20 − 8 = 65,507 bytes   |   No-frag Ethernet (1500 MTU) = 1,472 bytes',
      },
    ],
    workedProblems: [
      {
        id: 'wp-sec2-1',
        sectionId: 'sec2',
        title: 'UDP Length, Payload & Frame Size Calculation',
        arabicCue: 'حساب طول البيانات والإطار',
        prompt:
          'A Wireshark capture records an Ethernet II frame carrying an IPv4 packet with a UDP datagram. The UDP Length field shows 72 bytes. Calculate (a) the UDP application payload size, (b) the IPv4 Total Length, and (c) the captured Ethernet frame length.',
        assumptions: [
          'Standard IPv4 header with no IP options (IHL = 5 → 20 bytes).',
          'Standard Ethernet II header without 802.1Q VLAN tag (14 bytes) and without the 4-byte trailing FCS (typical NIC capture in Wireshark).',
        ],
        steps: [
          {
            label: '1. Identify UDP header size (RFC 768)',
            math: 'UDP Header = 8 bytes',
            detail: 'Four fixed 2-byte fields: Src Port, Dst Port, Length, Checksum.',
          },
          {
            label: '2. Compute UDP payload',
            math: 'UDP Payload = 72 bytes − 8 bytes = 64 bytes',
            detail: 'RFC 768 defines UDP Length as header + data.',
          },
          {
            label: '3. Compute IPv4 Total Length',
            math: 'IPv4 Total Length = 20 bytes + 72 bytes = 92 bytes',
          },
          {
            label: '4. Compute captured Ethernet frame size',
            math: 'Captured Frame = 14 bytes + 92 bytes = 106 bytes (848 bits)',
          },
        ],
        finalAnswer: 'UDP payload = 64 bytes; IPv4 Total Length = 92 bytes; Captured Ethernet frame = 106 bytes.',
        ifAssumptionChanges:
          'If the IPv4 header contained 12 bytes of options (32-byte IPv4 header), the UDP Length (72 bytes) and UDP payload (64 bytes) would NOT change, but IPv4 Total Length would increase to 104 bytes and the Ethernet frame to 118 bytes. If a 4-byte VLAN tag were captured, add 4 bytes to the Ethernet frame.',
      },
      {
        id: 'wp-sec2-2',
        sectionId: 'sec2',
        title: 'DNS Port Reversal & Demultiplexing Under Concurrent Clients',
        arabicCue: 'انعكاس المنافذ بين الطلب والرد',
        prompt:
          'Host A (10.14.2.35) sends a UDP DNS query to local resolver 10.14.2.10 using source port 51842. (a) List the source and destination ports in both the query and reply. (b) What if Host B (10.14.2.40) simultaneously queries the same resolver using the exact same ephemeral source port 51842?',
        assumptions: [
          'Standard DNS over UDP uses well-known port 53 on the resolver.',
          'No NAT device sits between Hosts A/B and the local resolver.',
        ],
        steps: [
          {
            label: '1. Initial DNS query (Host A → Resolver)',
            math: 'Src = 10.14.2.35:51842   →   Dst = 10.14.2.10:53',
          },
          {
            label: '2. DNS reply (Resolver → Host A)',
            math: 'Src = 10.14.2.10:53   →   Dst = 10.14.2.35:51842',
            detail: 'Source and destination ports reverse so Host A’s OS delivers the datagram to the waiting DNS client socket.',
          },
          {
            label: '3. Concurrent query from Host B on port 51842',
            math: 'Resolver tracks (Client IP, Client Port) per query: (10.14.2.35, 51842) ≠ (10.14.2.40, 51842)',
            detail: 'No collision occurs because IP addresses differ, so replies are routed to distinct hosts.',
          },
        ],
        finalAnswer:
          'Query: 51842 → 53; Reply: 53 → 51842. Host B using 51842 causes no conflict because the resolver addresses replies using both client IP and client port.',
        ifAssumptionChanges:
          'If both Host A and Host B sat behind a single-IP PAT/NAT router, the NAT router would rewrite at least one external source port (e.g., mapping Host B to 61204) so replies returning to the shared public IP can still be separated.',
      },
    ],
  },
  {
    id: 'sec3',
    code: 'Section 3',
    title: 'TCP Byte Stream, 3-Way Handshake, Header & Wireshark',
    arabicCue: 'بروتوكول TCP والمصافحة الثلاثية',
    summary:
      'Connection-oriented, reliable, ordered byte stream (RFC 9293): 20–60 byte header with 32-bit-word Data Offset, SYN sequence consumption, ACK semantics, and reading Wireshark traces critically.',
    concepts: [
      {
        heading: 'TCP as an Ordered Byte Stream (RFC 9293)',
        arabicCue: 'تدفق بايتات مرتب وموثوق',
        body: [
          'TCP (Transmission Control Protocol) provides a reliable, full-duplex, ordered byte stream between two sockets identified by the 4-tuple (Source IP, Source Port, Destination IP, Destination Port).',
          'Because TCP tracks bytes rather than message boundaries, the 32-bit Sequence Number identifies the byte offset of the first payload byte in a segment, and the 32-bit Acknowledgment Number gives the NEXT byte sequence number the sender of the ACK expects to receive (cumulative acknowledgment).',
        ],
        keyFormula: 'Next Expected ACK = Received Seq + Payload Length + (1 if SYN) + (1 if FIN)',
      },
      {
        heading: 'TCP Header Structure & Data Offset (RFC 9293)',
        arabicCue: 'ترويسة TCP وإزاحة البيانات',
        body: [
          'The fixed portion of a TCP header is 20 bytes (minimum header size). Source Port and Destination Port are 16 bits (2 bytes) each; Sequence Number and Acknowledgment Number are 32 bits (4 bytes) each; Window Size, Checksum, and Urgent Pointer are 16 bits (2 bytes) each.',
          'The 4-bit Data Offset (Header Length) field counts 32-bit (4-byte) words—not bytes! Its minimum valid value is 5 (5 × 4 = 20 bytes, no options) and its maximum is 15 (15 × 4 = 60 bytes, allowing up to 40 bytes of options such as MSS, Window Scale, SACK Permitted, and Timestamps).',
          'Control flags include the six classic bits (URG, ACK, PSH, RST, SYN, FIN) plus ECN congestion bits (CWR, ECE, and Accurate ECN / AE in RFC 9293).',
        ],
        keyFormula: 'TCP Header Bytes = Data Offset × 4   (Valid range: 20 to 60 bytes)',
      },
      {
        heading: '3-Way Handshake & SYN Sequence-Space Consumption',
        arabicCue: 'المصافحة الثلاثية (SYN / SYN-ACK / ACK)',
        body: [
          '1) Client → Server [SYN]: picks a random 32-bit Initial Sequence Number (ISN_c). The ACK flag is 0 (no acknowledgment number is valid yet). Although Len = 0, SYN consumes 1 unit of sequence space.',
          '2) Server → Client [SYN, ACK]: picks its own ISN_s, sets ACK = ISN_c + 1 (confirming receipt of the client’s SYN), and its SYN also consumes 1 unit of sequence space.',
          '3) Client → Server [ACK]: sets Seq = ISN_c + 1 and ACK = ISN_s + 1. A pure ACK with zero payload consumes 0 sequence numbers, so the client’s first data byte also begins at Seq = ISN_c + 1.',
        ],
        examWatchout:
          'Accuracy check: Never write a TCP SYN segment as having "Ack = 1" with the ACK flag unset. In Wireshark relative numbering, Packet 1 (SYN) has Seq = 0, Packet 2 (SYN, ACK) has Seq = 0, Ack = 1, and Packet 3 (ACK) has Seq = 1, Ack = 1.',
      },
      {
        heading: 'Wireshark TCP Analysis: Heuristics, Not Proof of Loss',
        arabicCue: 'تحليل Wireshark استدلالي وليس دليلاً قاطعاً',
        body: [
          'Wireshark display filters help isolate flows: tcp, tcp.port == 80 (HTTP), tcp.port == 443 (HTTPS), tcp.port == 21 (FTP control), and tcp.stream eq 0.',
          'Wireshark’s TCP analysis labels—such as [TCP Retransmission], [TCP Previous segment not captured], [TCP Out-Of-Order], and [TCP Dup ACK]—are heuristic inferences derived strictly from what reached the capture point. They are NOT proof that a packet was actually lost on the wire.',
          'Capture gaps (when the capturing NIC or OS buffer drops packets under load) make Wireshark flag [TCP Previous segment not captured] even when the destination received every byte cleanly. Likewise, multipath packet reordering can trigger [TCP Out-Of-Order] or spurious [TCP Dup ACK] annotations without any true loss.',
        ],
      },
    ],
    workedProblems: [
      {
        id: 'wp-sec3-1',
        sectionId: 'sec3',
        title: 'TCP Data Offset, Options Size & Application Payload',
        arabicCue: 'حساب طول ترويسة TCP والبيانات',
        prompt:
          'An IPv4 packet has Total Length = 1,480 bytes and carries a TCP segment whose 4-bit Data Offset field is 8 (binary 1000). Find (a) the TCP header size, (b) the TCP options length, and (c) the TCP payload size.',
        assumptions: [
          'IPv4 header has no options (IHL = 5 → 20 bytes).',
          'Packet is unfragmented and carries a complete TCP segment.',
        ],
        steps: [
          {
            label: '1. Convert Data Offset from 32-bit words to bytes (RFC 9293)',
            math: 'TCP Header Size = 8 × 4 bytes = 32 bytes',
          },
          {
            label: '2. Subtract minimum 20-byte fixed header to find options',
            math: 'TCP Options = 32 bytes − 20 bytes = 12 bytes',
            detail: 'For example, a 10-byte TCP Timestamps option plus 2 NOP padding bytes.',
          },
          {
            label: '3. Subtract IPv4 and TCP headers from IPv4 Total Length',
            math: 'TCP Payload = 1,480 − 20 − 32 = 1,428 bytes',
          },
        ],
        finalAnswer: 'TCP header = 32 bytes; TCP options = 12 bytes; TCP payload = 1,428 bytes.',
        ifAssumptionChanges:
          'If Data Offset = 5 (no TCP options, 20-byte header), payload space grows by 12 bytes to 1,440 bytes. If the IPv4 header instead had IHL = 6 (24 bytes), TCP payload would shrink by 4 bytes to 1,424 bytes.',
      },
      {
        id: 'wp-sec3-2',
        sectionId: 'sec3',
        title: '3-Way Handshake & Data Exchange Sequence/ACK Tracking',
        arabicCue: 'تتبع أرقام التسلسل والإقرار',
        prompt:
          'A client (ISN = 4,000) opens a TCP connection to a web server on port 80 (server ISN = 9,500). After the handshake, the client sends a 240-byte HTTP request, the server replies with 600 bytes of HTTP response data, and the client sends a pure ACK. Write the flags, raw Seq, raw Ack, and Wireshark relative Seq/Ack for all 6 segments.',
        assumptions: [
          'Standard 3-way handshake with no data piggybacked on Packet 3.',
          'Each data message fits inside a single segment (MSS ≥ 600 bytes) with zero packet loss.',
        ],
        steps: [
          {
            label: 'Packet 1 (Client → Server): SYN',
            math: 'Flags=[SYN], Raw Seq=4000 (Ack N/A), Len=0  |  Relative: Seq=0',
            detail: 'SYN consumes 1 byte of sequence space.',
          },
          {
            label: 'Packet 2 (Server → Client): SYN-ACK',
            math: 'Flags=[SYN, ACK], Raw Seq=9500, Raw Ack=4001, Len=0  |  Relative: Seq=0, Ack=1',
            detail: 'Server expects byte 4001 next; server SYN also consumes 1 sequence number.',
          },
          {
            label: 'Packet 3 (Client → Server): Final Handshake ACK',
            math: 'Flags=[ACK], Raw Seq=4001, Raw Ack=9501, Len=0  |  Relative: Seq=1, Ack=1',
            detail: 'Pure ACK consumes 0 sequence numbers.',
          },
          {
            label: 'Packet 4 (Client → Server): 240-byte Request',
            math: 'Flags=[PSH, ACK], Raw Seq=4001, Raw Ack=9501, Len=240  |  Relative: Seq=1, Ack=1',
            detail: 'Carries bytes 4001 through 4240.',
          },
          {
            label: 'Packet 5 (Server → Client): 600-byte Response',
            math: 'Flags=[PSH, ACK], Raw Seq=9501, Raw Ack=4241, Len=600  |  Relative: Seq=1, Ack=241',
            detail: 'Ack = 4001 + 240 = 4241; carries server bytes 9501 through 10100.',
          },
          {
            label: 'Packet 6 (Client → Server): Pure ACK',
            math: 'Flags=[ACK], Raw Seq=4241, Raw Ack=10101, Len=0  |  Relative: Seq=241, Ack=601',
            detail: 'Ack = 9501 + 600 = 10101.',
          },
        ],
        finalAnswer:
          'Final client ACK carries Raw Seq = 4,241 and Raw Ack = 10,101 (Relative Seq = 241, Ack = 601).',
        ifAssumptionChanges:
          'If the client piggybacks the 240-byte HTTP request onto Packet 3 (permitted by RFC 9293), Packets 3 and 4 merge into one segment (Seq = 4001, Ack = 9501, Len = 240), reducing the exchange to 5 segments while leaving the final numbers identical.',
      },
    ],
  },
  {
    id: 'sec4',
    code: 'Section 4',
    title: 'Stop-and-Wait, Sliding Windows, GBN vs. SR & RFC 6298 RTO',
    arabicCue: 'التوقف والانتظار، النافذة المنزلقة ومؤقت إعادة الإرسال',
    summary:
      'Channel utilization formulas with explicit timing assumptions, Go-Back-N vs. Selective Repeat mechanics, RFC 6298 SRTT/RTTVAR/RTO with 1-second floor and Karn’s rule, and RFC 5681 delayed ACKs.',
    concepts: [
      {
        heading: 'Stop-and-Wait Efficiency & Timing Assumptions',
        arabicCue: 'كفاءة بروتوكول التوقف والانتظار',
        body: [
          'In Stop-and-Wait, only 1 packet can be in flight at any time. The sender transmits L bits at link rate R (taking T_trans = L / R), waits one propagation delay to the receiver, and waits one propagation delay for the ACK to return (RTT_prop = 2 × T_prop).',
          'Under the standard textbook assumptions—negligible ACK transmission time, negligible processing/queuing delay, and zero loss—link utilization is U = T_trans / (T_trans + RTT_prop). On high-delay or high-bandwidth links (large bandwidth-delay product), utilization collapses because the sender sits idle waiting for ACKs.',
        ],
        keyFormula: 'T_trans = L / R   |   U_S&W = T_trans / (T_trans + RTT_prop)',
        examWatchout:
          'Delayed ACK nuance in Stop-and-Wait (rdt 3.0): Suppose the sender sends Packet 0, times out at 60 ms, and retransmits Packet 0—still waiting for ACK 0. If the original ACK 0 arrives late at 70 ms, standard alternating-bit Stop-and-Wait DOES accept that ACK 0 (it matches expected seq 0!) and advances to Packet 1; it is the SECOND ACK 0 (from the duplicate Packet 0) that is later discarded. Do not blindly assume a delayed ACK is always discarded—check which sequence number the sender expects at arrival time.',
      },
      {
        heading: 'Sliding Window, Go-Back-N (GBN) vs. Selective Repeat (SR)',
        arabicCue: 'النافذة المنزلقة: GBN مقابل SR',
        body: [
          'Pipelining lets up to W unacknowledged frames stay in flight, multiplying busy transmission time by W up to a hard cap of 100% (1.0): U = min(1, (W × T_trans) / (T_trans + RTT_prop)).',
          'Go-Back-N (GBN): Receiver buffers no out-of-order frames (receiver window = 1) and sends cumulative ACKs for the highest contiguous in-order frame. Sender keeps a single timer for the oldest unacked frame; on timeout, it retransmits the lost frame AND all subsequent frames in the window. With k-bit sequence numbers, W ≤ 2^k − 1.',
          'Selective Repeat (SR): Receiver buffers out-of-order frames within its window and sends individual ACKs for each received frame. Sender maintains per-frame timers and retransmits ONLY the timed-out frame. To prevent sequence wrap-around ambiguity, W ≤ 2^(k−1) (half the sequence space).',
        ],
        keyFormula: 'U_window = min(1, (W × T_trans) / (T_trans + RTT_prop))   |   GBN: W ≤ 2^k − 1   |   SR: W ≤ 2^(k−1)',
        examWatchout:
          'Lost ACK assumption check: If frames 0–3 are sent (seq 0–7, W = 4) and ACK 0 is lost while frames 1–3 arrive, what happens depends on the protocol! Under GBN (cumulative ACKs), receiving ACK 1, 2, or 3 before timeout acknowledges frame 0 too—NO retransmission happens. Under SR (individual ACKs), ACK 1–3 do not acknowledge frame 0, so frame 0 times out and ONLY frame 0 is retransmitted (receiver discards the duplicate and re-ACKs it).',
      },
      {
        heading: 'Adaptive RTO Estimation (RFC 6298) & Karn’s Rule',
        arabicCue: 'تقدير مهلة إعادة الإرسال (RTO)',
        body: [
          'Because Internet RTT fluctuates, TCP computes an adaptive Retransmission Timeout (RTO) from measured RTT samples R using RFC 6298:',
          '• Before any measurement: RTO = 1 second (1,000 ms).',
          '• First valid measurement R₁: SRTT ← R₁, RTTVAR ← R₁ / 2.',
          '• Subsequent measurement R′ (with α = 1/8 = 0.125, β = 1/4 = 0.25): RTTVAR ← (1 − β)·RTTVAR + β·|SRTT − R′|, then SRTT ← (1 − α)·SRTT + α·R′.',
          '• Formula: RTO = SRTT + max(G, K · RTTVAR), where K = 4 and G is clock granularity.',
          '• RFC 6298 Lower Bound (Section 2.4): Whenever computed RTO < 1 second, round it UP to 1 second (1,000 ms). (Note: textbook problems often report the unclamped formula value first—show both on exams!)',
          '• Karn’s Algorithm & Backoff: Never take RTT samples from retransmitted segments (you cannot tell whether the ACK belongs to the original or retransmitted copy unless TCP Timestamps are used). On every consecutive timeout, double RTO (exponential backoff: RTO ← 2 × RTO), capped at ≥ 60 seconds.',
        ],
        keyFormula: 'RTO = max(1 s, SRTT + max(G, 4 × RTTVAR))   |   α = 1/8, β = 1/4, K = 4',
      },
      {
        heading: 'TCP Delayed ACKs (RFC 5681) & Triple Duplicate ACKs',
        arabicCue: 'الإقرار المؤجل و3 إقرارات مكررة',
        body: [
          'A TCP receiver may briefly delay an ACK hoping to piggyback it on reverse data or combine two segments into one ACK. Do NOT invent a "fixed 1-second delayed ACK rule": RFC 5681 Section 4.2 specifies that an ACK SHOULD be generated for at least every second full-sized segment, and MUST be generated within 500 ms of the arrival of the first unacknowledged packet (many OS stacks use 40–200 ms).',
          'When an out-of-order segment arrives (indicating a gap), the receiver immediately sends a duplicate ACK repeating the expected sequence number. Receiving 3 duplicate ACKs (4 total ACKs for the same byte) signals probable packet loss to the sender, triggering Fast Retransmit without waiting for the RTO timer to expire.',
        ],
        keyFormula: 'RFC 5681 Delayed ACK: ≥ 1 ACK per 2 full-sized segments AND ≤ 500 ms max delay',
      },
    ],
    workedProblems: [
      {
        id: 'wp-sec4-1',
        sectionId: 'sec4',
        title: 'Stop-and-Wait Utilization & Overhead Sensitivity',
        arabicCue: 'حساب كفاءة التوقف والانتظار',
        prompt:
          'A Stop-and-Wait sender transmits 1,250-byte frames over a 2 Mbps link with a one-way propagation delay of 15 ms. Calculate (a) frame transmission time, (b) propagation RTT, (c) channel utilization, and (d) effective throughput.',
        assumptions: [
          'Decimal bit rate: 2 Mbps = 2 × 10⁶ bits/s (standard networking convention).',
          'Negligible ACK transmission time, negligible processing/queuing delay, and 0% packet loss.',
        ],
        steps: [
          {
            label: '1. Convert frame size to bits',
            math: 'L = 1,250 bytes × 8 bits/byte = 10,000 bits',
          },
          {
            label: '2. Compute transmission time T_trans',
            math: 'T_trans = 10,000 bits / (2 × 10⁶ bits/s) = 0.005 s = 5 ms',
          },
          {
            label: '3. Compute propagation RTT',
            math: 'RTT_prop = 2 × 15 ms = 30 ms',
          },
          {
            label: '4. Compute utilization U',
            math: 'U = 5 ms / (5 ms + 30 ms) = 5 / 35 = 1/7 ≈ 0.1429 = 14.29%',
          },
          {
            label: '5. Compute effective throughput',
            math: 'Throughput = U × R = (1/7) × 2 Mbps ≈ 0.2857 Mbps = 285.7 kbps',
          },
        ],
        finalAnswer: 'T_trans = 5 ms; RTT = 30 ms; Utilization = 14.29%; Throughput ≈ 285.7 kbps.',
        ifAssumptionChanges:
          'If each ACK is 50 bytes (T_ACK = 400 / 2×10⁶ = 0.2 ms) and receiver processing takes 0.8 ms, total cycle time grows to 5 + 30 + 0.2 + 0.8 = 36 ms, lowering U to 5 / 36 = 13.89%. If 10% of frames are lost with a 40 ms timeout, every lost frame adds a full idle timeout cycle, cutting throughput sharply.',
      },
      {
        id: 'wp-sec4-2',
        sectionId: 'sec4',
        title: 'Sliding Window Utilization & Minimum Window for Full Pipe',
        arabicCue: 'كفاءة النافذة المنزلقة وحجم النافذة الكامل',
        prompt:
          'A sliding-window link has propagation RTT = 47.5 ms and frame transmission time T_trans = 2.5 ms. (a) Find channel utilization when window size W = 8 frames. (b) Find the minimum window size W_min needed to reach 100% utilization. (c) If frames 0–3 are sent and ACK 0 is lost while frames 1–3 succeed, compare GBN and SR.',
        assumptions: [
          'Given RTT = 47.5 ms is propagation-only (2 × T_prop), ACK transmission time ≈ 0, zero packet loss in parts (a)–(b).',
          'Sequence number space is large enough to support W without wrap-around.',
        ],
        steps: [
          {
            label: '1. Compute single-frame cycle time',
            math: 'T_cycle = T_trans + RTT = 2.5 ms + 47.5 ms = 50 ms',
          },
          {
            label: '2. Compute utilization for W = 8',
            math: 'U = min(1, (8 × 2.5 ms) / 50 ms) = min(1, 20 / 50) = 0.40 = 40.0%',
          },
          {
            label: '3. Find minimum window for 100% utilization',
            math: 'W_min = ⌈50 ms / 2.5 ms⌉ = 20 frames',
            detail: 'At W ≥ 20, the first ACK returns before the sender finishes transmitting the window, so U caps at 100%.',
          },
          {
            label: '4. Compare lost ACK 0 under GBN vs. SR',
            math: 'GBN: ACK 1/2/3 cumulatively confirms frame 0 → 0 retransmissions.   SR: Frame 0 timer expires → only frame 0 retransmitted.',
          },
        ],
        finalAnswer: 'U (W = 8) = 40.0%; W_min = 20 frames; lost ACK 0 triggers 0 retransmissions in GBN (if ACK 1–3 arrive in time) vs. 1 retransmission (frame 0 only) in SR.',
        ifAssumptionChanges:
          'If the exam prompt meant RTT = 47.5 ms ALREADY includes T_trans (total cycle time), then U = (8 × 2.5) / 47.5 = 42.11% and W_min = ⌈47.5 / 2.5⌉ = 19 frames. Also, if W = 25 frames, never report 125%—utilization is strictly capped at 100%.',
      },
      {
        id: 'wp-sec4-3',
        sectionId: 'sec4',
        title: 'Multi-Sample RFC 6298 RTO Estimation, Lower Bound & Backoff',
        arabicCue: 'حساب RTO وفق RFC 6298',
        prompt:
          'A fresh TCP connection records three valid (non-retransmitted) RTT samples: R₁ = 80 ms, R₂ = 120 ms, and R₃ = 205 ms. Compute SRTT, RTTVAR, unclamped formula RTO, and RFC 6298 enforced RTO after each sample. Then state what happens if a segment times out right after R₃.',
        assumptions: [
          'RFC 6298 standard gains: α = 1/8 = 0.125, β = 1/4 = 0.25, K = 4.',
          'Clock granularity G = 10 ms (smaller than 4 × RTTVAR in all steps).',
          'None of the three samples come from retransmitted segments (Karn’s rule satisfied).',
        ],
        steps: [
          {
            label: 'Sample 1 (R₁ = 80 ms — RFC 6298 initialization)',
            math: 'SRTT₁ = 80 ms  |  RTTVAR₁ = 80 / 2 = 40 ms  |  Formula RTO₁ = 80 + 4(40) = 240 ms  →  RFC 6298 RTO₁ = 1,000 ms (1.0 s)',
          },
          {
            label: 'Sample 2 (R₂ = 120 ms)',
            math: 'RTTVAR₂ = 0.75(40) + 0.25|80 − 120| = 30 + 10 = 40 ms   |   SRTT₂ = 0.875(80) + 0.125(120) = 70 + 15 = 85 ms',
            detail: 'Formula RTO₂ = 85 + 4(40) = 245 ms → RFC 6298 lower bound enforces 1,000 ms (1.0 s).',
          },
          {
            label: 'Sample 3 (R₃ = 205 ms)',
            math: 'RTTVAR₃ = 0.75(40) + 0.25|85 − 205| = 30 + 30 = 60 ms   |   SRTT₃ = 0.875(85) + 0.125(205) = 74.375 + 25.625 = 100 ms',
            detail: 'Formula RTO₃ = 100 + 4(60) = 340 ms → RFC 6298 lower bound enforces 1,000 ms (1.0 s).',
          },
          {
            label: 'Timeout right after Sample 3',
            math: 'Exponential backoff: RTO ← 2 × 1,000 ms = 2,000 ms (2.0 s); ignore RTT sample from the retransmitted segment (Karn’s rule).',
          },
        ],
        finalAnswer:
          'After R₃: SRTT = 100 ms, RTTVAR = 60 ms, Formula RTO = 340 ms, RFC 6298 RTO = 1,000 ms (1.0 s). On timeout, RTO doubles to 2.0 s and Karn’s rule blocks sampling the retransmission.',
        ifAssumptionChanges:
          'If an OS uses a non-RFC-6298 minimum RTO of 200 ms (common in Linux), RTO₃ would remain 340 ms instead of clamping to 1,000 ms. On a high-RTT satellite link where SRTT = 900 ms and RTTVAR = 120 ms, the formula gives 900 + 480 = 1,380 ms (1.38 s), which exceeds the 1-second floor and is used directly.',
      },
    ],
  },
  {
    id: 'sec5',
    code: 'Section 5',
    title: 'TCP Congestion Control: Reno Model, rwnd, IW10 & CUBIC',
    arabicCue: 'التحكم في الازدحام (Slow Start / Reno / CUBIC)',
    summary:
      'State variables (cwnd, rwnd, ssthresh), Slow Start, Congestion Avoidance, Fast Retransmit/Fast Recovery vs. Timeout reset, and how classic Reno exam models differ from RFC 6928 IW10 and RFC 9438 CUBIC.',
    concepts: [
      {
        heading: 'Core State Variables: cwnd, rwnd & ssthresh',
        arabicCue: 'نافذة الازدحام ونافذة المستقبل والعتبة',
        body: [
          'Two independent limits govern how much unacknowledged data a TCP sender may keep in flight:',
          '• cwnd (Congestion Window): sender-maintained limit protecting the network path from congestion.',
          '• rwnd (Receiver Advertised Window): receiver-advertised free buffer space in the TCP header (flow control).',
          '• Effective Sending Window = min(cwnd, rwnd). Even if cwnd grows large, the sender must never exceed rwnd.',
          '• ssthresh (Slow Start Threshold): boundary separating Slow Start (cwnd < ssthresh) from Congestion Avoidance (cwnd ≥ ssthresh).',
        ],
        keyFormula: 'Unacknowledged Flight Size ≤ min(cwnd, rwnd)',
      },
      {
        heading: 'Reno Phases: Slow Start & Congestion Avoidance',
        arabicCue: 'البداية البطيئة وتجنب الازدحام',
        body: [
          'Slow Start (cwnd < ssthresh): In classic exam models, cwnd starts at 1 MSS (RFC 5681 allows 2–4 MSS based on SMSS; RFC 6928 proposes IW = 10 MSS). Each ACK for a new full-sized segment increases cwnd by 1 MSS. Assuming 1 ACK per segment, cwnd doubles every RTT (1 → 2 → 4 → 8 → 16 MSS).',
          'Congestion Avoidance (cwnd ≥ ssthresh): Growth switches to linear Additive Increase—approximately +1 MSS per RTT (about +MSS² / cwnd per ACK)—probing cautiously for spare bandwidth.',
        ],
        keyFormula: 'Slow Start: cwnd ≈ 2× per RTT (no delayed ACK)   |   Congestion Avoidance: cwnd += 1 MSS per RTT',
      },
      {
        heading: 'Loss Reaction: 3 Duplicate ACKs vs. RTO Timeout',
        arabicCue: 'الفرق بين 3 إقرارات مكررة وانتهاء المهلة',
        body: [
          'TCP Reno treats the two loss signals very differently because 3 duplicate ACKs prove later segments are still getting through, whereas an RTO timeout implies severe congestion:',
          '• Triple Duplicate ACKs (Fast Retransmit + Fast Recovery, RFC 5681): Set ssthresh = max(FlightSize / 2, 2 × SMSS) (roughly cwnd / 2), immediately retransmit the missing segment, inflate cwnd = ssthresh + 3 × SMSS during recovery, and upon receiving a new cumulative ACK deflate cwnd = ssthresh and continue in Congestion Avoidance.',
          '• RTO Timeout: Set ssthresh = max(FlightSize / 2, 2 × SMSS) (roughly cwnd / 2), AND reset cwnd = 1 MSS, restarting Slow Start from the bottom.',
        ],
        examWatchout:
          'Do not say "TCP always halves cwnd on packet loss." In TCP Reno, 3 duplicate ACKs reduce cwnd to roughly half (ssthresh), whereas an RTO timeout drops cwnd all the way to 1 MSS (while setting ssthresh to half). In older TCP Tahoe, BOTH events reset cwnd to 1 MSS.',
      },
      {
        heading: 'Exam Model vs. Modern Internet TCP (RFC 6928 & RFC 9438)',
        arabicCue: 'نموذج Reno مقابل TCP الحديث (CUBIC)',
        body: [
          'Lecture and exam exercises use the classic TCP Reno AIMD model because its discrete per-RTT arithmetic is easy to trace by hand. However, Reno is NOT universal current Internet TCP:',
          '• RFC 6928 is an Experimental proposal increasing the Initial Congestion Window to 10 MSS (IW10) to speed up short web transfers—widely deployed in practice, though formally Experimental rather than Internet Standard.',
          '• RFC 9438 specifies TCP CUBIC, the modern default on Linux, Windows, and macOS. On packet loss, CUBIC multiplies cwnd by β_cubic = 0.7 (a 30% cut, not Reno’s 50% halving) and grows cwnd as a cubic function of elapsed time since the last loss rather than linearly per RTT, improving fairness and utilization on high-BDP paths.',
          '• RFC 2018 (TCP SACK) lets receivers report non-contiguous received blocks so senders recover multiple losses in one window efficiently.',
        ],
      },
    ],
    workedProblems: [
      {
        id: 'wp-sec5-1',
        sectionId: 'sec5',
        title: 'Full TCP Reno Trajectory with rwnd Cap, 3 Dup ACKs & Timeout',
        arabicCue: 'تتبع نافذة الازدحام خطوة بخطوة',
        prompt:
          'A TCP Reno connection starts with cwnd = 1 MSS, ssthresh = 8 MSS, and constant receiver window rwnd = 12 MSS (MSS = 1,460 bytes). Trace cwnd, ssthresh, and effective window across RTTs 0–12 if 3 duplicate ACKs occur after RTT 7 and an RTO timeout occurs after RTT 10.',
        assumptions: [
          'Classic exam Reno model: 1 ACK per segment (no delayed ACKs), so Slow Start doubles cwnd per RTT.',
          'All cwnd values are tracked in whole MSS units; after Fast Recovery finishes within the loss RTT, cwnd equals the new ssthresh.',
        ],
        steps: [
          {
            label: 'RTT 0 → RTT 3 (Slow Start)',
            math: 'RTT 0: 1  →  RTT 1: 2  →  RTT 2: 4  →  RTT 3: 8 MSS (= ssthresh)',
            detail: 'At RTT 3, cwnd hits ssthresh (8 MSS) and transitions to Congestion Avoidance.',
          },
          {
            label: 'RTT 4 → RTT 7 (Congestion Avoidance)',
            math: 'RTT 4: 9  →  RTT 5: 10  →  RTT 6: 11  →  RTT 7: 12 MSS (17,520 bytes)',
            detail: 'Effective window = min(12, 12) = 12 MSS.',
          },
          {
            label: 'After RTT 7: 3 Duplicate ACKs (Fast Retransmit / Fast Recovery)',
            math: 'ssthresh = max(12 / 2, 2) = 6 MSS   |   cwnd → 6 MSS (after recovery)',
            detail: 'During Fast Recovery, cwnd temporarily inflates to 6 + 3 = 9 MSS, then deflates to 6 MSS on new ACK.',
          },
          {
            label: 'RTT 8 → RTT 10 (Congestion Avoidance resumes)',
            math: 'RTT 8: 7  →  RTT 9: 8  →  RTT 10: 9 MSS (linear +1 MSS/RTT)',
          },
          {
            label: 'After RTT 10: RTO Timeout',
            math: 'ssthresh = max(⌊9 / 2⌋, 2) = 4 MSS   |   cwnd = 1 MSS (Slow Start)',
          },
          {
            label: 'RTT 11 → RTT 12 (Slow Start resumes)',
            math: 'RTT 11: 2 MSS  →  RTT 12: 4 MSS (reaches new ssthresh = 4 MSS)',
          },
        ],
        finalAnswer:
          'At RTT 7: cwnd = 12 MSS (17,520 B); after 3 Dup ACKs: ssthresh = 6, cwnd = 6 MSS; after Timeout at cwnd = 9: ssthresh = 4, cwnd = 1 MSS; by RTT 12: cwnd = 4 MSS.',
        ifAssumptionChanges:
          '1) If rwnd were 10 MSS instead of 12 MSS, FlightSize at RTT 7 would be capped at 10 MSS, so ssthresh on 3 Dup ACKs would be 10 / 2 = 5 MSS instead of 6 MSS. 2) If TCP Tahoe were used, the 3 Dup ACKs after RTT 7 would reset cwnd to 1 MSS instead of 6 MSS. 3) Under TCP CUBIC (RFC 9438), the loss at 12 MSS would cut cwnd to 0.7 × 12 = 8.4 MSS rather than 6 MSS.',
      },
      {
        id: 'wp-sec5-2',
        sectionId: 'sec5',
        title: 'Slow Start RTT Count & Delayed ACK Assumption Impact',
        arabicCue: 'تأثير الإقرارات المؤجلة على البداية البطيئة',
        prompt:
          'Starting from cwnd = 2 MSS with ssthresh = 64 MSS and no loss, how many RTTs does TCP Slow Start need to reach cwnd = 32 MSS? How does the answer change if the receiver uses RFC 5681 delayed ACKs (1 ACK per 2 full-sized segments) with classic ACK-counting?',
        assumptions: [
          'Case A (Standard textbook assumption): 1 ACK per segment, cwnd += 1 MSS per ACK → doubles each RTT.',
          'Case B (Delayed ACK + classic ACK counting without Appropriate Byte Counting): 1 ACK per 2 segments → cwnd grows by factor 1.5× per RTT.',
          'rwnd ≥ 32 MSS so flow control does not cap growth.',
        ],
        steps: [
          {
            label: 'Case A: 1 ACK per segment (2× per RTT)',
            math: 'RTT 0: 2  →  RTT 1: 4  →  RTT 2: 8  →  RTT 3: 16  →  RTT 4: 32 MSS',
            detail: 'Exactly log₂(32 / 2) = 4 RTTs.',
          },
          {
            label: 'Case B: Delayed ACK (1 ACK per 2 segments, ~1.5× per RTT)',
            math: 'RTT 0: 2 → RTT 1: 3 → RTT 2: 4.5 → RTT 3: 6.75 → RTT 4: 10.1 → RTT 5: 15.2 → RTT 6: 22.8 → RTT 7: 34.2 MSS',
            detail: 'Takes ~7 RTTs instead of 4 RTTs under pure ACK counting.',
          },
        ],
        finalAnswer:
          '4 RTTs under 1 ACK/segment (standard exam assumption); ~7 RTTs under 1 ACK per 2 segments with classic ACK counting.',
        ifAssumptionChanges:
          'If the connection starts with RFC 6928 Experimental IW10 (cwnd = 10 MSS) and 1 ACK/segment, it reaches 32 MSS in just 2 RTTs (10 → 20 → 40, crossing 32 during RTT 2).',
      },
    ],
  },
];

export const REFERENCE_SOURCES: ReferenceSource[] = [
  {
    id: 'rfc768',
    title: 'RFC 768 — User Datagram Protocol (UDP)',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc768',
    scope: 'Sections 2–5',
    verifies: '8-byte fixed UDP header, 16-bit ports, Length = header + data, optional IPv4 checksum.',
  },
  {
    id: 'rfc9293',
    title: 'RFC 9293 — Transmission Control Protocol (TCP)',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc9293',
    scope: 'Sections 2–5',
    verifies: '20-byte minimum header, Data Offset in 32-bit words, 16-bit ports, next-byte-expected ACK, SYN sequence consumption.',
  },
  {
    id: 'rfc6298',
    title: 'RFC 6298 — Computing TCP’s Retransmission Timer',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc6298',
    scope: 'Sections 2–5',
    verifies: 'SRTT/RTTVAR update equations (α=1/8, β=1/4), K=4, 1-second RTO lower bound, Karn’s rule, exponential backoff.',
  },
  {
    id: 'rfc5681',
    title: 'RFC 5681 — TCP Congestion Control',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc5681',
    scope: 'Sections 2–5',
    verifies: 'Reno Slow Start, Congestion Avoidance, Fast Retransmit/Fast Recovery, and Delayed ACK rule (every 2nd full-sized segment, ≤ 500 ms).',
  },
  {
    id: 'rfc6928',
    title: 'RFC 6928 — Increasing TCP’s Initial Window (Experimental)',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc6928',
    scope: 'Sections 2–5',
    verifies: 'Experimental IW10 (10 MSS initial cwnd) proposal—distinguished from classic 1 MSS / RFC 5681 2–4 MSS.',
  },
  {
    id: 'rfc9438',
    title: 'RFC 9438 — CUBIC for Fast and Long-Distance Networks',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc9438',
    scope: 'Sections 2–5',
    verifies: 'Modern default TCP CUBIC congestion control (β = 0.7 multiplicative decrease and cubic time-based window growth).',
  },
  {
    id: 'rfc2018',
    title: 'RFC 2018 — TCP Selective Acknowledgment Options (SACK)',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc2018',
    scope: 'Sections 2–5',
    verifies: 'Selective acknowledgment blocks in TCP options enabling efficient recovery from multiple losses.',
  },
  {
    id: 'wireshark-tcp',
    title: 'Wireshark User’s Guide — TCP Analysis',
    organization: 'Wireshark',
    url: 'https://www.wireshark.org/docs/wsug_html_chunked/ChAdvTCPAnalysis.html',
    scope: 'Sections 2–5',
    verifies: 'Heuristic nature of Wireshark TCP analysis labels (retransmissions, dup ACKs, capture gaps, and reordering).',
  },
  {
    id: 'rfc4632',
    title: 'RFC 4632 (BCP 122) — Classless Inter-domain Routing (CIDR)',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc4632',
    scope: 'Supplemental Subnetting',
    verifies: 'CIDR prefix notation (/n), variable-length subnet masks, and address aggregation.',
  },
  {
    id: 'rfc1878',
    title: 'RFC 1878 — Variable Length Subnet Table for IPv4',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc1878',
    scope: 'Supplemental Subnetting',
    verifies: 'Standard IPv4 prefix lengths, dotted-decimal masks, and conventional host count tables.',
  },
  {
    id: 'rfc3021',
    title: 'RFC 3021 — Using 31-Bit Prefixes on IPv4 Point-to-Point Links',
    organization: 'RFC Editor',
    url: 'https://www.rfc-editor.org/rfc/rfc3021',
    scope: 'Supplemental Subnetting',
    verifies: '/31 point-to-point exception allowing 2 usable endpoint hosts without network/broadcast address reservation.',
  },
  {
    id: 'cisco-subnetting',
    title: 'Cisco Learning Network — IPv4 Subnetting Reference Chart',
    organization: 'Cisco Learning Network',
    url: 'https://learningnetwork.cisco.com/s/article/ipv4-subnetting-reference-chart',
    scope: 'Supplemental Subnetting',
    verifies: 'Quick prefix-to-mask, block size, and usable host reference chart for IPv4 subnetting practice.',
  },
];
