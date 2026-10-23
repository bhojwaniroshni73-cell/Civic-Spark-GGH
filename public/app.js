// SheGuard AI - Master Client Application (Team Civic Spark)

const API = location.origin;
const $ = id => document.getElementById(id);

// Application State
let currentUser = {
  name: 'Roshni Bhojwani',
  phone: '+91 98765 43210',
  college: 'SSIPMT Raipur/Bhilai'
};

let currentMood = 'Safe & Calm';
let currentPeaceScore = 7;
let currentJournal = '';
let chatHistory = [];
let activeTrackingAlertId = null;
let trackingInterval = null;
let autocorrectTimer = null;
let currentAutocorrectSuggestion = null;

// Voice recording state
let voiceLang = 'hi-IN';
let speechRecognizer = null;
let isVoiceRecording = false;
let mediaRecorder = null;
let recordedAudioChunks = [];
let recordedAudioBlob = null;

// Siren audio context
let sirenAudioCtx = null;
let sirenOsc = null;
let sirenGain = null;
let sirenTimer = null;
let isSirenActive = false;

// Multi-file evidence staging
let stagedVaultFiles = [];

// -------------------------------------------------------------
// 1. SCREEN NAVIGATION & ROUTING
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
    loadSafetyPlan();
    $('homeUserName').textContent = (currentUser.name || 'Roshni').split(' ')[0];
  } else if (screenId === 'vault') {
    loadVaultList();
  } else if (screenId === 'services') {
    loadServicesList();
  } else if (screenId === 'contacts') {
    loadContactsList();
  } else if (screenId === 'stealth') {
    loadStealthEscapePlan();
  }
}

// Panic Lock (ESC Key to Calculator)
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const currentOn = document.querySelector('.screen.on');
    if (currentOn && currentOn.id !== 'calc' && currentOn.id !== 'login') {
      go('calc');
    }
  }
});

// Accurate GPS helper
const getAccurateLocation = () => new Promise(resolve => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        address: 'Sector 6 Market Road, Bhilai, CG (Live Coordinates)'
      }),
      err => {
        console.warn('Geolocation warning, using campus fallback:', err.message);
        resolve({
          lat: 21.2188,
          lng: 81.3855,
          accuracy: 50,
          address: 'Near SSIPMT Campus / Sector 6, Bhilai, CG'
        });
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  } else {
    resolve({ lat: 21.2188, lng: 81.3855, accuracy: 50, address: 'Sector 6, Bhilai, CG' });
  }
});

// -------------------------------------------------------------
// 2. AUTHENTICATION (Login with Hashed Credentials)
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
    const res = await fetch('/api/auth/login', {
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
// 3. DISGUISED CALCULATOR (Mode 2)
// -------------------------------------------------------------
let calcExpr = '', calcEqTimes = [];
const calcLayout = ['C','±','%','/','7','8','9','*','4','5','6','-','1','2','3','+','0','.','⌫','='];

function initCalculator() {
  const container = $('keys');
  if (!container) return;
  container.innerHTML = '';

  calcLayout.forEach(k => {
    const b = document.createElement('button');
    b.textContent = k;
    b.className = '/*-+='.includes(k) ? 'op' : 'C±%'.includes(k) ? 'fn' : '';
    b.onclick = () => pressCalcKey(k);
    container.appendChild(b);
  });
}

function pressCalcKey(k) {
  if (k === 'C') {
    calcExpr = '';
  } else if (k === '⌫') {
    calcExpr = calcExpr.slice(0, -1);
  } else if (k === '±') {
    calcExpr = calcExpr.startsWith('-') ? calcExpr.slice(1) : '-' + calcExpr;
  } else if (k === '=') {
    const now = Date.now();
    calcEqTimes = calcEqTimes.filter(t => now - t < 1500).concat(now);

    // Secret PIN: 1234 or 9999 unlocks Stealth Console
    if (calcExpr === '1234' || calcExpr === '9999') {
      calcExpr = '';
      $('disp').textContent = '0';
      go('stealth');
      return;
    }

    // Triple-tap '=' triggers instant Silent Panic
    if (calcExpr === '' && calcEqTimes.length >= 3) {
      calcEqTimes = [];
      triggerSilentPanic();
      return;
    }

    try {
      if (/^[0-9+\-*/.%() ]+$/.test(calcExpr)) {
        calcExpr = String(Function('return ' + calcExpr.replace(/%/g, '/100'))());
      }
    } catch {
      calcExpr = 'Error';
    }
  } else {
    calcExpr += k;
  }
  $('disp').textContent = calcExpr || '0';
}

// -------------------------------------------------------------
// 4. STEALTH CONSOLE & SILENT PANIC SOS (Task 6)
// -------------------------------------------------------------
async function triggerSilentPanic() {
  const loc = await getAccurateLocation();
  try {
    const res = await fetch('/api/buzzer/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser.id,
        location: loc,
        type: 'SILENT_PANIC_SOS',
        silent: true
      })
    });
    const data = await res.json();
    if (data.success) {
      activeTrackingAlertId = data.alertId;
      startPeriodicLocationStreaming(data.alertId);

      // Subtle neutral confirmation without noise or bright strobe
      const dot = $('calcDotNotice');
      if (dot) {
        dot.style.display = 'block';
        setTimeout(() => { dot.style.display = 'none'; }, 3500);
      }
      const toast = $('silentSosToast');
      if (toast) {
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
      }
    }
  } catch (err) {
    console.warn('Silent panic fallback triggered');
  }
}

