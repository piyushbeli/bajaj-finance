import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://bajajfinance-alb1s-ec2-1561512233.ap-south-1.elb.amazonaws.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
