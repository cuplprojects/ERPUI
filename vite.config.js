import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    outDir: '//192.168.1.27/e/ERP/ERPUI',
  },
  plugins: [react()],
})
