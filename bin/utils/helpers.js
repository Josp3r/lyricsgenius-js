export function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
    .slice(0, 200); // Limit length
}