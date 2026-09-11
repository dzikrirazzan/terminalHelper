import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "cli/index": "src/cli/index.ts",
    "electron/main": "src/electron/main.ts",
    "electron/preload": "src/electron/preload.ts"
  },
  clean: false,
  dts: false,
  format: ["esm"],
  minify: false,
  platform: "node",
  shims: true,
  sourcemap: true,
  splitting: false,
  target: "node20"
});
