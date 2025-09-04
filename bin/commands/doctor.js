import inquirer from 'inquirer';
import { Genius } from '../../dist/index.js';
import { loadConfig } from '../utils/config.js';

class LyricsGeniusDoctor {
  constructor() {
    this.token = null;
    this.testResults = {};
  }

  async start() {
    console.log('🩺 LyricsGenius-JS Doctor');
    console.log('   Diagnostic and testing tool for lyricsgenius-js\n');

    // Check for token
    await this.checkToken();

    while (true) {
      const action = await this.showMenu();
      
      switch (action) {
        case 'diagnose':
          await this.runDiagnostics();
          break;
        case 'test-connection':
          await this.testConnection();
          break;
        case 'test-search':
          await this.testSearch();
          break;
        case 'test-proxy':
          await this.testProxy();
          break;
        case 'exit':
          console.log('👋 Goodbye!');
          process.exit(0);
      }

      const continueAnswer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Continue with another action?',
          default: true
        }
      ]);

      if (!continueAnswer.continue) break;
    }
  }

  async checkToken() {
    this.token = process.env.GENIUS_ACCESS_TOKEN || 
                 loadConfig().accessToken ||
                 null;

    if (!this.token) {
      console.log('⚠️  No Genius API token found');
      console.log('   You can set it via:');
      console.log('   - Running "lyricsgenius init"');
      console.log('   - Environment variable: GENIUS_ACCESS_TOKEN\n');
    } else {
      console.log('✅ API token found\n');
    }
  }

  async showMenu() {
    const choices = [
      {
        name: '🩺 Run full diagnostics',
        value: 'diagnose',
        short: 'Diagnose'
      },
      {
        name: '🔌 Test API connection',
        value: 'test-connection',
        short: 'Connection'
      },
      {
        name: '🔍 Test search functionality',
        value: 'test-search',
        short: 'Search'
      },
      {
        name: '🌐 Test proxy configuration',
        value: 'test-proxy',
        short: 'Proxy'
      },
      new inquirer.Separator(),
      {
        name: '❌ Exit',
        value: 'exit',
        short: 'Exit'
      }
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices,
        pageSize: 12
      }
    ]);

    return answer.action;
  }

  async testConnection() {
    if (!this.token) {
      console.log('❌ No token available. Please set a token first.');
      return;
    }

    console.log('🔌 Testing API connection...\n');

    try {
      const genius = new Genius({
        accessToken: this.token,
        timeout: 10000,
        verbose: false
      });

      const result = await genius.searchAll('test');
      console.log('✅ Connection successful!');
      console.log(`📊 Status: ${result.meta.status}`);
      console.log(`🔍 Results: ${result.response.hits.length} hits`);
      
      this.testResults.connection = true;
      
    } catch (error) {
      console.log('❌ Connection failed:', error.message);
      this.testResults.connection = false;
    }
  }

  async testSearch() {
    if (!this.token) {
      console.log('❌ No token available. Please set a token first.');
      return;
    }

    console.log('🔍 Testing search functionality...\n');

    try {
      const genius = new Genius({
        accessToken: this.token,
        timeout: 10000,
        verbose: false
      });

      const searchResult = await genius.searchAll('hello world');
      console.log('✅ Basic search: OK');

      if (searchResult.response.hits.length > 0) {
        const firstSong = searchResult.response.hits[0].result;
        console.log(`   First result: "${firstSong.title}" by ${firstSong.primary_artist.name}`);

        // Test song details
        const songDetails = await genius.song(firstSong.id);
        console.log('✅ Song details API: OK');
        console.log(`   Lyrics state: ${songDetails.response.song.lyrics_state}`);
      }

      this.testResults.search = true;

    } catch (error) {
      console.log('❌ Search test failed:', error.message);
      this.testResults.search = false;
    }
  }

  async testProxy() {
    console.log('🌐 Testing proxy configuration...\n');

    // Test different proxy configurations
    const proxyConfigs = [
      { name: 'Auto-detect', config: null },
      { name: 'SOCKS 127.0.0.1:7890', config: { host: '127.0.0.1', port: 7890, type: 'socks' } },
      { name: 'HTTP 127.0.0.1:7890', config: { host: '127.0.0.1', port: 7890, type: 'http' } }
    ];

    for (const { name, config } of proxyConfigs) {
      try {
        console.log(`Testing ${name}...`);
        
        const genius = new Genius({
          accessToken: this.token || 'dummy-token',
          timeout: 5000,
          verbose: false,
          ...(config && { proxy: config })
        });

        await genius.searchAll('test');
        console.log(`✅ ${name}: Working`);
        break;

      } catch (error) {
        console.log(`❌ ${name}: ${error.message}`);
      }
    }
  }

  async runDiagnostics() {
    console.log('🩺 Running full diagnostics...\n');

    // Environment check
    console.log('1️⃣ Environment Check:');
    console.log(`   - Node.js: ${process.version}`);
    console.log(`   - Platform: ${process.platform}`);
    console.log(`   - Token: ${this.token ? 'Available' : 'Missing'}`);

    // Network tests
    console.log('\n2️⃣ Network Tests:');
    await this.testConnection();
    await this.testProxy();

    // API tests
    console.log('\n3️⃣ API Tests:');
    await this.testSearch();

    // Summary
    console.log('\n📊 Diagnostic Summary:');
    const passed = Object.values(this.testResults).filter(Boolean).length;
    const total = Object.keys(this.testResults).length;
    console.log(`   Tests passed: ${passed}/${total}`);
    
    if (passed === total) {
      console.log('   🎉 All systems operational!');
    } else {
      console.log('   ⚠️  Some issues detected. Check the logs above.');
    }
  }
}

export function setupDoctorCommand(program) {
  program
    .command('doctor')
    .alias('doc')
    .description('Run diagnostic tests')
    .action(async () => {
      await new LyricsGeniusDoctor().start();
    });
}