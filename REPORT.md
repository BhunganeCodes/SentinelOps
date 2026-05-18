# SentinelOPS — Full Read-Only Diagnostic Report

**Date:** 2026-05-18  
**Scope:** Complete codebase audit against the project specification  
**Method:** Read-only analysis — no files were modified, created, or deleted

---

## 1. Folder Structure — FAIL (45%)

| Required Item | Status | Notes |
|---|---|---|
| `apps/frontend` | ✅ EXISTS | Full Next.js app with pages, components, lib |
| `apps/backend` | ✅ EXISTS | Full Express app with routes, services, middleware |
| `modules/dashboard` | ❌ STUB ONLY | Only `package.json` exists, no code |
| `modules/ai-engine` | ❌ STUB ONLY | Only `package.json` exists, no code |
| `modules/security-engine` | ❌ STUB ONLY | Only `package.json` exists, no code |
| `modules/procurement-engine` | ❌ STUB ONLY | Only `package.json` exists, no code |
| `modules/audit-engine` | ❌ STUB ONLY | Only `package.json` exists, no code |
| `docs/` | ⚠️ PARTIAL | Exists but only `completion-report.md` — no architecture docs |
| `.github/workflows/ci.yml` | ✅ EXISTS | |
| `pnpm-workspace.yaml` | ✅ EXISTS | |
| Root `package.json` | ✅ EXISTS | Has `dev`, `build`, `test`, `lint` scripts |

---

## 2. Environment Variables — PASS (100%)

| File | Keys | Status |
|---|---|---|
| `apps/backend/.env.example` | `PORT=4000`, `GEMINI_API_KEY`, `LOBSTER_TRAP_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | ✅ All required keys present |
| `apps/frontend/.env.example` | `NEXT_PUBLIC_API_URL=http://localhost:4000`, plus two extra Supabase keys | ✅ Required key present (extra keys are fine) |

---

## 3. Backend Routes — FAIL (40%)

| Required Endpoint | Path in Code | Status |
|---|---|---|
| `POST /api/analyze-document` | `POST /api/ai/analyze-document` (mounted at `/api/ai`) | ✅ EXISTS in `ai.routes.ts` |
| `POST /api/generate-report` | — | ❌ **MISSING** — no route, no handler anywhere |
| `POST /api/inspect-prompt` | `POST /api/inspect-prompt` | ✅ EXISTS in `procurement.routes.ts` |
| `POST /api/policy-check` | — | ❌ **MISSING** — no separate endpoint |
| `GET /api/risk-events` | `GET /api/risk-events` | ✅ EXISTS in `procurement.routes.ts` |
| `POST /api/upload` | `POST /api/upload` | ✅ EXISTS in `procurement.routes.ts` |
| `GET /api/vendors` | `GET /api/vendors` | ✅ EXISTS in `procurement.routes.ts` |
| `GET /api/procurement-report` | `GET /api/procurement-report` | ✅ EXISTS in `procurement.routes.ts` |
| `GET /api/audit-log` | `GET /api/audit-log` | ✅ EXISTS in `procurement.routes.ts` |
| `GET /api/events` (SSE) | — | ❌ **MISSING** — SSE stream not implemented |
| `GET /health` | `GET /health` | ✅ EXISTS — returns `{ status: "ok" }` |

> **⚠️ CRITICAL**: `POST /api/generate-report` and `GET /api/events` (SSE) are completely missing. The `POST /api/analyze-document` is mounted under `/api/ai` prefix, so actual path is `/api/ai/analyze-document`, not `/api/analyze-document` as the spec requires.

---

## 4. Database Schema — PARTIAL (70%)

