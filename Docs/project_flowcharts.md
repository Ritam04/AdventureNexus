# System Flowcharts: **AdventureNexus**
### Procedural Logic, Decision Points, and System Workflows

---

## 1. AI Itinerary Generation Flowchart

This flowchart outlines the process of validating inputs, checking cache states, querying the LLM, and rendering itineraries.

```mermaid
graph TD
    Start([Start: User Requests Itinerary]) --> InputParams[Input: Destination, Style, Budget, Duration]
    InputParams --> CheckCache{Check Redis Cache}
    
    %% Cache Hit
    CheckCache -->|Hit| RetrieveCache[Retrieve Cached Itinerary JSON]
    RetrieveCache --> RenderMap[Render Route on OpenStreetMap Layer]
    
    %% Cache Miss
    CheckCache -->|Miss| ConstructPrompt[Construct Prompts with Heuristic Context]
    ConstructPrompt --> QueryGroq[Query Groq AI API]
    QueryGroq --> ParseJSON{Parse AI JSON Output}
    
    %% Parsing Decision
    ParseJSON -->|Success| SaveDB[Save Itinerary to MongoDB]
    ParseJSON -->|Fail / Invalid Format| HeuristicParse[Apply Regular Expression Fallback Parsing]
    HeuristicParse --> SaveDB
    
    SaveDB --> CacheItinerary[Cache Itinerary JSON in Redis]
    CacheItinerary --> RenderMap
    RenderMap --> End([End: Render Itinerary UI])
```

---

## 2. E2EE Message Delivery Flowchart

This flowchart illustrates the zero-knowledge message path, highlighting the client-side cryptographic boundary.

```thought
The client-side encryption flow must detail key pair checks, encryption, and socket relays.
```

```mermaid
graph TD
    StartMsg([Start: Send Message]) --> CheckKeys{Check IndexedDB for Key Pair}
    
    %% Key check
    CheckKeys -->|Not Found| GenKeyPair[Generate X25519 Key Pair client-side]
    GenKeyPair --> SaveIndexedDB[Save Private Key in IndexedDB]
    SaveIndexedDB --> UploadPubKey[Upload Public Key to Server]
    UploadPubKey --> QueryRecipientKey
    
    CheckKeys -->|Found| QueryRecipientKey[Query Recipient Public Key from Server]
    
    %% Encryption
    QueryRecipientKey --> EncryptPayload[Encrypt Plaintext via nacl.box client-side]
    EncryptPayload --> PostPayload[Post Payload: Ciphertext + Nonce to Express API]
    
    %% Server Relay
    PostPayload --> DBWrite[Save E2EE Payload in MongoDB]
    DBWrite --> SocketRelay[Relay Payload via WebSockets Socket.io]
    
    %% Recipient Decryption
    SocketRelay --> RecipientReceive[Recipient Client Receives Payload]
    RecipientReceive --> DecryptPayload[Decrypt Payload via local Private Key client-side]
    DecryptPayload --> RenderText[Render Plaintext Message in UI]
    RenderText --> EndMsg([End])
```

---

## 3. Expense Netting Settlement Flowchart

This flowchart displays the mathematical loop execution of the greedy netting minimization algorithm.

```mermaid
graph TD
    StartNet([Start: Settle Expense Group]) --> FetchExp[Fetch Expenses from MongoDB]
    FetchExp --> CalcNet[Calculate Net Balances: Total Paid - Total Share]
    CalcNet --> FilterUsers[Filter into Creditors > 0 and Debtors < 0]
    FilterUsers --> SortUsers[Sort Creditors and Debtors in Descending Order]
    
    %% Settlement Loop
    SortUsers --> LoopStart{Are lists empty?}
    LoopStart -->|No| MatchMax[Match Largest Creditor C and Largest Debtor D]
    MatchMax --> CalcMin[Calculate Transfer T = min C_Balance, abs D_Balance]
    CalcMin --> RegisterDebt[Register Settlement: D pays C the amount T]
    RegisterDebt --> UpdateBalances[Update C_Balance and D_Balance]
    UpdateBalances --> RemoveSettled[Remove Resolved Users from Lists]
    RemoveSettled --> LoopStart
    
    %% End Loop
    LoopStart -->|Yes| OutputList[Output Simplified Settlement List]
    OutputList --> EndNet([End])
```

---

## 4. Content Moderation & Reputation Modulation Flowchart

This flowchart details the asynchronous safety checks, Jaccard Match evaluations, and visibility score adjustments.

```mermaid
graph TD
    StartMod([Start: User Submits Review or Post]) --> TriggerAsync[Trigger Asynchronous Processing Tasks]
    
    %% Safety Pipeline
    TriggerAsync --> ModerationCheck[Send Content to Groq Moderation API]
    ModerationCheck --> EvaluateFlags{Does Content Violate Toxicity or Spam Rules?}
    
    %% Similarity Pipeline
    TriggerAsync --> FetchAuthorReviews[Fetch Historical Reviews by Same Author]
    FetchAuthorReviews --> CalcJaccard[Compute Jaccard Text Similarity Index]
    CalcJaccard --> EvaluateSimilarity{Is Jaccard Index > 0.6?}
    
    %% Branch Processing
    EvaluateFlags -->|Yes| FlagViolation[Flag Content and Quarantine Item]
    EvaluateFlags -->|No| CheckSimilarityState
    
    EvaluateSimilarity -->|Yes| FlagViolation
    EvaluateSimilarity -->|No| PublishContent[Publish Content and Render in UI]
    
    FlagViolation --> PenaltyScore[Apply Trust Score Deductions]
    PenaltyScore --> RecalcTrust[Recalculate User Trust Score 0-100]
    
    CheckSimilarityState{Are both checks complete and clean?}
    CheckSimilarityState -->|Yes| PublishContent
    
    PublishContent --> RecalcTrust
    RecalcTrust --> VisibilityAdjust{Determine Trust Band}
    
    %% Visibility Bands
    VisibilityAdjust -->|Trust < 30| HideItinerary[Hide User's Itineraries from Search]
    VisibilityAdjust -->|Trust 30-50| PenalizeVisibility[Apply 0.5x Visibility Penalty]
    VisibilityAdjust -->|Trust > 80| BoostVisibility[Apply 1.2x Visibility Boost]
    VisibilityAdjust -->|Trust 50-80| DefaultVisibility[Maintain Default Visibility]
    
    HideItinerary --> EndMod([End])
    PenalizeVisibility --> EndMod
    BoostVisibility --> EndMod
    DefaultVisibility --> EndMod
```
