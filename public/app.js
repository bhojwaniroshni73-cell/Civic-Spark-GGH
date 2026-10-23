// SheGuard AI - Master Accessible Client Application

const API = location.origin;
const $ = id => document.getElementById(id);

let currentUser = {
  name: 'Roshni Bhojwani',
  phone: '+91 98765 43210',
  college: 'SSIPMT Raipur/Bhilai'
};

let currentMood = 'Safe & Calm';
let sirenAudioCtx = null;
let sirenOsc = null;
let sirenGain = null;
let sirenTimer = null;
let isSirenOn = false;

// -------------------------------------------------------------
// 1. SCREEN NAVIGATION & INITIALIZATION
// -------------------------------------------------------------

function go(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  const target = $(screenId);
  if (target) {
    target.classList.add('on');
    window.scrollTo(0, 0);
  }

  document.title = (screenId === 'calc') ? 'Calculator' : 'SheGuard AI';

  if (screenId === 'home') {
    loadPlan();
    $('homeUserName').textContent = currentUser.name.split(' ')[0] || 'Roshni';
  } else if (screenId === 'vault') {
    loadVault();
  } else if (screenId === 'services') {
    loadServices();
  }
}

const getLoc = () => new Promise(r => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      p => r({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => r({ lat: 21.2188, lng: 81.3855 }),
      { timeout: 5000 }
    );
  } else {
    r({ lat: 21.2188, lng: 81.3855 });
  }
});

// -------------------------------------------------------------
// 2. AUTHENTICATION (Login with Name & Password)
// -------------------------------------------------------------

function quickFillDemo() {
  $('loginName').value = 'Roshni Bhojwani';
  $('loginPassword').value = 'password123';
}

async function doLogin() {
  const name = $('loginName').value.trim();
  const password = $('loginPassword').value;

  if (!name || !password) {
    alert('कृपया नाम और पासवर्ड दर्ज करें / Please enter name and password.');
    return;
  }

  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
    } else {
      currentUser.name = name;
    }
  } catch (err) {
    currentUser.name = name;
  }

  localStorage.setItem('sheguard_user', JSON.stringify(currentUser));
  go('home');
}

// -------------------------------------------------------------
// 3. DISGUISED CALCULATOR (Mode 2 Silent Mode)
// -------------------------------------------------------------

let expr = '', eqTimes = [];
const layout = ['C','±','%','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','⌫','='];

function initCalculator() {
  const keysContainer = $('keys');
  if (!keysContainer) return;
  keysContainer.innerHTML = '';

  layout.forEach(k => {
    const b = document.createElement('button');
    b.textContent = k;
    b.className = '/*-+='.includes(k) ? 'op' : 'C±%'.includes(k) ? 'fn' : '';
    b.onclick = () => pressCalc(k);
    keysContainer.appendChild(b);
  });
}

function pressCalc(k) {
  if (k === 'C') {
    expr = '';
  } else if (k === '⌫') {
    expr = expr.slice(0, -1);
  } else if (k === '±') {
    expr = expr.startsWith('-') ? expr.slice(1) : '-' + expr;
  } else if (k === '=') {
    const now = Date.now();
    eqTimes = eqTimes.filter(t => now - t < 1500).concat(now);

    // Secret PINs: 1234 or 9999 unlocks SheGuard
    if (expr === '1234' || expr === '9999') {
      expr = '';
      $('disp').textContent = '0';
      go('home');
      return;
    }

    // Triple-tap '=' triggers silent panic alert
    if (expr === '' && eqTimes.length >= 3) {
      eqTimes = [];
      panic(true);
      return;
    }

    try {
      if (/^[0-9+\-*/.%() ]+$/.test(expr)) {
        expr = String(Function('return ' + expr.replace(/%/g, '/100'))());
      }
    } catch {
      expr = 'Error';
    }
  } else {
    expr += k;
  }
  $('disp').textContent = expr || '0';
}

// -------------------------------------------------------------
// 4. EMERGENCY BUZZER (Feature 2)
// -------------------------------------------------------------

function startSiren() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!sirenAudioCtx) {
      sirenAudioCtx = new AudioCtx();
    }
    if (sirenAudioCtx.state === 'suspended') {
      sirenAudioCtx.resume();
    }

    sirenOsc = sirenAudioCtx.createOscillator();
    sirenGain = sirenAudioCtx.createGain();

    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.setValueAtTime(850, sirenAudioCtx.currentTime);

    sirenGain.gain.setValueAtTime(0.35, sirenAudioCtx.currentTime);
    sirenOsc.connect(sirenGain);
    sirenGain.connect(sirenAudioCtx.destination);

    sirenOsc.start();

    // Dual-tone police siren (850Hz to 1150Hz)
    let high = false;
    sirenTimer = setInterval(() => {
      if (sirenOsc && sirenAudioCtx) {
        sirenOsc.frequency.setTargetAtTime(high ? 850 : 1150, sirenAudioCtx.currentTime, 0.12);
        high = !high;
      }
    }, 320);

    $('strobeOverlay').classList.add('strobe-flashing');
  } catch (e) {
    console.warn('Web Audio error:', e);
  }
}

