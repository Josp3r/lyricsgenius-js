# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js port of the Python `lyricsgenius` library, providing a Node.js client for the Genius.com API. The project includes both a programmatic API and a CLI tool for interacting with song lyrics, artist information, and albums.

## Development Commands

### Building and Development
- `npm run build` - Compile TypeScript to JavaScript in `dist/`
- `npm run dev` - Watch mode for development (recompiles on changes)
- `pnpm install` - Install dependencies (project uses pnpm as package manager)

### Testing and Diagnostics
- `npm run doctor` - Run the built-in diagnostic tool (equivalent to `node bin/cli.js doctor`)
- There are no traditional unit tests - the project uses the doctor tool and example scripts for validation

### CLI Testing
- `npm start` - Run the CLI tool directly
- `node bin/cli.js <command>` - Run specific CLI commands during development

### Examples
- `npm run example:basic` - Run basic song search example
- `npm run example:artist` - Run artist search example  
- `npm run example:proxy` - Run proxy configuration example

## Architecture

### Core Library Structure
- **`src/genius.ts`** - Main `Genius` class that extends `PublicAPI` and provides high-level methods like `searchSong()`, `searchArtist()`, `lyrics()`
- **`src/api/`** - API layer with base HTTP client and public API methods
  - `base.ts` - BaseAPI class with HTTP client, proxy support, rate limiting
  - `client.ts` - PublicAPI class with Genius API endpoints (`/search`, `/songs/{id}`, etc.)
- **`src/types/`** - TypeScript type definitions for API responses and domain models
  - `song.ts`, `artist.ts`, `album.ts` - Domain model classes
  - `index.ts` - Main interfaces like `GeniusOptions`, `SearchResponse`
- **`src/auth/`** - OAuth2 authentication support
- **`src/utils/`** - Utility functions for string cleaning, section header removal

### CLI Tool
- **`bin/cli.js`** - Commander.js-based CLI with subcommands:
  - `init` - Configure API token (stored in `~/.lyricsgenius/config.json`)
  - `search <query>` - Search for songs/artists/albums
  - `download <songId>` - Download lyrics with structured folder layout (`./lyricsgenius/{artist}/{song}.txt`)
  - `doctor` - Built-in diagnostic tool with connection testing, proxy testing, etc.

### Key Design Patterns
- **API Response Handling**: The `SearchResponse` interface was recently updated to match the actual API structure (`response.hits[]` instead of `response.sections[0].hits[]`)
- **Lyrics Scraping**: Uses Cheerio to scrape lyrics from Genius web pages (not available via API)
- **Search Result Filtering**: `getItemFromSearchResponse()` method handles finding specific result types and fallback logic for artist searches
- **File Organization**: Download command creates organized folder structure by artist name

### Configuration
- API tokens can be set via CLI (`lyricsgenius init`), environment variable `GENIUS_ACCESS_TOKEN`, or programmatically
- Configuration stored in `~/.lyricsgenius/config.json` by CLI init command
- Proxy support for SOCKS and HTTP proxies (important for regions where Genius is blocked)
- Extensive options in `GeniusOptions` interface for customizing behavior (verbose logging, section header removal, excluded terms, etc.)

### Important Implementation Notes
- **Memory considerations**: `searchArtist()` loads all songs into memory - can be large for prolific artists
- **API limitations**: Album search via `searchAll()` is no longer supported by the API, so `searchAlbum()` requires an `albumId`
- **Python compatibility**: Maintains similar API surface to the original Python library for easier migration
- **CLI Integration**: Doctor tool is now integrated into the main CLI rather than a separate executable

### Testing Strategy
The project uses a comprehensive "doctor" diagnostic tool instead of traditional unit tests, which can:
- Test API connectivity and authentication
- Validate search functionality
- Test proxy configurations
- Verify lyrics extraction

The doctor tool was recently cleaned up to remove non-functional features:
- Removed "Set API token" option (generated `.genius-token` files that weren't read by the SDK)
- Removed "Generate configuration file" option (generated `genius-config.json` files that weren't used)
- Now focuses on actual testing and diagnostics rather than configuration management

This approach is practical for an API client where most functionality depends on external services and network connectivity.