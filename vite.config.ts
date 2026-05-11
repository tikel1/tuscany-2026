import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// GitHub Pages needs `/tuscany-2026/`; local dev uses `/` so opening
// http://localhost:5173/ works (same as default Vite UX).
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  base: command === "serve" ? "/" : "/tuscany-2026/",
}))
