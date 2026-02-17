import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@sym': resolve(__dirname, '../../..', 'packages'),
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: { '.js': 'jsx' },
        },
    },
    esbuild: {
        loader: 'jsx',
        include: /\.jsx?$/,
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/socket.io': {
                target: 'http://localhost:4000',
                ws: true,
            },
        },
    },
    css: {
        modules: {
            localsConvention: 'camelCase',
        },
    },
});
