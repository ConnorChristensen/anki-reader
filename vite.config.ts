import { defineConfig } from "vite-plus";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
    },
  },
  plugins: [dts()],
  lint: { options: { typeAware: true, typeCheck: true } },
});