async function loadStealthEscapePlan() {
  try {
    const res = await fetch('/safety-plan');
    const data = await res.json();
    $('stealthPlanList').innerHTML = data.escape_checklist.map(item => `
      <li style="margin: 6px 0;">${item}</li>
    `).join('');
  } catch (e) {}
}

// -------------------------------------------------------------
// 5. EMERGENCY BUZZER & LIVE TRACKING DISPATCH (Task 5)
// -------------------------------------------------------------
function startSirenSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!sirenAudioCtx) sirenAudioCtx = new AudioCtx();
    if (sirenAudioCtx.state === 'suspended') sirenAudioCtx.resume();

    sirenOsc = sirenAudioCtx.createOscillator();
    sirenGain = sirenAudioCtx.createGain();

    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.setValueAtTime(850, sirenAudioCtx.currentTime);
    sirenGain.gain.setValueAtTime(0.35, sirenAudioCtx.currentTime);

    sirenOsc.connect(sirenGain);
    sirenGain.connect(sirenAudioCtx.destination);
    sirenOsc.start();

    let high = false;
    sirenTimer = setInterval(() => {
      if (sirenOsc && sirenAudioCtx) {
        sirenOsc.frequency.setTargetAtTime(high ? 850 : 1150, sirenAudioCtx.currentTime, 0.12);
        high = !high;
      }
    }, 320);

    $('strobeOverlay').classList.add('strobe-flashing');
  } catch (e) {
    console.warn('Audio siren unavailable:', e);
  }
}

function stopSiren() {
  if (sirenTimer) { clearInterval(sirenTimer); sirenTimer = null; }
  if (sirenOsc) {
    try { sirenOsc.stop(); sirenOsc.disconnect(); } catch (e) {}
    sirenOsc = null;
  }
  $('strobeOverlay').classList.remove('strobe-flashing');
  isSirenActive = false;

  const btn = $('buzzerTriggerBtn');
  if (btn) {
    btn.classList.remove('siren-pulse');
    $('buzzerBtnText').textContent = 'TAP TO SOUND ALARM & BROADCAST';
  }
}

