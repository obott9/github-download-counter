import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages にデプロイする場合、リポジトリ名をbaseに設定
// https://<USERNAME>.github.io/<REPO_NAME>/
export default defineConfig({
  plugins: [react()],
  base: '/github-download-counter/',
})
