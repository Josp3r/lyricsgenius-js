// 测试SOCKS代理支持
import { Genius } from '../dist/index.js';

async function testSOCKSProxy() {
  console.log('🧪 Testing SOCKS proxy support...\n');

  console.log('1️⃣ Testing with explicit SOCKS proxy:');
  try {
    const genius = new Genius({
      accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
      verbose: true,
      timeout: 15000,
      proxy: {
        host: '127.0.0.1',
        port: 7890,
        type: 'socks'
      }
    });

    console.log('🔍 Making API request...');
    const result = await genius.searchAll('test');
    console.log('✅ SOCKS proxy - SUCCESS!');
    console.log(`📊 Status: ${result.meta.status}`);
    console.log(`🎵 Found ${result.response.hits.length} results\n`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ SOCKS proxy failed: ${error.message}\n`);
  }

  console.log('2️⃣ Testing with auto-detection (should use SOCKS):');
  try {
    const genius2 = new Genius({
      accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
      verbose: true,
      timeout: 15000
    });

    console.log('🔍 Making API request...');
    const result2 = await genius2.searchAll('hello');
    console.log('✅ Auto-detection SOCKS - SUCCESS!');
    console.log(`📊 Status: ${result2.meta.status}`);
    console.log(`🎵 Found ${result2.response.hits.length} results\n`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Auto-detection failed: ${error.message}\n`);
  }

  return false;
}

// 运行测试
testSOCKSProxy().then(success => {
  if (success) {
    console.log('🎉 Proxy configuration successful!');
    console.log('✅ Your lyricsgenius-js package is now ready to use!');
  } else {
    console.log('💡 Troubleshooting tips:');
    console.log('   - Check if your VPN is running');
    console.log('   - Verify proxy port (7890) is correct');
    console.log('   - Try different proxy types in your VPN settings');
    console.log('   - Some VPNs use port 1080 for SOCKS proxy');
  }
});