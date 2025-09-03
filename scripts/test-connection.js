// 最简单的连接测试
import { Genius } from '../dist/index.js';

async function testConnection() {
  const genius = new Genius({
    accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
    verbose: true,
    timeout: 10000
  });

  try {
    console.log('🔗 Testing Genius API connection...');
    console.log('📡 Making simple search request...');
    
    const searchResults = await genius.searchAll('hello');
    
    console.log('✅ Connection successful!');
    console.log(`📊 Response status: ${searchResults.meta.status}`);
    console.log(`🔍 Found sections: ${searchResults.response.sections.length}`);
    
    // 显示第一个结果
    if (searchResults.response.sections[0]?.hits[0]) {
      const firstResult = searchResults.response.sections[0].hits[0].result;
      console.log(`🎵 First result: ${firstResult.title || firstResult.name}`);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('🔍 Error details:', error.code || 'Unknown error');
    
    if (error.message.includes('ECONNRESET')) {
      console.log('💡 This might be a network/proxy issue');
    }
  }
}

testConnection();