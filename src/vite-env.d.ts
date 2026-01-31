/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_NEON_DATABASE_URL: string
    readonly VITE_JWT_SECRET: string
    readonly VITE_JWT_EXPIRES_IN: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
