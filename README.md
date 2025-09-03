# lyricsgenius-js

A TypeScript/Node.js client for the Genius.com API 🎶🎤

This is a TypeScript port of the popular Python [lyricsgenius](https://github.com/johnwmillr/LyricsGenius) library, providing access to song lyrics, artist information, and albums from Genius.com.

## Quick Start

### Install the package
```bash
npm install lyricsgenius-js

# Or install globally to use CLI commands
npm install -g lyricsgenius-js
```

### Set up your API token
1. Get your token from [Genius API](https://genius.com/api-clients)
2. Configure it using the CLI:

```bash
lyricsgenius init
```

## CLI Usage

The package includes a powerful CLI tool with several commands:

### Initialize Configuration
```bash
lyricsgenius init
```
Sets up your API token and saves it to `~/.lyricsgenius/config.json`

### Search
```bash
# Search for songs (default)
lyricsgenius search "Shape of You"

# Search for artists
lyricsgenius search -t artist "Ed Sheeran" -l 5

# Search for albums  
lyricsgenius search -t album "Divide" -l 3
```

### Download Lyrics
```bash
# Download to structured folders: ./lyricsgenius/{artist}/{song}.txt
lyricsgenius download 1234567

# Download to custom location (maintains artist/song structure)
lyricsgenius download 1234567 -o ~/Music/

# Download to specific file
lyricsgenius download 1234567 -o my-song.txt

# Download as JSON format
lyricsgenius download 1234567 -f json
```

### Diagnostics
```bash
lyricsgenius doctor
```
Runs comprehensive tests including:
- 🔌 API connection testing
- 🔍 Search functionality verification  
- 🌐 Proxy configuration testing
- 🩺 Full system diagnostics

## API Token Setup

You can set your API token using several methods:

**CLI Configuration (Recommended):**
```bash
lyricsgenius init
```

**Environment Variable:**
```bash
export GENIUS_ACCESS_TOKEN="your_token_here"
```

**Programmatically:**
```javascript
const genius = new Genius({ accessToken: 'your_token_here' });
```

## Programmatic Usage

### Basic Usage

```typescript
import { Genius } from 'lyricsgenius-js';

// Initialize with access token
const genius = new Genius({ accessToken: 'your_access_token_here' });

// Or use environment variable GENIUS_ACCESS_TOKEN
const genius = new Genius();
```

### Search for Songs

```typescript
// Search for a specific song
const song = await genius.searchSong('Song Title', 'Artist Name');
if (song) {
  console.log(song.title);
  console.log(song.artist);
  console.log(song.lyrics);
}
```

### Search for Artists

```typescript
// Search for an artist and get their songs
const artist = await genius.searchArtist('Artist Name', 5); // Get 5 songs max
if (artist) {
  console.log(`Found ${artist.numSongs} songs by ${artist.name}`);
  for (const song of artist.songs) {
    console.log(`- ${song.title}`);
  }
}
```

### Search for Albums

```typescript
// Search for an album by ID (album name search no longer supported by API)
const album = await genius.searchAlbum(12345);
if (album) {
  console.log(`Album: ${album.name} by ${album.artistName}`);
  console.log(`Tracks: ${album.numTracks}`);
  
  // Save album data to JSON file
  album.saveLyrics();
}
```

### Configuration Options

```typescript
const genius = new Genius({
  accessToken: 'your_token',
  verbose: false,                    // Turn off status messages
  removeSectionHeaders: true,        // Remove [Chorus], [Verse] etc from lyrics
  skipNonSongs: false,              // Include non-song results
  excludedTerms: ['Remix', 'Live'], // Skip songs with these terms
  timeout: 10000,                   // Request timeout in ms
  retries: 2                        // Number of retries on failure
});
```

## Development

```bash
npm install          # Install dependencies
npm run build       # Compile TypeScript
npm run dev         # Watch mode for development
npm run doctor      # Run diagnostic tool
```

## Examples

Run the included examples:

```bash
# Basic song search
npm run example:basic

# Artist search with multiple songs
npm run example:artist

# Proxy configuration examples
npm run example:proxy
```

Or check the `examples/` directory for code samples.

## Features

- **Full TypeScript Support**: Complete type definitions for all API responses
- **Promise-based API**: Modern async/await syntax
- **Configurable**: Extensive options for customizing behavior
- **Rate limiting**: Built-in request throttling and retry logic
- **OAuth2 Support**: Complete OAuth2 flow implementation
- **Web scraping**: Lyrics extraction from Genius web pages

## API Reference

### Main Classes

- `Genius` - Main client class for interacting with Genius API
- `Song` - Represents a song with lyrics and metadata
- `Artist` - Represents an artist with their songs
- `Album` - Represents an album with tracks
- `OAuth2` - OAuth2 authentication helper

## License

MIT

## Contributing

This is a TypeScript port of the Python lyricsgenius library. Issues and pull requests are welcome!