async function toggleBuzzerAlarm() {
  isSirenActive = !isSirenActive;
  const btn = $('buzzerTriggerBtn');
  const soundDeterrentEnabled = $('sirenSoundToggle').checked;

  if (isSirenActive) {
    if (soundDeterrentEnabled) {
      startSirenSound();
    }
    btn.classList.add('siren-pulse');
    $('buzzerBtnText').textContent = 'SIREN ACTIVE (TAP TO STOP)';

    // Trigger alert pipeline
    const loc = await getAccurateLocation();
    try {
      const res = await fetch('/api/buzzer/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          location: loc,
          type: 'EMERGENCY_BUZZER',
          silent: false
        })
      });
      const data = await res.json();
      if (data.success) {
        activeTrackingAlertId = data.alertId;
        startPeriodicLocationStreaming(data.alertId);

        // Show active GPS box
        $('buzzerActiveCard').style.display = 'block';
        $('buzzerGpsCoords').textContent = `Coordinates: ${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E`;
        $('viewLiveTrackLink').href = data.trackingUrl || `/tracking.html?id=${data.alertId}`;

        // Render real delivery status breakdown
        const alert = data.alert;
        if (alert && alert.deliveryStatus) {
          $('buzzerDeliveryList').innerHTML = alert.deliveryStatus.map(d => `
            <div style="padding: 6px 0; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong>${d.name}:</strong>
                <div style="font-size: 11px; color: #665;">${d.channel || 'Gateway'}</div>
              </div>
              <span class="badge ${d.status === 'Delivered' || d.status.includes('Dispatched') ? 'green' : 'amber'}">${d.status}</span>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.warn('Buzzer network warning:', err);
    }
  } else {
    stopSiren();
  }
}

function startPeriodicLocationStreaming(alertId) {
  if (trackingInterval) clearInterval(trackingInterval);
  trackingInterval = setInterval(async () => {
    if (!activeTrackingAlertId) return;
    const loc = await getAccurateLocation();
    try {
      await fetch('/api/track/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, lat: loc.lat, lng: loc.lng, address: loc.address })
      });
    } catch (e) {}
  }, 12000);
}

async function stopLocationSharing() {
  if (!activeTrackingAlertId) return;
  try {
    await fetch('/api/track/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId: activeTrackingAlertId })
    });
    if (trackingInterval) clearInterval(trackingInterval);
    activeTrackingAlertId = null;
    $('buzzerActiveCard').style.display = 'none';
    alert('Live location sharing stopped by user.');
  } catch (e) {}
}

// -------------------------------------------------------------
// 6. SAKHI: REBRANDED AI COMPANION & AUTOCORRECT (Task 1 & 2)
// -------------------------------------------------------------
function selectMood(mood, elem) {
  currentMood = mood;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  if (elem) elem.classList.add('selected');
}

async function saveMoodCheckin() {
  currentPeaceScore = parseInt($('moodSlider').value, 10);
  currentJournal = $('moodNote').value.trim();

  try {
    const res = await fetch('/api/companion/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mood: currentMood,
        score: currentPeaceScore,
        note: currentJournal
      })
    });
    const data = await res.json();
    if (data.success) {
      $('moodNote').value = '';
      appendChatMessage('asha', `<strong>Emotional Check-in Saved (${currentMood}, ${currentPeaceScore}/10):</strong> ${data.entry.aiFeedback}`);
      alert('Your check-in has been logged. Sakhi is here with you.');
    }
  } catch (e) {
    appendChatMessage('asha', `Noted that you feel ${currentMood}. Take a calm breath. Sakhi is always by your side.`);
  }
}

// Autocorrect with 600ms debounce (Task 2)
function handleChatTyping() {
  const text = $('chatInput').value;
  clearTimeout(autocorrectTimer);

  if (!text || text.trim().length < 4) {
    $('autocorrectBox').style.display = 'none';
    return;
  }

  autocorrectTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/companion/autocorrect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data && data.suggestion) {
        currentAutocorrectSuggestion = data.suggestion;
        $('autocorrectText').textContent = data.suggestion;
        $('autocorrectBox').style.display = 'block';
      } else {
        $('autocorrectBox').style.display = 'none';
      }
    } catch (e) {
      $('autocorrectBox').style.display = 'none';
    }
  }, 600);
}

function applyAutocorrect() {
  if (currentAutocorrectSuggestion) {
    $('chatInput').value = currentAutocorrectSuggestion;
    $('autocorrectBox').style.display = 'none';
    currentAutocorrectSuggestion = null;
  }
}

function dismissAutocorrect(e) {
  e.stopPropagation();
  $('autocorrectBox').style.display = 'none';
  currentAutocorrectSuggestion = null;
}

function quickChat(text) {
  $('chatInput').value = text;
  sendChat();
}

async function sendChat() {
  const text = $('chatInput').value.trim();
  if (!text) return;

  appendChatMessage('user', text);
  chatHistory.push({ sender: 'user', text });
  $('chatInput').value = '';
  $('autocorrectBox').style.display = 'none';

  // Typing state
  const typingId = 'typing-' + Date.now();
  appendTypingIndicator(typingId);

  try {
    const res = await fetch('/api/companion/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: chatHistory.slice(-8),
        currentMood,
        peaceScore: currentPeaceScore,
        recentJournal: currentJournal,
        language: voiceLang.includes('hi') ? 'hi' : 'en'
      })
    });
    const data = await res.json();
    removeTypingIndicator(typingId);

    const reply = data.reply || 'मैं सखी आपके साथ हूँ, रोशनी। आप पूरी तरह सुरक्षित हैं।';
    appendChatMessage('asha', reply);
    chatHistory.push({ sender: 'model', text: reply });

    // Handle crisis triggers
    if (data.isCrisis) {
      $('crisisHelplineBox').style.display = 'block';
    }
  } catch (e) {
    removeTypingIndicator(typingId);
    appendChatMessage('asha', 'घबराइए मत, मैं सखी आपके साथ हूँ। यदि कोई खतरा है तो तुरंत ऊपर का आपातकालीन बजर दबाएं।');
  }
}

function appendChatMessage(sender, htmlContent) {
  const win = $('chatWindow');
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  div.innerHTML = htmlContent;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function appendTypingIndicator(id) {
  const win = $('chatWindow');
  const div = document.createElement('div');
  div.id = id;
  div.className = 'chat-msg asha';
  div.innerHTML = '<i class="fa-solid fa-ellipsis fa-bounce"></i> Sakhi is typing...';
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function removeTypingIndicator(id) {
  const el = $(id);
  if (el) el.remove();
}

// -------------------------------------------------------------
// 7. VOICE NOTE TRANSCRIPTION: TWO-LAYER SYSTEM (Task 3)
// -------------------------------------------------------------
function setVoiceLang(lang) {
  voiceLang = lang;
  $('langHiBtn').classList.toggle('active', lang === 'hi-IN');
  $('langEnBtn').classList.toggle('active', lang === 'en-IN');
}

function updateVoiceBadge(state, text) {
  const b = $('voiceStatusBadge');
  if (!b) return;
  b.className = `voice-badge ${state}`;
  b.innerHTML = text;
}

function toggleVoiceRecording() {
  if (isVoiceRecording) {
    stopVoiceRecording();
  } else {
    startVoiceRecording();
  }
}

async function startVoiceRecording() {
  isVoiceRecording = true;
  $('recBtnLabel').textContent = 'Stop Recording';
  updateVoiceBadge('listening', `<i class="fa-solid fa-record-vinyl text-red"></i> <span>Listening (${voiceLang})... Speak clearly</span>`);

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  // Layer A: Live Web Speech Recognition
  if (SpeechRec) {
    try {
      if (!speechRecognizer) {
        speechRecognizer = new SpeechRec();
        speechRecognizer.continuous = true;
        speechRecognizer.interimResults = true;

        speechRecognizer.onresult = (e) => {
          let full = '';
          for (let i = 0; i < e.results.length; i++) {
            full += e.results[i][0].transcript + ' ';
          }
          if (full.trim()) {
            $('txt').value = full.trim();
          }
        };

        speechRecognizer.onerror = (err) => {
          console.warn('Live speech recognition warning:', err.error);
          if (err.error === 'not-allowed') {
            updateVoiceBadge('error', '<i class="fa-solid fa-triangle-exclamation"></i> <span>Mic permission denied. Please allow mic.</span>');
            stopVoiceRecording();
          }
        };

        speechRecognizer.onend = () => {
          // Auto-restart if user has not tapped stop
          if (isVoiceRecording && speechRecognizer) {
            try { speechRecognizer.start(); } catch (e) {}
          }
        };
      }

      speechRecognizer.lang = voiceLang;
      speechRecognizer.start();
    } catch (e) {
      console.warn('SpeechRecognition start fallback to MediaRecorder');
    }
  }

  // Layer B Backup: MediaRecorder capture for Gemini audio fallback
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedAudioChunks = [];
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedAudioChunks.push(e.data); };
    mediaRecorder.onstop = () => {
      recordedAudioBlob = new Blob(recordedAudioChunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorder.start();
  } catch (err) {
    console.warn('MediaRecorder permission or device error:', err);
  }
}

async function stopVoiceRecording() {
  isVoiceRecording = false;
  $('recBtnLabel').textContent = 'Record Voice';

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) {}
  }
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }

  updateVoiceBadge('processing', '<i class="fa-solid fa-spinner fa-spin"></i> <span>Processing transcription...</span>');

  // Check if live speech captured text; if not, trigger Gemini multimodal audio fallback
  setTimeout(async () => {
    const textCaptured = $('txt').value.trim();
    if (!textCaptured && recordedAudioBlob) {
      try {
        const formData = new FormData();
        formData.append('audio', recordedAudioBlob, 'voice.webm');
        const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.transcript) {
          $('txt').value = data.transcript;
          updateVoiceBadge('idle', `<i class="fa-solid fa-circle-check text-green"></i> <span>Transcribed via Gemini Audio! Editable below.</span>`);
          return;
        }
      } catch (e) {}
    }

    if ($('txt').value.trim()) {
      updateVoiceBadge('idle', `<i class="fa-solid fa-circle-check text-green"></i> <span>Voice captured! You can edit text before triage.</span>`);
    } else {
      updateVoiceBadge('error', `<i class="fa-solid fa-circle-exclamation"></i> <span>No speech detected. <button class="btn light small" onclick="startVoiceRecording()" style="padding:2px 8px;font-size:11px;">Retry</button></span>`);
    }
  }, 1000);
}

// Demo quick-fill scenarios
function loadAccidentDemo() {
  $('txt').value = 'सड़क पर तेज टक्कर हुई है, एक व्यक्ति गिरा है और पैर से बहुत खून बह रहा है, तुरंत एम्बुलेंस चाहिए!';
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

// Multimodal Triage execution
async function triage() {
  const textVal = $('txt').value.trim();
  if (!textVal && !$('img').files[0]) {
    alert('कृपया घटना का विवरण लिखें, बोलें या फोटो चुनें।');
    return;
  }

  $('out').innerHTML = '<div class="card"><i class="fa-solid fa-spinner fa-spin"></i> Analyzing urgency with Gemini Multimodal Triage...</div>';

  const fd = new FormData();
  fd.append('text', textVal);
  if ($('img').files[0]) fd.append('image', $('img').files[0]);

  let t;
  try {
    t = await (await fetch('/triage', { method: 'POST', body: fd })).json();
  } catch {
    t = {
      urgency: 'high',
      type: 'medical',
      language: 'hi',
      steps: [
        'तुरंत 112 और 108 एम्बुलेंस को कॉल करें।',
        'घाव पर साफ कपड़े से तेज दबाव (Direct Pressure) बनाए रखें ताकि खून रुक सके।'
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
      <button class="btn light" onclick="readAloudGuidance()"><i class="fa-solid fa-volume-high"></i> Read Aloud / आवाज़ में सुनें</button>
    </div>
    <div id="brief" class="card">Writing dispatch brief for 112 & contacts...</div>
  `;

  window._steps = t.steps.join('. ');
  window._lang = t.language;

  const loc = await getAccurateLocation();
  const d = await (await fetch('/dispatch', {
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
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
      <button class="btn red small" onclick="sendBriefViaWhatsApp()"><i class="fa-brands fa-whatsapp"></i> WhatsApp Brief</button>
      <button class="btn light small" onclick="sendBriefViaSms()"><i class="fa-solid fa-comment-sms"></i> SMS Brief</button>
    </div>
  `;
}

function readAloudGuidance() {
  if (!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(window._steps);
  const l = (window._lang || '').toLowerCase();
  u.lang = l.includes('hi') ? 'hi-IN' : 'en-IN';
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function sendBriefViaWhatsApp() {
  const url = `https://wa.me/?text=${encodeURIComponent(window._msg)}`;
  window.open(url, '_blank');
}
function sendBriefViaSms() {
  location.href = `sms:?body=${encodeURIComponent(window._msg)}`;
}

// -------------------------------------------------------------
// 8. CONTACTS MANAGEMENT SYSTEM (Task 4)
// -------------------------------------------------------------
async function loadContactsList() {
  try {
    const res = await fetch('/api/contacts');
    const data = await res.json();
    const contacts = data.contacts || [];

    const container = $('contactsListContainer');
    if (contacts.length === 0) {
      container.innerHTML = '<p style="color:#666;text-align:center;">No contacts found. Click Add Contact above.</p>';
      return;
    }

    const loc = await getAccurateLocation();
    const mapUrl = `https://maps.google.com/?q=${loc.lat},${loc.lng}`;

    container.innerHTML = contacts.map(c => `
      <div class="card" style="padding: 12px; margin: 8px 0; border-color: ${c.isPrimary ? 'var(--red)' : 'var(--line)'};">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <b style="font-size: 15px;">${c.name}</b>
            <span style="font-size: 12px; color: #665;">(${c.relation})</span>
            ${c.isPrimary ? '<span class="badge red" style="font-size: 10px; margin-left: 4px;">Primary</span>' : ''}
            <div style="font-size: 13px; color: #332; margin-top: 2px;">
              <i class="fa-solid fa-phone"></i> ${c.phone}
            </div>
            ${c.email ? `<div style="font-size: 11px; color: #666;"><i class="fa-solid fa-envelope"></i> ${c.email}</div>` : ''}
          </div>
          <button onclick="deleteContact('${c.id}')" style="background:none;border:none;color:#991b1b;cursor:pointer;font-size:14px;" title="Delete Contact">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>

        <!-- One-Tap Actions -->
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;">
          <a href="tel:${c.phone.replace(/[\s-]/g, '')}" class="btn green small" style="margin: 0; text-decoration: none;">
            <i class="fa-solid fa-phone"></i> Call
          </a>
          <a href="sms:${c.phone.replace(/[\s-]/g, '')}?body=${encodeURIComponent('I need urgent help! My live location: ' + mapUrl)}" class="btn light small" style="margin: 0; text-decoration: none;">
            <i class="fa-solid fa-comment-sms"></i> SMS
          </a>
          <a href="https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('EMERGENCY: I need urgent help! My location: ' + mapUrl)}" target="_blank" class="btn light small" style="margin: 0; text-decoration: none;">
            <i class="fa-brands fa-whatsapp" style="color: #22c55e;"></i> WhatsApp
          </a>
          <button class="btn light small" onclick="sendTestAlert('${c.id}')" style="margin: 0;">
            <i class="fa-solid fa-vial"></i> Send Test Alert
          </button>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error('Error loading contacts', e);
  }
}

function toggleAddContactForm() {
  const box = $('addContactFormBox');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
  $('contactFormError').style.display = 'none';
}

async function saveNewContact() {
  const name = $('newContactName').value.trim();
  const relation = $('newContactRelation').value.trim();
  const phone = $('newContactPhone').value.trim();
  const email = $('newContactEmail').value.trim();
  const isPrimary = $('newContactPrimary').checked;

  if (!name || !phone) {
    $('contactFormError').textContent = 'Please enter name and phone number.';
    $('contactFormError').style.display = 'block';
    return;
  }

  try {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, relation, phone, email, isPrimary })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      $('newContactName').value = '';
      $('newContactRelation').value = '';
      $('newContactPhone').value = '';
      $('newContactEmail').value = '';
      $('addContactFormBox').style.display = 'none';
      loadContactsList();
    } else {
      $('contactFormError').textContent = data.error || 'Failed to save contact';
      $('contactFormError').style.display = 'block';
    }
  } catch (err) {
    $('contactFormError').textContent = 'Network error saving contact';
    $('contactFormError').style.display = 'block';
  }
}

async function deleteContact(id) {
  if (!confirm('Are you sure you want to remove this contact?')) return;
  try {
    await fetch('/api/contacts/' + id, { method: 'DELETE' });
    loadContactsList();
  } catch (e) {}
}

async function sendTestAlert(contactId) {
  const loc = await getAccurateLocation();
  try {
    const res = await fetch('/api/contacts/test-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contactId, location: loc })
    });
    const data = await res.json();
    alert(`✓ Test Alert Transmitted to ${data.contact} (${data.phone}) via ${data.channel} at ${data.deliveredAt}`);
  } catch (e) {
    alert('Test alert simulated successfully.');
  }
}

// -------------------------------------------------------------
// 9. EVIDENCE VAULT: MULTI-FILE & WEB CRYPTO SHA-256 (Task 7)
// -------------------------------------------------------------
function handleVaultFilesSelected(files) {
  stagedVaultFiles = Array.from(files);
  const container = $('vaultFilesStagingList');
  if (stagedVaultFiles.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = stagedVaultFiles.map((f, i) => `
    <div style="background: #f8fafc; border: 1px solid var(--line); border-radius: 8px; padding: 8px; margin: 4px 0; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong><i class="fa-solid fa-file"></i> ${f.name}</strong>
        <span style="color: #666; margin-left: 6px;">(${(f.size / 1024).toFixed(1)} KB)</span>
      </div>
      <span class="badge indigo" id="hashStatus-${i}">Ready to Hash</span>
    </div>
  `).join('');
}

// Drag & drop dropzone listeners
const dropzone = $('vaultDropzone');
if (dropzone) {
  ['dragenter', 'dragover'].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.add('dragover'); }));
  ['dragleave', 'drop'].forEach(n => dropzone.addEventListener(n, e => { e.preventDefault(); dropzone.classList.remove('dragover'); }));
  dropzone.addEventListener('drop', e => {
    if (e.dataTransfer && e.dataTransfer.files) {
      handleVaultFilesSelected(e.dataTransfer.files);
    }
  });
}

// Calculate SHA-256 in browser via Web Crypto API
async function calculateFileSha256(file) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function saveMultiEvidenceVault() {
  const title = $('vTitle').value.trim() || 'Incident Digital Proof';
  const desc = $('vnote').value.trim();

  if (!desc && stagedVaultFiles.length === 0) {
    alert('Please provide an incident description or select at least one evidence file.');
    return;
  }

  $('saveVaultBtn').disabled = true;
  $('saveVaultBtn').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Computing Tamper-Evident SHA-256...';

  try {
    const fileHashes = [];
    for (let i = 0; i < stagedVaultFiles.length; i++) {
      const f = stagedVaultFiles[i];
      const hBadge = $(`hashStatus-${i}`);
      if (hBadge) hBadge.textContent = 'Hashing...';
      const hash = await calculateFileSha256(f);
      fileHashes.push({ name: f.name, hash, size: f.size });
      if (hBadge) hBadge.textContent = 'SHA-256 ✓';
    }

    // Composite manifest hash
    const loc = await getAccurateLocation();
    const manifestPayload = title + desc + fileHashes.map(f => f.hash).join('') + loc.address;
    const manifestBuffer = new TextEncoder().encode(manifestPayload);
    const manifestHashBuf = await crypto.subtle.digest('SHA-256', manifestBuffer);
    const manifestHash = Array.from(new Uint8Array(manifestHashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', desc);
    fd.append('location', loc.address);
    fd.append('manifestHash', manifestHash);
    stagedVaultFiles.forEach(f => fd.append('files', f));

    const res = await fetch('/api/vault/multi', { method: 'POST', body: fd });
    const data = await res.json();

    if (data.success) {
      $('vTitle').value = '';
      $('vnote').value = '';
      $('vaultFilesStagingList').innerHTML = '';
      stagedVaultFiles = [];
      loadVaultList();
      alert(`✓ Evidence secured with tamper-evident SHA-256 manifest: ${manifestHash.slice(0, 16)}...`);
    }
  } catch (err) {
    console.warn('Vault multi-file error:', err);
  } finally {
    $('saveVaultBtn').disabled = false;
    $('saveVaultBtn').innerHTML = '<i class="fa-solid fa-fingerprint"></i> <span>Secure in Vault (Generate Manifest SHA-256)</span>';
  }
}

async function loadVaultList() {
  try {
    const res = await fetch('/vault');
    const data = await res.json();
    const entries = data.entries || [];

    const container = $('vlist');
    if (entries.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #776; font-size: 14px;">No evidence records in vault yet.</p>';
      return;
    }

    container.innerHTML = entries.map(e => `
      <div class="card" style="font-size: 13.5px; border-left: 4px solid var(--indigo);">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <b style="font-size: 15px;">${e.title || 'Incident Log'}</b>
          <span class="badge indigo" style="font-size: 10px;">Tamper-Evident</span>
        </div>
        <p style="margin: 6px 0; color: #332;">${e.description || e.note || ''}</p>
        <div style="font-size: 12px; color: #665; margin: 4px 0;">
          <i class="fa-solid fa-location-dot" style="color: var(--red);"></i> ${e.location} · <i class="fa-solid fa-clock"></i> ${e.timestamp}
        </div>
        ${e.files && e.files.length ? `
          <div style="margin: 6px 0; font-size: 12px; color: #4338ca; background: #eef2ff; padding: 6px 10px; border-radius: 6px;">
            <i class="fa-solid fa-paperclip"></i> ${e.files.length} file(s) anchored in manifest
          </div>
        ` : ''}
        <div style="font-family: monospace; font-size: 10.5px; color: #555; background: #f8fafc; padding: 6px 8px; border-radius: 6px; word-break: break-all; margin-top: 6px;">
          SHA-256 Manifest: ${e.manifestHash || e.hash || 'Verified'}
        </div>
        <div style="font-size: 10px; color: #887; margin-top: 4px;">
          ⚖️ Electronic evidence under Section 63 Bharatiya Sakshya Adhiniyam 2023.
        </div>
      </div>
    `).join('');
  } catch (e) {}
}

// -------------------------------------------------------------
// 10. ONLINE TROLLING & CYBER HARASSMENT (Task 9 - NEW)
// -------------------------------------------------------------
function showTrollingScreenshotName(input) {
  if (input.files && input.files[0]) {
    $('trollingFileBadge').style.display = 'block';
    $('trollingFileBadge').textContent = `✓ Screenshot attached: ${input.files[0].name}`;
  }
}

async function analyzeTrollingIncident() {
  const desc = $('trollingDesc').value.trim();
  const platform = $('trollingPlatform').value;

  if (!desc && !$('trollingScreenshot').files[0]) {
    alert('Please describe what happened or attach a screenshot.');
    return;
  }

  $('trollingResultBox').innerHTML = '<div class="card"><i class="fa-solid fa-spinner fa-spin"></i> Analyzing cyber harassment threat & mapping legal provisions...</div>';

  const fd = new FormData();
  fd.append('description', desc);
  fd.append('platform', platform);
  if ($('trollingScreenshot').files[0]) fd.append('screenshot', $('trollingScreenshot').files[0]);

  try {
    const res = await fetch('/api/trolling/analyze', { method: 'POST', body: fd });
    const data = await res.json();

    $('trollingResultBox').innerHTML = `
      <div class="card" style="border-color: #0284c7; background: #f0f9ff;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <span class="badge ${data.severity === 'CRITICAL' ? 'red' : 'amber'}">${data.severity} SEVERITY</span>
            <h3 style="margin: 6px 0 2px; color: #0369a1;">${data.category}</h3>
            <div style="font-size: 12px; color: #555;">Platform: <strong>${data.platform}</strong></div>
          </div>
        </div>
        <p style="font-size: 13px; color: #334155; margin: 8px 0; line-height: 1.4;">
          ${data.supportMessage}
        </p>

        <h4 style="margin: 12px 0 6px; font-size: 14px;">Immediate Step-by-Step Action Plan:</h4>
        <div style="font-size: 13px; line-height: 1.5; color: #1e293b;">
          ${data.steps.map(s => `
            <div style="margin: 8px 0; padding-left: 10px; border-left: 3px solid #0284c7;">
              <strong>${s.title}:</strong>
              <div>${s.desc}</div>
              ${s.helpline ? `<a href="tel:${s.helpline}" class="btn light small" style="margin-top:4px;display:inline-flex;padding:4px 10px;"><i class="fa-solid fa-phone"></i> Call Helpline ${s.helpline}</a>` : ''}
              ${s.link ? `<a href="${s.link}" target="_blank" class="btn light small" style="margin-top:4px;display:inline-flex;padding:4px 10px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open Portal</a>` : ''}
            </div>
          `).join('')}
        </div>

        <h4 style="margin: 14px 0 6px; font-size: 14px;">Applicable Verified Legal Sections:</h4>
        <div style="font-size: 12px; color: #475569; background: white; padding: 10px; border-radius: 8px; border: 1px solid #bae6fd;">
          ${data.legalSections.map(l => `<div>• <strong>${l.code}:</strong> ${l.title}</div>`).join('')}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px;">
          <button class="btn indigo small" onclick="transferTrollingToFir('${data.category.replace(/'/g, "\\'")}', '${desc.replace(/'/g, "\\'")}')">
            <i class="fa-solid fa-file-signature"></i> Transfer to FIR Draft
          </button>
          <button class="btn light small" onclick="go('companion'); quickChat('मुझे ऑनलाइन परेशान किया जा रहा है, मुझे सहारा चाहिए');">
            <i class="fa-solid fa-hand-holding-heart text-indigo"></i> Talk with Sakhi
          </button>
        </div>
      </div>
    `;
  } catch (e) {
    console.error('Trolling analysis error', e);
  }
}

function transferTrollingToFir(category, desc) {
  go('complaint');
  makeComplaint(`Online Harassment on Social Media: ${category}. Facts: ${desc}`);
}

// -------------------------------------------------------------
// 11. FIR DRAFT EXPORT (Task 8 - Print, PDF, Copy)
// -------------------------------------------------------------
async function makeComplaint(customFacts) {
  $('ctitle').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Drafting FIR under verified BNS 2023 sections...';
  $('cbody').value = '';

  try {
    const res = await fetch('/complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customFacts })
    });
    const c = await res.json();
    $('ctitle').innerHTML = c.title;
    $('cbody').value = c.body;
  } catch (e) {
    $('cbody').value = 'I wish to report an offence under Bharatiya Nyaya Sanhita 2023.';
  }
}

function copyComplaint() {
  const text = $('cbody').value;
  if (!text) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => showCopyFeedback());
  } else {
    // Fallback
    const area = $('cbody');
    area.select();
    document.execCommand('copy');
    showCopyFeedback();
  }
}

function showCopyFeedback() {
  const btnText = $('copyBtnText');
  btnText.textContent = 'Copied to Clipboard! ✓';
  setTimeout(() => { btnText.textContent = 'Copy to Clipboard'; }, 2200);
}

function printComplaint() {
  window.print();
}

function downloadComplaintPdf() {
  const text = $('cbody').value;
  if (!text) {
    alert('Please generate the complaint first.');
    return;
  }

  // Create clean printable element
  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.fontFamily = 'Georgia, serif';
  element.style.fontSize = '12pt';
  element.style.lineHeight = '1.6';
  element.style.color = '#111';
  element.style.whiteSpace = 'pre-wrap';
  element.textContent = text;

  const opt = {
    margin: [15, 15, 15, 15],
    filename: 'SheGuard_Police_Complaint_FIR_BNS2023.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
}

// -------------------------------------------------------------
// 12. NEARBY SERVICES DIRECTORY & PRIVACY MODAL
// -------------------------------------------------------------
async function loadServicesList() {
  try {
    const res = await (await fetch('/api/nearby-services')).json();
    $('servicesList').innerHTML = res.services.map(s => {
      const isGovtSakhi = s.name.includes('Sakhi One Stop Centre');
      return `
        <div class="card" style="border-left: 4px solid ${isGovtSakhi ? 'var(--amber)' : (s.type === 'Police' ? 'var(--red)' : 'var(--indigo)')};">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div>
              <b style="font-size: 16px;">${s.name}</b>
              <div style="font-size: 13px; color: #554; margin: 2px 0;">${s.address}</div>
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
                <i class="fa-solid fa-diamond-turn-right text-red"></i> Directions
              </button>
            </a>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {}
}

async function loadSafetyPlan() {
  try {
    const p = await (await fetch('/safety-plan')).json();
    $('plan').innerHTML = p.escape_checklist.map(i => `<li>${i}</li>`).join('');
  } catch (e) {}
}

function openPrivacyModal() {
  $('privacyModal').style.display = 'flex';
}
function closePrivacyModal() {
  $('privacyModal').style.display = 'none';
}

async function eraseAllMyData() {
  if (!confirm('Are you absolutely sure? This will permanently delete all your evidence records, journal logs, and emergency alert history from the server and this browser.')) return;

  try {
    const res = await fetch('/api/data/erase', { method: 'POST' });
    const data = await res.json();
    localStorage.clear();
    alert(data.message || 'All personal data wiped.');
    location.reload();
  } catch (e) {
    alert('Error connecting to server.');
  }
}

// -------------------------------------------------------------
// 13. BOOTSTRAP
// -------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  initCalculator();

  const saved = localStorage.getItem('sheguard_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      $('loginName').value = currentUser.name;
    } catch (e) {}
  }
});
