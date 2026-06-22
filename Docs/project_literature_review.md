# Project Literature Review: **AdventureNexus**
### Analysis of Existing Methodologies, Technologies, and Research Gaps

---

## 1. AI-Driven Travel & Route Planning

### Traditional Methods vs. Large Language Models (LLMs)
Historically, digital travel planners relied on deterministic algorithms (such as Dijkstra's, A*, or Genetic Algorithms) to compute optimal paths between tourist spots based on distance or cost constraints. However, these systems struggled to incorporate unstructured constraints, such as user sentiment, travel preferences, and flexible scheduling. 

Recent research demonstrates that Large Language Models (LLMs) are highly capable of processing natural language inputs and generating detailed, day-by-day travel itineraries. However, LLMs face issues with factual accuracy (hallucinations) and cannot dynamically calculate real-time environmental changes. Modern implementations (such as AdventureNexus) address this gap by combining LLMs (via Groq API) for qualitative text creation with deterministic APIs (Open-Meteo, OpenStreetMap) for location, weather, and scheduling data.

---

## 2. End-to-End Cryptography in Group Collaboration

### E2EE Protocols (Signal and NaCl)
End-to-End Encryption (E2EE) prevents intermediate relays (servers) from reading message content. Protocols such as the Signal Protocol (Double Ratchet Algorithm) and the NaCl Cryptographic Suite are widely accepted standards. NaCl, specifically through TweetNaCl, offers a lightweight implementation using **X25519 Elliptic Curve Diffie-Hellman (ECDH)** for key exchange, **XSalsa20** for symmetric encryption, and **Poly1305** for message authentication.

### Secure Client-Side Key Storage
A critical vulnerability in web-based E2EE applications is the extraction of private keys via Cross-Site Scripting (XSS) attacks. Research shows that saving keys in `localStorage` or `sessionStorage` exposes them to any script running in the browser context. Sandboxing keys inside **IndexedDB** mitigates this risk. Unlike `localStorage`, IndexedDB supports structured binary data storage and operates in a separate transactional context that browsers can encrypt at rest, providing an isolated cryptographic environment.

### Group Key Exchange Strategies
Implementing group encryption client-side presents scalability issues. While systems often use shared symmetric group keys managed by server-side key distributors, this approach re-introduces trust dependencies. The **Per-Member Fan-out** model, where the sender encrypts a message separately with each group member's public key, ensures absolute decentralization. Although this increases network payload, it guarantees that no group key is shared, maintaining strong security.

---

## 3. Expense Netting & Settlement Algorithms

### Graph Theory and Transaction Minimization
Splitting expenses in social groups is modeled mathematically using directed graphs, where nodes represent users and edges represent debts. Left unoptimized, these graphs contain redundant edges and cycles (e.g., Alice owes Bob ₹100, Bob owes Charlie ₹100). 

To resolve this, systems apply transaction minimization algorithms. While the *Maximum Flow* algorithm calculates optimal settlement flows, it is computationally complex. Practical systems implement a **Greedy Netting Algorithm**:
1. Calculate the net balance for each user (Total Paid - Total Share).
2. Separate users into creditors (balance $> 0$) and debtors (balance $< 0$).
3. Sort both groups in descending order of their balances.
4. Iteratively resolve the minimum absolute value of the largest debtor and largest creditor.

This heuristic runs in $O(V \log V)$ time (due to sorting) and reduces the transaction count to a maximum of $V - 1$ transfers, where $V$ is the number of participants.

---

## 4. Content Moderation & Reputation Systems

### Automated Spam & Toxicity Detection
Traditional moderation filters rely on static keyword blocklists, which are easily bypassed by character substitutions. Modern moderation systems utilize LLMs as semantic classifiers to score content across multiple hazard dimensions (toxicity, spam, hate speech, explicit content). 

### Fraud & Fake Review Mitigation
Testimonial systems are vulnerable to astroturfing (fake reviews submitted by bots or coordinated campaigns). Research in textual fraud detection utilizes the **Jaccard Similarity Index** to detect automated phrasing. The Jaccard Index computes the intersection over union of word sets:
$$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
An index exceeding $0.6$ between reviews submitted by the same user or target profile indicates content duplication, flagging coordinated spam campaigns.

### Trust-Modulated Recommender Systems
Traditional Collaborative Filtering and Content-Based Filtering models generate recommendations based purely on preference similarity. However, they are vulnerable to shilling attacks, where malicious accounts boost specific items. Modern literature suggests coupling recommendation engines with dynamic trust scores computed from user activity (spam indices, bot signals, profile completeness). Modulating recommendation rankings based on user trust scores (0-100) ensures that high-quality recommendations are prioritized.

---

## 5. Summary of Research Gaps Addressed by AdventureNexus

| Feature / Area | Existing Systems | AdventureNexus Solution |
| :--- | :--- | :--- |
| **Itinerary Personalization** | Static templates or pure LLM outputs (prone to hallucinations). | LLM-structured plans combined with real-time API verification (Open-Meteo & Nominatim). |
| **Chat Security** | Server-side storage of plaintext or shared database keys. | Client-side E2EE (X25519) with IndexedDB storage sandboxing. |
| **Debt Simplification** | Pairwise individual debts resulting in high transaction volume. | Greedy netting algorithm minimizing transactions to a maximum of $V-1$ transfers. |
| **Travel Recommendation** | Unmoderated lists susceptible to spam and malicious manipulation. | Trust-modulated recommendations that boost trusted guides and hide low-trust items. |
