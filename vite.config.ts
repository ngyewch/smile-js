import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: './src/index.ts',
            name: 'smile',
            formats: ['es', 'cjs', 'iife'],
        },
    },
    plugins: [
        dts({
            rollupTypes: true,
        }),
    ],
});
