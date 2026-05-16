# **SentinelOPS**

**The Trust Layer for Enterprise AI Agents**

**SentinelOPS** is an autonomous AI governance and procurement intelligence platform designed to monitor, secure, and audit AI agents operating within high-stakes enterprise workflows. By acting as a **"Control Tower,"** the platform transforms AI agents from black-box tools into secure, trustworthy operational systems through real-time observability and policy enforcement.

---

**1. Executive Summary**
Modern organizations face a "black box" crisis when deploying AI agents for contract reviews and tender evaluations. SentinelOPS provides the necessary **governance layer** to ensure these agents remain safe and compliant. The platform focuses on five critical pillars:
*   **AI-powered procurement intelligence** (via Gemini).
*   **Runtime AI agent monitoring**.
*   **Prompt injection detection** (via Lobster Trap).
*   **Governance and policy enforcement**.
*   **Explainable AI decisions** with full, immutable audit trails.

**2. The Problem**
AI agents currently suffer from five critical governance gaps that prevent safe enterprise adoption:
1.  **Lack of Visibility:** No insight into prompt processing or agent actions.
2.  **Prompt Injection:** Vulnerability to malicious instruction overrides or data exfiltration.
3.  **No Governance Layer:** Missing runtime monitoring and access control.
4.  **Procurement Risk:** High sensitivity to fraud, inflated pricing, and suspicious vendors.
5.  **Lack of Explainability:** Need for confidence scoring and compliance-ready audit logs.

**3. The Solution**
SentinelOPS governs AI workflows through five integrated modules:
*   **Dashboard Module:** Real-time visualization of agent activity, risk cards, and threat feeds.
*   **AI Intelligence Engine:** Gemini-powered document analysis and compliance risk identification.
*   **Governance Engine:** Prompt inspection and injection detection using **Veea Lobster Trap**.
*   **Procurement Workflow Engine:** Orchestrates upload pipelines and vendor anomaly detection.
*   **Audit & Event Engine:** Centralized event storage and real-time governance history.

---

**4. Technical Stack**
*   **Frontend:** Next.js + TypeScript with Tailwind CSS & shadcn/ui.
*   **Backend:** Node.js + Express.js API Gateway.
*   **AI Layer:** **Gemini Pro** (reasoning) & **Gemini Flash** (low-latency monitoring).
*   **Security:** **Veea Lobster Trap** for deep prompt inspection (DPI).
*   **Database:** Supabase PostgreSQL with Row-Level Security (RLS).
*   **Real-time:** Socket.IO / Supabase Realtime for live dashboard updates.

---

**5. Local Setup & Installation**

#### **Prerequisites**
*   Node.js v20.x.x
*   pnpm package manager
*   Access to Gemini API and Lobster Trap credentials

**Installation Steps**
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/[org]/sentinelops.git
    cd sentinelops
    ```
2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
3.  **Configure Environment Variables:**
    Create `.env` files in `apps/backend/` and `apps/frontend/` using the provided `.env.example` templates.
    Required keys include: `GEMINI_API_KEY`, `LOBSTER_TRAP_KEY`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`.
4.  **Start Development Servers:**
    *   **Backend:** `cd apps/backend && pnpm dev` (Port 4000)
    *   **Frontend:** `cd apps/frontend && pnpm dev` (Port 3000)

---

**6. Project Roadmap**
*   **Phase 0:** Foundation & CI/CD Infrastructure.
*   **Phase 1:** AI Intelligence Engine (Gemini integration).
*   **Phase 2:** Governance & Security Engine (Lobster Trap integration).
*   **Phase 3:** Procurement Workflow Engine (Orchestration & Anomalies).
*   **Phase 4:** Dashboard & Real-time Visualization.
*   **Phase 5:** Polish, Demo Seeding, and Final Audit.

---

**7. Testing Strategy**
SentinelOPS follows a strict **Test-Driven Development (TDD)** approach. No feature is merged without corresponding tests passing in the CI pipeline.
*   **Unit Tests:** Vitest for core logic and components.
*   **Integration Tests:** Supertest for API contracts.
*   **E2E Tests:** Playwright for full user journeys (upload to live update).

