/**
 * Normalizes input strings for comparison.
 * - Trims whitespace
 * - Converts to lowercase
 * - Replaces smart quotes (curved quotes) with standard straight quotes
 */
export function normalizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .trim()
    .toLowerCase()
    // Replace smart single quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    // Replace smart double quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    // Remove punctuation like periods for better matching (e.g., St. John's -> St Johns)
    .replace(/[.]/g, ''); 
}
