import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: (() => {
    if (process.env.GITHUB_PAGES !== "true") return "/";

    const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
    if (!repo) return "/";

    // For <user>.github.io repositories, Pages is served from '/'
    if (repo.endsWith(".github.io")) return "/";

    // For project pages, assets are served from '/<repo>/'
    return `/${repo}/`;
  })(),
  plugins: [],
  server: {
    open: true,
  },
  build: {
    outDir: "dist",
  },
});
