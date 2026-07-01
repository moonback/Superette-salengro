import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

/**
 * Copie splash.html dans dist-electron/main/ après chaque build du main process.
 * Nécessaire car vite-plugin-electron ne copie pas les fichiers HTML statiques.
 */
function copySplashPlugin() {
  return {
    name: 'copy-splash-html',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist-electron/main');
      fs.mkdirSync(outDir, { recursive: true });

      // Copie splash.html
      const splashSrc = path.resolve(__dirname, 'electron/main/splash.html');
      if (fs.existsSync(splashSrc)) {
        fs.copyFileSync(splashSrc, path.join(outDir, 'splash.html'));
        console.log('[copy-splash] splash.html → dist-electron/main/');
      }

      // Copie le logo à côté du splash pour que src="logo-full.png" fonctionne
      const logoSrc = path.resolve(__dirname, 'public/logo-full.png');
      if (fs.existsSync(logoSrc)) {
        fs.copyFileSync(logoSrc, path.join(outDir, 'logo-full.png'));
        console.log('[copy-splash] logo-full.png → dist-electron/main/');
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      electron([
        {
          entry: 'electron/main/index.ts',
          vite: {
            build: {
              outDir: 'dist-electron/main',
            },
            plugins: [copySplashPlugin()],
          },
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(options) {
            options.reload();
          },
          vite: {
            build: {
              outDir: 'dist-electron/preload',
              rollupOptions: {
                output: {
                  entryFileNames: '[name].cjs',
                  format: 'cjs'
                }
              }
            },
          },
        },
      ]),
      renderer(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
