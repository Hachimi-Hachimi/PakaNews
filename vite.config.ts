import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: "/PakaNews/",
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                details: resolve(__dirname, 'details/index.html'),
            },
        },
    },
})