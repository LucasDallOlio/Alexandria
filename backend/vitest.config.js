

import { defineConfig } from 'vitest/config';


export default defineConfig(() => ({
    test: {
        environment: 'node',
        setupFiles: ['./tests/setup.js'],
        fileParallelism: false,
        env: {
            NODE_ENV: 'test',
        },
        // roda os arquivos em série para não ter conflito de banco
        pool: 'forks',
        poolOptions: {
            forks: {
                singleFork: true,
            },
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.js'],
            exclude: ['src/config/swagger.js'],
        },
    },
}))