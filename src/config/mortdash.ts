export const mortdash_url = process.env.MORTDASH_BASE_URL;

if (!mortdash_url) {
  throw new Error('MORTDASH_BASE_URL environment variable is not set');
} 