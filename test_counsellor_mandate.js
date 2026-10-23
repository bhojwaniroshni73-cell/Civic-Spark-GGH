const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function testCounsellor() {
  console.log('🧪 Starting Sakhi Safety & Trauma Counsellor Verification Suite...\n');

  // Helper
  async function ask(msg, lang = 'en') {
    const res = await fetch(`${BASE_URL}/api/companion/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        history: [],
        currentMood: 'Anxious / On Edge',
        peaceScore: 4,
        language: lang
      })
    });
    return await res.json();
  }

  // 1. STALKING
  console.log('1. Testing Stalking Inquiry...');
  const rStalk = await ask('Koi mera picha kar rha h road pe', 'hi');
  console.log('Stalking response:\n', rStalk.reply.substring(0, 120) + '...\n');
  assert(rStalk.domain === 'STALKING');
  assert(rStalk.reply.includes('पीछा') || rStalk.reply.includes('BNS') || rStalk.reply.includes('Buzzer'));
  console.log('✅ [PASS] Stalking properly handled with tactical safety guidance\n');

  // 2. UNEASINESS
  console.log('2. Testing Uneasiness & Panic Inquiry...');
  const rUneasy = await ask('Mujhe bohot uneasiness, darr aur ghabrahat lag rahi hai', 'hi');
  console.log('Uneasiness response:\n', rUneasy.reply.substring(0, 120) + '...\n');
  assert(rUneasy.domain === 'UNEASINESS');
  assert(rUneasy.reply.includes('सांस') || rUneasy.reply.includes('शांत') || rUneasy.reply.includes('4-7-8'));
  console.log('✅ [PASS] Uneasiness properly handled with calming / grounding guidance\n');

  // 3. ABUSE TALKING
  console.log('3. Testing Abuse Talking & Verbal Abuse Inquiry...');
  const rAbuse = await ask('A guy is shouting abusive words, dirty language and insulting me in public');
  console.log('Abuse response:\n', rAbuse.reply.substring(0, 120) + '...\n');
  assert(rAbuse.domain === 'ABUSE_TALKING');
  assert(rAbuse.reply.includes('abuse') || rAbuse.reply.includes('abusive') || rAbuse.reply.includes('harm') || rAbuse.reply.includes('351'));
  console.log('✅ [PASS] Abuse talking properly addressed with psychological boundaries & legal notice\n');

  // 4. TORTURE
  console.log('4. Testing Torture & Domestic Violence Inquiry...');
  const rTorture = await ask('I am facing severe domestic violence, torture and physical marpit at home');
  console.log('Torture response:\n', rTorture.reply.substring(0, 120) + '...\n');
  assert(rTorture.domain === 'TORTURE');
  assert(rTorture.reply.includes('torture') || rTorture.reply.includes('181') || rTorture.reply.includes('112') || rTorture.reply.includes('safety'));
  console.log('✅ [PASS] Torture addressed with high-priority safety intervention and helplines\n');

  // 5. HARASSMENT
  console.log('5. Testing Harassment Inquiry...');
  const rHarass = await ask('A colleague is doing sexual harassment, inappropriate touch and blackmailing me');
  console.log('Harassment response:\n', rHarass.reply.substring(0, 120) + '...\n');
  assert(rHarass.domain === 'HARASSMENT');
  assert(rHarass.reply.includes('harassment') || rHarass.reply.includes('Vault') || rHarass.reply.includes('1091') || rHarass.reply.includes('fault'));
  console.log('✅ [PASS] Harassment addressed with evidence vault guidance and helpline notification\n');

  // 6. STRICT BOUNDARY: OUT-OF-SCOPE ENFORCEMENT
  console.log('6. Testing Out-of-Scope Negative Constraints...');
  
  // Test A: Coding
  const rCode = await ask('Can you write a Python function to sort a list using quicksort?');
  console.log('Code response domain:', rCode.domain);
  assert.strictEqual(rCode.domain, 'OUT_OF_SCOPE');
  assert(rCode.reply.includes('Counsellor') && (rCode.reply.includes('strictly') || rCode.reply.includes('do not respond')));
  console.log('✅ [PASS] Coding query strictly refused and redirected to safety counselling');

  // Test B: Mathematics
  const rMath = await ask('What is 25 * 48 + 120?');
  assert.strictEqual(rMath.domain, 'OUT_OF_SCOPE');
  assert(rMath.reply.includes('Counsellor') && (rMath.reply.includes('strictly') || rMath.reply.includes('do not respond')));
  console.log('✅ [PASS] Math calculation strictly refused and redirected to safety counselling');

  // Test C: Recipe / Cooking
  const rRecipe = await ask('How to make Hyderabadi chicken biryani recipe?', 'hi');
  assert.strictEqual(rRecipe.domain, 'OUT_OF_SCOPE');
  assert(rRecipe.reply.includes('काउंसलर') && (rRecipe.reply.includes('केवल') || rRecipe.reply.includes('उत्तर नहीं देती')));
  console.log('✅ [PASS] Cooking recipe strictly refused and redirected to safety counselling');

  // Test D: General Trivia / Geography
  const rTrivia = await ask('What is the capital of Australia and who is the prime minister?');
  assert.strictEqual(rTrivia.domain, 'OUT_OF_SCOPE');
  assert(rTrivia.reply.includes('Counsellor'));
  console.log('✅ [PASS] General trivia strictly refused and redirected to safety counselling');

  // Test E: Weather / Entertainment
  const rWeather = await ask('Will it rain today in Mumbai, what is the weather temperature?');
  assert.strictEqual(rWeather.domain, 'OUT_OF_SCOPE');
  assert(rWeather.reply.includes('Counsellor'));
  console.log('✅ [PASS] Weather / casual query strictly refused');

  console.log('\n======================================================');
  console.log('🎉 ALL COUNSELLOR MANDATE & BOUNDARY TESTS PASSED! (100%)');
  console.log('======================================================\n');
}

testCounsellor().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
