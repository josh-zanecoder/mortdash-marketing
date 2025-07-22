export const mortdash_url = process.env.NEXT_PUBLIC_MORTDASH_BASE_URL;
export const mortdash_ae_url = process.env.NEXT_PUBLIC_MORTDASH_AE_URL;

// Validate URL format
if (typeof mortdash_url !== 'string' || !mortdash_url.startsWith('http')) {
  console.warn('NEXT_PUBLIC_MORTDASH_BASE_URL should be a valid URL starting with http:// or https://');
}

if (typeof mortdash_ae_url !== 'string' || !mortdash_ae_url.startsWith('http')) {
  console.warn('NEXT_PUBLIC_MORTDASH_AE_URL should be a valid URL starting with http:// or https://');
}