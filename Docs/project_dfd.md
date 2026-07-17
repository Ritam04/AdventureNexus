# Data Flow Diagram (DFD): **AdventureNexus**
### Level 0, Level 1, and Level 2 Data Flow Specifications

---

## 1. DFD Level 0: Context Diagram

The Context Diagram defines the boundary of the AdventureNexus system, identifying external entities that feed data into the application or receive data from it.

```mermaid
graph TD
    User([User / Traveler])
    Admin([System Administrator])
    GroqAPI([Groq LLM API])
    OpenMeteo([Open-Meteo API])
    Nominatim([Nominatim OSM Geocoder])
    Firebase([Firebase Auth Server])
    
    System{{"[ AdventureNexus System ]"}}
    
    %% User Interactions
    User -->|1. Credentials / JWT| System
    User -->|2. Encrypted Messages| System
    User -->|3. Travel Preferences & Expenses| System
    System -->|4. Decrypted UI Views / Routes / Maps| User
    System -->|5. Settlement Sheets & Recommendations| User
    
    %% Admin Interactions
    Admin -->|6. Start Simulator / Maintenance Toggle| System
    System -->|7. Telemetry & Log Output| Admin
    
    %% API Interactions
    System -->|8. Itinerary Prompts / Safety Queries| GroqAPI
    GroqAPI -->|9. Structured JSON Itineraries & Safety Flags| GroqAPI
    System -->|10. Weather Requests| OpenMeteo
    OpenMeteo -->|11. Meteorological Data| System
    System -->|12. Address Queries| Nominatim
    Nominatim -->|13. Coordinates| System
    System -->|14. Token Validation| Firebase
    Firebase -->|15. UID & User Details| System
```

---

## 2. DFD Level 1: Process Decomposition

Level 1 DFD breaks the system down into core processes, illustrating how data flows between processes, external entities, and database stores.

```mermaid
graph TD
    %% External Entities
    User([User])
    Admin([Admin])
    ExternalAPIs([External APIs - Groq/Meteo/OSM])
    
    %% Data Stores
    DB_Users[(DB: Users)]
    DB_Plans[(DB: Plans)]
    DB_Messages[(DB: Messages)]
    DB_Expenses[(DB: Expenses)]
    DB_Logs[(DB: Logs & Reports)]
    Cache_Redis[(Cache: Redis)]

    %% Processes
    P1((1.0 Auth & Key Sync))
    P2((2.0 AI Plan Builder))
    P3((3.0 E2EE Messaging))
    P4((4.0 Expense Splitting))
    P5((5.0 Travel Intel Engine))
    P6((6.0 Trust Shield & Moderation))
    P7((7.0 Admin Simulator))

    %% Flows
    User -->|Auth Token| P1
    P1 -->|Sync User Profile| DB_Users
    P1 -->|Register Public Keys| DB_Users
    
    User -->|Itinerary Parameters| P2
    P2 -->|Query/Prompt| ExternalAPIs
    ExternalAPIs -->|Itinerary Details| P2
    P2 -->|Save Itinerary| DB_Plans
    P2 -->|Read Preferences| DB_Users
    
    User -->|Ciphertext & Nonce| P3
    P3 -->|Broadcast E2EE Payload| User
    P3 -->|Write Chat Log| DB_Messages
    P3 -->|Read Public Keys| DB_Users
    
    User -->|Bill Splitting Details| P4
    P4 -->|Run Graph Netting| P4
    P4 -->|Write Group Expense| DB_Expenses
    P4 -->|Net Balances Output| User
    
    User -->|Location Query| P5
    P5 -->|Check Caches| Cache_Redis
    P5 -->|Query Weather / Geocoding| ExternalAPIs
    P5 -->|Safety Coordinates Fallback| DB_Plans
    P5 -->|Visiting Alerts| User
    
    User -->|Posts & Reviews| P6
    P6 -->|Toxicity Prompts| ExternalAPIs
    P6 -->|Flag Reviews| DB_Logs
    P6 -->|Adjust Visibility| DB_Plans
    P6 -->|Update Trust Score| DB_Users
    
    Admin -->|Inject Events| P7
    P7 -->|Generate Mock Activity| DB_Users
    P7 -->|Broadcast Status Updates| Admin
```

