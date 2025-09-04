import fs from 'fs';
import path from 'path';
import os from 'os';
import { sanitizeFilename } from './helpers.js';

const configDir = path.join(os.homedir(), '.lyricsgenius');
const configFile = path.join(configDir, 'config.json');

function ensureConfigDir() {
  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    return true;
  } catch (error) {
    console.warn(`Warning: Could not create config directory: ${error.message}`);
    return false;
  }
}

export function loadConfig() {
  let config = {};
  
  // Load global config from ~/.lyricsgenius/config.json
  try {
    if (fs.existsSync(configFile)) {
      config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading global config:', error.message);
  }
  
  // Load local config from lyricsgenius.config.json in current working directory
  const localConfigFile = path.join(process.cwd(), 'lyricsgenius.config.json');
  try {
    if (fs.existsSync(localConfigFile)) {
      const localConfig = JSON.parse(fs.readFileSync(localConfigFile, 'utf8'));
      // Merge local config with global config (local takes precedence)
      config = { ...config, ...localConfig, accessToken: localConfig.accessToken || config.accessToken };
    }
  } catch (error) {
    console.error('Error loading local config (lyricsgenius.config.json):', error.message);
  }
  
  return config;
}

export function saveConfig(config) {
  try {
    if (!ensureConfigDir()) {
      return false;
    }
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error.message);
    return false;
  }
}

export async function getAccessToken() {
  const config = loadConfig();
  if (config.accessToken) {
    return config.accessToken;
  }
  
  console.log('No access token found. Please run "lyricsgenius init" first.');
  process.exit(1);
}

export function resolveOutputPath(outputPathTemplate, songData) {
  if (!outputPathTemplate) {
    return null;
  }

  return outputPathTemplate.replace('{{artist}}', sanitizeFilename(songData.artist || 'Unknown Artist'));
}

export { configFile };