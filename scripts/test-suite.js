// 完整的集成测试套件
import { Genius } from '../dist/index.js';

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  addTest(name, testFn, requiresNetwork = false) {
    this.tests.push({ name, testFn, requiresNetwork });
  }

  async runAll() {
    console.log('🧪 Running lyricsgenius-js test suite\n');
    
    for (const test of this.tests) {
      try {
        console.log(`▶️  ${test.name}`);
        
        if (test.requiresNetwork && !process.env.GENIUS_ACCESS_TOKEN) {
          console.log('   ⏭️  Skipped (no token or network)');
          this.results.skipped++;
          continue;
        }
        
        await test.testFn();
        console.log('   ✅ Passed\n');
        this.results.passed++;
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
        this.results.failed++;
      }
    }
    
    this.printSummary();
  }

  printSummary() {
    console.log('📊 Test Results:');
    console.log(`   ✅ Passed: ${this.results.passed}`);
    console.log(`   ❌ Failed: ${this.results.failed}`);
    console.log(`   ⏭️  Skipped: ${this.results.skipped}`);
    
    const total = this.results.passed + this.results.failed;
    if (total > 0) {
      const successRate = (this.results.passed / total * 100).toFixed(1);
      console.log(`   📈 Success Rate: ${successRate}%`);
    }
  }
}

// 创建测试实例
const runner = new TestRunner();

// 离线测试
runner.addTest('Class instantiation', async () => {
  const genius = new Genius({ accessToken: 'test', verbose: false });
  if (!genius) throw new Error('Failed to create instance');
});

runner.addTest('Song class creation', async () => {
  const { Song } = await import('./dist/index.js');
  const song = new Song('test lyrics', {
    id: 1,
    title: 'Test',
    url: 'test',
    path: 'test',
    lyrics_state: 'complete',
    primary_artist: { id: 1, name: 'Test Artist', url: 'test' }
  });
  
  if (song.title !== 'Test') throw new Error('Wrong title');
  if (!song.hasLyrics) throw new Error('Should have lyrics');
});

runner.addTest('Artist class creation', async () => {
  const { Artist } = await import('./dist/index.js');
  const artist = new Artist({
    id: 1,
    name: 'Test Artist',
    url: 'test'
  });
  
  if (artist.name !== 'Test Artist') throw new Error('Wrong name');
  if (artist.numSongs !== 0) throw new Error('Should have 0 songs initially');
});

runner.addTest('Album class creation', async () => {
  const { Album } = await import('./dist/index.js');
  const album = new Album({
    id: 1,
    name: 'Test Album',
    url: 'test',
    full_title: 'Test Album by Test Artist',
    artist: { id: 1, name: 'Test Artist', url: 'test' }
  });
  
  if (album.name !== 'Test Album') throw new Error('Wrong album name');
  if (album.numTracks !== 0) throw new Error('Should have 0 tracks initially');
});

// 网络测试（需要token和网络连接）
runner.addTest('API Search (requires network)', async () => {
  const genius = new Genius({
    accessToken: process.env.GENIUS_ACCESS_TOKEN,
    verbose: false,
    timeout: 10000
  });
  
  const result = await genius.searchAll('test');
  if (result.meta.status !== 200) throw new Error('API call failed');
}, true);

runner.addTest('Song search (requires network)', async () => {
  const genius = new Genius({
    accessToken: process.env.GENIUS_ACCESS_TOKEN,
    verbose: false,
    timeout: 10000
  });
  
  const song = await genius.searchSong('Shape of You', 'Ed Sheeran');
  if (!song) throw new Error('Song not found');
  if (!song.title.includes('Shape')) throw new Error('Wrong song returned');
}, true);

// 运行所有测试
runner.runAll().catch(console.error);