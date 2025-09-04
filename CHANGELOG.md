# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-09-04

### Added

- **Project Configuration Support**: Local configuration via `lyricsgenius.config.json`
  - Create project-specific configuration files in current working directory
  - Local configuration takes precedence over global `~/.lyricsgenius/config.json`
  - Supports all configuration options including `accessToken` and `outputPath`
- **Template-based Output Paths**: Configurable download paths with variable substitution
  - `outputPath` configuration option with `{{artist}}` template variable
  - Automatic path sanitization for file system compatibility
  - Smart path resolution prevents duplicate artist directories
- **Enhanced CLI Download Experience**: Template-aware download path suggestions
  - Search command displays resolved template paths as defaults
  - Automatic detection and handling of template vs custom paths
  - Improved user prompts showing configured vs default paths
- **Enhanced Init Command**: Smart local configuration creation
  - Interactive choice between global and local configuration storage
  - Automatic detection and use of `lyricsgenius.config.json.example` as template
  - Preserves existing configuration structure while updating access token
  - Example configuration file included in package for easy project setup

### Changed

- **Configuration System**: Enhanced to support both global and local configuration files
- **Download Logic**: Improved path resolution to avoid directory duplication when using templates
- **Init Command**: Now offers choice between global and local configuration storage with template support

## [1.0.2] - 2025-09-04

### Added

- **Interactive CLI Search**: New interactive search experience with song selection menu
  - Search results now display as selectable list using inquirer.js
  - Users can browse and select songs interactively
  - Integrated download flow: search → select → download directory → format → download
- **Command Aliases**: Added convenient short aliases for all CLI commands
  - `search` → `s` for faster searching
  - `download` → `dl` for quick downloads  
  - `doctor` → `doc` for diagnostics
- **CLI Code Modularization**: Complete refactoring of CLI architecture
  - Moved from single 500+ line file to modular structure
  - Commands organized in `bin/commands/` directory
  - Utilities organized in `bin/utils/` directory
  - Cleaner setup functions using `setupXxxCommand(program)` pattern
- **Download Utilities**: New shared download functions for code reuse

### Changed

- **Search Command**: Completely redesigned search experience
  - Removed album search support (albums no longer returned by search)
  - Search now filters to songs only
  - Interactive menu replaces simple list output
  - Integrated with download workflow
- **CLI Module Structure**: Refactored from single file to modular architecture
  - Main `cli.js` reduced from 508 to 22 lines
  - Each command in separate module with single responsibility
  - Better type inference with direct program manipulation
- **Project Description**: Updated from "TypeScript client" to "Node.js client" for better user clarity
  - Emphasizes that this is a standard Node.js package
  - TypeScript support mentioned as additional feature rather than primary identifier

### Removed

- **Album Search Support**: Removed album search options from CLI
  - Albums are no longer returned by the Genius search API
  - Simplified search interface to focus on songs only

## [1.0.1] - Previous Release

### Features Added

- Node.js port of Python lyricsgenius library
- Full CLI tool with search, download, and diagnostic features
- OAuth2 authentication support
- Web scraping for lyrics extraction
- Comprehensive configuration options
- Built-in doctor diagnostic tool
- Proxy support for restricted regions

### Core Functionality

- **Search**: Find songs, artists, and albums
- **Download**: Save lyrics in txt or json format with organized folder structure
- **Diagnostics**: Test API connections, search functionality, and proxy configurations
- **Configuration**: Flexible token management via CLI, environment, or programmatic setup
