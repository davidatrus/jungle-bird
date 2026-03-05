/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly [key: string]: string | undefined
  readonly SANITY_STUDIO_CANCEL_API_BASE?: string
  readonly SANITY_STUDIO_ADMIN_CANCEL_EVENT_TOKEN?: string
  readonly SANITY_STUDIO_ORIGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
