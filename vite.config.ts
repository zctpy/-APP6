import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径，确保在子目录或 OSS 静态托管中也能正常加载资源
});