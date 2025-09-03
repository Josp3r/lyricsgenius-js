// 艺术家搜索示例
import { Genius } from '../dist/index.js';

async function artistExample() {
  const token = process.env.GENIUS_ACCESS_TOKEN;
  
  if (!token) {
    console.error('Please set GENIUS_ACCESS_TOKEN environment variable');
    process.exit(1);
  }

  const genius = new Genius({
    accessToken: token,
    verbose: true
  });

  try {
    console.log('🎤 Searching for an artist...');
    
    // 搜索艺术家，获取前3首歌
    const artist = await genius.searchArtist('Taylor Swift', 3);
    
    if (artist) {
      console.log('✅ Artist found:');
      console.log(`   Name: ${artist.name}`);
      console.log(`   Songs found: ${artist.numSongs}`);
      console.log(`   Verified: ${artist.verified}`);
      
      console.log('\n🎵 Songs:');
      artist.songs.forEach((song, index) => {
        console.log(`   ${index + 1}. ${song.title}`);
      });
      
      // 保存为JSON文件
      console.log('\n💾 Saving artist data...');
      const artistData = artist.toJSON();
      
      // 注意：实际使用时需要import fs
      // const fs = require('fs');
      // fs.writeFileSync(`${artist.name.replace(/[^a-z0-9]/gi, '_')}.json`, 
      //   JSON.stringify(artistData, null, 2));
      
    } else {
      console.log('❌ Artist not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

artistExample();