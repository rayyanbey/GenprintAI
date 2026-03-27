#!/usr/bin/env node

// Load environment variables from .env
require('dotenv').config();

/**
 * Test Script: Complete Mockup Generation Flow
 * 
 * This script:
 * 1. Generates an image from the AI service (port 8000)
 * 2. Creates a mockup task using the generated image
 * 3. Polls the mockup status until completion
 * 4. Displays the results
 */

const https = require('https');
const http = require('http');

// Configuration
const AI_SERVICE_URL = 'http://localhost:8000';
const MOCKUP_API_URL = 'http://localhost:3000/api/mockups';
const MOCKUP_STATUS_URL = 'http://localhost:3000/api/mockups/status';

// Test data
const TEST_CONFIG = {
  aiPrompt: 'A cool retro vintage style t-shirt design with geometric shapes and bold colors, vibrant neon aesthetic',
  productId: '71', // T-shirt
  placement: 'front',
  format: 'jpg',
};

/**
 * Make HTTP/HTTPS request
 */
async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const requestOptions = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Step 1: Generate image from AI service
 */
async function generateImageFromAI(prompt) {
  console.log('\n📸 STEP 1: Generating image from AI service...');
  console.log(`   Prompt: "${prompt}"`);
  
  try {
    const response = await makeRequest(`${AI_SERVICE_URL}/generate-design`, {
      method: 'POST',
      body: { text: prompt },
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    console.log(`   ✅ Image generated successfully!`);
    console.log(`   Image URL: ${response.data.image_url}`);
    
    return response.data.image_url;
  } catch (error) {
    console.error(`   ❌ Error generating image:`, error.message);
    throw error;
  }
}

/**
 * Step 2: Create mockup task
 */
async function createMockupTask(imageUrl) {
  console.log('\n🎨 STEP 2: Creating mockup task...');
  console.log(`   Product ID: ${TEST_CONFIG.productId}`);
  console.log(`   Placement: ${TEST_CONFIG.placement}`);
  console.log(`   Image URL: ${imageUrl}`);

  try {
    const response = await makeRequest(`${MOCKUP_API_URL}?test=true`, {
      method: 'POST',
      body: {
        product_id: TEST_CONFIG.productId,
        design_id: `test-design-${Date.now()}`,
        design_image_url: imageUrl,
        placement: TEST_CONFIG.placement,
        format: TEST_CONFIG.format,
      },
      headers: {
        'Cookie': process.env.SESSION_COOKIE || '',
      },
    });

    if (response.status === 401) {
      console.warn('   ⚠️  Authentication required.');
      console.log('   Note: The API now supports test mode. Use ?test=true parameter in development.');
      throw new Error('Unauthorized - test mode with ?test=true should be available in dev');
    }

    if (!response.data.success) {
      console.error('   API Response:', JSON.stringify(response.data, null, 2));
      throw new Error(response.data.error || 'Failed to create mockup task');
    }

    console.log(`   ✅ Mockup task created!`);
    console.log(`   Task Key: ${response.data.taskKey}`);
    console.log(`   Mockup ID: ${response.data.mockupId}`);
    console.log(`   Status: ${response.data.status}`);

    return response.data.taskKey;
  } catch (error) {
    console.error(`   ❌ Error creating mockup task:`, error.message || JSON.stringify(error));
    throw error;
  }
}

/**
 * Step 3: Poll mockup status until completion
 */
async function pollMockupStatus(taskKey, maxAttempts = 45, interval = 2000) {
  console.log('\n⏳ STEP 3: Polling mockup status...');
  console.log(`   Task Key: ${taskKey}`);
  console.log(`   Poll interval: ${interval}ms`);
  console.log(`   Max attempts: ${maxAttempts}`);

  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await makeRequest(`${MOCKUP_STATUS_URL}/${taskKey}?test=true`, {
        method: 'GET',
        headers: {
          'Cookie': process.env.SESSION_COOKIE || '',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to get status');
      }

      const status = response.data.status;
      const progress = response.data.progress || 0;
      
      console.log(`   [Attempt ${attempts + 1}/${maxAttempts}] Status: ${status} | Progress: ${progress}%`);

      if (status === 'completed') {
        console.log(`   ✅ Mockup generation completed!`);
        return response.data;
      }

      if (status === 'failed') {
        throw new Error(response.data.error || 'Mockup generation failed');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;
    } catch (error) {
      console.error(`   ❌ Error polling status:`, error.message);
      throw error;
    }
  }

  throw new Error('Mockup generation timeout - exceeded max attempts');
}

/**
 * Display results
 */
function displayResults(mockupData) {
  console.log('\n✨ RESULTS:');
  console.log('═'.repeat(60));
  
  if (mockupData.mockups && mockupData.mockups.length > 0) {
    const mockup = mockupData.mockups[0];
    console.log(`\nMockup Image:`);
    console.log(`  Placement: ${mockup.placement}`);
    console.log(`  Display Name: ${mockup.display_name}`);
    console.log(`  URL: ${mockup.mockup_url}`);
    
    if (mockupData.printfiles && mockupData.printfiles.length > 0) {
      const printfile = mockupData.printfiles[0];
      console.log(`\nPrintfile (for fulfillment):`);
      console.log(`  URL: ${printfile.url}`);
      console.log(`  Placement: ${printfile.placement}`);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('✅ Test completed successfully!');
}

/**
 * Main test flow
 */
async function runTest() {
  console.log('🚀 MOCKUP GENERATION API TEST');
  console.log('═'.repeat(60));
  console.log(`AI Service: ${AI_SERVICE_URL}`);
  console.log(`Mockup API: ${MOCKUP_API_URL}`);

  try {
    // Step 1: Generate image
    const imageUrl = await generateImageFromAI(TEST_CONFIG.aiPrompt);

    // Step 2: Create mockup task
    const taskKey = await createMockupTask(imageUrl);

    // Step 3: Poll status
    const mockupData = await pollMockupStatus(taskKey);

    // Display results
    displayResults(mockupData);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('  1. Verify AI service is running: curl http://localhost:8000/docs');
    console.log('  2. Verify Next.js API is running: http://localhost:3000');
    console.log('  3. Check environment: HF_API_KEY, PRINTFUL_API_KEY');
    console.log('  4. For auth issues: Set SESSION_COOKIE env var or login first');
    process.exit(1);
  }
}

// Run the test
runTest();
