/**
 * Utility to quit the Electron app from the renderer process.
 * Uses `window.close()` which triggers `window-all-closed` in main,
 * which calls `app.quit()`. This works reliably regardless of
 * preload/contextBridge configuration.
 */
export function quitApp(): void {
  window.close();
}
