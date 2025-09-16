/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RUNTIME_ENV: string
  readonly MOCK_ENDPOINT: string
  readonly SOCKET_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
