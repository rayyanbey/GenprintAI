#!/usr/bin/env node

/**
 * Pre-flight Check: Verify all services are running before testing
 */


const http = require('http');

const SERVICES = {
  'AI Service': { url: 'http://localhost:8000', path: '/' },
  'Next.js API': { url: 'http://localhost:3000', path: '/' },
};

const REQUIRED_ENV = [
  'HF_API_KEY',
  'PRINTFUL_API_KEY',
];

const OPTIONAL_ENV = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SESSION_COOKIE',
];

/**
 * Check if port is responding
 */
async function checkService(name, urlObj) {
  return new Promise((resolve) => {
    const client = urlObj.protocol === 'https:' ? require('https') : http;
    
    const req = client.get(urlObj.href, { timeout: 3000 }, (res) => {
      resolve({ name, ok: true, status: res.statusCode });
    });

    req.on('error', () => {
      resolve({ name, ok: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ name, ok: false });
    });
  });
}

/**
 * Check environment variables
 */
function checkEnv() {
  const missing = [];
  const set = [];

  for (const key of REQUIRED_ENV) {
    if (process.env[key]) {
      set.push(key);
    } else {
      missing.push(key);
    }
  }

  return { missing, set };
}

/**
 * Main check
 */
async function runChecks() {
  console.log('\n🔍 PRE-FLIGHT CHECK\n');
  console.log('═'.repeat(60));

  // Check services
  console.log('\n📡 Checking Services:');
  console.log('─'.repeat(60));

  const results = await Promise.all(
    Object.entries(SERVICES).map(([name, { url }]) =>
      checkService(name, new URL(url))
    )
  );

  let allServicesOk = true;
  for (const result of results) {
    if (result.ok) {
      console.log(`✅ ${result.name.padEnd(20)} (Status ${result.status})`);
    } else {
      console.log(`❌ ${result.name.padEnd(20)} NOT RESPONDING`);
      allServicesOk = false;
    }
  }

  // Check required env vars
  console.log('\n🔑 Environment Variables:');
  console.log('─'.repeat(60));

  const { missing, set } = checkEnv();

  for (const key of set) {
    const value = process.env[key];
    const display = value.length > 30 ? value.substring(0, 27) + '...' : value;
    console.log(`✅ ${key.padEnd(30)} = ${display}`);
  }

  if (missing.length > 0) {
    console.log('\n⚠️  MISSING REQUIRED VARIABLES:');
    for (const key of missing) {
      console.log(`❌ ${key}`);
    }
  }

  console.log('\n' + '═'.repeat(60));

  if (allServicesOk && missing.length === 0) {
    console.log('\n✨ ALL CHECKS PASSED! Ready to test.\n');
    console.log('📋 Next steps:');
    console.log('   1. Run: cd my-app && npm run dev (if not already running)');
    console.log('   2. Run: ./test-mockup-flow.ps1  (PowerShell)');
    console.log('   3. Or:  npm run test:mockup     (Node.js)');
    console.log('');
    return 0;
  } else {
    console.log('\n❌ CHECKS FAILED! Fix issues above before testing.\n');
    
    if (!allServicesOk) {
      console.log('📋 Start services:');
      console.log('   Terminal 1: cd ai-services && poetry run uvicorn app:app --port 8000');
      console.log('   Terminal 2: cd my-app && npm run dev');
      console.log('');
    }

    if (missing.length > 0) {
      console.log('📋 Set environment variables:');
      for (const key of missing) {
        console.log(`   ${key}=<your_key>`);
      }
      console.log('');
    }

    return 1;
  }
}

runChecks().then(code => process.exit(code));
