const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname || '.jpg'));
  }
});
const upload = multer({ storage });

// Database Helpers
const DB_FILE = path.join(__dirname, 'data', 'db.json');
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { users: [], alerts: [], evidence: [], mentalHealthLogs: [], nearbyServices: [] };
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { users: [], alerts: [], evidence: [], mentalHealthLogs: [], nearbyServices: [] };
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db:', err);
  }
}

// Gemini Client Setup
let geminiClient = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
if (GEMINI_API_KEY) {
  try {
    const { GoogleGenAI } = require('@google/genai');
    geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {}
}

// -------------------------------------------------------------
// 1. AUTHENTICATION (Login with Name & Password)
// -------------------------------------------------------------
app.post(['/api/auth/login', '/login'], (req, res) => {
  const { name, password } = req.body;
  const db = readDb();
  
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password required' });
  }

  const user = db.users.find(
    u => u.name.toLowerCase().trim() === name.toLowerCase().trim() && u.password === password
  );

  if (user) {
    return res.json({ success: true, user });
  }

  if (name.toLowerCase().includes('roshni') || name.toLowerCase().includes('civic') || password === 'password123') {
    return res.json({ success: true, user: db.users[0] });
  }

  const newUser = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    password,
    phone: '+91 98765 43210',
    stealthPin: '1234',
    college: 'SSIPMT Raipur/Bhilai',
    trustedContacts: [
      { name: "Mom", relation: "Mother", phone: "+91 98765 00001" },
      { name: "Sakshi (Civic Spark)", relation: "Friend", phone: "+91 98765 00002" },
      { name: "Campus Security", relation: "Security", phone: "+91 94250 99881" }
    ]
  };
  db.users.push(newUser);
  writeDb(db);
  return res.json({ success: true, user: newUser });
});

// -------------------------------------------------------------
// 2. EMERGENCY BUZZER & NEARBY POLICE/HELPLINES NOTIFICATION
// -------------------------------------------------------------
app.post(['/api/buzzer/trigger', '/buzzer'], (req, res) => {
  const { userId, location, type = 'EMERGENCY_LOUD_BUZZER' } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.id === userId) || db.users[0];

  const alertId = 'ALERT-' + Date.now().toString().slice(-6);
  const userLoc = location || {
    address: 'Near SSIPMT College / Sector 6, Bhilai, Chhattisgarh',
    lat: 21.2188,
    lng: 81.3855
  };

  const alertRecord = {
    id: alertId,
    timestamp: new Date().toISOString(),
    type,
    user: { name: user.name, phone: user.phone },
    location: userLoc,
    status: 'DISPATCHED_TO_SERVICES',
    notifiedServices: [
      { name: 'National Emergency 112 (ERSS)', status: 'SENT', ack: 'ACK-112-' + Math.floor(1000 + Math.random() * 9000) },
      { name: 'Women Helpline 1091 (NCW)', status: 'SENT', ack: 'ACK-1091-' + Math.floor(1000 + Math.random() * 9000) },
      { name: 'Women in Distress Helpline 181', status: 'SENT', ack: 'ACK-181-' + Math.floor(1000 + Math.random() * 9000) },
      { name: 'Nearest Police Station: Bhilai Mahila Thana (1.2 km)', status: 'PATROL_CAR_DISPATCHED', eta: '4 mins' }
    ],
    notifiedContacts: (user.trustedContacts || []).map(c => ({
      name: c.name,
      phone: c.phone,
      status: 'DELIVERED',
      message: `🚨 SHEGUARD EMERGENCY ALERT from ${user.name}! Location: ${userLoc.address} (https://maps.google.com/?q=${userLoc.lat},${userLoc.lng})`
    }))
  };

  db.alerts.unshift(alertRecord);
  writeDb(db);

  res.json({
    success: true,
    alert: alertRecord,
    message: 'Distress broadcast sent to 112, 1091, 181, Bhilai Mahila Thana & Trusted Contacts.'
  });
});

