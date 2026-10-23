# SheGuard AI 🛡️
> *"Others call for help. SheGuard AI makes sure help understands her instantly."*

**Challenge Track:** Society & Well-being | **Google Gemini Hackathon 2026**  
**Team Name:** Civic Spark  
**Institution:** Shri Shankaracharya Institute of Professional Management and Technology (SSIPMT), Raipur/Bhilai  
**Live Application URL:** [http://localhost:3000](http://localhost:3000)  
**Responder Console (Demo):** [http://localhost:3000/responder.html](http://localhost:3000/responder.html)  

---

## 📖 Table of Contents
1. [Overview & Winning Vision](#-overview--winning-vision)
2. [Key Features & Implemented Tasks](#-key-features--implemented-tasks)
3. [System Architecture Diagram](#-system-architecture-diagram)
4. [Gemini Model Usage & AI Stack](#-gemini-model-usage--ai-stack)
5. [Real vs. Simulated Capabilities](#-real-vs-simulated-capabilities)
6. [Privacy, Data Security & Sovereignty](#-privacy-data-security--sovereignty)
7. [Technical Limitations & Browser Realities](#-technical-limitations--browser-realities)
8. [Setup & Running Locally](#-setup--running-locally)
9. [Future Roadmap](#-future-roadmap)

---

## 🌟 Overview & Winning Vision

Crimes against women—including stalking, street harassment, domestic violence, and online extortion—frequently occur in environments where the victim **cannot safely speak, make a phone call, or type a detailed complaint**. Traditional safety apps stop at a raw panic button, leaving the burden of explanation, evidence gathering, legal citation, and recovery entirely on the traumatized victim.

**SheGuard AI** is an AI-powered safety and justice companion that stays with a woman **from the first second of panic to the last page of paperwork**:
- **Immediate Panic & Triage:** Multimodal voice/vision triage in Indian languages (Hindi, English, Hinglish) with immediate step-by-step guidance and dispatch briefs.
- **Silent Stealth Disguise:** Calculator disguised app for victims in domestic abuse or stalking.
- **Emotional Well-being:** Sakhi, an empathetic 24x7 AI companion tracking emotional check-ins, grounding techniques, and de-escalation.
- **Tamper-Evident Justice:** Multi-file evidence vault anchored with client-side SHA-256 hashes and auto-drafted police complaints under the new **Bharatiya Nyaya Sanhita (BNS) 2023**.

---

## 🚀 Key Features & Implemented Tasks

### 1. "Sakhi, your AI companion" (Rebranded & Real Conversational AI)
- Rebranded from "Asha" to **"Sakhi, your AI companion"** to serve as a warm, non-judgmental confidante.
- **Distinct Identity:** Clearly differentiated in UI and directory from the **Sakhi One Stop Centre (Government Assistance Centre)** to avoid any confusion.
- **Multi-Turn Context Awareness:** Sends full conversation history, current mood (🌸 *Safe & Calm*, ⚡ *Anxious / On Edge*, ⚠️ *Scared / Stalked*, 💪 *Empowered*), 1–10 peace-of-mind score, and recent journal notes to Gemini on every turn.
- **Crisis & Self-Harm Safety Intercept:** If acute self-harm, suicidal ideation, or domestic danger is detected, Sakhi immediately de-escalates with compassion and surfaces one-tap verified Indian helplines:
  - **Tele-MANAS (Govt. of India 24x7 Mental Health Helpline):** `14416` / `1800-891-4416`
  - **National Emergency:** `112`
  - **Women in Distress:** `181` / `1091`
- **Disclaimer:** *"Sakhi offers supportive companionship, not medical or professional care."*

### 2. Autocorrect in Sakhi Chat
- Lightweight debounced (~600ms) autocorrect powered by Gemini for Hindi, English, and Hinglish.
- Displays a dismissible **`💡 Did you mean: "..."?`** chip above the input box.
- One tap applies the correction. Never blocks sending and never auto-replaces without explicit user confirmation.

### 3. Two-Layer Voice Note Transcription
- **Layer A (Live Speech Recognition):** Web Speech API with explicit language switcher (Hindi `hi-IN` & English `en-IN`) and continuous auto-restart.
- **Layer B (Gemini Multimodal Audio Fallback):** MediaRecorder captures audio blobs and transmits to `/api/transcribe` where Gemini multimodal audio transcribes Hindi/English speech when live recognition is unsupported or interrupted.
- Plain-language UI states: `Listening...`, `Processing Audio...`, `Captured!`, and `Retry`. All transcripts remain fully editable before submission to emergency triage.

### 4. Emergency Contacts Management
- Complete CRUD management (Add, Edit, Delete, Toggle Primary).
- Strict regex validation for Indian mobile numbers (`+91` format) and international E.164 standards.
- One-tap actions for each contact:
  - **Call:** `tel:<phone>`
  - **SMS:** `sms:<phone>?body=...` (prefilled with incident message and live location link)
  - **WhatsApp:** `https://wa.me/...` (prefilled with Google Maps coordinates link)
  - **Send Test Alert:** One-tap verification button confirming delivery before an emergency occurs.

### 5. Emergency Buzzer & Dual-Tone Siren
- Decoupled deterrent switch: Allows toggling the loud Web Audio dual-tone siren (850Hz–1150Hz) and visual strobe ON or OFF while always broadcasting the distress beacon.
- **Live Location Tracking Link:** Generates public standalone link ([`http://localhost:3000/tracking.html?id=ALERT-XXXXXX`](http://localhost:3000/tracking.html)) that contacts can open from any smartphone without downloading an app.
- **Real-Time Responder Console:** Dedicated dashboard for Mahila Thana / Help Center ([`http://localhost:3000/responder.html`](http://localhost:3000/responder.html)) receiving real-time telemetry with workflow status (`New` -> `Acknowledged` -> `Patrol Dispatched`).
- **Honest Institutional Handoff:** Clearly described as a designed integration path and one-tap handoff for ERSS 112, 1091, and 181.

### 6. Silent Panic SOS (Stealth Mode)
- Access via disguised dark calculator by entering secret PIN (`1234=` or `9999=`).
- Prominent **"TRANSMIT SILENT SOS BEACON"** button.
- Dispatches emergency telemetry with zero audio, zero strobe, and zero loud notifications.
- Subtle confirmation: Neutral small green dot notice that vanishes in 3.5 seconds.
- **Panic Lock:** Immediate return to innocent calculator screen via `ESC` key or button.

### 7. Multi-File Tamper-Evident Evidence Vault
- Drag-and-drop dropzone supporting multiple photos, audio notes, video clips, and documents.
- **Client-Side SHA-256:** Computed in the browser using the Web Crypto API (`crypto.subtle.digest('SHA-256', buffer)`) for every individual file.
- **Combined Incident Manifest Hash:** Generates a root SHA-256 manifest hash combining all staged evidence.
- **Legal Compliance:** Explicitly labeled as **"tamper-evident"** with statutory reference to **Section 63 of the Bharatiya Sakshya Adhiniyam (BSA) 2023** (governing electronic record admissibility in Indian courts).

### 8. BNS 2023 FIR Complaint Generator & Clean Export
- Pre-drafts formal police complaints citing verified sections of the **Bharatiya Nyaya Sanhita (BNS) 2023** and **IT Act 2000**:
  - *BNS Section 78:* Stalking
  - *BNS Section 74:* Assault or criminal force to woman with intent to outrage modesty
  - *BNS Section 79:* Word, gesture or act intended to insult modesty of a woman
  - *BNS Section 351(2):* Criminal Intimidation
  - *IT Act Section 66E / 67:* Electronic privacy violation & obscenity
- **Export Formats:**
  - **Clean Print:** `@media print` stylesheet strips navigation, buttons, and app headers for pure formal legal printouts.
  - **Real PDF Download:** Client-side PDF generation (`SheGuard_Police_Complaint_FIR_BNS2023.pdf`) via `html2pdf.js` with Unicode Hindi support.
  - **Clipboard Copy:** Robust copy with fallback and visible feedback.
- **Disclaimer Banner:** *"AI-assisted draft. Review with the police or a lawyer before filing."*

### 9. Online Trolling & Cyber Harassment Help Flow
- Dedicated incident reporting flow for social media blackmail, cyberstalking, trolling, impersonation, and non-consensual intimate image (NCII) threats.
- Powered by Gemini to categorize threat severity and generate action plans referencing **verified official channels only**:
  - **National Cyber Crime Reporting Portal:** `https://cybercrime.gov.in` | Toll-Free **1930**
  - **StopNCII.org:** Non-profit digital hash creation to prevent non-consensual intimate images from spreading across Meta, TikTok, and web platforms.
  - **National Commission for Women (NCW):** Helpline **7827170170** & `ncw.nic.in`
  - Step-by-step evidence preservation (URL headers, full handles, timestamps).
  - 1-Click transfer to FIR Drafter & emotional debrief with Sakhi.

---

## 📐 System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SHEGUARD AI CLIENT                                     │
│                                                                                        │
│  [ Disguised Calculator ] ────(PIN 1234=)────► [ Stealth Safety Console (Silent SOS) ]  │
│                                                          │                             │
│  [ Emergency Buzzer ] ───────► [ Web Audio Siren ]      │                             │
│          │                              ▲               ▼                             │
│          ▼                              │      [ Live GPS Tracking ]                   │
│   (SOS Broadcast) ───► [ High-Accuracy GPS ]            │                             │
│                                                          ▼                             │
└───────────────────────────────────┬──────────────────────┬─────────────────────────────┘
                                    │                      │
                                HTTP REST / SSE        Public Web Link
                                    │                      │
┌───────────────────────────────────▼──────────────────────▼─────────────────────────────┐
│                            EXPRESS BACKEND (server.js)                                 │
│                                                                                        │
│  ├── /api/buzzer/trigger   ──► Dispatches telemetry to contacts + Responder Console   │
│  ├── /api/track/:id        ──► Serves live coordinates to tracking.html               │
│  ├── /api/responder/*      ──► Streams incidents to responder.html (Mahila Thana)     │
│  ├── /api/companion/*      ──► Multi-turn context & Autocorrect to Gemini             │
│  ├── /api/trolling/analyze ──► Threat classification & verified legal mapping          │
│  ├── /api/vault/multi      ──► Anchors multi-file SHA-256 manifests (BSA 2023)        │
│  └── /complaint            ──► Drafts formal FIR under BNS 2023 Sections 78 & 74       │
└───────────────────────────────────┬────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS & GEMINI AI                               │
│                                                                                        │
│  ├── Google Gemini API (AI Studio / Vertex AI):                                        │
│  │     • gemini-1.5-flash (Multimodal Voice, Vision, Triage, FIR Drafter)              │
│  │     • gemini-1.5-flash (Sakhi Empathetic Conversational AI & Autocorrect)           │
│  ├── National Gateways (Simulated Handoff):                                            │
│  │     • ERSS 112 (National Emergency) · 1091 (NCW) · 181 (Women in Distress)        │
│  │     • Tele-MANAS (14416) Mental Health Support                                      │
│  └── Verified Public Tools: StopNCII.org · CyberCrime.gov.in (1930)                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Gemini Model Usage & AI Stack

| Feature | Model Used | Reason for Model Selection | Input Modalities |
|---|---|---|---|
| **Multimodal Emergency Triage** | `gemini-1.5-flash` | High-speed multimodal triage for audio, scene photos, and multilingual speech under crisis conditions. | Audio, Image, Text |
| **Voice Audio Transcription Fallback** | `gemini-1.5-flash` | Native multimodal audio processing accurately transcribes Hindi, English, and regional Indian dialects. | Audio (WebM/MP4) |
| **Sakhi Conversational AI** | `gemini-1.5-flash` | Low latency, high emotional empathy, robust Hindi/Hinglish comprehension, and contextual safety boundaries. | Text History + Mood Context |
| **Sakhi Chat Autocorrect** | `gemini-1.5-flash` | Rapid inference (<600ms) for real-time spelling and grammar normalization in Hinglish/Hindi. | Text snippet |
| **Online Harassment Classifier** | `gemini-1.5-flash` | Accurately extracts legal elements from screenshot evidence and maps to Indian IT Act & BNS sections. | Image + Text |
| **BNS 2023 FIR Complaint Drafter** | `gemini-1.5-flash` | Structured legal synthesis integrating facts, dates, coordinates, and SHA-256 manifest fingerprints. | Text Evidence Manifest |

---

## ⚖️ Real vs. Simulated Capabilities

Transparency is essential for safety technologies. Below is an honest accounting of what is natively functional versus what represents a designed integration handoff:

| Capability | Real Implementation | Simulated / Prototype Handoff |
|---|---|---|
| **Live GPS Coordinate Acquisition** | ✅ **100% Real:** Captured via browser HTML5 Geolocation API with high accuracy enabled. | — |
| **Web Audio Emergency Siren** | ✅ **100% Real:** Native Web Audio API dual-tone synthesized oscillator (850Hz–1150Hz). | — |
| **Public Live Tracking Page (`/tracking.html`)** | ✅ **100% Real:** Functional standalone tracking link that any contact can open on mobile. | — |
| **Police Responder Console (`/responder.html`)** | ✅ **100% Real:** Functional real-time dashboard tracking incident telemetry and patrol status. | Labeled as a **Demo Responder System** representing future police command integration. |
| **Direct Institutional Dispatch (112, 1091, 181)** | ✅ **100% Real One-Tap Handoff:** Pre-populates `tel:112` and SMS with exact coordinates. | Direct programmatic injection into state police CAD is simulated (requires formal state MoU). |
| **SMS / WhatsApp Alert Transmission** | ✅ **100% Real Handoff:** One-tap `sms:` and `wa.me` links pre-filled with live Google Maps URLs. | Twilio gateway sends real SMS when API keys are configured in `.env`; otherwise simulated gracefully. |
| **Client-Side SHA-256 Hashing** | ✅ **100% Real:** Computed on raw file byte buffers via browser `crypto.subtle.digest`. | — |
| **FIR PDF & Clean Print Export** | ✅ **100% Real:** Real `.pdf` file downloaded via `html2pdf.js`; `@media print` CSS strips UI chrome. | — |

---

## 🔒 Privacy, Data Security & Sovereignty

Women's safety data is extraordinarily sensitive. SheGuard AI incorporates privacy-by-design:
1. **Zero Client-Side API Key Exposure:** The Google Gemini API key is stored strictly on the backend in environment variables and is never transmitted to the browser.
2. **Credential Hashing:** User passwords and stealth PINs are hashed using cryptographic **SHA-256 with a unique salt** before being stored in `data/db.json`.
3. **Data Storage Location:** User profiles, contacts, and evidence are stored locally in the application's persistent database (`data/db.json`) and browser `localStorage`.
4. **Who Can See Your Data:** Only the user on their device, and emergency contacts who receive a shared live tracking link during an active alert.
5. **One-Tap Data Erasure:** A permanent **"Erase All My Data"** control is accessible in the Privacy Modal. Clicking it wipes `localStorage`, deletes all files in `uploads/`, and purges all personal alerts, evidence, and logs from `data/db.json`.

---

## ⚠️ Technical Limitations & Browser Realities

1. **Background Geolocation on Locked Screens:** Web browsers restrict background GPS access when the screen is locked or the tab is backgrounded. While SheGuard is configured as a foreground-reliable PWA, continuous tracking works best with the screen active. For complete background reliability, an Android native background service is on the future roadmap.
2. **Web Speech API Availability:** Live speech recognition requires browser speech engine support (Chromium/Edge). When unsupported or when microphone permission is denied, SheGuard automatically engages its **MediaRecorder + Gemini Multimodal Audio transcription fallback**.
3. **Court Admissibility of Electronic Records:** Generating a SHA-256 hash proves an electronic record has remained unaltered. However, in Indian courts of law, digital evidence must be formally tendered with a certificate under **Section 63 of the Bharatiya Sakshya Adhiniyam (BSA) 2023**.

---

## 💻 Setup & Running Locally

### Prerequisites
- Node.js (v18 or higher recommended; tested on v24.19.0)
- NPM (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/bhojwaniroshni73-cell/Civic-Spark-GGH.git
cd Civic-Spark-GGH

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and insert your Gemini API Key
echo GEMINI_API_KEY=your_key_here > .env

# Start the server
node server.js
```

The application will start at:
- **Main Web Application:** `http://localhost:3000`
- **Responder Console:** `http://localhost:3000/responder.html`
- **Live Tracking Demo:** `http://localhost:3000/tracking.html?id=ALERT-DEMO`

---

## 🔮 Future Roadmap
1. **Official ERSS 112 API Integration:** Partnering with state emergency management agencies to ingest SheGuard dispatch briefs directly into CAD police consoles.
2. **Native Android PWA Wrapper (TWA):** Packaging into a lightweight APK with background geolocation service workers.
3. **Campus ICC Integration:** Direct incident reporting workflows for college Internal Complaints Committees (ICC) across Indian universities.
4. **Regional Dialect Expansion:** Broadening voice models to support Chhattisgarhi, Bhojpuri, Odia, and Tamil speech synthesis.

---

*Developed with ❤️ and civic responsibility by Team Civic Spark (Archita Ravlani, Sakshi Dembani, Roshni Bhojwani) for the Google Gemini Hackathon 2026.*
