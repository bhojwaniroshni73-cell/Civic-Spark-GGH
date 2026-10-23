# SheGuard AI - Engineering Implementation Plan

**Objective:** Upgrade SheGuard AI into a robust, accessible, privacy-respecting women's safety and justice companion with verified multimodal Gemini integration, emergency dispatch channels, and legal compliance.

---

## 1. Architectural Overview & Component Structure

```
sheguard-ai/
├── server.js               <-- Express Backend + Gemini API Integration + Live Telemetry SSE/Poll
├── data/
│   └── db.json             <-- Persistent local storage (Hashed Credentials, Alerts, Contacts, Evidence, Logs)
├── public/
│   ├── index.html          <-- Accessible Single-Page Application (All Screens & Modals)
│   ├── app.js              <-- Client Architecture, State, Web Audio, Web Speech, Web Crypto SHA-256
│   ├── style.css           <-- Mobile-first High-Contrast Styling + Clean @media print CSS
│   ├── tracking.html       <-- Standalone Public Live Tracking Page for Emergency Contacts
│   └── responder.html      <-- Real-time Police / Women's Help Centre Responder Console
├── AUDIT.md                <-- Baseline audit report
├── PLAN.md                 <-- Implementation plan (this document)
├── TEST_REPORT.md          <-- Verification evidence & testing documentation
├── DEMO_SCRIPT.md          <-- 2-Minute Hackathon Demo Script
└── README.md               <-- Complete system documentation
```

---

## 2. Detailed Task Breakdown

### Task 1: Companion Rebrand & Real Conversational AI ("Sakhi")
- **Naming & Distinct Identity:**
  - Rebrand in-app companion from "Asha" to **"Sakhi, your AI companion"** across all UI, prompts, comments, and README.
  - Distinguish explicitly from **"Sakhi One Stop Centre (Government Assistance Centre)"** in the help directory.
- **Backend (`/api/companion/chat`):**
  - Accept `message`, `history` (full conversation transcript), `currentMood`, `peaceScore`, and `recentJournal`.
  - Craft system prompt for Sakhi: warm, empathetic, non-judgmental, supports Hindi/English/Hinglish, active listening, 5-4-3-2-1 grounding, breathing techniques, safety reassurance. Strictly state she is an AI companion, never claiming to be a doctor or therapist.
  - **Crisis / Safety Intercept:** If self-harm, suicidal ideation, or immediate violence is detected, prioritize warm care and surface verified Indian helplines:
    - **Emergency:** 112 (National Emergency)
    - **Mental Health:** Tele-MANAS `14416` (Toll-free 24x7 National Tele-Mental Health Programme by MoHFW)
    - **Women in Distress:** 181 / 1091
- **Frontend:**
  - Rename section to **"Emotional Check-in & Trends"**.
  - Retain mood buttons (🌸 Safe & Calm, ⚡ Anxious / On Edge, ⚠️ Scared / Stalked, 💪 Empowered), 1–10 slider, and journal log.
  - Prominent disclaimer: *"Sakhi offers supportive companionship, not medical or professional care."*

### Task 2: Autocorrect in Sakhi Chat
- **Backend (`/api/companion/autocorrect`):**
  - Lightweight, rapid Gemini endpoint (`gemini-1.5-flash`) that accepts `{ text, language }` and returns `{ suggestion: string | null }` correcting spelling and grammar for Hindi, English, and Hinglish.
  - Intelligent fallback dictionary for instant response if offline.
- **Frontend:**
  - 600ms debounce on input keystrokes.
  - Render a clickable chip above the input: `💡 Did you mean: "<suggested_text>"?`
  - Tapping replaces the input field; dismissible button keeps original text; sending is never blocked.

### Task 3: Dual-Layer Voice Note Transcription
- **Layer A (Live Client Transcription):**
  - Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with explicit toggle for Hindi (`hi-IN`) and English (`en-IN`).
  - Auto-restart handler on premature `onend` while recording is active.