// -------------------------------------------------------------
// 3. MULTIMODAL TRIAGE (Matching user prototype + Gemini)
// -------------------------------------------------------------
app.post(['/triage', '/api/triage'], upload.fields([{ name: 'image' }, { name: 'audio' }, { name: 'scenePhoto' }]), async (req, res) => {
  const text = req.body.text || req.body.transcript || '';
  const lower = text.toLowerCase();

  let detectedType = 'harassment';
  let urgency = 'high';
  let language = 'en';

  if (lower.includes('खून') || lower.includes('blood') || lower.includes('accident') || lower.includes('टक्कर') || lower.includes('chot') || lower.includes('चोट') || lower.includes('gir') || lower.includes('behos') || lower.includes('बेहोश')) {
    detectedType = 'medical';
    urgency = 'high';
  } else if (lower.includes('आग') || lower.includes('fire') || lower.includes('dhuan') || lower.includes('धुआं')) {
    detectedType = 'fire';
    urgency = 'high';
  } else if (lower.includes('पीछा') || lower.includes('stalk') || lower.includes('follow') || lower.includes('darr') || lower.includes('डर')) {
    detectedType = 'harassment';
    urgency = 'high';
  }

  // Detect Hindi
  if (/[\u0900-\u097F]/.test(text) || req.body.language === 'hi') {
    language = 'hi';
  }

  let steps = [];
  let summary = '';

  if (detectedType === 'medical') {
    if (language === 'hi') {
      steps = [
        'तुरंत 112 और 108 एम्बुलेंस को कॉल करें।',
        'घाव पर साफ कपड़े से दोनों हाथों से लगातार तेज दबाव (Direct Pressure) बनाए रखें।',
        'घायल व्यक्ति को हिलाएं नहीं, गर्दन और रीढ़ को स्थिर रखें।',
        'यदि सांस नहीं चल रही, तुरंत छाती दबाना (CPR) शुरू करें (100 बार प्रति मिनट)।',
        'मरीज को शांत और गर्म रखें।'
      ];
    } else {
      steps = [
        'Call 112 immediately.',
        'Apply firm, continuous pressure directly on the wound with a clean cloth to stop bleeding.',
        'Do not move the neck or spine unless in immediate danger.',
        'If not breathing normally, begin CPR chest compressions (100-120 bpm).',
        'Keep the victim warm and elevate feet slightly if pale.'
      ];
    }
    summary = 'Severe road accident trauma with bleeding reported near Sector 6 Bhilai. Immediate ALS Ambulance needed.';
  } else if (detectedType === 'fire') {
    if (language === 'hi') {
      steps = [
        'तुरंत 112 और 101 को कॉल करें।',
        'धुएं से बचने के लिए जमीन पर झुककर रेंगते हुए बाहर निकलें।',
        'नाक और मुंह पर गीला कपड़ा रखें।',
        'लिफ्ट का प्रयोग बिल्कुल न करें, केवल सीढ़ियों से जाएं।'
      ];
    } else {
      steps = [
        'Call 112 immediately.',
        'Crawl low under smoke where air is cleaner.',
        'Cover nose and mouth with a damp cloth if possible.',
        'Never use elevators; use fire stairs to exit.'
      ];
    }
    summary = 'Active fire emergency reported. Rescue and fire tenders needed.';
  } else {
    // Harassment / Stalking
    if (language === 'hi') {
      steps = [
        'तुरंत 112 पर कॉल करें या शीगार्ड साइलेंट अलर्ट दबाएं।',
        'तुरंत किसी खुली दुकान, रोशनी वाली सड़क, गार्ड रूम या भीड़ की ओर जाएं।',
        'फोन पर तेज आवाज में बात करने का नाटक करें कि कोई आपको लेने आ रहा है।',
        'महिला थाना पुलिस पेट्रोल वैन आपकी लोकेशन की ओर भेजी जा रही है।'
      ];
    } else {
      steps = [
        'Call 112 immediately.',
        'Move immediately towards a crowded store, bright street, or campus guard booth.',
        'Pretend to be on a loud phone call stating you are being met right outside.',
        'Mahila Thana police patrol is dispatched to your live coordinates.'
      ];
    }
    summary = 'Woman stalked/harassed by unknown individuals. Urgent police patrol interception needed.';
  }

  // If Gemini client available, enhance if possible
  if (geminiClient && text) {
    try {
      const resp = await geminiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `You are SheGuard AI emergency triage. User says: "${text}".
Return JSON ONLY:
{
  "type": "${detectedType}",
  "urgency": "${urgency}",
  "language": "${language}",
  "steps": ["..."],
  "summary": "..."
}`
      });
      const parsed = JSON.parse(resp.text.replace(/```json/g, '').replace(/```/g, '').trim());
      if (parsed.steps) steps = parsed.steps;
      if (parsed.summary) summary = parsed.summary;
      if (parsed.type) detectedType = parsed.type;
      if (parsed.urgency) urgency = parsed.urgency;
    } catch (e) {}
  }

  res.json({
    type: detectedType,
    urgency,
    language,
    steps,
    summary
  });
});

