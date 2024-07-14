import {defineConfig} from 'vite';

export default defineConfig({
    build: {
        ssr: './src/smile-cli.ts',
        sourcemap: true,
        emptyOutDir: false,
    },
    ssr: {
        noExternal: true,
    },
});
