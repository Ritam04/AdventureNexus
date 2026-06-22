# System Design Documentation: **AdventureNexus**
### Architectural Blueprints, Database Schemas, Cryptographic Flows, and Core Algorithms

---

## 1. Architectural Overview

AdventureNexus uses a multi-tier microservice architecture to isolate client interactions, API routing, and machine learning computations:

```
+-------------------------------------------------------------+
|                     React Frontend Client                   |
|  - E2EE Engine (TweetNaCl)                                  |
|  - Local Private Key Storage (IndexedDB Sandbox)            |
|  - State Manager (Zustand) & Live Map Layers (OpenStreetMap) |
+-------------------------------------------------------------+
                              |
                     HTTPS / WebSockets (WSS)
                              |
                              v
+-------------------------------------------------------------+
|                      Node.js API Gateway                    |
|  - Express Router, JWT Validator (Firebase Admin SDK)       |
|  - Real-time Relays (Socket.io)                             |
|  - Telemetry Trackers, Input Sanitizers & Maintenance Mode  |
+-------------------------------------------------------------+
            /                 |                     \
           /                  |                      \
          v                   v                       v
+--------------+     +-----------------+     +-----------------+
| Redis Cache  |     | MongoDB Cluster |     | FastAPI Service |
| - API data   |     | - Mongoose DB   |     | - Scikit-learn  |
| - Sessions   |     | - Schema Stores |     | - Recommendation|
+--------------+     +-----------------+     +-----------------+
```

---

## 2. Database Schema Design (MongoDB / Mongoose)

Below are the primary schemas used in AdventureNexus:

### 2.1 User Collection (`users`)
Stores user profiles, activity states, public keys, and trust score aggregates.
* **Fields**:
  - `firebaseUid` (String, Indexed, Unique)
  - `email` (String, Unique)
  - `username` (String)
  - `publicKey` (String) - Client's X25519 E2EE Public Key
  - `trustScore` (Number, Default: 100)
  - `lastActive` (Date)
  - `isBot` (Boolean, Default: false)

### 2.2 Plan Collection (`plans`)
Stores manual and AI-generated travel itineraries.
* **Fields**:
  - `creatorId` (ObjectId referencing `users`)
  - `destination` (String)
  - `duration` (Number)
  - `days` (Array of objects containing activity names, times, coordinates, and notes)
  - `style` (String) - e.g. Adventure, Relaxed, Budget
  - `visibility` (String: 'public' or 'private')
  - `score` (Number) - Dynamically adjusted rank score

### 2.3 Message Collection (`messages`)
Stores E2EE ciphertexts. Note that the server never stores plain text.
* **Fields**:
  - `chatId` (String, Indexed) - Unique identifier for the conversation
  - `senderId` (ObjectId referencing `users`)
  - `recipients` (Array of objects containing `recipientId` and `ciphertext`) - Group fan-out payloads
  - `nonce` (String) - Cryptographic nonce used by TweetNaCl
  - `timestamp` (Date, Default: Date.now)

### 2.4 Expense Group Collection (`expense_groups`)
Tracks financial transactions and group shares.
* **Fields**:
  - `name` (String)
  - `members` (Array of ObjectIds referencing `users`)
  - `expenses` (Array of objects containing `description`, `amount`, `paidById`, `shares` [memberId, amount])
  - `settlements` (Array of settled debt objects)

---

## 3. Cryptographic Design (E2EE Chat Sequence)

### 3.1 Key Generation and Sandboxing
When a user registers or logs in:
1. The client checks **IndexedDB** (`NexusE2EE` database, `keys` store) for an existing X25519 key pair.
2. If absent, the E2EE engine (`nacl.box.keyPair()`) generates a key pair.
3. The private key is saved to IndexedDB.
4. The public key is uploaded to the backend server and linked to the user's document in the `users` collection.

### 3.2 Secure Messaging Flow (Direct Chat)
To send a message from Alice to Bob:
1. Alice retrieves Bob's X25519 public key from the backend.
2. Alice generates a random 24-byte cryptographic nonce.
3. Alice encrypts the message using her private key (from IndexedDB) and Bob's public key:
   $$\text{Ciphertext} = \text{Encrypt}(\text{Plaintext}, \text{Alice\_Private\_Key}, \text{Bob\_Public\_Key}, \text{Nonce})$$
4. Alice uploads the `ciphertext`, `nonce`, and Bob's `recipientId` to the backend.
5. Bob receives the payload, retrieves Alice's public key, and decrypts the ciphertext locally:
   $$\text{Plaintext} = \text{Decrypt}(\text{Ciphertext}, \text{Alice\_Public\_Key}, \text{Bob\_Private\_Key}, \text{Nonce})$$

