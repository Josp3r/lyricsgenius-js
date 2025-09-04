import inquirer from 'inquirer';
import { Genius } from '../../dist/index.js';
import { getAccessToken, loadConfig, resolveOutputPath } from '../utils/config.js';
import { downloadSong } from '../utils/download.js';

export function setupSearchCommand(program) {
  program
    .command('search <query>')
    .alias('s')
    .description('Search for songs and download interactively')
    .option('-l, --limit <number>', 'Maximum number of results', '10')
    .action(async (query, options) => {
      try {
        const accessToken = await getAccessToken();
        const genius = new Genius({ accessToken, verbose: true });

        console.log(`🔍 Searching for "${query}"\n`);

        const response = await genius.searchAll(query);
        const hits = response.response.hits;
        const limit = parseInt(options.limit);

        if (!hits || hits.length === 0) {
          console.log('No results found.');
          return;
        }

        // Filter only songs and limit results
        const songHits = hits
          .filter(hit => hit.index === 'song' || !hit.index) // Keep songs or items without index
          .slice(0, limit);

        if (songHits.length === 0) {
          console.log('No songs found.');
          return;
        }

        console.log(`Found ${songHits.length} songs:\n`);

        // Create choices for inquirer
        const choices = songHits.map((hit, index) => {
          const song = hit.result;
          const title = song.full_title || `${song.title} - ${song.primary_artist?.name || 'Unknown Artist'}`;
          return {
            name: `${index + 1}. ${title}`,
            value: {
              id: song.id,
              title: song.title,
              artist: song.primary_artist?.name || 'Unknown Artist',
              url: song.url
            },
            short: title
          };
        });

        // Add option to exit without downloading
        choices.push(new inquirer.Separator(), {
          name: '❌ Cancel (don\'t download)',
          value: null,
          short: 'Cancel'
        });

        // Let user select a song
        const songAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'selectedSong',
            message: 'Select a song to download:',
            choices,
            pageSize: 15
          }
        ]);

        if (!songAnswer.selectedSong) {
          console.log('👋 Cancelled.');
          return;
        }

        const selectedSong = songAnswer.selectedSong;
        console.log(`\n📥 Preparing to download: ${selectedSong.title} by ${selectedSong.artist}`);

        // Load config to check for outputPath template
        const config = loadConfig();
        let defaultDir = './lyricsgenius';
        let promptMessage = 'Enter download directory (press Enter for default: ./lyricsgenius):';
        
        if (config.outputPath) {
          // Resolve template with selected song data
          const resolvedPath = resolveOutputPath(config.outputPath, selectedSong);
          defaultDir = resolvedPath;
          promptMessage = `Enter download directory (press Enter for configured: ${resolvedPath}):`;
        }

        // Ask for download directory
        const dirAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'downloadDir',
            message: promptMessage,
            default: defaultDir
          }
        ]);

        // Ask for format
        const formatAnswer = await inquirer.prompt([
          {
            type: 'list',
            name: 'format',
            message: 'Select output format:',
            choices: [
              { name: 'Text (.txt)', value: 'txt' },
              { name: 'JSON (.json)', value: 'json' }
            ],
            default: 'txt'
          }
        ]);

        // Download the song
        console.log(`\n📥 Downloading lyrics...`);
        
        // Check if we should skip adding artist directory
        // If the user accepted the template-resolved path, don't add artist subdir
        const shouldSkipArtistDir = config.outputPath && (dirAnswer.downloadDir === defaultDir);
        
        const result = await downloadSong(
          genius, 
          selectedSong.id, 
          dirAnswer.downloadDir,
          formatAnswer.format,
          shouldSkipArtistDir
        );

        if (result) {
          console.log(`\n🎉 Download completed successfully!`);
        } else {
          console.log(`\n❌ Download failed.`);
        }

      } catch (error) {
        console.error('❌ Search failed:', error.message);
        process.exit(1);
      }
    });
}