export function cleanStr(str: string): string {
  return str.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
}

export function safeUnicode(str: string): string {
  // Handle unicode strings safely
  return str.replace(/[\u0000-\u001f\u007f-\u009f]/g, '');
}

export function authFromEnvironment(): string | undefined {
  return process.env.GENIUS_ACCESS_TOKEN;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeSectionHeaders(lyrics: string): string {
  // Remove [Verse], [Chorus], [Bridge], etc. headers
  return lyrics
    .replace(/\[.*?\]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim();
}