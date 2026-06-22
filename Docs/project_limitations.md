# Project Limitations: **AdventureNexus**
### Cryptographic Boundaries, Algorithmic Constraints, API Bottlenecks, and Ingestion Limits

---

## 1. Cryptographic and Local Storage Limitations

### A. Single-Device Dependency
Because the private key is stored locally inside the browser's IndexedDB, user security is bound to a single device and browser session. If a user logs in from a different browser, computer, or mobile device, they cannot decrypt their message history unless they manually export/import their cryptographic keys.

### B. Risk of Irreversible Key Loss
To maintain zero-knowledge security, the backend server does not back up or store user private keys. If a user clears their browser cache, deletes site storage, or experiences hardware failure, their private key is permanently lost. Consequently, their historical chat transcripts become undecryptable.

---

## 2. Machine Learning & Recommender Boundaries

### A. Cold Start Problem
The FastAPI recommender relies on content-based filtering using historical user profiles. New users with no past itineraries or explicit preferences receive default recommendations, as the TF-IDF vectorizer requires historical user data to calculate cosine similarity scores.

### B. Delayed Model Training
Re-fitting the TF-IDF model and updating the cosine similarity matrices run on a background pipeline. Because retraining is not real-time, new plans and updated user preferences do not affect recommendations until the next retraining cycle.

---

## 3. Expense Ledger Limitations

### A. Lack of Real-Time Payment Settlement
The greedy netting algorithm simplifies and displays optimal settlement paths, but it does not execute the actual financial transactions. Users must still manually make bank transfers, wire funds, or use external UPI apps to settle debts.

### B. Manual Input Trust Dependency
The netting engine assumes that users enter honest expense data. If a user inputs inaccurate or fraudulent transactions, the system calculates a mathematically correct netting path for incorrect debt balances.

---

## 4. API Dependency and Performance Bottlenecks

### A. LLM Response Latency
Generating itineraries via the Groq LLM API takes 1.5 to 3 seconds. While fast for an LLM, this latency is higher than standard database queries, requiring loading screens on the frontend.

### B. Third-Party Rate Limits and Fallbacks
The system relies on free tiers for Open-Meteo (weather) and Nominatim (geocoding). Under high traffic, these APIs may throttle requests, forcing the system to fall back to preset coordinate lists and location hashes, which reduces data accuracy.
