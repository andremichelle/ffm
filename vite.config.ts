import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
    base: process.env.NODE_ENV === "production" ? "/ffm/" : "./",
    plugins: [react()],
    optimizeDeps: {
        exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
    },
    build: {
        outDir: "dist",
        rollupOptions: {
            external: (source) => {
                return source.includes("service-worker.ts")
            }
        }
    },
    server: {
        hmr: false,
        port: 8081,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    }
})