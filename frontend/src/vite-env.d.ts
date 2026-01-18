/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_AMAP_JS_API_KEY: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