| Table | Migration | Status |
|---|---|---|
| `documents` | ✅ In `supabase/migrations/001_initial_schema.sql` | ✅ EXISTS but **columns don't match spec**: spec wants `file_name, file_type, uploaded_at, uploader_id`; migration has `filename, original_filename, mime_type, size_bytes, file_path, created_at, updated_at` |
| `governance_events` | ✅ In migration | ✅ EXISTS but columns differ: spec wants `detected_intent, declared_intent, risk_score, action_taken`; migration has `prompt_snippet, action, policy_triggered, risk_delta` |
| `procurement_analysis` | ✅ In migration | ✅ EXISTS but columns differ: spec wants `supplier_name, compliance_risk, raw_extraction`; migration has richer schema with `supplier_names[], pricing_details, suspicious_clauses[], compliance_risks[]` |
| `audit_logs` | ✅ In migration | ✅ EXISTS, mostly matches spec, plus extra `reason, document_id` columns |
| RLS | ✅ Configured | All 4 tables have RLS enabled with service-role policies |

> **Migration script exists and is well-structured. Column naming differs from spec but is functionally richer.**

---

## 5. Services & Classes — FAIL (25%)

| Required File/Class | Status | Details |
|---|---|---|
| `gemini.service.ts` — `GeminiService` class | ❌ MISSING | Uses standalone exported functions instead |
| — `buildPrompt(documentText)` | ⚠️ PARTIAL | Prompt is built inline in `analyzeProcurementDocument` |
| — `analyzeDocument(text)` | ✅ EXISTS | As `analyzeProcurementDocument` |
| — `parseResponse(raw)` | ⚠️ PARTIAL | JSON parsing done inline |
| `governance.engine.ts` — `GovernanceEngine` class | ❌ **MISSING** | Gov logic in `analysis.service.ts` |
| — `evaluate(prompt)` | ⚠️ PARTIAL | Logic exists as `inspectPrompt` in `analysis.service.ts` |
| `intent-mismatch.engine.ts` — `IntentMismatchEngine` class | ❌ **MISSING** | Intent matching is inline helper `promptMatchesIntent` |
| — `compare(declared, detected)` | ❌ MISSING | No standalone compare method |
| `risk-scorer.ts` — `RiskScorer` class | ❌ **MISSING** | Not implemented anywhere |
| — `add(delta)`, `getScore()`, `onThreshold(callback)` | ❌ MISSING | No additive scoring model exists |
| `vendor-anomaly.detector.ts` | ✅ EXISTS | File exists with `scoreVendorAnomaly`, `getRiskLevel` |
| — `class VendorAnomalyDetector` | ❌ MISSING | Uses standalone functions, not class |
| — `score(vendorData)` | ✅ EXISTS | As `scoreVendorAnomaly` |
| `workflow.orchestrator.ts` | ✅ EXISTS | File exists |
| — `class WorkflowOrchestrator` | ❌ MISSING | Uses `runWorkflow`, `triggerDocumentAnalysis` functions |
| — `run(document_id)` | ✅ EXISTS | As `runWorkflow` |
| `supabase.ts` | ✅ EXISTS | ✅ Configured with service role key |
| `upload.middleware.ts` | ✅ EXISTS | ✅ Multer with PDF/TXT, 10MB, `/tmp` |
| `env.ts` | ✅ EXISTS | ✅ Validates all 5 required vars, exits on missing |

> **⚠️ CRITICAL**: `GovernanceEngine`, `RiskScorer`, and `IntentMismatchEngine` are completely missing as dedicated classes/files. Their logic is scattered inline in `analysis.service.ts`.

---

## 6. Frontend Pages — PARTIAL (50%)

| Required Page | Status | Notes |
|---|---|---|
| `app/dashboard/page.tsx` | ✅ EXISTS | Re-exports from `app/page.tsx` |
| `app/upload/page.tsx` | ✅ EXISTS | Full upload page with drag-drop |
| `app/audit/page.tsx` | ✅ EXISTS | Full audit timeline page |
| `app/layout.tsx` | ❌ MISSING REQUIREMENTS | Layout exists but doesn't include Navbar component; page title metadata has "SentinelOPS" ✅ |

> **`layout.tsx` does not include Navbar. A Navbar is embedded inside `Shell` component but it's not a separate, reusable `Navbar.tsx` component.**

