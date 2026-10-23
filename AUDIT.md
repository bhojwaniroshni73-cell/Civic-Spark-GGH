# SheGuard AI - System Audit Report

**Date & Time:** October 23, 2026 | 09:15 IST  
**Auditor:** Team Civic Spark / Antigravity Engineering  
**Target:** SheGuard AI Full-Stack Web Application  

---

## 1. Executive Summary
An initial architectural and functional audit was performed on the existing codebase (`server.js`, `public/index.html`, `public/app.js`, `data/db.json`). While the foundation (Express backend, prototype UI screens, and emergency dispatch structure) is established, multiple critical features are either broken, simulated as static text, or missing entirely.

Below is the structured audit matrix detailing each feature's status, symptoms, and root cause.

---

## 2. Feature Audit Matrix

| Feature / Task | Current Status | Symptoms & Observed Behavior | Root Cause |
|---|:---:|---|---|
| **1. Companion Rebrand & Conversational AI** | ⚠️ Partial / Shallow | Labeled as "Asha"; only responds with 3–4 hardcoded `if/else` keyword checks; fails to retain conversation history; does not incorporate daily mood/journal context into prompt. | No multi-turn chat history state passed to backend; prompt hardcoded without user mood/score context; missing emergency/mental health safety triggers (Tele-MANAS 14416). |
| **2. Autocorrect in Companion Chat** | ❌ Missing | No spelling or grammar suggestions appear while typing in Hindi, English, or Hinglish. | No debounced typing listener, no autocorrect API endpoint, and no UI chip for "Did you mean: ...". |
| **3. Voice Note Transcription** | 🔴 Broken | Speech-to-text fails frequently or stops prematurely; no audio transcription fallback via Gemini multimodal audio. | Web Speech API instance lacks continuous error recovery; no language toggle (`hi-IN` / `en-IN`); MediaRecorder fallback records raw blob but never sends to Gemini for audio transcription. |
| **4. Emergency Contacts Management** | ❌ Missing UI | Contacts are hardcoded in `db.json`; user cannot add, edit, delete, or mark contacts as primary; no validation for Indian (+91) phone numbers. | No CRUD API endpoints or UI management panel for trusted contacts; missing per-contact test alert trigger. |
| **5. Emergency Buzzer Alerting & Dispatch** | ⚠️ Limited Deterrent Only | Buzzer triggers local Web Audio siren and static card, but does not generate an accessible live tracking link or feed into a Responder Console. | No live GPS streaming endpoint (`/track/:id`); no Responder Console dashboard (WebSocket / SSE / polling); siren deterrent cannot be toggled off independently from alert broadcast. |
| **6. Silent Panic SOS** | ⚠️ Hidden / Incomplete | Secret calculator PIN (`1234=`) opens general home screen rather than a discreet Stealth Console; no discreet confirmation; no panic lock escape key. | UI lacks dedicated discreet stealth container; alert pipeline lacks silent mode flags; no foreground PWA consideration. |
| **7. Evidence Vault (Multi-file)** | 🔴 Broken / Single-file | File input only accepts single attachment; hashes are computed server-side on concatenated strings; no client-side Web Crypto SHA-256 per file; uses inaccurate term "tamper-proof". | Missing `multiple` attribute and drag-and-drop zone; no browser Web Crypto `crypto.subtle.digest`; lacks combined incident manifest hash and BSA 2023 legal certificate notice. |
| **8. FIR Draft Export** | ⚠️ Flawed | Print opens raw `<pre>` tag with unstyled layout; no real PDF download; clipboard copy lacks fallback; BNS sections unverified. | Missing print CSS stylesheet (`@media print`); missing client-side PDF generation library; missing disclaimer banner ("AI-assisted draft. Review with police/lawyer"). |
| **9. Online Trolling & Harassment Flow** | ❌ Missing | No dedicated interface or reasoning engine for cyberstalking, trolling, blackmail, or non-consensual intimate image (NCII) threats. | Feature not implemented; missing mapping to National Cyber Crime Portal (1930 / cybercrime.gov.in), StopNCII.org, and IT Act sections. |
| **10. Privacy & Data Security** | ⚠️ Vulnerable | User passwords and stealth PIN are stored in plaintext in `db.json`; no one-tap "Erase all my data" control. | Plaintext credentials stored in JSON; missing cryptographic hashing (SHA-256); missing complete data erasure endpoint. |

---

## 3. Remediation Strategy
All 10 items will be systematically resolved through modular backend API extensions and an accessible, responsive, mobile-first frontend overhaul. Full details are documented in `PLAN.md`.
