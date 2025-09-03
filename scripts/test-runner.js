import inquirer from 'inquirer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class TestManager {
  constructor() {
    this.testsDir = './tests';
    this.tests = this.loadTests();
  }

  loadTests() {
    const testFiles = fs.readdirSync(this.testsDir)
      .filter(file => file.startsWith('test-') && file.endsWith('.js'))
      .sort();

    return testFiles.map(file => {
      const name = file.replace('test-', '').replace('.js', '');
      const description = this.getTestDescription(file);
      const requiresNetwork = this.checkIfRequiresNetwork(file);
      
      return {
        name: `${name} ${requiresNetwork ? '🌐' : '📱'}`,
        value: file,
        description,
        requiresNetwork,
        path: path.join(this.testsDir, file)
      };
    });
  }

  getTestDescription(filename) {
    const descriptions = {
      'test-basic.js': 'Basic API connectivity test',
      'test-song.js': 'Song search functionality test', 
      'test-artist.js': 'Artist search functionality test',
      'test-connection.js': 'Simple connection test',
      'test-configs.js': 'Test different network configurations',
      'test-offline.js': 'Offline code structure validation',
      'test-mock.js': 'Mock data business logic test',
      'test-suite.js': 'Complete test suite runner'
    };
    return descriptions[filename] || 'Test file';
  }

  checkIfRequiresNetwork(filename) {
    const networkTests = ['basic', 'song', 'artist', 'connection', 'configs'];
    return networkTests.some(test => filename.includes(test));
  }

  async runTest(testFile) {
    return new Promise((resolve, reject) => {
      console.log(`\n🚀 Running: ${testFile}\n`);
      console.log('─'.repeat(50));
      
      const testProcess = spawn('node', [path.join(this.testsDir, testFile)], {
        stdio: 'inherit',
        env: { ...process.env }
      });

      testProcess.on('close', (code) => {
        console.log('─'.repeat(50));
        if (code === 0) {
          console.log(`✅ Test completed successfully\n`);
          resolve(code);
        } else {
          console.log(`❌ Test failed with code: ${code}\n`);
          resolve(code);
        }
      });

      testProcess.on('error', (error) => {
        console.error(`❌ Failed to run test: ${error.message}`);
        reject(error);
      });
    });
  }

  async showMenu() {
    console.log('🧪 LyricsGenius-JS Test Manager\n');
    
    // 检查是否有token
    const hasToken = !!process.env.GENIUS_ACCESS_TOKEN;
    if (!hasToken) {
      console.log('⚠️  No GENIUS_ACCESS_TOKEN found in environment');
      console.log('   Network tests will be skipped or may fail\n');
    } else {
      console.log('✅ GENIUS_ACCESS_TOKEN found\n');
    }

    const choices = [
      ...this.tests,
      new inquirer.Separator(),
      {
        name: '🏃‍♂️ Run all offline tests',
        value: 'all-offline',
        description: 'Run all tests that don\'t require network'
      },
      {
        name: '🌐 Run all network tests',
        value: 'all-network', 
        description: 'Run all tests that require network connection'
      },
      {
        name: '🎯 Run complete test suite',
        value: 'all',
        description: 'Run the comprehensive test suite'
      },
      new inquirer.Separator(),
      {
        name: '🔧 Set GENIUS_ACCESS_TOKEN',
        value: 'set-token',
        description: 'Set or update your API token'
      },
      {
        name: '❌ Exit',
        value: 'exit'
      }
    ];

    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices,
        pageSize: 15
      }
    ]);

    return answer.action;
  }

  async setToken() {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'token',
        message: 'Enter your Genius API access token:',
        validate: (input) => input.length > 0 || 'Token cannot be empty'
      }
    ]);

    process.env.GENIUS_ACCESS_TOKEN = answer.token;
    console.log('✅ Token set for this session\n');
  }

  async runMultipleTests(testFiles) {
    const results = [];
    
    for (const testFile of testFiles) {
      try {
        const code = await this.runTest(testFile);
        results.push({ testFile, success: code === 0 });
      } catch (error) {
        results.push({ testFile, success: false, error: error.message });
      }
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('─'.repeat(50));
    
    let passed = 0;
    results.forEach(({ testFile, success, error }) => {
      const status = success ? '✅' : '❌';
      console.log(`${status} ${testFile}`);
      if (error) console.log(`   Error: ${error}`);
      if (success) passed++;
    });
    
    console.log('─'.repeat(50));
    console.log(`📈 ${passed}/${results.length} tests passed\n`);
  }

  async start() {
    while (true) {
      try {
        const action = await this.showMenu();

        switch (action) {
          case 'exit':
            console.log('👋 Goodbye!');
            process.exit(0);
            
          case 'set-token':
            await this.setToken();
            break;
            
          case 'all-offline':
            const offlineTests = this.tests
              .filter(t => !t.requiresNetwork)
              .map(t => t.value);
            await this.runMultipleTests(offlineTests);
            break;
            
          case 'all-network':
            const networkTests = this.tests
              .filter(t => t.requiresNetwork)
              .map(t => t.value);
            await this.runMultipleTests(networkTests);
            break;
            
          case 'all':
            await this.runTest('test-suite.js');
            break;
            
          default:
            await this.runTest(action);
        }

        // Ask if user wants to continue
        const continueAnswer = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Run another test?',
            default: true
          }
        ]);

        if (!continueAnswer.continue) {
          console.log('👋 Goodbye!');
          break;
        }

      } catch (error) {
        console.error('❌ Error:', error.message);
        break;
      }
    }
  }
}

// Start the test manager
const manager = new TestManager();
manager.start().catch(console.error);