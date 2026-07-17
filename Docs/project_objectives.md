# Project Objectives: **AdventureNexus**
### Technical & Functional Objectives for the Final Year Project

---

## 🎯 Primary Objective

The overarching objective of this project is to develop **AdventureNexus**, a unified, secure, and trust-modulated travel planning ecosystem that addresses the fragmentation, security flaws, and coordination complexities inherent in modern travel planning. The system combines generative AI, peer-to-peer (P2P) client-side cryptography, graph optimization, and real-time environmental APIs to deliver a streamlined social travel planning experience.

---

## ⚙️ Technical & Module-Specific Objectives

### 1. Intelligent Itinerary & Planning Automation
* **Dynamic Generation**: To automate the generation of day-by-day travel itineraries based on destination, travel style, duration, and budget range using Large Language Models (LLM) via the Groq API.
* **Service Mapping**: To integrate accommodations, transport routes, and geographic data using the OpenStreetMap (OSM) interface, mapping interactive coordinates for travel points.

### 2. Zero-Knowledge Social Communication (E2EE)
* **Cryptographic Privacy**: To implement a secure direct and group messaging network using the **TweetNaCl** library (X25519 ECDH for key agreements, XSalsa20 for encryption, Poly1305 MAC for authenticity), ensuring the database server acts solely as a blind relay and never sees plain text.
* **XSS Resistance**: To store user private keys inside browser-isolated **IndexedDB** sandboxes rather than `localStorage`, preventing data leakage through malicious scripts.
* **Per-Recipient Fan-out**: To establish group encryption by creating separate ciphertexts corresponding to each member's public key, resolving standard group-key management issues in client-side encryption.

### 3. Transaction Minimization & Financial Ledger
* **Debt Netting**: To minimize group debt settlements using a **Greedy Netting Algorithm** that reduces a complex network of multi-user obligations to the absolute minimum number of direct transfers ($O(V + E)$ complexity).
* **AI Anomaly Tracking**: To generate real-time warnings for group spend imbalances (e.g., when a user pays for >60% of all expenses) and alert heavy debtors to settle accounts.

### 4. Live Environmental & Crowd Intelligence
* **Multi-Source Data Ingestion**: To fetch real-time weather forecasts via the **Open-Meteo API** and geolocate landmarks via the **Nominatim (OSM) API**, providing robust hash-based fallbacks in case of external service downtime.
* **Density Estimation**: To calculate location crowd indexes ('low', 'medium', 'high') dynamically based on internal plan searches, bookings, and community posts.
* **Optimal Window Recommendation**: To calculate the safest and most comfortable visiting windows based on temperature extremes, precipitation, and peak crowd hours (e.g. sunrise visits to high-crowd landmarks).

### 5. Content Integrity & Social Trust Modulation
* **AI-Driven Moderation**: To build an asynchronous content moderation system using Groq LLMs to detect and flag toxic comments, spam, hate speech, or inappropriate reviews.
* **Fraud Detection**: To detect fake testimonials by computing a **Jaccard Similarity Index** ($>0.6$ match threshold) across historical reviews, combined with activity frequency and rating distribution flags (detecting bot spam).
* **Dynamic Visibility Boost & Penalty**: To model user reputations through a dynamic 0-100 Trust Score. This score modulates recommendations: boosting plans created by high-trust users ($1.2\times$), penalizing moderate-risk users ($0.5\times$), and censoring/hiding plans from low-trust accounts (score $< 30$).

### 6. Observability, Telemetry & Load Simulation
* **Synthetic Traffic Ingestion**: To implement a configurable background traffic simulator simulating concurrent user signups, comments, itinerary creation, and reviews.
* **Telemetry Monitoring**: To measure system performance metrics (latency, memory consumption, socket connection state, and cache hit rates) under simulated loads to verify production readiness.
