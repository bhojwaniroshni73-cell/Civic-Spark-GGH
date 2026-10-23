# SheGuard AI 🛡️
> *"Others call for help. SheGuard AI understands her instantly."*

**Team:** Civic Spark  
**College:** Shri Shankaracharya Institute of Professional Management and Technology (SSIPMT)  
**Track:** Society & Well-being | Google Gemini Hackathon 2026  

---

## 🌟 Overview & Capabilities

SheGuard AI is an intelligent safety and justice companion that stays with a woman from the first second of panic to the last page of paperwork:

1. **Authentication & Profile:**
   - Secure login with Name & Password.
   - Seed Profile: `Roshni Bhojwani` / `password123` / Stealth PIN `9999`.
   - Emergency contacts linked (Mom, Sakshi, Archita, Campus Security).

2. **Emergency Buzzer & High-Decibel Siren:**
   - Real Web Audio API high-frequency distress siren synthesizer.
   - Screen strobe red alert visual warning.
   - Auto-dispatches live distress telemetry to **112 (National ERSS)**, **1091 (Women Helpline)**, **181 (Women in Distress)**, and **Nearest Police Station (Mahila Thana Bhilai - 1.2 km away)**.

3. **Mode 1: Gemini Multimodal Emergency Triage:**
   - Voice note recorder with live Speech-to-Text in Hindi (`hi-IN`) and English (`en-IN`).
   - Scene photo and video capture upload.
   - Gemini Multimodal Triage: Detects urgency (**CRITICAL / HIGH**) and classifies incident (**Medical & Trauma / Road Accident / Harassment & Stalking / Fire Hazard / Domestic Abuse**).
   - Real-time step-by-step life saving guidance cards (direct pressure on arterial bleeding, CPR instructions, safe route navigation).
   - Auto-generates **112 Dispatch Brief** with live GPS coordinates, victim status, and hazards.
   - 1-Click WhatsApp/SMS forwarding to family and Text-to-Speech audio readout in Hindi & English!

4. **Daily AI Companion & Mental Status Tracker ("Asha"):**
   - Daily emotional check-in with mood selector (*Safe & Calm, Anxious / On Edge, Scared / Stalked, Empowered*).
   - Peace of Mind score slider (1 to 10) and journal reflections.
   - Historical Mental Status Timeline & trend log.
   - Conversational AI Companion ("Asha") providing empathetic listening, 5-4-3-2-1 anxiety grounding, and safety reassurance.

5. **Mode 2: Silent / Stealth Mode (Calculator Disguise):**
   - Innocuous, fully functional scientific calculator (`12 * 45 = 540`).
   - Entering secret PIN (`9999=`) secretly unlocks the **Stealth Safety Console**.
   - **Silent Panic SOS:** Transmits silent live GPS coordinates without making any sound or screen flicker.
   - **Private Safety Escape Plan:** Checklist for domestic violence/stalking victims (documents, hidden cash, safe house, distress code words).
   - Quick Panic Lock to Calculator (`ESC` key or button) for instant camouflage.

6. **Mode 3: After the Incident & Legal Justice:**
   - **Timestamped Evidence Vault:** SHA-256 cryptographic tamper-proof hash generation for photos, audio clips, and incident logs.
   - **Auto-Drafted Police Complaint / FIR:** Formatted for SHO / Mahila Thana incorporating **Bharatiya Nyaya Sanhita (BNS) 2023** Sections (BNS 78 Stalking, BNS 74 Assault/Modesty, BNS 351 Intimidation) and SHA-256 digital custody proof.
   - 1-Click Print / PDF export and Copy to Clipboard.

7. **Nearby Police Stations & Women Helplines Directory:**
   - Live distance & ETA locator for Mahila Thana, Bhilai Sector 6 Police Station, Sakhi One Stop Centre, JLNH Hospital, and 24x7 Helplines (112, 1091, 181).
   - Direct one-tap calling (`tel:...`) and navigation maps.

---

## 🚀 Quick Start Guide

The server is currently running at:
```bash
http://localhost:3000
```

To run manually:
```bash
cd C:\Users\ROSH\.gemini\antigravity\scratch\sheguard-ai
node server.js
```

### ⚡ 2-Minute Hackathon Demo Script
1. **Login:** Open `http://localhost:3000`, click *"Auto-Fill Civic Spark Demo Account"* and hit **Enter Console**.
2. **Emergency Buzzer:** Tap the giant red **Emergency Buzzer** to demonstrate the Web Audio siren, flashing strobe, and live police dispatch dispatching to Bhilai Mahila Thana (1.2 km away). Tap again to stop.
3. **Multimodal Triage (Mode 1):** Click *"Scenario 1: Hindi Road Accident + Bleeding"*, then click **Analyze with Gemini Triage Engine**. Show the CRITICAL urgency badge, bilingual step-by-step first aid guidance, and the auto-generated 112 Dispatch Brief. Click **Read Aloud** to showcase voice output.
4. **Daily AI Companion:** Switch to the *"Daily AI Companion"* tab. Select mood *"Anxious / On Edge"*, rate 4/10, submit today's mental check-in, and ask Asha: *"I feel scared walking alone at night"*.
5. **Silent Mode (Mode 2):** Click *"Mode 2: Silent / Stealth Disguise"*. Show the functioning calculator doing `25 + 75 = 100`. Then enter `9999=` to unlock the secret stealth safety dashboard and trigger a **Silent Panic SOS**. Press `ESC` to show how quickly it hides back to the calculator!
6. **Evidence Vault & FIR (Mode 3):** Switch to *"Mode 3"* to view the SHA-256 tamper-proof evidence records and click **Draft FIR** to show the auto-generated legal police complaint cited under Bharatiya Nyaya Sanhita 2023.
