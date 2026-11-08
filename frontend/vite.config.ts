import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Port 5173 matches CORS_ORIGIN in the backend .env files.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