- **Layer B (Gemini Multimodal Audio Fallback):**
  - Record audio in browser via `MediaRecorder` (audio/webm / audio/mp4).
  - Backend endpoint `/api/transcribe` accepts multipart audio and passes to Gemini multimodal speech transcription.
- **UI States:**
  - Visual badges: `[Listening...]`, `[Processing Audio...]`, `[Transcription Error: <reason>]`, and `[Retry]` button.
  - Fully editable transcript field before submitting to triage.

### Task 4: Full Contacts Management System
- **Backend CRUD (`/api/contacts`):**
  - `GET /api/contacts`: returns contact list.
  - `POST /api/contacts`: add contact with validation.
  - `PUT /api/contacts/:id`: edit contact or toggle primary.
  - `DELETE /api/contacts/:id`: delete contact.
  - Seed demo contacts: Mom (+91 98765 00001 [Primary]), Sakshi (+91 98765 00002), Archita (+91 98765 00003), Campus Security (+91 94250 99881).
- **Phone Validation:**
  - Regex validation for Indian mobile numbers (`^(?:\+91[\-\s]?)?[6-9]\d{9}$`) and E.164 international standard.
- **Contact Actions:**
  - Call (`tel:<phone>`), SMS (`sms:<phone>?body=...`), WhatsApp (`https://wa.me/<phone>?text=...` with Google Maps link).
  - One-tap **"Send Test Alert"** button per contact with simulation log.

### Task 5: Emergency Buzzer & Helper Notification Pipeline
- **Decoupled Siren Deterrent:**
  - Toggle switch for audible siren (Web Audio dual-tone) & visual strobe overlay, allowing loud deterrent OR silent alert.
- **Immediate Broadcast on Trigger:**
  - Acquire high-accuracy GPS (`navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`, fallback to default coordinates with clear notice if denied).
  - Create incident session in `db.json` with unique `alertId`.
  - Transmit to emergency contacts via Twilio/WhatsApp/Telegram backend config (with robust simulation fallback).
- **Live Location Tracking Link (`/tracking.html?id=<alertId>`):**
  - Publicly accessible link generated for contacts requiring no app installation.
  - Endpoint `/api/track/:alertId` and `/api/track/update` streaming live coordinates every 10–15 seconds.
  - User-facing "Stop Sharing Live Location" button.
- **Responder Console (`/responder.html`):**
  - Realistic dispatch dashboard for Women's Help Centre / Police PCR.
  - Real-time polling / Event stream displaying alert cards, victim profile, map coordinates, and status workflow (`New` -> `Acknowledged` -> `Patrol Dispatched`).
- **Institutional Handoff:**
  - Clearly state: *"One-tap handoff plus designed integration path for ERSS 112, 1091, 181"* (no false claims of automatic police API integration).
  - Display live delivery status breakdown list.

### Task 6: Stealth Console & Silent Panic SOS
- **Accessible Stealth Dashboard:**
  - Unlocked inside the Calculator screen via secret PIN (`1234=` or `9999=`).
  - Prominent but discreet button: **"TRANSMIT SILENT SOS BEACON"**.
  - Dispatches full alert pipeline (Task 5) with zero audio, zero screen flash, and zero loud notifications.
  - Subtle feedback: a tiny neutral confirmation (e.g., small green dot or calculator history entry `0.00` that fades in 3 seconds).
  - Instant **Panic Lock** via `ESC` key or button returning to calculator state.
  - PWA manifest configuration and honest documentation of browser background limitations.

### Task 7: Multiple-File Evidence Vault & Tamper-Evident SHA-256
- **Multi-File Selection & Drag-and-Drop:**
  - `<input type="file" multiple ...>` + drag-and-drop dropzone supporting photos, audio, video, and documents.
  - Per-file upload progress and preview cards.