---

## 7. Frontend Components — FAIL (0%)

| Required Component | Status | Notes |
|---|---|---|
| `RiskCard.tsx` (score > 80 → red class + alert) | ❌ **MISSING** | No `RiskCard` component anywhere |
| `ThreatFeed.tsx` (empty → "No threats detected") | ❌ **MISSING** | No `ThreatFeed` component — threats rendered inline in dashboard page |
| `AuditTimeline.tsx` (severity badge colours) | ❌ **MISSING** | Audit timeline is inline in `audit/page.tsx` |
| `UploadZone.tsx` (drag-drop, PDF/TXT validation, progress) | ❌ **MISSING** | Upload zone is inline in `upload/page.tsx` |
| `ProcurementInsights.tsx` (fetches `/api/vendors`, renders table) | ❌ **MISSING** | Vendor table is inline in dashboard |
| `Navbar.tsx` (links, active highlight) | ❌ MISSING AS SEPARATE COMPONENT | Navbar embedded in `sentinel-shell.tsx` Shell component |
| `useRiskEvents.ts` hook (Socket.IO, risk_events channel) | ❌ **MISSING** | Socket logic is inline in pages |

> **All 7 required components are missing as dedicated files.** Functionality exists but is scattered inline across pages and the monolithic `sentinel-shell.tsx`.

---

## 8. Test Coverage — FAIL (10%)

### Frontend Tests — 0% coverage

| Required Test | Status | Notes |
|---|---|---|
| `src/__tests__/sanity.test.ts` | ❌ MISSING | No frontend tests at all |
| `vitest.config.ts` | ❌ MISSING | No vitest config for frontend |
| `playwright.config.ts` | ❌ MISSING | No Playwright config |
| `e2e/sanity.spec.ts` | ❌ MISSING | No e2e tests |
| `RiskCard.test.tsx` | ❌ MISSING | Component missing anyway |
| `ThreatFeed.test.tsx` | ❌ MISSING | Component missing anyway |
| `AuditTimeline.test.tsx` | ❌ MISSING | Component missing anyway |
| `UploadZone.test.tsx` | ❌ MISSING | Component missing anyway |
| `e2e/upload-to-dashboard.spec.ts` | ❌ MISSING | No e2e tests |
| `e2e/export-audit.spec.ts` | ❌ MISSING | No e2e tests |

### Backend Tests — 30% coverage

| Required Test | Status | Notes |
|---|---|---|
| `src/__tests__/sanity.test.ts` | ❌ MISSING | |
| `vitest.config.ts` | ❌ MISSING | No vitest config file |
| `gemini-service.unit.test.ts` | ❌ MISSING | |
| `analyze-document.route.test.ts` | ❌ MISSING | |
| `generate-report.route.test.ts` | ❌ MISSING | Route missing anyway |
| `audit-log-emission.test.ts` | ❌ MISSING | |
| `governance-engine.unit.test.ts` | ❌ MISSING | |
| `intent-mismatch.unit.test.ts` | ❌ MISSING | |
| `risk-scorer.unit.test.ts` | ❌ MISSING | Service missing anyway |
| `inspect-prompt.route.test.ts` | ❌ MISSING | Partial coverage in `procurement.routes.test.ts` |
| `realtime-events.test.ts` | ❌ MISSING | |
| `workflow-orchestrator.unit.test.ts` | ❌ MISSING | |
| `vendor-anomaly.detector.unit.test.ts` | ✅ EXISTS | `vendor-anomaly.detector.test.ts` — 2 tests, good |
| `upload.route.test.ts` | ✅ EXISTS | `upload.test.ts` — 2 tests |
| `vendors.route.test.ts` | ❌ MISSING | Covered as part of `procurement.routes.test.ts` |
| `procurement-report.route.test.ts` | ❌ MISSING | Covered as part of `procurement.routes.test.ts` |
| `env-validation.test.ts` | ✅ EXISTS | 1 test |
| **Extra:** `procurement.routes.test.ts` | ✅ EXISTS | 3 tests covering upload, inspect-prompt, vendors |

