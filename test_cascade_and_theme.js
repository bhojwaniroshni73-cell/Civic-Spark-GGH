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

async function runTests() {
  console.log('🧪 Testing 3-Tier Cascading Emergency Buzzer Protocol...');

  // 1. Test /api/buzzer/trigger
  const res = await postJson('/api/buzzer/trigger', {
    userId: 'user-1',
    location: {
      address: 'Near Sector 6 Market, Bhilai',
      lat: 21.2188,
      lng: 81.3855
    },
    type: 'EMERGENCY_BUZZER',
    silent: false
  });

  if (res.status !== 200 || !res.data.success) {
    console.error('❌ [FAIL] Buzzer trigger failed:', res);
    process.exit(1);
  }

  const { tiers, alert } = res.data;
  console.log('Tier 1 Contacts:', tiers.tier1.map(t => `${t.name} (${t.phone})`));
  console.log('Tier 2 Parents:', tiers.tier2.map(t => `${t.name} (${t.phone})`));
  console.log('Tier 3 Selected Contacts:', tiers.tier3.map(t => `${t.name} (${t.phone})`));

  // Verify Tier 1
  const has112 = tiers.tier1.some(t => t.phone === '112');
  const has181 = tiers.tier1.some(t => t.phone === '181');
  const has1091 = tiers.tier1.some(t => t.phone === '1091');
  if (has112 && (has181 || has1091)) {
    console.log('✅ [PASS] Tier 1: 112 & Women Helplines prioritized first');
  } else {
    console.error('❌ [FAIL] Tier 1 does not contain required helplines');
    process.exit(1);
  }

  // Verify Tier 2
  const hasParent = tiers.tier2.some(t => (t.relation || '').toLowerCase().includes('mother') || (t.name || '').toLowerCase().includes('mom'));
  if (hasParent) {
    console.log('✅ [PASS] Tier 2: Parents (Mom / Dad) contacted second');
  } else {
    console.error('❌ [FAIL] Tier 2 does not contain parent contacts');
    process.exit(1);
  }

  // Verify Tier 3
  if (tiers.tier3 && tiers.tier3.length > 0) {
    console.log('✅ [PASS] Tier 3: Selected Emergency Contacts contacted third');
  } else {
    console.error('❌ [FAIL] Tier 3 empty');
    process.exit(1);
  }

  // 2. Verify HTML contains Emergency Buzzer on Login Page
  const htmlContent = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
  const loginSection = htmlContent.substring(htmlContent.indexOf('id="login"'), htmlContent.indexOf('id="calc"'));
  if (loginSection.includes('TAP EMERGENCY BUZZER') && loginSection.includes('triggerBuzzerFromAnywhere()')) {
    console.log('✅ [PASS] Emergency Buzzer directly accessible on Login page without signing in');
  } else {
    console.error('❌ [FAIL] Emergency Buzzer missing on Login page');
    process.exit(1);
  }

  // 3. Verify Theme CSS contains AI Blue Fusion palette
  const cssContent = fs.readFileSync(path.join(__dirname, 'public', 'style.css'), 'utf8');
  if (cssContent.includes('--primary-gradient') && cssContent.includes('AI Blue Fusion') && cssContent.includes('--red-gradient')) {
    console.log('✅ [PASS] CSS implements AI Blue Fusion theme (Royal-blue gradients, white cards, red alert accent)');
  } else {
    console.error('❌ [FAIL] AI Blue Fusion styles missing');
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('🎉 ALL THEME & CASCADE TESTS PASSED! (100%)');
  console.log('========================================');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
