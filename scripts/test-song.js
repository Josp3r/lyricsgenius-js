// 简单的歌曲搜索测试
import { Genius } from '../dist/index.js';

async function testSong() {
  const genius = new Genius({
    accessToken: process.env.GENIUS_ACCESS_TOKEN,
    verbose: true
  });

  try {
    console.log('🔍 Testing song search...');
    const song = await genius.searchSong('Shape of You', 'Ed Sheeran');
    
    if (song) {
      console.log(`✅ Found: ${song.title} by ${song.artist}`);
      console.log(`📝 Lyrics preview: ${song.lyrics.substring(0, 100)}...`);
    } else {
      console.log('❌ Song not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testSong();