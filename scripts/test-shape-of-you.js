// 测试Shape of You歌曲搜索功能
import { Genius } from '../dist/index.js';

async function testShapeOfYou() {
  console.log('🎵 Testing Shape of You song search...\n');

  try {
    const genius = new Genius({
      accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
      verbose: true,
      timeout: 15000
    });

    console.log('🔍 Searching for "Shape of You" by Ed Sheeran...');
    const song = await genius.searchSong('Shape of You', 'Ed Sheeran');

    if (song) {
      console.log('✅ Song found successfully!');
      console.log('📊 Song Information:');
      console.log(`   - Title: ${song.title}`);
      console.log(`   - Artist: ${song.artist}`);
      console.log(`   - Album: ${song.album || 'N/A'}`);
      console.log(`   - URL: ${song.url}`);
      console.log(`   - Release Date: ${song.releaseDate || 'N/A'}`);
      console.log(`   - Has Lyrics: ${song.hasLyrics ? 'Yes' : 'No'}`);
      console.log(`   - Lyrics State: ${song.lyricsState}`);
      
      if (song.lyrics) {
        console.log(`   - Lyrics Length: ${song.lyrics.length} characters`);
        console.log(`   - First 100 characters: "${song.lyrics.substring(0, 100)}..."`);
      }
      
      console.log('\n🎯 API Response Data Sample:');
      console.log(`   - Song ID: ${song.data.id}`);
      console.log(`   - Primary Artist ID: ${song.data.primary_artist.id}`);
      console.log(`   - Song Art: ${song.data.song_art_image_url ? 'Available' : 'N/A'}`);
      
    } else {
      console.log('❌ Song not found or access denied');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   - Check your internet connection');
    console.log('   - Verify your VPN is working');
    console.log('   - Confirm your Genius API token is valid');
  }
}

testShapeOfYou();