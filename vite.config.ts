// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // Blade's published barrel contains extensionless Day.js plugin imports.
    // Let Vite resolve them during SSR instead of handing the barrel to Node ESM.
    ssr: {
      noExternal: ["@razorpay/blade", "styled-components"],
      // Normalize styled-components v5's CommonJS dependencies in the dev SSR runner.
      optimizeDeps: {
        include: ["@razorpay/blade/components", "@razorpay/blade/tokens", "styled-components"],
        // React must stay shared with the external server renderer, not bundled a second time.
        exclude: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
      },
    },
    // Pre-bundle UI deps up front so late discovery doesn't re-optimize mid-session
    // (which left mixed React copies and crashed dialogs with "reading 'useRef'").
    optimizeDeps: {
      include: [
        "@razorpay/blade/components",
        "@razorpay/blade/tokens",
        "styled-components",
        "framer-motion",
        "@radix-ui/react-alert-dialog",
        "@radix-ui/react-dialog",
        "@radix-ui/react-slot",
        "@radix-ui/react-slider",
        "@radix-ui/react-tabs",
        "@radix-ui/react-select",
        "class-variance-authority",
        "clsx",
        "lucide-react",
        "sonner",
        "tailwind-merge",
      ],
    },
  },
});
