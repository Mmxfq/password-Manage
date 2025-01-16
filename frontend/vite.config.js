import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 根据环境变量判断使用哪个API地址
const getApiUrl = () => {
  // 判断是否是生产环境
  if (process.env.NODE_ENV === 'production') {
    return 'https://zlilwpsuuuni.sealosbja.site'
  }
  // 判断是否是内网环境
  if (process.env.INTERNAL_NETWORK) {
    return 'http://encrypt.ns-hey43r72.svc.cluster.local:8000'
  }
  // 本地开发环境
  return 'http://localhost:8000'
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: getApiUrl(),
        changeOrigin: true,
        secure: false,
      },
    },
    host: '0.0.0.0',
    port: 8000,
    strictPort: true,
  },
  define: {
    'process.env.API_URL': JSON.stringify(getApiUrl()),
  },
}) 