- **Client-Side SHA-256 via Web Crypto:**
  - Calculate `crypto.subtle.digest('SHA-256', buffer)` directly in browser for each individual file.
  - Record: file name, file size, MIME type, capture timestamp, and cryptographic hash.
  - Generate a **Combined Incident Manifest** with its own composite SHA-256 root hash.
- **Legal Compliance Notice:**
  - Rename all occurrences of "tamper-proof" to **"tamper-evident"**.
  - Prominent legal notice: *"A cryptographic hash verifies that a file has not been altered since hashing. Admissibility of electronic records in Indian Courts requires an electronic certificate under Section 63 of the Bharatiya Sakshya Adhiniyam (BSA) 2023."*

### Task 8: FIR Draft Export & Legal Citation Verification
- **Verified Legal Provisions (Bharatiya Nyaya Sanhita 2023 & IT Act):**
  - **BNS Section 78**: Stalking (repeatedly monitoring, following, or contacting a woman).
  - **BNS Section 74**: Assault or use of criminal force to woman with intent to outrage modesty.
  - **BNS Section 79**: Word, gesture or act intended to insult the modesty of a woman.
  - **BNS Section 351(2)**: Criminal Intimidation.
  - **IT Act Section 66E**: Violation of bodily privacy.
  - **IT Act Section 67 & 67A**: Publishing or transmitting sexually explicit/obscene electronic material.
- **Export Capabilities:**
  - Clean `@media print` CSS hiding navigation, buttons, and app chrome.
  - Real PDF download (`SheGuard_Police_Complaint_FIR.pdf`) with Unicode/Hindi support.
  - Robust Clipboard Copy with fallback and visual toast feedback.
  - Embed the SHA-256 evidence manifest hashes directly in the legal prayer.
  - Mandatory disclaimer banner: *"AI-assisted draft. Review with the police or a lawyer before filing."*

### Task 9: Online Trolling & Cyber Harassment Help Flow
- **Dedicated Screen & Gemini Classifier:**
  - Screen for reporting online harassment, trolling, doxxing, impersonation, blackmail/sextortion, and non-consensual intimate image (NCII) sharing.
  - Accepts text descriptions, voice notes, and screenshot uploads.
  - Gemini analysis categorizes incident severity and produces an actionable, verified response plan.
- **Verified Institutional Resources Only:**
  - **National Cyber Crime Reporting Portal**: `https://cybercrime.gov.in` | Toll-Free **1930**
  - **StopNCII.org**: Global platform for preventing non-consensual intimate image sharing via digital hashes.
  - **National Commission for Women (NCW)**: `ncw.nic.in` | 24x7 Helpline **7827170170**
  - **Emergency / Police**: **112** & **181**
  - Platform report & safety guides (Instagram, X, WhatsApp, Facebook, Telegram).
  - Immediate digital evidence protocol (preserve URLs, full headers, handles, and timestamps before blocking).
  - 1-Click "Transfer to FIR Drafter" button and warm link to Sakhi for emotional debrief.

### Task 10: Security, Privacy & Cross-Cutting Polish
- **Security & Password Hashing:**
  - Passwords and stealth PINs hashed with SHA-256 + salt before storing in `db.json`.
  - Mark demo accounts (`Roshni Bhojwani` / `password123` / PIN `1234`) clearly as demo-only.
- **Privacy & Data Sovereignity:**
  - Add **"Privacy & Data Settings"** modal with 1-click **"Erase All My Data"** (wipes `localStorage` and calls backend `/api/data/erase`).
  - README Privacy section documenting data flows and storage policies.
- **UI/UX Polish:**
  - Mobile-first, high-contrast, accessible touch targets (≥48px), clear Hindi/English bilingual labels.

---

## 3. Verification & Testing Strategy
- Automated unit and integration tests via Node.js test script.
- Headless browser verification using Puppeteer / Node screenshot generation for all screens.
- Production of `TEST_REPORT.md` with verifiable output.
- Finalization of `DEMO_SCRIPT.md` tailored for a high-impact 2-minute hackathon pitch.
