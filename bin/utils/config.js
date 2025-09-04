import fs from 'fs';
import path from 'path';
import os from 'os';

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
  try {
    if (fs.existsSync(configFile)) {
      return JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading config:', error.message);
  }
  return {};
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

export { configFile };