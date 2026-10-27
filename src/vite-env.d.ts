/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GUARDIAN_KEY?: string;
  readonly VITE_GUARDIAN_BASE_URL?: string;
  readonly VITE_NYT_KEY?: string;
  readonly VITE_NYT_BASE_URL?: string;
  readonly VITE_NEWSAPI_KEY?: string;
  readonly VITE_NEWSAPI_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
