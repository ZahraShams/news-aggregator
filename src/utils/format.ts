const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

/** Removes the HTML tags and common entities some APIs put in summaries. */
export function stripHtml(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&(nbsp|amp|quot|#39|lt|gt);/g, (entity) => ENTITIES[entity])
    .trim();
}
