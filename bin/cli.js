#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import { Genius } from '../dist/index.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const program = new Command();
const configDir = path.join(os.homedir(), '.lyricsgenius');
const configFile = path.join(configDir, 'config.json');

// Ensure config directory exists
function ensureConfigDir() {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    return true;
  } catch (error) {
    console.warn(`Warning: Could not create config directory: ${error.message}`);
    return false;
  }
}

// Load config
function loadConfig() {
  try {
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading config:', error.message);
  }
  return {};
}

// Save config
function saveConfig(config) {
  try {
    if (!ensureConfigDir()) {
      return false;
    }
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error.message);
    return false;
  }
}

// Get access token from config or prompt
async function getAccessToken() {
  const config = loadConfig();
  if (config.accessToken) {
    return config.accessToken;
  }
  
  console.log('No access token found. Please run "lyricsgenius init" first.');
  process.exit(1);
}

// Sanitize filename for filesystem compatibility
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .slice(0, 200); // Limit length
}

program
  .name('lyricsgenius')
  .description('A TypeScript/Node.js client for the Genius.com API')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize and configure access token')
  .action(async () => {
    console.log('🎵 LyricsGenius-JS Configuration\n');
    
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'accessToken',
        message: 'Enter your Genius API access token:',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Access token is required';
          }
          return true;
        }
      }
    ]);

    const config = {
      accessToken: answers.accessToken.trim()
    };

    if (saveConfig(config)) {
      console.log('✅ Configuration saved successfully!');
      console.log(`Config stored at: ${configFile}`);
    } else {
      console.error('❌ Failed to save configuration');
      process.exit(1);
    }
  });

// Search command
program
  .command('search <query>')
  .description('Search for songs, artists, or albums')
  .option('-t, --type <type>', 'Search type: song, artist, album', 'song')
  .option('-l, --limit <number>', 'Maximum number of results', '10')
  .action(async (query, options) => {
    try {
      const accessToken = await getAccessToken();
      const genius = new Genius({ accessToken, verbose: true });

      console.log(`🔍 Searching for "${query}" (type: ${options.type})\n`);

      const response = await genius.searchAll(query);
      const hits = response.response.hits;
      const limit = parseInt(options.limit);

      if (!hits || hits.length === 0) {
        console.log('No results found.');
        return;
      }

      // Filter by type if specified
      let filteredHits = hits;
      if (options.type !== 'all') {
        filteredHits = hits.filter(hit => hit.index === options.type);
      }

      // Limit results
      const limitedHits = filteredHits.slice(0, limit);

      console.log(`Found ${limitedHits.length} results:\n`);

      limitedHits.forEach((hit, index) => {
        const item = hit.result;
        console.log(`${index + 1}. ${item.full_title || item.title || item.name}`);
        if (item.primary_artist) {
          console.log(`   Artist: ${item.primary_artist.name}`);
        }
        if (item.id) {
          console.log(`   ID: ${item.id}`);
        }
        console.log(`   URL: ${item.url}`);
        console.log('');
      });

    } catch (error) {
      console.error('❌ Search failed:', error.message);
      process.exit(1);
    }
  });

// Download command
program
  .command('download <songId>')
  .description('Download lyrics for a specific song')
  .option('-o, --output <file>', 'Output file path')
  .option('-f, --format <format>', 'Output format: txt, json', 'txt')
  .action(async (songId, options) => {
    try {
      const accessToken = await getAccessToken();
      const genius = new Genius({ accessToken, verbose: true });

      console.log(`📥 Downloading song ID: ${songId}\n`);

      const song = await genius.searchSong(undefined, undefined, parseInt(songId));

      if (!song) {
        console.log('❌ Song not found or has no lyrics');
        return;
      }

      console.log(`✅ Found: ${song.title} by ${song.artist}`);

      // Prepare output
      let output;
      let outputFile;
      
      if (options.format === 'json') {
        output = JSON.stringify({
          id: song.id,
          title: song.title,
          artist: song.artist,
          url: song.url,
          lyrics: song.lyrics
        }, null, 2);
      } else {
        output = `${song.title} - ${song.artist}\n${'='.repeat(50)}\n\n${song.lyrics}`;
      }

      // Determine output file path
      if (options.output) {
        const outputPath = options.output;
        
        // Check if output is a directory path (ends with separator or exists as directory)
        const endsWithSeparator = outputPath.endsWith('/') || outputPath.endsWith('\\');
        const isExistingDirectory = fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory();
        const hasNoExtension = !path.extname(outputPath);
        
        if (endsWithSeparator || isExistingDirectory || (hasNoExtension && !outputPath.includes('.'))) {
          // Treat as base directory, create artist/song structure underneath
          const baseDir = outputPath.replace(/[/\\]+$/, ''); // Remove trailing separators
          const artistName = sanitizeFilename(song.artist);
          const songTitle = sanitizeFilename(song.title);
          const extension = options.format === 'json' ? 'json' : 'txt';
          
          const artistDir = path.join(baseDir, artistName);
          outputFile = path.join(artistDir, `${songTitle}.${extension}`);
          
          // Create directories if they don't exist
          if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
          }
          if (!fs.existsSync(artistDir)) {
            fs.mkdirSync(artistDir, { recursive: true });
          }
        } else {
          // Use as complete file path
          outputFile = outputPath;
          
          // Ensure parent directory exists
          const parentDir = path.dirname(outputPath);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }
        }
      } else {
        // Create structured folder layout: ./lyricsgenius/{artist}/{song}.{ext}
        const baseDir = path.join(process.cwd(), 'lyricsgenius');
        const artistName = sanitizeFilename(song.artist);
        const songTitle = sanitizeFilename(song.title);
        const extension = options.format === 'json' ? 'json' : 'txt';
        
        const artistDir = path.join(baseDir, artistName);
        outputFile = path.join(artistDir, `${songTitle}.${extension}`);
        
        // Create directories if they don't exist
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true });
        }
        if (!fs.existsSync(artistDir)) {
          fs.mkdirSync(artistDir, { recursive: true });
        }
      }

      // Write file
      fs.writeFileSync(outputFile, output, 'utf8');
      console.log(`💾 Lyrics saved to: ${outputFile}`);

    } catch (error) {
      console.error('❌ Download failed:', error.message);
      process.exit(1);
    }
  });

// Doctor command
program
  .command('doctor')
  .description('Run diagnostic tests')
  .action(async () => {
    await new LyricsGeniusDoctor().start();
  });

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

program.parse();