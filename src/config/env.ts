interface RuntimeConfig {
  guardianKey?: string;
  guardianBaseUrl?: string;
  nytKey?: string;
  nytBaseUrl?: string;
  newsApiKey?: string;
  newsApiBaseUrl?: string;
}

declare global {
  interface Window {
    /** Written to /config.js when the Docker container starts. Empty in local development. */
    __APP_CONFIG__?: RuntimeConfig;
  }
}

/** Default API addresses, used when no base URL is set in the environment. */
const DEFAULT_BASE_URLS = {
  guardian: 'https://content.guardianapis.com',
  nyt: 'https://api.nytimes.com/svc/search/v2',
  newsApi: 'https://newsapi.org/v2',
};

/** The first value that is set, treating a missing or blank value as "not set". */
function read(...values: (string | undefined)[]): string | undefined {
  return values.map((value) => value?.trim()).find(Boolean);
}

const runtime: RuntimeConfig = window.__APP_CONFIG__ ?? {};
const env = import.meta.env;

/**
 * Values given to the container at start-up win over the ones Vite builds in
 * from .env, so one image can be run with different keys and addresses.
 */
export const config = {
  guardian: {
    apiKey: read(runtime.guardianKey, env.VITE_GUARDIAN_KEY),
    baseUrl: read(runtime.guardianBaseUrl, env.VITE_GUARDIAN_BASE_URL) ?? DEFAULT_BASE_URLS.guardian,
  },
  nyt: {
    apiKey: read(runtime.nytKey, env.VITE_NYT_KEY),
    baseUrl: read(runtime.nytBaseUrl, env.VITE_NYT_BASE_URL) ?? DEFAULT_BASE_URLS.nyt,
  },
  newsApi: {
    apiKey: read(runtime.newsApiKey, env.VITE_NEWSAPI_KEY),
    baseUrl: read(runtime.newsApiBaseUrl, env.VITE_NEWSAPI_BASE_URL) ?? DEFAULT_BASE_URLS.newsApi,
  },
};
