/** Treats a missing or blank value as "not set". */
function readKey(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export const config = {
  guardianKey: readKey(import.meta.env.VITE_GUARDIAN_KEY),
  nytKey: readKey(import.meta.env.VITE_NYT_KEY),
  newsApiKey: readKey(import.meta.env.VITE_NEWSAPI_KEY),
};
