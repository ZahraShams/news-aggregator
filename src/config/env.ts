interface RuntimeConfig {
  guardianKey?: string;
  nytKey?: string;
  newsApiKey?: string;
}

declare global {
  interface Window {
    /** Written to /config.js when the Docker container starts. Empty in local development. */
    __APP_CONFIG__?: RuntimeConfig;
  }
}

/** Treats a missing or blank value as "not set". */
function readKey(...values: (string | undefined)[]): string | undefined {
  return values.map((value) => value?.trim()).find(Boolean);
}

const runtime: RuntimeConfig = window.__APP_CONFIG__ ?? {};

/**
 * Keys given to the container at start-up win over the ones Vite builds in
 * from .env, so one image can be run with different keys.
 */
export const config = {
  guardianKey: readKey(runtime.guardianKey, import.meta.env.VITE_GUARDIAN_KEY),
  nytKey: readKey(runtime.nytKey, import.meta.env.VITE_NYT_KEY),
  newsApiKey: readKey(runtime.newsApiKey, import.meta.env.VITE_NEWSAPI_KEY),
};