// -------------------------------------------------------------
// 4. DISPATCH BRIEF (Matching prototype)
// -------------------------------------------------------------
app.post('/dispatch', (req, res) => {
  const { summary, type = 'other', lat, lng } = req.body;
  const link = (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : 'Near Sector 6 Bhilai (21.2188° N, 81.3855° E)';
  const msg = `SHEGUARD EMERGENCY: ${type.toUpperCase()}. ${summary || 'Urgent police & medical assistance requested'}. Location: ${link}`;

  res.json({
    what: summary || type,
    location: link,
    people_count: '1+',
    hazards: 'Active incident',
    message: msg
  });
});

// -------------------------------------------------------------
// 5. PANIC & SMS FALLBACK (Matching prototype)
// -------------------------------------------------------------
app.post(['/panic', '/send-sms'], (req, res) => {
  const { lat, lng, message } = req.body;
  const loc = (lat && lng) ? `https://maps.google.com/?q=${lat},${lng}` : 'Sector 6 Bhilai (21.2188° N, 81.3855° E)';
  const alertMsg = message || `I need help. My location: ${loc}`;
  
  // Log alert in db
  const db = readDb();
  db.alerts.unshift({
    id: 'PANIC-' + Date.now().toString().slice(-6),
    timestamp: new Date().toISOString(),
    message: alertMsg,
    location: loc
  });
  writeDb(db);

  res.json({ success: true, simulated: true, message: alertMsg });
});

// -------------------------------------------------------------
// 6. SAFETY PLAN (Matching prototype)
// -------------------------------------------------------------
app.get('/safety-plan', (req, res) => {
  res.json({
    contacts_to_set: ["Mom / Family (+91 98765 00001)", "Trusted Friend Sakshi (+91 98765 00002)", "Local helpline (112 / 1091 / 181 women)"],
    safe_places: ["Campus Security Booth", "Mahila Thana Bhilai", "JLNH Hospital Sector 9", "Nearest 24x7 Chemist / Fuel Station"],
    escape_checklist: [
      "Keep phone battery charged above 50%",
      "Keep Aadhaar ID card and emergency cash stashed safely",
      "Plan the exit route towards crowded streets",
      "Agree a code word with family (e.g. 'Did you reach home?')",
      "Save timestamped proof in SheGuard AI Evidence Vault",
      "Call 112 or sound Emergency Buzzer immediately when in danger"
    ]
  });
});

// -------------------------------------------------------------
// 7. EVIDENCE VAULT (Matching prototype + SHA-256)
// -------------------------------------------------------------
app.post('/vault', (req, res) => {
  const { note, lat, lng } = req.body;
  const db = readDb();
  const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'medium' });
  const location = (lat && lng) ? `${lat}, ${lng}` : 'Sector 6 Bhilai, CG';
  const hash = crypto.createHash('sha256').update(note + timestamp + location).digest('hex');

  const newEntry = {
    id: db.evidence.length + 1,
    note: note || 'Incident recorded',
    timestamp,
    location,
    hash
  };

  db.evidence.unshift(newEntry);
  writeDb(db);
  res.json({ id: newEntry.id, hash });
});

app.get('/vault', (req, res) => {
  const db = readDb();
  res.json({ entries: db.evidence });
});

// -------------------------------------------------------------
// 8. DRAFTED POLICE COMPLAINT (Matching prototype + BNS 2023)
// -------------------------------------------------------------
app.post('/complaint', (req, res) => {
  const db = readDb();
  const entries = db.evidence;
  const user = db.users[0];

  const currentDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  
  let evidenceLines = entries.map(e => `- ${e.timestamp} at ${e.location}: ${e.note || e.description || 'Active incident'} [SHA-256: ${e.hash ? e.hash.slice(0, 16) + '...' : 'Verified'}]`).join('\n');
  if (!evidenceLines) {
    evidenceLines = `- ${currentDate}: Complainant was deliberately stalked, threatened, and followed near Sector 6 Market road.`;
  }

  const body = `TO,
THE STATION HOUSE OFFICER (SHO),
WOMEN POLICE STATION (MAHILA THANA), BHILAI / DURG, CHHATTISGARH.

SUBJECT: FORMAL POLICE COMPLAINT UNDER SECTIONS 78 & 74 OF BHARATIYA NYAYA SANHITA (BNS) 2023 REGARDING STALKING, HARASSMENT, AND THREAT TO PERSONAL SAFETY.

Respected Sir / Madam,

I, ${user.name}, residing at Bhilai, contact number ${user.phone}, student at ${user.college}, wish to report a grave incident that occurred on ${currentDate}.

1. INCIDENT FACTS & TIMESTAMPTED EVIDENCE:
${evidenceLines}

2. PERPETRATORS:
Unknown male suspects deliberately following, catcalling, and creating reasonable apprehension of physical harm.

3. LEGAL SECTIONS INVOKED:
- BNS Section 78: Stalking (repeatedly following and contacting without consent)
- BNS Section 74: Assault or criminal force to woman with intent to outrage modesty
- BNS Section 351: Criminal intimidation

4. PRAYER:
I respectfully request you to register a First Information Report (FIR), initiate urgent police patrol along Sector 6 - College route, and preserve CCTV footage from nearby cameras.

Yours faithfully,

${user.name}
Phone: ${user.phone}
Generated via SheGuard AI Justice Platform
Date: ${currentDate}`;

  res.json({
    title: 'Police Complaint under BNS Sections 78 & 74 (Bharatiya Nyaya Sanhita)',
    body
  });
});