---

## 3. DFD Level 2: Detailed Process Diagrams

### 3.1 Process 3.0: E2EE Messaging Data Flow
Decomposes the cryptographic messaging sequence to show how data is handled client-side and server-side.

```mermaid
graph TD
    Sender([Sender Client])
    Receiver([Receiver Client])
    ServerProcess((3.1 Express Blind Relay))
    DB_Keys[(DB: Users - Public Keys)]
    DB_Msgs[(DB: Messages - Encrypted)]
    IndexedDB[(IndexedDB: Client Sandbox)]

    %% Message Generation
    Sender -->|1. Query Public Key| DB_Keys
    DB_Keys -->|2. Public Key| Sender
    IndexedDB -->|3. Private Key| Sender
    Sender -->|4. Encrypt Payload| Sender
    
    %% Message Transmission
    Sender -->|5. Ciphertext, Nonce, RecipientId| ServerProcess
    ServerProcess -->|6. Save Message| DB_Msgs
    ServerProcess -->|7. Socket.io Relay| Receiver
    
    %% Message Decryption
    Receiver -->|8. Fetch Sender Public Key| DB_Keys
    DB_Keys -->|9. Public Key| Receiver
    IndexedDB -->|10. Private Key| Receiver
    Receiver -->|11. Decrypt Message| Receiver
```

### 3.2 Process 4.0: Expense Splitting & Netting Data Flow
Decomposes the financial calculations used to minimize transactions.

```mermaid
graph TD
    GroupMember([Group Member])
    InputProcess((4.1 Compile Expenses))
    NettingProcess((4.2 Greedy Minimization))
    DB_Exp[(DB: Expenses)]
    OutputProcess((4.3 Generate Anomaly Insights))

    %% Data Input
    GroupMember -->|1. Transaction Records & Share Allocations| InputProcess
    InputProcess -->|2. Write Base Transaction| DB_Exp
    
    %% Algorithmic Optimization
    DB_Exp -->|3. Fetch Group Transactions| NettingProcess
    NettingProcess -->|4. Calculate Net Balances| NettingProcess
    NettingProcess -->|5. Sort Creditors & Debtors| NettingProcess
    NettingProcess -->|6. Greedy Debt Resolution| NettingProcess
    
    %% Output Generation
    NettingProcess -->|7. Simplified Debt Settlements| GroupMember
    DB_Exp -->|8. Analyze Splitting Skewness| OutputProcess
    OutputProcess -->|9. Anomalies Alerts| GroupMember
```

### 3.3 Process 6.0: Trust Score Calculation Data Flow
Decomposes the reputation-scoring mechanism.

```mermaid
graph TD
    ReviewInput([User Review / Comment])
    ModProcess((6.1 Toxicity Check))
    JaccardProcess((6.2 Jaccard Text Match))
    BotProcess((6.3 Bot Behavior Audit))
    AggProcess((6.4 Aggregate Trust Score))
    DB_Users[(DB: Users)]
    DB_Plans[(DB: Plans)]

    %% Inputs
    ReviewInput --> ModProcess
    ReviewInput --> JaccardProcess
    ReviewInput --> BotProcess
    
    %% Moderation Outputs
    ModProcess -->|Toxicity Score| AggProcess
    JaccardProcess -->|Fake Review Score| AggProcess
    BotProcess -->|Activity Index| AggProcess
    
    %% Scoring & Visibility
    AggProcess -->|Calculate Trust Score| AggProcess
    AggProcess -->|Write Updated Score| DB_Users
    DB_Users -->|Adjust Visibility Multipliers| DB_Plans
```
