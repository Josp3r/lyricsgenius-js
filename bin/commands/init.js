import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { saveConfig, configFile } from '../utils/config.js';

export function setupInitCommand(program) {
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
        },
        {
          type: 'confirm',
          name: 'saveLocally',
          message: 'Save configuration to current directory? (creates lyricsgenius.config.json)',
          default: false
        }
      ]);

      const config = {
        accessToken: answers.accessToken.trim()
      };

      if (answers.saveLocally) {
        // Ask for output path when creating local config
        const localConfigAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'outputPath',
            message: 'Enter output path template:',
            default: './music/{{artist}}',
            validate: (input) => {
              if (!input || input.trim().length === 0) {
                return 'Output path is required';
              }
              return true;
            }
          }
        ]);

        // Create complete local config
        const localConfig = {
          outputPath: localConfigAnswers.outputPath.trim(),
          accessToken: config.accessToken
        };

        // Save to current directory
        const localConfigPath = path.join(process.cwd(), 'lyricsgenius.config.json');
        
        try {
          fs.writeFileSync(localConfigPath, JSON.stringify(localConfig, null, 2));
          console.log('✅ Local configuration saved successfully!');
          console.log(`📁 Config stored at: ${localConfigPath}`);
          console.log(`🎯 Output path template: ${localConfig.outputPath}`);
        } catch (error) {
          console.error('❌ Failed to save local configuration:', error.message);
          process.exit(1);
        }
      } else {
        // Save to global configuration (original behavior)
        if (saveConfig(config)) {
          console.log('✅ Global configuration saved successfully!');
          console.log(`🌍 Config stored at: ${configFile}`);
        } else {
          console.error('❌ Failed to save configuration');
          process.exit(1);
        }
      }
    });
}