import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    // Vite 8 runs on Rolldown. The legacy `manualChunks` compat lets a chunk
    // group absorb the *dependencies* of the modules it captures — with the
    // old config, flow-vendor (@xyflow/react + elkjs) absorbed react,
    // react-dom's base runtime, react/jsx-runtime and use-sync-external-store,
    // so the entry chunk statically imported the ~480 KB gzip flow bundle on
    // every page load even though FlowCanvas is lazy (ADR-006).
    // Native `advancedChunks` groups with explicit priorities fix this: the
    // react-vendor group claims the shared framework modules first, so
    // flow-vendor stays lazy-only.
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              // Framework + shared-state modules needed by the initial page.
              // Exact path segments so e.g. react-i18next is NOT captured.
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom|zustand|use-sync-external-store)[\\/]/,
              priority: 100,
            },
            {
              // Flow diagram stack — only ever loaded via lazy FlowCanvas /
              // PlaygroundCanvas. Its remaining private deps (d3-*, classcat)
              // are intentionally left unclaimed so Rolldown co-locates them
              // here instead of emitting extra request waterfalls.
              name: 'flow-vendor',
              test: /[\\/]node_modules[\\/](@xyflow[\\/]|elkjs[\\/])/,
              priority: 50,
            },
            {
              name: 'i18n-vendor',
              test: /[\\/]node_modules[\\/][^\\/]*i18next[^\\/]*[\\/]/,
              priority: 40,
            },
            {
              name: 'motion-vendor',
              test: /[\\/]node_modules[\\/]motion(-dom|-utils)?[\\/]/,
              priority: 30,
            },
          ],
        },
      },
    },
  },
  worker: { format: 'es' },
});
