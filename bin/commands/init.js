import inquirer from 'inquirer';
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
}