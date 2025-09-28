/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // add more VITE_ variables here if you need them later
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
