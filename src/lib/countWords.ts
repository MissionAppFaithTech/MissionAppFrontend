/** Number of whitespace-separated words in `text` (0 for blank text). */
export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
