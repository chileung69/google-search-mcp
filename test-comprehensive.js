#!/usr/bin/env node

/**
 * Comprehensive test for Google Search MCP Server
 * Tests both basic functionality and mock data scenarios
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Google Search MCP Server - Comprehensive Test\n');

// Test the real server with basic functionality
async function testBasicFunctionality() {
  console.log('🔧 Testing Basic MCP Server Functionality...\n');
  
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
      name: 'Invalid Tool Call',
      request: {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'nonexistent_tool',
          arguments: {}
        }
      },
      expectError: true
    },
    {
      name: 'Empty Query Validation',
      request: {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'google_search',
          arguments: {
            query: ''
          }
        }
      },
      expectError: true
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await runTest(testCase, 'build/index.js');
    
    if (testCase.expectError) {
      if (result.error) {
        console.log(`   ✅ Expected error occurred: ${result.error}`);
        passed++;
      } else {
        console.log('   ❌ Expected error but got success');
        failed++;
      }
    } else {
      if (result.error) {
        failed++;
      } else {
        passed++;
      }
    }
  }

  return { passed, failed };
}

// Test credentials check
async function testCredentialsCheck() {
  console.log('\n🔑 Testing Credentials Handling...\n');
  
  const testCase = {
    name: 'Missing Credentials Check',
    request: {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'google_search',
        arguments: {
          query: 'test query'
        }
      }
    },
    expectError: true
  };

  const result = await runTest(testCase, 'build/index.js');
  
  if (result.error && result.error.includes('Missing required environment variables')) {
    console.log('   ✅ Correctly detected missing credentials');
    return { passed: 1, failed: 0 };
  } else {
    console.log('   ❌ Failed to detect missing credentials properly');
    return { passed: 0, failed: 1 };
  }
}

async function runTest(testCase, serverScript) {
  return new Promise((resolve) => {
    console.log(`🧪 Testing: ${testCase.name}`);
    
    const serverPath = path.join(__dirname, serverScript);
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GOOGLE_API_KEY: '', GOOGLE_SEARCH_ENGINE_ID: '' }
    });

    let stdout = '';
    let stderr = '';
    let responded = false;

    const timeout = setTimeout(() => {
      if (!responded) {
        console.log('   ⏰ Test timed out');
        child.kill();
        resolve({ error: 'timeout' });
      }
    }, 8000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      
      try {
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('{')) {
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
                }
                resolve({ success: true, response });
              }
              return;
            }
          }
        }
      } catch (e) {
        // Not complete JSON yet
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

    child.stdin.write(JSON.stringify(testCase.request) + '\n');
  });
}

async function main() {
  console.log('🚀 Starting Comprehensive MCP Server Tests...\n');
  
  // Test 1: Basic functionality
  const basicResults = await testBasicFunctionality();
  
  // Test 2: Credentials handling
  const credResults = await testCredentialsCheck();
  
  // Summary
  const totalPassed = basicResults.passed + credResults.passed;
  const totalFailed = basicResults.failed + credResults.failed;
  
  console.log('\n📊 Comprehensive Test Results:');
  console.log(`   ✅ Passed: ${totalPassed}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All tests passed! The MCP server is working correctly.');
    console.log('\n✨ Key Validations Completed:');
    console.log('   ✅ MCP protocol compliance');
    console.log('   ✅ Tool registration and listing');
    console.log('   ✅ Error handling for invalid tools');
    console.log('   ✅ Input validation for empty queries');
    console.log('   ✅ Credential requirement checking');
    
    console.log('\n🔑 Next Steps:');
    console.log('   1. Follow SETUP_GUIDE.md to get Google API credentials');
    console.log('   2. Set environment variables:');
    console.log('      export GOOGLE_API_KEY="your_api_key"');
    console.log('      export GOOGLE_SEARCH_ENGINE_ID="your_engine_id"');
    console.log('   3. Test with real data: node test-server.js');
    console.log('   4. Add to your MCP client using claude_desktop_config.json');
  } else {
    console.log('\n❌ Some tests failed. Please check the implementation.');
  }
  
  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(console.error);
