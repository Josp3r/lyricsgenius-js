import fs from 'fs';
import path from 'path';
import { sanitizeFilename } from './helpers.js';
import { loadConfig, resolveOutputPath } from './config.js';

export async function downloadSong(genius, songId, outputDir = null, format = 'txt', skipArtistDir = false) {
  try {
    const song = await genius.searchSong(undefined, undefined, parseInt(songId));

    if (!song) {
      console.log(`❌ Song ID ${songId} not found or has no lyrics`);
      return null;
    }

    console.log(`✅ Found: ${song.title} by ${song.artist}`);

    // Prepare output
    let output;
    if (format === 'json') {
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
    let outputFile;
    let baseDir;
    
    // Check if outputDir is provided via command line option
    if (outputDir) {
      baseDir = outputDir;
      const songTitle = sanitizeFilename(song.title);
      const extension = format === 'json' ? 'json' : 'txt';
      
      if (skipArtistDir) {
        // Don't add artist subdirectory (template already resolved it)
        outputFile = path.join(baseDir, `${songTitle}.${extension}`);
      } else {
        // Add artist subdirectory (traditional behavior)
        const artistName = sanitizeFilename(song.artist);
        const artistDir = path.join(baseDir, artistName);
        outputFile = path.join(artistDir, `${songTitle}.${extension}`);
      }
    } else {
      // Load config to check for outputPath template
      const config = loadConfig();
      const outputPathTemplate = config.outputPath;
      
      if (outputPathTemplate) {
        // Use template-based path
        const resolvedPath = resolveOutputPath(outputPathTemplate, song);
        const extension = format === 'json' ? 'json' : 'txt';
        const songTitle = sanitizeFilename(song.title);
        
        // If resolved path ends with a directory separator or doesn't have an extension,
        // treat it as a directory and append the song filename
        if (resolvedPath.endsWith('/') || resolvedPath.endsWith('\\') || !path.extname(resolvedPath)) {
          outputFile = path.join(resolvedPath, `${songTitle}.${extension}`);
        } else {
          // If the resolved path looks like a full file path, use it directly
          const parsedPath = path.parse(resolvedPath);
          outputFile = path.join(parsedPath.dir, `${parsedPath.name}.${extension}`);
        }
      } else {
        // Fallback to default behavior
        baseDir = path.join(process.cwd(), 'lyricsgenius');
        const artistName = sanitizeFilename(song.artist);
        const songTitle = sanitizeFilename(song.title);
        const extension = format === 'json' ? 'json' : 'txt';
        const artistDir = path.join(baseDir, artistName);
        outputFile = path.join(artistDir, `${songTitle}.${extension}`);
      }
    }
    
    // Create directories if they don't exist
    const outputDirectory = path.dirname(outputFile);
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    // Write file
    fs.writeFileSync(outputFile, output, 'utf8');
    console.log(`💾 Lyrics saved to: ${outputFile}`);
    
    return outputFile;

  } catch (error) {
    console.error(`❌ Download failed for song ID ${songId}:`, error.message);
    return null;
  }
}