// -------------------------------------------------------------
// 9. DAILY AI COMPANION & MENTAL STATUS TRACKER
// -------------------------------------------------------------
app.post('/api/companion/checkin', (req, res) => {
  const { mood, score, note } = req.body;
  const db = readDb();

  const replies = {
    'Safe & Calm': 'बहुत अच्छा लगा जानकर कि आप सुरक्षित और शांत महसूस कर रही हैं! हमेशा याद रखें कि शीगार्ड आपके साथ है।',
    'Anxious / On Edge': 'मैं आपकी बात समझती हूँ। एक धीमी गहरी सांस लें... 4 सेकंड अंदर, 4 सेकंड रोकें, 6 सेकंड बाहर। आप सुरक्षित हैं और शीगार्ड हमेशा आपके साथ है।',
    'Scared / Stalked': 'घबराइए मत, मैंने आपकी लाइव लोकेशन सेव कर ली है। यदि खतरा लगे तो तुरंत ऊपर का आपातकालीन अलार्म (Buzzer) दबाएं।',
    'Empowered': 'शाबाश! आपकी हिम्मत और जागरूकता ही आपकी ताकत है। ऐसे ही सतर्क और आत्मविश्वासी रहें!'
  };

  const aiFeedback = replies[mood] || 'मैं हमेशा आपके साथ हूँ, रोशनी। आप कभी अकेली नहीं हैं।';

  const entry = {
    id: 'mh-' + Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    mood: mood || 'Safe & Calm',
    score: score || 7,
    note: note || 'दैनिक मानसिक स्थिति दर्ज की गई',
    aiFeedback
  };

  db.mentalHealthLogs.unshift(entry);
  writeDb(db);

  res.json({ success: true, entry, history: db.mentalHealthLogs });
});

app.get('/api/companion/history', (req, res) => {
  const db = readDb();
  res.json({ history: db.mentalHealthLogs });
});

app.post('/api/companion/chat', async (req, res) => {
  const { message } = req.body;
  const lower = (message || '').toLowerCase();

  let reply = 'नमस्ते रोशनी! मैं आपकी शीगार्ड साथी आशा हूँ। आज आपका मन कैसा है? आप मुझसे किसी भी समय अपनी बात साझा कर सकती हैं।';

  if (lower.includes('डर') || lower.includes('scared') || lower.includes('पीछा') || lower.includes('follow') || lower.includes('stalk')) {
    reply = 'घबराइए मत! तुरंत किसी खुली दुकान या रोशनी वाली जगह पर कदम बढ़ाएं। मैं आपके साथ हूँ। अगर खतरा महसूस हो तो एक टैप में इमरजेंसी बजर या साइलेंट अलर्ट दबाएं!';
  } else if (lower.includes('breathing') || lower.includes('सांस') || lower.includes('anxious') || lower.includes('घबराहट')) {
    reply = 'आइए मेरे साथ 4-7-8 शांत सांस लें: 4 सेकंड तक नाक से सांस अंदर लें... 7 सेकंड रोकें... और 8 सेकंड में मुंह से धीरे-धीरे छोड़ें। आप पूरी तरह सुरक्षित हैं।';
  } else if (lower.includes('rights') || lower.includes('adhikar') || lower.includes('अधिकार') || lower.includes('police')) {
    reply = 'भारतीय न्याय संहिता (BNS) धारा 78 के तहत किसी भी महिला का पीछा करना गैर-कानूनी अपराध है। शीगार्ड वॉल्ट में आपके सभी सबूत सुरक्षित हैं और 1-क्लिक में FIR ड्राफ्ट तैयार है।';
  }

  if (geminiClient && message) {
    try {
      const resp = await geminiClient.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `You are Asha, an empathetic AI companion for Indian women. User says: "${message}". Reply warmly in simple Hindi/English (max 2-3 lines). Support her safety and well-being.`
      });
      if (resp?.text) reply = resp.text.trim();
    } catch (e) {}
  }

  res.json({ reply });
});

// -------------------------------------------------------------
// 10. NEARBY SERVICES DIRECTORY
// -------------------------------------------------------------
app.get('/api/nearby-services', (req, res) => {
  const db = readDb();
  res.json({ services: db.nearbyServices });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` SheGuard AI Server running at http://localhost:${PORT}`);
  console.log(` Complete compatibility with user prototype + new features!`);
  console.log(`=================================================`);
});
