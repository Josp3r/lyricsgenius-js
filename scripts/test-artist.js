// 测试艺术家搜索
import { Genius } from '../dist/index.js';

async function testArtist() {
  const genius = new Genius({
    accessToken: process.env.GENIUS_ACCESS_TOKEN,
    verbose: true
  });

  try {
    console.log('🔍 Testing artist search...');
    const artist = await genius.searchArtist('Taylor Swift', 3); // 只获取3首歌
    
    if (artist) {
      console.log(`✅ Found: ${artist.name}`);
      console.log(`🎵 Songs found: ${artist.numSongs}`);
      
      artist.songs.forEach((song, index) => {
        console.log(`${index + 1}. ${song.title}`);
      });
    } else {
      console.log('❌ Artist not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testArtist();