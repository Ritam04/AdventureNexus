# Software Requirement Specification (SRS): **AdventureNexus**
### System Requirements, Interface Definitions, and Architectural Constraints

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **AdventureNexus** travel planning and social web application. It defines the functional requirements, non-functional constraints, system architectures, and interface definitions required to construct and validate the system.

### 1.2 Scope
AdventureNexus is an AI-powered travel planning and secure collaboration web application. The scope of the system includes:
1. Automated day-by-day itinerary planning powered by the Groq LLM API.
2. End-to-End Encrypted (E2EE) messaging (X25519) with browser key sandboxing in IndexedDB.
3. Graph netting expense splitting.
4. Live weather, crowd, and risk analysis using Open-Meteo, Nominatim, and internal database indexes.
5. Trust score modulation and automated content moderation.
6. Admin panel with real-time telemetry and traffic simulation.

### 1.3 Definitions, Acronyms, and Abbreviations
* **E2EE**: End-to-End Encryption
* **ECDH**: Elliptic-curve Diffie-Hellman (specifically X25519)
* **XSS**: Cross-Site Scripting
* **OSM**: OpenStreetMap
* **LLM**: Large Language Model
* **JWT**: JSON Web Token
* **MAC**: Message Authentication Code (specifically Poly1305)

---

## 2. Overall Description

### 2.1 Product Perspective
AdventureNexus is composed of three primary operational components:

```
[ React + Vite Client ] <===( HTTPS / WSS )===> [ Node.js Express Gateway ]
                                                       || (HTTP)
                                             [ FastAPI ML Microservice ]
```

* **React + Vite Client**: Handles client-side rendering, user interaction, client-side cryptographic encryption/decryption, and local key storage inside IndexedDB.
* **Express Gateway**: Manages API routes, Firebase user synchronization, Redis cache states, Socket.io event connections, and database writes.
* **FastAPI ML Microservice**: Evaluates user preference profiles using TF-IDF vectorizers and cosine similarity matching models.

### 2.2 Operating Environment
* **Client**: Standard web browsers (Chrome, Firefox, Safari, Edge) supporting HTML5, WebSockets, and IndexedDB.
* **Backend**: Node.js runtime (v18+) and Python environment (v3.9+) deployed on standard cloud infrastructure (Render, Railway, AWS, etc.).
* **Database**: MongoDB Atlas database and Redis cache cluster.

### 2.3 Design and Implementation Constraints
* **Cryptographic Keys**: Private keys must never leave the client's device. No plaintext messages or private keys are allowed on the server.
* **External API Dependency**: The system must handle downtime or rate-limiting on Open-Meteo, Nominatim, and Groq without database lockups.

---

## 3. Functional Requirements (FR)

### FR-1: AI Travel Planning & Itinerary Generation
* **FR-1.1**: The system shall generate day-by-day travel itineraries via the Groq LLM API based on user parameters (destination, travelers, budget, travel style, duration).
* **FR-1.2**: Itineraries shall include coordinate mapping (latitude/longitude) and hotel options.
* **FR-1.3**: The frontend shall render travel routes using OpenStreetMap (OSM) map layers.

### FR-2: End-to-End Encrypted Communication (E2EE Chat)
* **FR-2.1**: The system shall generate a secure X25519 key pair on register/login.
* **FR-2.2**: The private key shall be stored locally inside the browser's IndexedDB (`NexusE2EE` DB, `keys` store) and must not be written to `localStorage` or transmitted to the backend server.
* **FR-2.3**: Direct and group messages shall be encrypted client-side using TweetNaCl (`nacl.box`).
* **FR-2.4**: Group messaging shall utilize per-recipient fan-out encryption, uploading a distinct ciphertext payload for each group member.

### FR-3: Expense Ledger & Debt Netting
* **FR-3.1**: The system shall allow users to create expense groups, register expenses, and split them equally, unequally, or by percentages.
* **FR-3.2**: The backend shall run a greedy transaction minimization algorithm to calculate settlements.
* **FR-3.3**: The system shall analyze expense items to generate alerts for high debtors (debts $> ₹150$) and flag spending imbalances (one user paying $>60\%$ of total costs).

### FR-4: Live Travel Intelligence
* **FR-4.1**: The system shall retrieve weather updates (temp, rain, wind, UV index) via the Open-Meteo API.
* **FR-4.2**: The system shall calculate localized crowd density levels ('low', 'medium', 'high') using internal search, booking, and post records.
* **FR-4.3**: The system shall evaluate risk levels ('safe', 'caution', 'danger') using weather inputs, safety alert databases, and crowd indices.
* **FR-4.4**: The system shall recommend optimal visiting windows based on temperature, rain, and crowd peaks.

### FR-5: Social Trust Shield & Toxicity Engine
* **FR-5.1**: The system shall asynchronously moderate posts, reviews, and comments for toxicity and spam using the Groq LLM.
* **FR-5.2**: The system shall check for fake reviews by calculating Jaccard similarity index across reviews; reviews with similarity $> 0.6$ shall be flagged.
* **FR-5.3**: The system shall dynamically calculate a User Trust Score (0-100) based on toxicity logs, spam flags, report counts, and duplicate review indices.
* **FR-5.4**: The trust score shall modulate recommendations: plans from users with trust score $< 30$ are hidden, while plans from users with trust score $> 80$ receive a $1.2\times$ score boost.

### FR-6: Admin Observability & Traffic Simulator
* **FR-6.1**: The system shall provide an admin dashboard to monitor API latency, CPU load, error logs, and active WebSocket connections.
* **FR-6.2**: The system shall feature a traffic simulator that generates mock registrations, plan creations, likes, comments, and reviews to test load capabilities.

---

## 4. External Interface Requirements

### 4.1 User Interfaces
* A responsive, single-page web interface (built with React 18 and Tailwind v4) featuring dashboard spaces, E2EE chat portals, expense splitting views, mapping widgets, and admin controls.

### 4.2 Software Interfaces
* **Firebase SDK**: Handles client session initialization and token generation.
* **Firebase Admin SDK**: Configured on the Express backend to verify client JWT tokens.
* **Groq API**: Receives prompt contexts and outputs structured JSON responses for itineraries and moderation checks.
* **Open-Meteo API**: Rest API query points resolving weather forecasts.
* **Nominatim API**: Geocoding query endpoint translating destinations into latitudes and longitudes.

### 4.3 Communication Interfaces
* **HTTP/HTTPS**: Managed for REST API transactions (JSON payloads).
* **WebSockets (WSS)**: Managed via Socket.io for real-time E2EE message routing and live simulation notifications.

---

## 5. Non-Functional Requirements (NFR)

### 5.1 Security Requirements
* All direct and group messages must be encrypted client-side; plain text must never be stored on backend servers.
* User private keys must be isolated in IndexedDB to prevent XSS leaks.
* The API gateway must run global input sanitizers to prevent MongoDB query injection.

### 5.2 Performance Requirements
* The ML recommender service must return user recommendations in less than $100\text{ms}$.
* The system must cache travel intelligence queries in Redis for 10 minutes (600s) to minimize external API latency.

### 5.3 Reliability and Availability
* **Fail-Safe Design**: If Open-Meteo or Nominatim is down, the system must use internal preset data or deterministic coordinate hashing to maintain uptime.
* If the Redis server goes offline, the Express backend must fall back to direct database reads without crashing.
