// SheGuard AI - Automated Verification Test Suite
const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('🧪 Starting SheGuard AI Test Suite...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Static Pages
  await test('Static Pages HTTP 200 (App, Tracking, Responder)', async () => {
    const r1 = await fetch(`${BASE_URL}/`);
    assert.strictEqual(r1.status, 200);
    const text1 = await r1.text();
    assert(text1.includes('SheGuard AI'));
    assert(text1.includes('Sakhi, your AI companion'));

    const r2 = await fetch(`${BASE_URL}/tracking.html`);
    assert.strictEqual(r2.status, 200);

    const r3 = await fetch(`${BASE_URL}/responder.html`);
    assert.strictEqual(r3.status, 200);
  });

  // 2. Authentication with Hashed Passwords
  await test('Task 10: Authentication with Hashed Credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Roshni Bhojwani', password: 'password123' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.user.name, 'Roshni Bhojwani');
  });

  // 3. Contacts Management System
  await test('Task 4: Contacts System (List, Add, Validate, Test Alert)', async () => {
    // List
    const r1 = await fetch(`${BASE_URL}/api/contacts`);
    const d1 = await r1.json();
    assert(Array.isArray(d1.contacts));
    assert(d1.contacts.length >= 4);

    // Validation rejection on bad phone
    const rBad = await fetch(`${BASE_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Invalid', phone: '123' })
    });
    assert.strictEqual(rBad.status, 400);

    // Add valid contact
    const r2 = await fetch(`${BASE_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sneha Rao', relation: 'Colleague', phone: '+91 98765 99999', isPrimary: false })
    });
    const d2 = await r2.json();
    assert.strictEqual(d2.success, true);
    const addedId = d2.contact.id;

    // Send Test Alert
    const r3 = await fetch(`${BASE_URL}/api/contacts/test-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId: addedId })
    });
    const d3 = await r3.json();
    assert.strictEqual(d3.success, true);
    assert(d3.channel.includes('Gateway'));

    // Clean up
    await fetch(`${BASE_URL}/api/contacts/${addedId}`, { method: 'DELETE' });
  });

  // 4. Emergency Buzzer & Live Tracking
  let alertId = null;
  await test('Task 5: Emergency Buzzer Broadcast & Live Tracking Link', async () => {
    const res = await fetch(`${BASE_URL}/api/buzzer/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-1',
        location: { lat: 21.2188, lng: 81.3855, address: 'Sector 6 Bhilai' },
        type: 'EMERGENCY_BUZZER'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert(data.alertId.startsWith('ALERT-'));
    alertId = data.alertId;
    assert(data.trackingUrl.includes(alertId));

    // Test Tracking Endpoint
    const rTrack = await fetch(`${BASE_URL}/api/track/${alertId}`);
    assert.strictEqual(rTrack.status, 200);
    const dTrack = await rTrack.json();
    assert.strictEqual(dTrack.alert.id, alertId);
    assert.strictEqual(dTrack.alert.sharingActive, true);
  });

  // 5. Responder Console Dashboard & Status Progression
  await test('Task 5: Responder Console Alert Stream & Status Updates', async () => {
    assert(alertId, 'AlertId must be present');
    const rResp = await fetch(`${BASE_URL}/api/responder/alerts`);
    const dResp = await rResp.json();
    assert(Array.isArray(dResp.alerts));
    const targetAlert = dResp.alerts.find(a => a.id === alertId);
    assert(targetAlert, 'Target alert must be visible in responder console');

    // Update status to Patrol Dispatched
    const rUp = await fetch(`${BASE_URL}/api/responder/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, status: 'Patrol Dispatched', notes: 'PCR-04 En Route' })
    });
    const dUp = await rUp.json();
    assert.strictEqual(dUp.success, true);
    assert.strictEqual(dUp.alert.status, 'Patrol Dispatched');
  });

  // 6. Silent Panic SOS
  await test('Task 6: Silent Panic SOS in Stealth Mode', async () => {
    const res = await fetch(`${BASE_URL}/api/buzzer/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-1',
        type: 'SILENT_PANIC_SOS',
        silent: true
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.alert.silent, true);
  });

  // 7. Sakhi Conversational AI & Emotional Check-in
  await test('Task 1: Sakhi Conversational AI Context & Emotional Check-in', async () => {
    // Check-in
    const rCheck = await fetch(`${BASE_URL}/api/companion/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: 'Anxious / On Edge', score: 4, note: 'Walking past dark alley near college' })
    });
    const dCheck = await rCheck.json();
    assert.strictEqual(dCheck.success, true);

    // Chat with multi-turn context
    const rChat = await fetch(`${BASE_URL}/api/companion/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I feel very anxious right now, someone is walking behind me.',
        history: [{ sender: 'model', text: 'Hello Roshni!' }],
        currentMood: 'Anxious / On Edge',
        peaceScore: 4,
        recentJournal: 'Walking past dark alley',
        language: 'en'
      })
    });
    const dChat = await rChat.json();
    assert(dChat.reply && dChat.reply.length > 10);
  });

  // 8. Sakhi Crisis Intercept (Tele-MANAS 14416 & 112)
  await test('Task 1: Sakhi Crisis Safety Intercept (Self-harm / Tele-MANAS)', async () => {
    const res = await fetch(`${BASE_URL}/api/companion/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'I feel like ending my life, marna chahti hoon',
        language: 'hi'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.isCrisis, true);
    assert(data.reply.includes('14416') || data.reply.includes('Tele-MANAS'));
    assert(data.helplines.some(h => h.number === '14416'));
  });

  // 9. Autocorrect in Sakhi Chat
  await test('Task 2: Autocorrect in Sakhi Chat (Hinglish/English)', async () => {
    const res = await fetch(`${BASE_URL}/api/companion/autocorrect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'koi picha kar rha h' })
    });
    const data = await res.json();
    assert(data.suggestion !== undefined);
  });

  // 10. Multimodal Emergency Triage
  await test('Task 3 & Mode 1: Multimodal Emergency Triage', async () => {
    const res = await fetch(`${BASE_URL}/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'सड़क पर एक्सीडेंट हुआ है, बहुत खून बह रहा है', language: 'hi' })
    });
    const data = await res.json();
    assert.strictEqual(data.urgency, 'high');
    assert.strictEqual(data.type, 'medical');
    assert(Array.isArray(data.steps) && data.steps.length >= 3);
  });

  // 11. Online Trolling & Harassment Flow
  await test('Task 9: Online Harassment Flow (StopNCII / 1930 / IT Act)', async () => {
    const res = await fetch(`${BASE_URL}/api/trolling/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Someone is blackmailing me threatening to leak morphed intimate photos on Instagram',
        platform: 'Instagram'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.severity, 'CRITICAL');
    assert(data.steps.some(s => s.desc.includes('1930') || s.desc.includes('cybercrime.gov.in')));
    assert(data.steps.some(s => s.title.includes('StopNCII')));
    assert(data.legalSections.some(l => l.code.includes('66E') || l.code.includes('67')));
  });

  // 12. Evidence Vault Multi-File & Tamper-Evident SHA-256
  await test('Task 7: Evidence Vault Multi-File & SHA-256 Manifest', async () => {
    const res = await fetch(`${BASE_URL}/api/vault/multi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Dark SUV Stalking Proof',
        description: 'Black SUV following near gate, license plate noted.',
        location: 'Sector 6 Market Road, Bhilai, CG',
        manifestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.evidence.tamperEvident, true);
    assert(data.evidence.manifestHash.length === 64);
  });

  // 13. BNS 2023 FIR Complaint Drafting
  await test('Task 8: BNS 2023 FIR Complaint Generation', async () => {
    const res = await fetch(`${BASE_URL}/complaint`, { method: 'POST' });
    const data = await res.json();
    assert(data.body.includes('Bharatiya Nyaya Sanhita'));
    assert(data.body.includes('Section 78'));
    assert(data.body.includes('Section 74'));
    assert(data.body.includes('Section 63 of the Bharatiya Sakshya Adhiniyam'));
    assert(data.disclaimer.includes('AI-assisted draft'));
  });

  // 14. Nearby Services Directory & Sakhi Govt Center Identity
  await test('Task 1 & Directory: Sakhi One Stop Centre Labeling', async () => {
    const res = await fetch(`${BASE_URL}/api/nearby-services`);
    const data = await res.json();
    const sakhiCentre = data.services.find(s => s.name.includes('Sakhi One Stop Centre'));
    assert(sakhiCentre, 'Sakhi One Stop Centre must be listed in directory');
    assert(sakhiCentre.name.includes('Government Assistance Centre'), 'Must be explicitly labeled as Government Centre');
  });

  console.log(`\n========================================`);
  console.log(`📊 Test Results: ${passed}/${total} Passed (${Math.round((passed/total)*100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
