import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        exclude: ['node_modules/**', '.expo/**', '.git/**', 'dist/**'],
        passWithNoTests: true,
        server: {
            deps: {
                inline: ['@formatjs/intl-supportedvaluesof']
            }
        },
        setupFiles: ['./polyfills.ts']
    }
});
