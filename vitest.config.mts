import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    // Playwright E2E specs live in e2e/ and run with `yarn e2e`, not Vitest.
    include: ['__test__/**/*.spec.{ts,tsx}'],
  },
});
