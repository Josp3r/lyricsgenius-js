import fs from 'fs';
import path from 'path';
import { Genius } from '../../dist/index.js';
import { sanitizeFilename } from './helpers.js';

export async function downloadSong(genius, songId, outputDir = null, format = 'txt') {
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
    const baseDir = outputDir || path.join(process.cwd(), 'lyricsgenius');
    const artistName = sanitizeFilename(song.artist);
    const songTitle = sanitizeFilename(song.title);
    const extension = format === 'json' ? 'json' : 'txt';
    
    const artistDir = path.join(baseDir, artistName);
    outputFile = path.join(artistDir, `${songTitle}.${extension}`);
    
    // Create directories if they don't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    if (!fs.existsSync(artistDir)) {
      fs.mkdirSync(artistDir, { recursive: true });
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