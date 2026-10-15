import deno from "@deno/vite-plugin";
import {
  readClientPort,
  readServerBaseUrl,
  readServerPort,
} from "@suittracker/lib";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, searchForWorkspaceRoot } from "vite";
import process from "node:process";
import { fileURLToPath } from "node:url";

const env = {
  clientPort: readClientPort(),
  serverBaseUrl: readServerBaseUrl(),
  serverPort: readServerPort(),
};

const libDir = fileURLToPath(new URL("../lib", import.meta.url));

const reloadOnLibChange = (): Plugin => ({
  name: "reload-on-lib-change",
  configureServer(server) {
    server.watcher.add(libDir);
    server.watcher.on("change", (file) => {
      if (!file.startsWith(libDir)) return;
      server.moduleGraph.invalidateAll();
      server.ws.send({ type: "full-reload" });
    });
  },
});

export default defineConfig({
  root: "./src",
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
  plugins: [react(), deno(), reloadOnLibChange()],
  server: {
    port: env.clientPort,
    fs: {
      allow: [searchForWorkspaceRoot(process.cwd()), "../../node_modules"],
    },
    proxy: {
      "/api": {
        target: `${env.serverBaseUrl}:${env.serverPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
