/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GUARDIAN_KEY?: string;
  readonly VITE_NYT_KEY?: string;
  readonly VITE_NEWSAPI_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
