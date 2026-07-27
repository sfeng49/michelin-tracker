import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' keeps the built site portable (open from any path / static host)
export default defineConfig({
  base: './',
  plugins: [react()],
})
