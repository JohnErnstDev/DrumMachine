import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// On GitHub Actions, GITHUB_REPOSITORY is "owner/repo-name"
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';

export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : '/',
});
