#!/usr/bin/env node

/**
 * Test script for Google Search MCP Server
 * This script helps test the MCP server functionality
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Google Search MCP Server Test Script\n');

// Check if environment variables are set
const hasApiKey = !!process.env.GOOGLE_API_KEY;
const hasEngineId = !!process.env.GOOGLE_SEARCH_ENGINE_ID;

console.log('Environment Check:');
console.log(`  GOOGLE_API_KEY: ${hasApiKey ? '✅ Set' : '❌ Not set'}`);
console.log(`  GOOGLE_SEARCH_ENGINE_ID: ${hasEngineId ? '✅ Set' : '❌ Not set'}\n`);

if (!hasApiKey || !hasEngineId) {
  console.log('⚠️  Missing API credentials!');
  console.log('   Please follow the SETUP_GUIDE.md to get your credentials.');
  console.log('   Then set the environment variables and run this test again.\n');
  console.log('   Quick setup:');
  console.log('   export GOOGLE_API_KEY="your_api_key"');
  console.log('   export GOOGLE_SEARCH_ENGINE_ID="your_engine_id"');
  console.log('   node test-server.js\n');
}

// Test cases
const testCases = [
  {
    name: 'List Tools',
    request: {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list'
    }
  },
  {
    name: 'Google Search Test',
    request: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'google_search',
        arguments: {
          query: 'artificial intelligence latest news',
          numResults: 3
        }
      }
    },
    requiresCredentials: true
  },
  {
    name: 'Google Search and Summarize Test',
    request: {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'google_search_and_summarize',
        arguments: {
          query: 'climate change solutions 2024',
          numResults: 5
        }
      }
    },
    requiresCredentials: true
  }
];

async function runTest(testCase) {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing: ${testCase.name}`);
    
    if (testCase.requiresCredentials && (!hasApiKey || !hasEngineId)) {
      console.log('   ⏭️  Skipped (requires API credentials)');
      resolve({ skipped: true });
      return;
    }

    const serverPath = path.join(__dirname, 'build', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });

    let stdout = '';
    let stderr = '';
    let responded = false;

    // Set timeout
    const timeout = setTimeout(() => {
      if (!responded) {
        console.log('   ⏰ Test timed out');
        child.kill();
        resolve({ error: 'timeout' });
      }
    }, 15000); // 15 second timeout

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      
      // Check if we got a complete JSON response
      try {
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('{') || line.startsWith('[')) {
            const response = JSON.parse(line);
            if (response.id === testCase.request.id) {
              clearTimeout(timeout);
              responded = true;
              child.kill();
              
              if (response.error) {
                console.log(`   ❌ Error: ${response.error.message}`);
                resolve({ error: response.error.message });
              } else {
                console.log('   ✅ Success');
                if (testCase.name === 'List Tools') {
                  console.log(`   📋 Found ${response.result.tools.length} tools: ${response.result.tools.map(t => t.name).join(', ')}`);
                } else if (testCase.name.includes('Search')) {
                  const content = response.result.content[0].text;
                  if (testCase.name.includes('Summarize')) {
                    console.log(`   📝 Summary generated (${content.length} characters)`);
                  } else {
                    try {
                      const parsed = JSON.parse(content);
                      console.log(`   🔍 Found ${parsed.results.length} search results`);
                    } catch {
                      console.log(`   📄 Response length: ${content.length} characters`);
                    }
                  }
                }
                resolve({ success: true, response });
              }
              return;
            }
          }
        }
      } catch (e) {
        // Not a complete JSON yet, continue waiting
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      console.log(`   ❌ Process error: ${error.message}`);
      resolve({ error: error.message });
    });

    // Send the test request
    child.stdin.write(JSON.stringify(testCase.request) + '\n');
  });
}

async function main() {
  console.log('🚀 Starting MCP Server Tests...\n');
  
  // Check if build exists
  const buildPath = path.join(__dirname, 'build', 'index.js');
  try {
    fs.accessSync(buildPath);
    console.log('✅ Build file found');
  } catch {
    console.log('❌ Build file not found. Run "npm run build" first.');
    process.exit(1);
  }

  let passed = 0;
  let skipped = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await runTest(testCase);
    
    if (result.skipped) {
      skipped++;
    } else if (result.error) {
      failed++;
    } else {
      passed++;
    }
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Failed: ${failed}`);

  if (skipped > 0) {
    console.log('\n💡 To run all tests:');
    console.log('   1. Follow SETUP_GUIDE.md to get Google API credentials');
    console.log('   2. Set environment variables');
    console.log('   3. Run this test again');
  }

  if (failed === 0 && passed > 0) {
    console.log('\n🎉 All available tests passed! The MCP server is working correctly.');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(console.error);
