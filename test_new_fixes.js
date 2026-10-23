const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

function postJson(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(BASE_URL + urlPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(BASE_URL + urlPath, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    }).on('error', reject);
  });
}

function postMultipart(urlPath, fields, fileField, filePath, fileName) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    let payload = '';

    for (const [key, val] of Object.entries(fields)) {
      payload += `--${boundary}\r\n`;
      payload += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
      payload += `${val}\r\n`;
    }

    const fileContent = fs.readFileSync(filePath);
    payload += `--${boundary}\r\n`;
    payload += `Content-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\n`;
    payload += `Content-Type: image/jpeg\r\n\r\n`;

    const preBuffer = Buffer.from(payload, 'utf8');
    const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const totalBuffer = Buffer.concat([preBuffer, fileContent, postBuffer]);

    const req = http.request(BASE_URL + urlPath, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': totalBuffer.length
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    req.write(totalBuffer);
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Photo Action in Triage & Dispatch Brief...');

  // Create temporary dummy image file for test
  const testImgPath = path.join(__dirname, 'test_molestation_photo.jpg');
  fs.writeFileSync(testImgPath, Buffer.from('FAKE_JPEG_IMAGE_DATA_FOR_TESTING'));

  // 1. Test /triage with attached photo
  const triageRes = await postMultipart('/triage', {
    text: 'A man is misbehaving and following me at night'
  }, 'image', testImgPath, 'molestation_incident.jpg');

  console.log('Triage response photo:', triageRes.data.photo);
  if (triageRes.data.photo && triageRes.data.photo.url && triageRes.data.photo.name === 'molestation_incident.jpg') {
    console.log('✅ [PASS] Photo parsed, stored in uploads, metadata returned in /triage');
  } else {
    console.error('❌ [FAIL] Photo not attached in /triage response:', triageRes.data);
    process.exit(1);
  }

  // Verify static serving of uploads
  const photoCheck = await getJson(triageRes.data.photo.url);
  if (photoCheck.status === 200) {
    console.log('✅ [PASS] Static photo URL is accessible via HTTP 200');
  } else {
    console.error('❌ [FAIL] Static photo URL returned status:', photoCheck.status);
    process.exit(1);
  }

  // 2. Test /dispatch with photo evidence
  const dispatchRes = await postJson('/dispatch', {
    summary: triageRes.data.summary,
    type: triageRes.data.type,
    lat: 21.2188,
    lng: 81.3855,
    photoUrl: triageRes.data.photo.url,
    photoName: triageRes.data.photo.name,
    photoAnalysis: triageRes.data.photo.analysis
  });

  console.log('Dispatch message:', dispatchRes.data.message);
  if (dispatchRes.data.message.includes('PHOTO EVIDENCE ATTACHED') && dispatchRes.data.photoUrl) {
    console.log('✅ [PASS] Photo evidence incorporated into 112 Dispatch Brief');
  } else {
    console.error('❌ [FAIL] Photo evidence missing in dispatch brief:', dispatchRes.data);
    process.exit(1);
  }

  console.log('\n🔍 Testing Sakhi Conversational AI Responsiveness...');

  // 3. Test Greeting
  const r1 = await postJson('/api/companion/chat', { message: 'Namaste Sakhi, kaisi ho?' });
  console.log('Greeting Reply:', r1.data.reply);
  if (r1.data.reply.includes('नमस्ते रोशनी') && r1.data.suggestions.length > 0) {
    console.log('✅ [PASS] Reactive Greeting with suggestions');
  } else {
    console.error('❌ [FAIL] Unexpected greeting reply:', r1.data);
    process.exit(1);
  }

  // 4. Test Exam stress
  const r2 = await postJson('/api/companion/chat', { message: 'I have a big exam tomorrow and I am super stressed and scared of failing' });
  console.log('Exam Stress Reply:', r2.data.reply);
  if ((r2.data.reply.includes('exam') || r2.data.reply.includes('Academic') || r2.data.reply.includes('worth')) && r2.data.reply !== r1.data.reply) {
    console.log('✅ [PASS] Contextual Academic & Exam empathy');
  } else {
    console.error('❌ [FAIL] Did not respond to exam context:', r2.data);
    process.exit(1);
  }

  // 5. Test Sadness
  const r3 = await postJson('/api/companion/chat', { message: 'I feel very sad and lonely today, please talk to me' });
  console.log('Sadness Reply:', r3.data.reply);
  if (r3.data.reply.includes('feelings') || r3.data.reply.includes('valid') || r3.data.reply.includes('heavy') || r3.data.reply.includes('रोना')) {
    console.log('✅ [PASS] Empathetic active listening for sadness');
  } else {
    console.error('❌ [FAIL] Did not respond to sadness:', r3.data);
    process.exit(1);
  }

  // 6. Test Stalking / Fear
  const r4 = await postJson('/api/companion/chat', { message: 'Koi mera picha kar raha hai gali me' });
  console.log('Stalking Reply:', r4.data.reply);
  if (r4.data.reply.includes('दुकान') || r4.data.reply.includes('Buzzer') || r4.data.reply.includes('alert') || r4.data.reply.includes('SOS')) {
    console.log('✅ [PASS] Immediate safety de-escalation for stalking');
  } else {
    console.error('❌ [FAIL] Did not respond to stalking:', r4.data);
    process.exit(1);
  }

  // 7. Test API Key Configuration endpoint
  const keyStatus = await getJson('/api/config/key');
  console.log('API Key Status:', keyStatus.data);
  if (keyStatus.status === 200 && keyStatus.data.provider) {
    console.log('✅ [PASS] /api/config/key returned valid status');
  } else {
    console.error('❌ [FAIL] /api/config/key failed:', keyStatus);
    process.exit(1);
  }

  // Cleanup test image
  try { fs.unlinkSync(testImgPath); } catch {}

  console.log('\n========================================');
  console.log('🎉 ALL FIXES VERIFIED SUCCESSFULLY! (100%)');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