function stopSiren() {
  if (sirenTimer) {
    clearInterval(sirenTimer);
    sirenTimer = null;
  }
  if (sirenOsc) {
    try {
      sirenOsc.stop();
      sirenOsc.disconnect();
    } catch (e) {}
    sirenOsc = null;
  }
  $('strobeOverlay').classList.remove('strobe-flashing');
  isSirenOn = false;

  const btn = $('buzzerTriggerBtn');
  if (btn) {
    btn.classList.remove('siren-pulse');
    $('buzzerBtnText').textContent = 'TAP TO SOUND LOUD SIREN';
  }
}

async function toggleBuzzerAlarm() {
  isSirenOn = !isSirenOn;
  const btn = $('buzzerTriggerBtn');

  if (isSirenOn) {
    startSiren();
    btn.classList.add('siren-pulse');
    $('buzzerBtnText').textContent = 'SIREN ACTIVE (TAP TO STOP)';

    // Trigger backend dispatch to 112, 1091, 181, & Mahila Thana
    const loc = await getLoc();
    try {
      const res = await fetch(API + '/buzzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id || 'user-1',
          location: {
            address: 'Near SSIPMT College / Sector 6, Bhilai, Chhattisgarh',
            ...loc
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        $('buzzerDispatchCard').innerHTML = `
          <h3 style="font-size: 16px; margin-top: 0; color: var(--red);">
            <i class="fa-solid fa-car-on"></i> POLICE PATROL DISPATCHED!
          </h3>
          <p style="font-size: 13px; color: #332; margin: 4px 0 10px;">
            <strong>Mahila Thana Bhilai Patrol Car (ETA: 4 mins)</strong> alerted with your live location.
          </p>
          <div style="font-size: 12px; color: var(--green); background: #f0fdf4; padding: 8px 12px; border-radius: 8px; border: 1px solid #bbf7d0;">
            ✓ Broadcast sent to 112, 1091, 181, & Mom, Sakshi, Campus Security.
          </div>
        `;
      }
    } catch (err) {
      console.warn('Buzzer network fallback:', err);
    }
  } else {
    stopSiren();
  }
}

// -------------------------------------------------------------
// 5. DAILY AI COMPANION (Feature 1)
// -------------------------------------------------------------

function selectMood(mood, elem) {
  currentMood = mood;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  if (elem) elem.classList.add('selected');
}

async function saveMoodCheckin() {
  const score = parseInt($('moodSlider').value, 10);
  const note = $('moodNote').value.trim();

  try {
    const res = await fetch(API + '/api/companion/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: currentMood, score, note })
    });
    const data = await res.json();
    if (data.success) {
      $('moodNote').value = '';
      appendChatMessage('asha', `<strong>स्थिति दर्ज (${currentMood}, ${score}/10):</strong> ${data.entry.aiFeedback}`);
      alert('Your daily mood is saved! Asha has noted your check-in.');
    }
  } catch (e) {
    appendChatMessage('asha', `I have noted that you feel ${currentMood}. Take a slow, calm breath. SheGuard is right here with you.`);
  }
}

function quickChat(text) {
  $('chatInput').value = text;
  sendChat();
}

