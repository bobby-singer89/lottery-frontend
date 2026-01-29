/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_MOCK_AUTH?: string;
}

interface Window {
  Buffer: typeof import('buffer').Buffer;
  global: Window;
}