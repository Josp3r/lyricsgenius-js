# Testing Guide

## Interactive Test Runner

Run the interactive test manager:

```bash
npm test
```

This will show you a menu with all available tests:

- **🌐 Network tests** - Require Genius API token and internet connection
- **📱 Offline tests** - Work without network, test code structure
- **Batch options** - Run multiple tests at once

## Test Categories

### Offline Tests (📱)
- `offline` - Code structure validation
- `mock` - Business logic with mock data  
- `suite` - Complete test suite

### Network Tests (🌐)
- `basic` - API connectivity test
- `song` - Song search functionality
- `artist` - Artist search functionality
- `connection` - Simple connection test
- `configs` - Different network configurations

## Setting Up Your Token

1. Get a token from [Genius API](https://genius.com/api-clients)
2. Use the interactive menu: `🔧 Set GENIUS_ACCESS_TOKEN`
3. Or set environment variable:
   ```bash
   export GENIUS_ACCESS_TOKEN=your_token_here
   npm test
   ```

## Quick Commands

```bash
# Interactive test menu
npm test

# Run offline tests only
npm run test:offline

# Run complete test suite
npm run test:suite
```

## Test Files Location

All test files are organized in the `tests/` directory:
```
tests/
├── test-offline.js     # Code structure validation
├── test-mock.js        # Mock data testing
├── test-suite.js       # Complete test suite
├── test-basic.js       # Basic API test
├── test-song.js        # Song search test
├── test-artist.js      # Artist search test
├── test-connection.js  # Connection test
└── test-configs.js     # Network config test
```