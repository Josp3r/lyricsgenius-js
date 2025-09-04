import fs from 'fs';
import path from 'path';
import { Genius } from '../../dist/index.js';
import { getAccessToken, loadConfig, resolveOutputPath } from '../utils/config.js';
import { downloadSong } from '../utils/download.js';

export function setupDownloadCommand(program) {
  program
    .command('download <songId>')
    .alias('dl')
    .description('Download lyrics for a specific song')
    .option('-o, --output <directory>', 'Output directory path')
    .option('-f, --format <format>', 'Output format: txt, json', 'txt')
    .action(async (songId, options) => {
      try {
        const accessToken = await getAccessToken();
        const genius = new Genius({ accessToken, verbose: true });

        console.log(`📥 Downloading song ID: ${songId}\n`);

        // Handle custom output directory logic if provided
        let outputDir = null;
        if (options.output) {
          const outputPath = options.output;
          
          // Check if it's meant to be a specific file path (has extension)
          if (path.extname(outputPath)) {
            // Handle as specific file path (legacy behavior)
            const song = await genius.searchSong(undefined, undefined, parseInt(songId));
            if (!song) {
              console.log('❌ Song not found or has no lyrics');
              return;
            }

            console.log(`✅ Found: ${song.title} by ${song.artist}`);

            let output;
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

            // Check if this is a template path
            const config = loadConfig();
            let finalOutputPath = outputPath;
            if (config.outputPath && !options.output) {
              // If no command line output specified, but we have a template, use it
              finalOutputPath = resolveOutputPath(config.outputPath, song);
              if (!path.extname(finalOutputPath)) {
                finalOutputPath = path.join(finalOutputPath, path.basename(outputPath));
              }
            }

            // Ensure parent directory exists
            const parentDir = path.dirname(finalOutputPath);
            if (!fs.existsSync(parentDir)) {
              fs.mkdirSync(parentDir, { recursive: true });
            }

            fs.writeFileSync(finalOutputPath, output, 'utf8');
            console.log(`💾 Lyrics saved to: ${finalOutputPath}`);
            return;
          } else {
            // Use as directory
            outputDir = outputPath;
          }
        }

        // Use the downloadSong utility function
        const result = await downloadSong(genius, songId, outputDir, options.format);
        
        if (!result) {
          process.exit(1);
        }

      } catch (error) {
        console.error('❌ Download failed:', error.message);
        process.exit(1);
      }
    });
}