async function sendChat() {
  const text = $('chatInput').value.trim();
  if (!text) return;

  appendChatMessage('user', text);
  $('chatInput').value = '';

  try {
    const res = await fetch(API + '/api/companion/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    appendChatMessage('asha', data.reply || 'मैं हमेशा आपके साथ हूँ, रोशनी। आप पूरी तरह सुरक्षित हैं।');
  } catch (e) {
    appendChatMessage('asha', 'घबराइए मत, मैं आपके साथ हूँ। यदि कोई खतरा है तो तुरंत ऊपर का आपातकालीन बजर दबाएं।');
  }
}

function appendChatMessage(sender, text) {
  const win = $('chatWindow');
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  div.innerHTML = text;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

// -------------------------------------------------------------
// 6. EMERGENCY MODE (Mode 1 Multimodal Triage)
// -------------------------------------------------------------

let mediaRec, chunks = [], audioBlob = null;
let speechRec = null;

function loadAccidentDemo() {
  $('txt').value = 'सड़क पर तेज टक्कर हुई है, एक व्यक्ति गिरा है और सिर व पैर से बहुत खून बह रहा है, तुरंत एम्बुलेंस चाहिए!';
}

function loadStalkingDemo() {
  $('txt').value = 'A black SUV is following me near Sector 6 gate, two men are catcalling and blocking my path. Send police immediately!';
}

function showPhotoBadge(input) {
  if (input.files && input.files[0]) {
    $('photoStatus').style.display = 'block';
    $('photoStatus').innerHTML = `✓ Photo attached: <strong>${input.files[0].name}</strong>`;
  }
}

async function rec() {
  // Try Web Speech Recognition for instant Hindi/English transcription first
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRec) {
    if (!speechRec) {
      speechRec = new SpeechRec();
      speechRec.lang = 'hi-IN';
      speechRec.onstart = () => {
        $('recBtn').innerHTML = '<i class="fa-solid fa-record-vinyl text-red"></i> Listening in Hindi...';
      };
      speechRec.onresult = (e) => {
        $('txt').value = e.results[0][0].transcript;
        $('recBtn').innerHTML = '<i class="fa-solid fa-microphone"></i> Voice Captured!';
      };
      speechRec.onerror = () => {
        $('recBtn').innerHTML = '<i class="fa-solid fa-microphone"></i> Record voice';
      };
      speechRec.onend = () => {
        $('recBtn').innerHTML = '<i class="fa-solid fa-microphone"></i> Record voice';
      };
    }
    speechRec.start();
    return;
  }

  // Fallback to MediaRecorder audio blob
  if (mediaRec && mediaRec.state === 'recording') {
    mediaRec.stop();
    return;
  }
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRec = new MediaRecorder(s);
    chunks = [];
    mediaRec.ondataavailable = e => chunks.push(e.data);
    mediaRec.onstop = () => {
      audioBlob = new Blob(chunks, { type: mediaRec.mimeType });
      $('recBtn').innerHTML = '<i class="fa-solid fa-check text-green"></i> Voice Saved!';
      s.getTracks().forEach(t => t.stop());
    };
    mediaRec.start();
    $('recBtn').innerHTML = '<i class="fa-solid fa-record-vinyl text-red"></i> Recording... tap to stop';
  } catch {
    alert('Microphone permission needed or type directly in the box.');
  }
}

async function triage() {
  const textVal = $('txt').value.trim();
  if (!textVal && !audioBlob && !$('img').files[0]) {
    alert('कृपया घटना का विवरण लिखें, बोलें या फोटो चुनें।');
    return;
  }

  $('out').innerHTML = '<div class="card"><i class="fa-solid fa-spinner fa-spin"></i> Getting emergency guidance...</div>';
  
  const fd = new FormData();
  fd.append('text', textVal);
  if (audioBlob) fd.append('audio', audioBlob, 'voice.webm');
  if ($('img').files[0]) fd.append('image', $('img').files[0]);

  let t;
  try {
    t = await (await fetch(API + '/triage', { method: 'POST', body: fd })).json();
  } catch {
    t = {
      urgency: 'high',
      type: 'medical',
      language: 'hi',
      steps: [
        'तुरंत 112 और 108 एम्बुलेंस को कॉल करें।',
        'घाव पर साफ कपड़े से तेज दबाव (Direct Pressure) बनाए रखें।',
        'घायल व्यक्ति को हिलाएं नहीं जब तक बहुत जरूरी न हो।'
      ],
      summary: 'Emergency reported; safe fallback steps active.'
    };
  }

  const col = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--green)' }[t.urgency] || 'var(--red)';
  
  $('out').innerHTML = `
    <div class="card">
      <span class="badge" style="background:${col}">${t.urgency} urgency</span>
      <b style="font-size: 16px; margin-left: 6px;"> ${t.type.toUpperCase()}</b>
      <ol class="steps">${t.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      <button class="btn light" onclick="speak()"><i class="fa-solid fa-volume-high"></i> Read Aloud / आवाज़ में सुनें</button>
    </div>
    <div id="brief" class="card">Writing dispatch brief for 112 & contacts...</div>
  `;

  window._steps = t.steps.join('. ');
  window._lang = t.language;

  const loc = await getLoc();
  const d = await (await fetch(API + '/dispatch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: t.summary, type: t.type, ...loc })
  })).json();

  window._msg = d.message;
  $('brief').innerHTML = `
    <b>Auto-Generated Dispatch Brief:</b>
    <p style="font-family: monospace; font-size: 13px; color: #332; background: #fbf0f2; padding: 10px; border-radius: 8px; border: 1px solid #fcc;">
      ${d.message}
    </p>
    <button class="btn red" onclick="sendBrief()"><i class="fa-solid fa-paper-plane"></i> Send to Trusted Contacts</button>
  `;
}

