import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: './index.html'
            }
        },
        assetsInlineLimit: 0,
        copyPublicDir: true
    },
    server: {
        port: 7777,
        host: true
    },
    plugins: [
        {
            name: 'static-assets',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url.startsWith('/js/') && req.url.endsWith('.js')) {
                        const filePath = path.join(__dirname, req.url);
                        if (fs.existsSync(filePath)) {
                            const content = fs.readFileSync(filePath, 'utf-8');
                            res.setHeader('Content-Type', 'application/javascript');
                            res.end(content);
                            return;
                        }
                    }
                    next();
                });
            },
            transform(code, id) {
                if (id.includes('/js/') && id.endsWith('.js')) {
                    return code;
                }
                return null;
            }
        }
    ]
});