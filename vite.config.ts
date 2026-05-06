import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        onstart(args) {
          args.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            lib: {
              entry: 'electron/main.ts',
              formats: ['cjs'],
              fileName: () => '[name].js',
            },
            rollupOptions: {
              external: ['electron', 'electron-store', 'electron-updater', '@ffmpeg-installer/ffmpeg', '@ffprobe-installer/ffprobe', 'fluent-ffmpeg'],
              output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
                interop: 'auto',
              },
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(args) {
          args.reload()
        },
        vite: {
          build: {
            sourcemap: 'inline',
            minify: false,
            outDir: 'dist-electron',
            lib: {
              entry: 'electron/preload.ts',
              formats: ['cjs'],
              fileName: () => '[name].cjs',
            },
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
})
