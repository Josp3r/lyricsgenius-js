#!/usr/bin/env node

import { Command } from 'commander';
import { setupInitCommand } from './commands/init.js';
import { setupSearchCommand } from './commands/search.js';
import { setupDownloadCommand } from './commands/download.js';
import { setupDoctorCommand } from './commands/doctor.js';

const program = new Command();

program
  .name('lyricsgenius')
  .description('A Node.js client for the Genius.com API')
  .version('1.0.3');

// Setup commands
setupInitCommand(program);
setupSearchCommand(program);
setupDownloadCommand(program);
setupDoctorCommand(program);

program.parse();