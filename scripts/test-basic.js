// 基础API测试（不需要歌词内容）
import { Genius } from '../dist/index.js';

async function testBasicAPI() {
  const genius = new Genius({
    accessToken: process.env.GENIUS_ACCESS_TOKEN,
    verbose: true
  });

  try {
    console.log('🔍 Testing basic search...');
    
    // 测试搜索功能
    const searchResults = await genius.searchAll('test');
    console.log('✅ Search API working');
    console.log(`📊 Found ${searchResults.response.sections.length} sections`);
    
    // 测试获取歌曲信息（不包含歌词）
    if (searchResults.response.sections[0]?.hits[0]) {
      const firstHit = searchResults.response.sections[0].hits[0];
      if (firstHit.index === 'song') {
        const songId = firstHit.result.id;
        console.log(`🎵 Testing song info for ID: ${songId}`);
        
        const songInfo = await genius.song(songId);
        console.log(`✅ Song info retrieved: ${songInfo.response.song.title}`);
      }
    }
    
    console.log('✅ All basic tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('401')) {
      console.log('💡 Hint: Check your GENIUS_ACCESS_TOKEN');
    }
  }
}

testBasicAPI();