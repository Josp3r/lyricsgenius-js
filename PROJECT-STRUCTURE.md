# Project Structure

This document explains the organization of the lyricsgenius-js project.

## Directory Structure

```
lyricsgenius-js/
├── src/                 # TypeScript source code
│   ├── api/            # API client implementations
│   ├── types/          # Type definitions
│   ├── utils/          # Utility functions
│   └── auth/           # Authentication helpers
├── dist/               # Compiled JavaScript (auto-generated)
├── bin/                # Executable tools
│   └── cli.js          # Main CLI tool with all commands
├── examples/           # Usage examples (for users)
│   ├── basic-search.js # Basic song search
│   ├── artist-search.js# Artist search example
│   └── proxy-config.js # Proxy configuration examples
├── scripts/            # Development and testing scripts
│   └── test-*.js       # Various test scripts
└── docs/               # Documentation files
```

## Files Overview

### User-Facing Files (Should be committed)

- **`examples/`** - Code examples for users to learn from
- **`bin/cli.js`** - Main CLI tool with init/search/download/doctor commands
- **`README.md`** - Main documentation with CLI usage guide
- **`TESTING.md`** - Testing guide
- **`CLAUDE.md`** - Architecture documentation for future maintainers

### Development Files (Should be committed)

- **`scripts/`** - Internal testing and development scripts
- **`src/`** - TypeScript source code
- **`tsconfig.json`** - TypeScript configuration

### Generated/Local Files (Should NOT be committed)

- **`dist/`** - Compiled JavaScript output
- **`~/.lyricsgenius/config.json`** - CLI configuration directory
- **`node_modules/`** - Dependencies

## CLI Commands

The main CLI tool (`bin/cli.js`) provides:

- **`lyricsgenius init`** - Configure API token
- **`lyricsgenius search`** - Search songs/artists/albums
- **`lyricsgenius download`** - Download lyrics with structured folders
- **`lyricsgenius doctor`** - Diagnostic and testing tool

## Security Notes

### ⚠️ Never Commit These Files:

- `~/.lyricsgenius/config.json` - Contains your API token
- Any files with real API tokens

### ✅ Safe to Commit:

- Example files (use environment variables)
- Test scripts (no hardcoded tokens)
- Documentation
- Source code

## Usage Patterns

### For End Users:
```bash
npm install -g lyricsgenius-js
lyricsgenius init            # Set up token
lyricsgenius search "Hello"  # Search songs
lyricsgenius doctor          # Test everything
```

### For Developers:
```bash
npm run build              # Compile TypeScript
npm run dev                # Watch mode
node scripts/test-*.js     # Run specific tests
```

## Token Management

The project supports multiple ways to provide API tokens:

1. **CLI Configuration** (recommended for end users):
   ```bash
   lyricsgenius init
   ```
   Stores token in `~/.lyricsgenius/config.json`

2. **Environment variable** (recommended for CI/CD):
   ```bash
   export GENIUS_ACCESS_TOKEN="your_token"
   ```

3. **Programmatic** (for library usage):
   ```javascript
   const genius = new Genius({ accessToken: 'your_token' });
   ```

## Testing Philosophy

- **CLI Commands** - Provide user-friendly interface for all operations
- **Doctor tool** - Built-in diagnostic system for troubleshooting
- **Examples** (`examples/`) - Show users how to use the library
- **Scripts** (`scripts/`) - Internal testing and development tools

This separation keeps user-facing code clean while maintaining comprehensive testing capabilities.