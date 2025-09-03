// 测试不同的连接配置
import { Genius } from '../dist/index.js';

async function testWithDifferentConfigs() {
  const configs = [
    {
      name: 'Default config',
      config: {
        accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
        verbose: true
      }
    },
    {
      name: 'Extended timeout', 
      config: {
        accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
        verbose: true,
        timeout: 30000,
        retries: 2
      }
    },
    {
      name: 'Custom User-Agent',
      config: {
        accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
        verbose: true,
        timeout: 15000,
        userAgent: 'Mozilla/5.0 (compatible; lyricsgenius-js/1.0.0)'
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      const genius = new Genius(config);
      const result = await genius.searchAll('test');
      
      console.log(`✅ ${name} - SUCCESS!`);
      console.log(`📊 Status: ${result.meta.status}`);
      return; // 如果成功就停止测试
      
    } catch (error) {
      console.log(`❌ ${name} - Failed: ${error.message}`);
    }
  }
  
  console.log('\n💡 All configs failed. This might be:');
  console.log('   - Network/firewall issue');
  console.log('   - Genius API temporarily unavailable');
  console.log('   - Need to test from different network');
}

testWithDifferentConfigs();