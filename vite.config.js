import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // WAJIB sama persis dengan nama repo GitHub kamu (huruf besar/kecil harus cocok)
  base: '/Renjana-Store/',
})
