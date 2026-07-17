# Testing Documentation: **AdventureNexus**
### Test Strategy, TestCase Specifications, Cryptographic Validation, and Load Testing Metrics

---

## 1. Testing Strategy

The quality assurance strategy for AdventureNexus isolates testing activities into four distinct layers:

```
+-----------------------------------------------------------------+
|                       End-to-End (E2E) Testing                  |
| - Validate E2EE Client decryption & IndexedDB sandboxing        |
+-----------------------------------------------------------------+
                                |
+-----------------------------------------------------------------+
|                       Integration Testing                       |
| - Verify API endpoints, Redis caching, and FastAPI connections  |
+-----------------------------------------------------------------+
                                |
+-----------------------------------------------------------------+
|                          Unit Testing                           |
| - Verify Greedy Netting, Jaccard index, and Trust algorithms    |
+-----------------------------------------------------------------+
```

### A. Unit Testing
* **Scope**: Focuses on pure, deterministic functions that do not require active network connections.
* **Target Components**: `expenseEngine.ts` (greedy netting logic), `trustEngine.ts` (trust rating formulas), `recommender.py` (cosine calculations).
* **Tools**: **Jest** (TypeScript) and **PyTest** (Python).

### B. Integration Testing
* **Scope**: Validates interfaces between Node.js, FastAPI, Redis, and MongoDB Atlas.
* **Target Components**: Session authentications, travel intelligence APIs, cache updates.
* **Tools**: **Supertest** (Node.js API router mocking) and **PyTest HTTP Client**.

### C. End-to-End (E2E) Testing (Cryptographic Boundary)
* **Scope**: Verifies client-side cryptographic functions and browser database storage.
* **Target Components**: Key generation, IndexedDB storage, fan-out message routing.
* **Tools**: **Playwright** (browser sandbox testing).

### D. Load & Security Testing
* **Scope**: Evaluates system behavior under concurrent traffic loads and scans for security vulnerabilities.
* **Target Components**: WebSockets broadcasts, input sanitization middleware, route access boundaries.
* **Tools**: Built-in **Traffic Simulator** and **Artillery**.

---

## 2. Test Case Specifications

### TC-01: Itinerary Geocoding Fallback Validation
* **Objective**: Verify that the system falls back to internal preset coordinates if the Nominatim OSM API is offline.
* **Pre-conditions**: Simulate Nominatim API downtime (return HTTP 503).
* **Test Steps**:
  1. Post a plan creation request for a common destination (e.g., " Shimla").
  2. Capture the outgoing Nominatim request.
  3. Verify that the geocoding service detects the API failure.
  4. Verify that the system retrieves Shimla's coordinates from the internal database cache.
* **Expected Result**: The itinerary is generated successfully with correct coordinates.

### TC-02: Cryptographic Private Key Sandboxing (XSS Defense)
* **Objective**: Verify that user private keys are isolated inside IndexedDB and cannot be accessed via standard document storage APIs.
* **Pre-conditions**: User is logged in and E2EE session is active.
* **Test Steps**:
  1. Inject a simulated XSS script to execute `console.log(localStorage.getItem('privateKey'))`.
  2. Execute `console.log(sessionStorage.getItem('privateKey'))`.
  3. Attempt to read the browser's IndexedDB contents via `window.indexedDB.open("NexusE2EE")` without user permission.
* **Expected Result**: Local/Session storage queries return `null`. The browser blocks unauthorized access to IndexedDB, preventing private key extraction.

### TC-03: Greedy Debt Minimization Accuracy
* **Objective**: Verify that the greedy netting algorithm correctly simplifies debt transactions.
* **Pre-conditions**: Create an expense group with 3 members: Alice, Bob, and Charlie. Alice pays ₹300 (total split: ₹100 each). Bob pays ₹300 (total split: ₹100 each).
* **Test Steps**:
  1. Record the expenses.
  2. Calculate net positions: Alice: $+₹100$, Bob: $+₹100$, Charlie: $-₹200$.
  3. Execute the settlement algorithm.
* **Expected Result**: The engine outputs exactly 2 payments: Charlie pays Alice ₹100, and Charlie pays Bob ₹100. The total transaction count is minimized.

### TC-04: Fraudulent Testimonials Quarantine (Jaccard Index)
* **Objective**: Verify that the system flags reviews with high Jaccard similarity indices.
* **Pre-conditions**: User has submitted an itinerary review.
* **Test Steps**:
  1. Submit a second review with similar phrasing (e.g., matching $>60\%$ of the words in the first review).
  2. Verify that the system calculates the Jaccard similarity index.
  3. Check if the similarity exceeds $0.6$.
* **Expected Result**: The system flags the second review as spam, quarantines it, and lowers the user's trust score.

### TC-05: AI Toxicity Moderation and Visibility Penalty
* **Objective**: Verify that toxic content is moderated and automatically reduces the creator's itinerary visibility.
* **Pre-conditions**: User trust score starts at 100.
* **Test Steps**:
  1. Post a comment containing toxic text.
  2. Verify that the asynchronous moderation engine flags the content.
  3. Verify that the user's trust score drops below 30.
  4. Perform an itinerary search.
* **Expected Result**: The comment is flagged, the user's trust score is updated, and their itineraries are hidden from search results.

---

## 3. Test Cases Summary Matrix

| ID | Test Target | Focus Area | Input / Trigger | Expected Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | `travelIntelService.ts` | Resiliency | Geocoding API timeout | Fall back to preset coordinate hash | Passed |
| **TC-02** | `keyManager.js` | Security | Script injection (XSS) | Private key remains sandboxed in IndexedDB | Passed |
| **TC-03** | `expenseEngine.ts` | Algorithm | $N$-party debts | Outputs minimized payments ($V-1$ max transfers) | Passed |
| **TC-04** | `trustEngine.ts` | Quality | Review text duplicate | Identify Jaccard index $>0.6$, quarantine review | Passed |
| **TC-05** | `moderationEngine.ts`| AI Safety | Toxic text submission | Block publication, lower trust score to $<30$ | Passed |
| **TC-06** | `trafficSimulator.ts`| Scale | 50 concurrent requests | WebSockets handle updates under $50\text{ms}$ latency | Passed |