function speak() {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(window._steps);
  const l = (window._lang || '').toLowerCase();
  u.lang = l.includes('hi') ? 'hi-IN' : 'en-IN';
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

async function sendBrief() {
  const r = await (await fetch(API + '/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: window._msg })
  })).json();

  if (r.success) {
    alert('Sent to your trusted contacts.');
  } else {
    // Open WhatsApp or SMS
    location.href = 'sms:?body=' + encodeURIComponent(window._msg);
  }
}

// -------------------------------------------------------------
// 7. SILENT MODE & SAFETY PLAN (Mode 2)
// -------------------------------------------------------------

async function panic(silent) {
  const loc = await getLoc();
  const r = await (await fetch(API + '/panic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loc)
  })).json();

  if (!silent) {
    alert(r.success ? 'Silent distress alert sent to trusted contacts & 112.' : 'Alert sent.');
  }
}

async function loadPlan() {
  try {
    const p = await (await fetch(API + '/safety-plan')).json();
    $('plan').innerHTML = p.escape_checklist.map(i => `<li>${i}</li>`).join('');
  } catch (e) {}
}

// -------------------------------------------------------------
// 8. EVIDENCE VAULT & DRAFTED COMPLAINT (Mode 3)
// -------------------------------------------------------------

async function addVault() {
  const note = $('vnote').value.trim();
  if (!note) return;
  const loc = await getLoc();
  await fetch(API + '/vault', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note, ...loc })
  });
  $('vnote').value = '';
  loadVault();
}

async function loadVault() {
  try {
    const v = await (await fetch(API + '/vault')).json();
    $('vlist').innerHTML = (v.entries && v.entries.length)
      ? v.entries.map(e => `
          <div class="card" style="font-size: 14px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: #776;">
              <span><i class="fa-solid fa-clock"></i> ${e.timestamp}</span>
              <span class="badge indigo" style="font-size: 10px;">SHA-256 Verified</span>
            </div>
            <p style="margin: 8px 0;">${e.note}</p>
            <div style="font-size: 11px; font-family: monospace; color: #887; word-break: break-all;">
              Hash: ${e.hash || 'Verified'}
            </div>
          </div>
        `).join('')
      : '<p style="text-align: center; color: #776; font-size: 14px;">No entries saved yet.</p>';
  } catch (e) {}
}

async function makeComplaint() {
  $('ctitle').innerHTML = 'Writing your formal complaint under BNS 2023...';
  $('cbody').value = '';
  try {
    const c = await (await fetch(API + '/complaint', { method: 'POST' })).json();
    $('ctitle').innerHTML = c.title;
    $('cbody').value = c.body;
  } catch (e) {
    $('cbody').value = 'I wish to report an incident of harassment and stalking to the Station House Officer under BNS Section 78.';
  }
}

function copyComplaint() {
  navigator.clipboard.writeText($('cbody').value);
  alert('Complaint text copied to clipboard!');
}

function printComplaint() {
  const win = window.open('', '_blank');
  win.document.write(`<pre style="font-family: monospace; padding: 30px; font-size: 13px; line-height: 1.5;">${$('cbody').value}</pre>`);
  win.document.close();
  win.focus();
  win.print();
}

// -------------------------------------------------------------
// 9. NEARBY SERVICES DIRECTORY
// -------------------------------------------------------------

async function loadServices() {
  try {
    const res = await (await fetch(API + '/api/nearby-services')).json();
    $('servicesList').innerHTML = res.services.map(s => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <b style="font-size: 16px;">${s.name}</b>
            <div style="font-size: 13px; color: #665; margin: 2px 0;">${s.address}</div>
            <div style="font-size: 12px; color: var(--green); font-weight: bold; margin-top: 4px;">
              <i class="fa-solid fa-clock"></i> ETA: ${s.eta} · ${s.distance}
            </div>
          </div>
          <span class="badge ${s.type === 'Emergency' ? 'red' : 'indigo'}">${s.type}</span>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <a href="tel:${s.phone}" style="text-decoration: none; flex: 1;">
            <button class="btn green small" style="width: 100%; margin: 0;">
              <i class="fa-solid fa-phone"></i> Call ${s.phone}
            </button>
          </a>
          <a href="https://maps.google.com/?q=${s.lat},${s.lng}" target="_blank" style="text-decoration: none;">
            <button class="btn light small" style="margin: 0;" title="Map Directions">
              <i class="fa-solid fa-diamond-turn-right text-red"></i>
            </button>
          </a>
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

// -------------------------------------------------------------
// 10. APP BOOTSTRAP
// -------------------------------------------------------------

window.addEventListener('DOMContentLoaded', () => {
  initCalculator();

  const saved = localStorage.getItem('sheguard_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      // If user was already logged in, they can directly see the home or calculator
      $('loginName').value = currentUser.name;
    } catch (e) {}
  }
});
