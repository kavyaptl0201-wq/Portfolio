/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_ENDPOINT?: string;
  readonly VITE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
