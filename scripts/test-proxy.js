// 直接测试代理配置
import { Genius } from '../dist/index.js';

async function testProxyConnection() {
  console.log('🧪 Testing proxy connection...\n');

  // Test 1: 明确指定代理
  console.log('1️⃣ Testing with explicit proxy configuration:');
  try {
    const genius = new Genius({
      accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
      verbose: true,
      timeout: 15000,
      proxy: {
        host: '127.0.0.1',
        port: 7890
      }
    });

    const result = await genius.searchAll('test');
    console.log('✅ Explicit proxy - SUCCESS!');
    console.log(`📊 Status: ${result.meta.status}\n`);
    
  } catch (error) {
    console.log(`❌ Explicit proxy failed: ${error.message}\n`);
  }

  // Test 2: 使用环境变量
  console.log('2️⃣ Testing with environment proxy variables:');
  process.env.HTTPS_PROXY = 'http://127.0.0.1:7890';
  process.env.HTTP_PROXY = 'http://127.0.0.1:7890';
  
  try {
    const genius2 = new Genius({
      accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
      verbose: true,
      timeout: 15000
    });

    const result2 = await genius2.searchAll('test');
    console.log('✅ Environment proxy - SUCCESS!');
    console.log(`📊 Status: ${result2.meta.status}\n`);
    
  } catch (error) {
    console.log(`❌ Environment proxy failed: ${error.message}\n`);
  }

  // Test 3: 测试自动检测
  console.log('3️⃣ Testing with auto-detection (macOS):');
  delete process.env.HTTPS_PROXY;
  delete process.env.HTTP_PROXY;
  
  try {
    const genius3 = new Genius({
      accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
      verbose: true,
      timeout: 15000
    });

    const result3 = await genius3.searchAll('test');
    console.log('✅ Auto-detection - SUCCESS!');
    console.log(`📊 Status: ${result3.meta.status}\n`);
    
  } catch (error) {
    console.log(`❌ Auto-detection failed: ${error.message}\n`);
  }

  console.log('💡 If all tests failed, your VPN might be using SOCKS proxy instead of HTTP proxy.');
  console.log('💡 Try configuring your VPN to use HTTP proxy mode.');
}

testProxyConnection();