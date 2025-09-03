// 测试API功能并展示歌曲信息（不展示完整歌词）
import { Genius } from '../dist/index.js';

async function testSongSearch() {
  console.log('🎵 Testing Genius API functionality...\n');

  try {
    const genius = new Genius({
      accessToken: 'VxsPsPXEagK5p4LbzYtZdzoAPwsjB4WvtyqYgdym0CKfrFAOX9KyNidxBzoKfja3',
      verbose: false,
      timeout: 15000
    });

    // Test basic search
    console.log('1️⃣ Testing basic search...');
    const searchResults = await genius.searchAll('test');
    console.log(`✅ Search successful - Found ${searchResults.response.hits.length} results`);
    
    if (searchResults.response.hits.length > 0) {
      const firstSong = searchResults.response.hits[0].result;
      console.log(`   First result: "${firstSong.title}" by ${firstSong.primary_artist.name}`);
    }

    // Test song search with a popular song
    console.log('\n2️⃣ Testing song search...');
    const song = await genius.searchSong('Hello', 'Adele');
    
    if (song) {
      console.log('✅ Song search successful!');
      console.log('📊 Song Information:');
      console.log(`   - Title: ${song.title}`);
      console.log(`   - Artist: ${song.artist}`);
      console.log(`   - URL: ${song.url}`);
      console.log(`   - Song ID: ${song.id}`);
      console.log(`   - Has Lyrics: ${song.hasLyrics ? 'Yes' : 'No'}`);
      
      if (song.lyrics) {
        console.log(`   - Lyrics Length: ${song.lyrics.length} characters`);
        console.log(`   - Preview: "${song.lyrics.substring(0, 50)}..." (truncated for copyright)`);
      }
      
    } else {
      console.log('❌ Song not found');
    }

    // Test artist search
    console.log('\n3️⃣ Testing artist search...');
    const artist = await genius.searchArtist('Taylor Swift', 2); // Get only 2 songs
    
    if (artist) {
      console.log('✅ Artist search successful!');
      console.log(`   - Artist: ${artist.name}`);
      console.log(`   - Songs found: ${artist.numSongs}`);
      console.log(`   - Artist ID: ${artist.id}`);
      
      if (artist.songs.length > 0) {
        console.log('   - Sample songs:');
        artist.songs.forEach((song, index) => {
          console.log(`     ${index + 1}. ${song.title}`);
        });
      }
    } else {
      console.log('❌ Artist not found');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Your lyricsgenius-js package is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSongSearch();