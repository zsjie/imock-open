import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from 'vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ _command, mode }) => {
    // 加载环境变量
    // eslint-disable-next-line no-undef
    const env = loadEnv(mode, process.cwd(), '')
  
    return {
        plugins: [
            react()
        ],
        
        // 路径别名配置
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src'),
                '~': resolve(__dirname, 'src')
            }
        },
    
        // 开发服务器配置
        server: {
            port: 3010,
            host: true,
            // 在 Docker 容器中禁用自动打开浏览器
            open: false,
            // 代理配置
            proxy: {
                '/server': {
                    // 开发环境用的是 docker，将 api 请求转发至 docker 内部地址
                    target: 'http://imock-server-dev:6060',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/server/, '')
                }
            }
        },
    
        // 构建配置
        build: {
            outDir: 'dist',
            sourcemap: mode !== 'production',
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['react', 'react-dom'],
                        antd: ['antd', '@ant-design/icons', '@ant-design/pro-components'],
                        monaco: ['@monaco-editor/react']
                    }
                }
            }
        },
    
        // 环境变量配置
        define: {
            'process.env.RUNTIME_ENV': JSON.stringify(env.RUNTIME_ENV || 'development'),
            'process.env.MOCK_ENDPOINT': JSON.stringify(env.MOCK_ENDPOINT || 'http://localhost:6060/server/proxy-api'),
            'process.env.SOCKET_URL': JSON.stringify(env.SOCKET_URL || 'http://localhost:6060')
        }
    }
})