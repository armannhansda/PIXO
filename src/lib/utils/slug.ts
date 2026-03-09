const NON_LATIN = /[^\p{Letter}\p{Number}]+/gu;
const WHITESPACE = /\s+/g;
const EDGE_DASHES = /^-+|-+$/g;
const MULTIPLE_DASHES = /-{2,}/g;
const MAX_SLUG_LENGTH = 100;

/**
 * Generates a URL-friendly slug from input text
 * 
 * @param input - The text to convert to a slug
 * @param maxLength - Optional maximum length (default: 100)
 * @returns A clean, URL-friendly slug
 */
export function generateSlug(input: string, maxLength = MAX_SLUG_LENGTH): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .normalize("NFKD") // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
    .replace(NON_LATIN, '-') // Replace non-alphanumeric chars with hyphens
    .replace(WHITESPACE, '-') // Replace whitespace with hyphens
    .replace(MULTIPLE_DASHES, '-') // Replace multiple hyphens with single hyphen
    .replace(EDGE_DASHES, '') // Remove leading/trailing hyphens
    .toLowerCase() // Convert to lowercase
    .substring(0, maxLength); // Limit length
}

/**
 * Creates a unique timestamp-based slug if input is invalid
 * 
 * @returns A timestamp-based fallback slug
 */
export function generateFallbackSlug(prefix: string = 'post'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}