### 3.3 Group Messaging Flow (Per-Member Fan-out)
For a group chat containing Alice, Bob, and Charlie:

```
[ Alice (Sender Client) ]
  1. Retrieve Bob and Charlie's Public Keys from Backend.
  2. Generate Nonce.
  3. Encrypt Plaintext for Bob     ==> Ciphertext_Bob
  4. Encrypt Plaintext for Charlie ==> Ciphertext_Charlie
  5. Post Payload to Server:
     {
       senderId: Alice,
       nonce: Nonce,
       recipients: [
         { recipientId: Bob,     ciphertext: Ciphertext_Bob },
         { recipientId: Charlie, ciphertext: Ciphertext_Charlie }
       ]
     }

[ Server (Blind Relay) ]
  1. Receive Payload.
  2. Save to "messages" Collection in DB.
  3. Broadcast Payload to Sockets (Bob & Charlie).
```

---

## 4. Algorithmic Engine Designs

### 4.1 Greedy Netting Debt Simplification Algorithm
The system simplifies group debts to minimize transactions.
* **Input**: List of expenses with transaction splits.
* **Step-by-Step Execution**:
  1. For each member $u \in V$, calculate their net balance:
     $$\text{Balance}(u) = \text{Total\_Paid}(u) - \text{Total\_Share}(u)$$
  2. Filter users into two lists: `creditors` (balance $>0$) and `debtors` (balance $<0$).
  3. Sort both lists in descending order of absolute values.
  4. Let the largest creditor be $C$ with balance $B_C$, and the largest debtor be $D$ with balance $B_D$.
  5. Determine the transaction amount:
     $$T = \min(B_C, |B_D|)$$
  6. Register a debt payment: **$D$ pays $C$ the amount $T$**.
  7. Update balances: $B_C \leftarrow B_C - T$ and $B_D \leftarrow B_D + T$.
  8. Remove resolved users from the list and repeat steps 4–7 until all balances are settled.

### 4.2 Content-Based Recommendation Engine (FastAPI)
The recommendation microservice runs content-based filtering on itineraries:
* **Feature Extraction**: Text from destinations, travel styles, activities, and summaries are combined to create a single weighted string for each plan.
* **Vectorization**: The text is converted into vector matrices using TF-IDF:
  $$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \log\left(\frac{|D|}{1 + |\{d \in D : t \in d\}|}\right)$$
* **Matching**: User preferences are vectorized into a profile vector. Cosine similarity is computed between the user profile vector $U$ and all plan vectors $P$:
  $$\text{Cosine Similarity}(U, P) = \frac{U \cdot P}{\|U\| \|P\|}$$
* **Model Serialization**: The vectorizer and similarity matrices are saved using `joblib` for fast loading into the FastAPI application.

### 4.3 Social Trust Score Formula
The trust engine modulates user content visibility using a dynamic trust score:
$$\text{Trust Score} = 100 - (\text{Toxicity} \times 30) - (\text{Spam} \times 20) - (\text{Reports} \times 5) - (\text{Fake Reviews} \times 20)$$
* **Toxicity**: Calculated using Groq content moderation filters on posts and comments.
* **Fake Reviews**: Calculated using Jaccard Similarity index checks on reviews:
  $$J(A, B) = \frac{|A \cap B|}{|A \cup B|}$$
  Reviews with similarity $> 0.6$ are flagged.
* **Visibility Adjustments**:
  - Trust Score $< 30$: Itineraries are hidden from search results.
  - Trust Score $30 - 50$: Visibility score is penalized ($0.5\times$ multiplier).
  - Trust Score $> 80$: Visibility score is boosted ($1.2\times$ multiplier).

---

## 5. Component API Routes Mapping

The Express backend exposes structured routes to the client:

| Route Path | Method | Controller/Service Function | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/users/register` | POST | `userController.register` | Verifies Firebase token, registers user, records public key. |
| `/api/v1/plans/create` | POST | `newPlanController.create` | Sends request to Groq LLM to generate plan options. |
| `/api/v1/messaging/send` | POST | `chatController.sendMessage` | Relays E2EE payload and triggers Socket.io broadcast. |
| `/api/v1/expenses/settle` | POST | `expenseController.settleGroup` | Runs the Greedy Netting algorithm on group transactions. |
| `/api/v1/travel/intel` | GET | `travelIntelController.getIntel` | Connects to Open-Meteo, calculates weather and crowd levels. |
| `/api/v1/trust/recalculate` | POST | `trustController.runRecalc` | Evaluates bot signals and recalculates trust metrics. |
| `/api/v1/admin/simulator/start` | POST | `simulatorController.start` | Launches the background traffic simulator. |
