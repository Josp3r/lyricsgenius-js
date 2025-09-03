// 基础使用示例
import { Genius } from '../dist/index.js';

async function basicExample() {
  // 从环境变量获取token
  const token = process.env.GENIUS_ACCESS_TOKEN;
  
  if (!token) {
    console.error('Please set GENIUS_ACCESS_TOKEN environment variable');
    console.log('Get your token from: https://genius.com/api-clients');
    process.exit(1);
  }

  const genius = new Genius({
    accessToken: token,
    verbose: true,
    timeout: 10000
  });

  try {
    console.log('🔍 Searching for a song...');
    
    // 搜索歌曲
    const song = await genius.searchSong('Hello', 'Adele');
    
    if (song) {
      console.log('✅ Song found:');
      console.log(`   Title: ${song.title}`);
      console.log(`   Artist: ${song.artist}`);
      console.log(`   URL: ${song.url}`);
      console.log(`   Lyrics available: ${song.hasLyrics}`);
      
      // 只显示歌词片段（出于版权考虑）
      if (song.lyrics) {
        console.log(`   Lyrics preview: "${song.lyrics.substring(0, 100)}..."`);
      }
    } else {
      console.log('❌ Song not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

basicExample();