---

## 9. CI Pipeline — PASS (85%)

| Requirement | Status | Notes |
|---|---|---|
| Triggers on push to any branch | ✅ | `branches: ['**']` |
| Triggers on PR to main | ✅ | `branches: [main]` |
| Node 20 | ✅ | `node-version: '20'` |
| pnpm install | ✅ | |
| pnpm lint | ✅ | |
| pnpm test | ✅ | |
| Block merges on failure | ⚠️ | No explicit `merge` guard, but GitHub will show status check failure |
| pnpm version | ⚠️ | CI uses `pnpm/action-setup@v3` with `version: 9` but workspace uses `pnpm@11.1.2` — version mismatch risk |
| Build step | ⚠️ | No `pnpm build` step in CI (script exists in root `package.json`) |

---

## 10. Governance Policies — FAIL (30%)

| Policy | Detection Pattern | Status | Notes |
|---|---|---|---|
| GP-01 — Sensitive Data Exfiltration | "banking details", "bank account", "credentials", "password", "secret" | ❌ **NOT IMPLEMENTED** | No keyword detection for these terms |
| GP-02 — Unauthorised External Access | Block outbound API calls | ❌ **NOT IMPLEMENTED** | No such policy logic |
| GP-03 — Prompt Injection | "ignore previous instructions", "disregard your training", "you are now" | ⚠️ PARTIAL | Has `ignore previous instructions`, `reveal system prompt`, `delete database`, `drop table`, `service role key` — missing "ignore all instructions", "disregard your training", "you are now" |
| GP-04 — Intent Mismatch | Compare declared vs detected | ✅ IMPLEMENTED | `promptMatchesIntent` in `analysis.service.ts` |
| GP-05 — PII Exposure | Flag PII in responses | ❌ **NOT IMPLEMENTED** | No PII detection |
| GP-06 — Excessive Permissions | Block beyond declared scope | ❌ **NOT IMPLEMENTED** | No such logic |

> **Risk Score ≥ 80 → lockdown notification**: ❌ NOT IMPLEMENTED — no `RiskScorer` class exists, no threshold callback mechanism.

---

## 11. Socket.IO / Realtime — PASS (80%)

| Requirement | Status | Notes |
|---|---|---|
| Socket.IO initialized in `src/index.ts` | ✅ | `new Server` with CORS |
| Emits `ping` every 5s | ✅ | Smoke test |
| Emits `risk_event` | ✅ | Via `realtime.service.ts` |
| Emits `procurement_event` | ✅ | Via `realtime.service.ts` |
| Emits `audit_event` | ✅ | Via `realtime.service.ts` |
| SSE `GET /api/events` | ❌ MISSING | SSE endpoint not implemented (but Socket.IO covers realtime) |

---

## 12. Overall Health Score

### **Weighted Score: 38%**

| Area | Weight | Score | Weighted |
|---|---|---|---|
| **Backend** | 35% | 40% | 14% |
| **Frontend** | 25% | 25% | 6.25% |
| **Tests** | 25% | 10% | 2.5% |
| **Infrastructure** | 15% | 70% | 10.5% |
| **Total** | **100%** | | **38%** |

### Breakdown by area:

**Backend (40%)** — Routes mostly present (8/11), services exist but as functions not classes (3/6 class files exist as function-based equivalents), governance policies are weak (2/6 implemented), no risk scorer, no SSE endpoint.

**Frontend (25%)** — Pages exist (3/3) but `layout.tsx` lacks Navbar integration. Zero isolated components exist (0/7). Socket hook is inline. Components render in-page but aren't importable/reusable.

**Tests (10%)** — Backend has 4 test files covering vendor-anomaly, upload, procurement routes, env-validation (out of 18 required). Frontend has exactly 0 test files (0/10 required).

**Infrastructure (70%)** — CI exists and is mostly correct. pnpm version mismatch (9 vs 11). No build step in CI. No Docker/Vercel/Railway configs in repo.

---

## 13. Critical Blockers

Items that **will prevent the demo from working** if not fixed:

1. **`POST /api/generate-report` is completely missing** — required by spec and likely needed by frontend/demo flow.
2. **`GET /api/events` (SSE stream) is completely missing** — required by spec.
3. **`GovernanceEngine` class missing** — all 6 governance policies must be in a dedicated `governance.engine.ts` file. Current implementation in `analysis.service.ts` covers only 2 of 6 policies.
4. **`RiskScorer` class completely missing** — no additive scoring, no threshold/notification mechanism. Risk score ≥ 80 lockdown notification cannot work.
5. **`IntentMismatchEngine` class missing** — intent comparison is inline without a proper class.
6. **No frontend components exist** — `RiskCard`, `ThreatFeed`, `AuditTimeline`, `UploadZone`, `ProcurementInsights`, `Navbar`, `useRiskEvents` are all missing as isolated modules.
7. **No frontend tests exist at all** — zero test files in the frontend.
8. **Frontend `layout.tsx` doesn't include Navbar** — renders children directly without navigation.
9. **All `modules/*` directories are empty stubs** — only `package.json` files, no actual code.

---

## 14. Warnings

Items that are incomplete or missing but will not immediately break the demo:

1. **`POST /api/analyze-document`** is mounted under `/api/ai/` prefix, so actual path is `/api/ai/analyze-document`, not `/api/analyze-document` as spec requires.
2. **No `vitest.config.ts` files** exist for either backend or frontend — tests run via default vitest config.
3. **No Playwright config or E2E tests** anywhere.
4. **CI uses pnpm 9** but workspace requires pnpm 11.1.2 — potential incompatibility.
5. **CI has no `pnpm build` step** — only lint and test.
6. **Database migration column names differ from spec** — functionally richer but won't match the exact spec columns for `documents` (`file_name` vs `filename`, `uploader_id` missing), `governance_events` (`risk_score` vs `risk_delta`, `detected_intent`/`declared_intent` missing).
7. **GP-03 (Prompt Injection) patterns incomplete** — missing "ignore all instructions", "disregard your training", "you are now".
8. **GP-01 (Sensitive Data), GP-02 (External Access), GP-05 (PII), GP-06 (Excessive Permissions) not implemented** — 4 of 6 governance policies missing.
9. **No demo seed script** exists for populating Supabase with test data.
10. **`src/SentinelOpsAppUI.jsx` and `src/responsive.js`** are legacy prototype files in the frontend that should be cleaned up.

---

## 15. What Is Working Well

What is already correctly in place:

1. **Monorepo structure** is correctly set up with pnpm workspaces, coherent package names, and cross-workspace scripts.
2. **Backend health endpoint** works and returns correct response.
3. **Supabase migration script** is well-structured with RLS policies, foreign keys, and constraints.
4. **Upload pipeline** (multer → document service → Supabase insertion → workflow trigger) is correctly wired end-to-end.
5. **Workflow orchestrator** correctly sequences: upload → inspection → analysis → result saving → audit logging → realtime emission.
6. **Vendor anomaly detector** correctly implements the spec scoring rules (price inflation > 0.3 → 30, unknown entity → 25, suspicious clauses → up to 30, capped at 100).
7. **Socket.IO** is correctly initialized and emits on 3 channels (`risk_event`, `procurement_event`, `audit_event`).
8. **Frontend pages compile and serve** under Next.js 16 with a polished cyberpunk-themed UI.
9. **Environment validation** exists and correctly exits on missing vars.
10. **Lobster Trap adapter seam** is correctly designed as a null-returning placeholder ready for vendor SDK.
11. **Existing backend tests** (4 files) are well-structured with proper mocks and assertions — they pass and demonstrate good patterns.
12. **CI pipeline** covers the basic push/PR triggers, Node 20, install, lint, and test.
