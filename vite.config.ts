import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    build: {
        sourcemap: true,
        lib: {
            entry: './src/main/js/index.ts',
            name: 'smile-js',
        },
    },
    plugins: [
        dts({
            rollupTypes: true,
        }),
    ],
});
