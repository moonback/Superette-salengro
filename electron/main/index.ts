import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// â”œâ”€â”€ dist
// â”‚   â”œâ”€â”€ index.html
// â”‚   â””â”€â”€ ...
// â”œâ”€â”€ dist-electron
// â”‚   â”œâ”€â”€ main
// â”‚   â”‚   â””â”€â”€ index.js
// â”‚   â””â”€â”€ preload
// â”‚       â””â”€â”€ index.mjs (or .js / .cjs)

process.env.DIST = path.join(__dirname, '../../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let win: BrowserWindow | null;
// â•£VITE_DEV_SERVER_URLâ•  is created by vite-plugin-electron
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    width: 1200,
    height: 800,
    // fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.cjs'),
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

// Handle quit request from renderer
ipcMain.on('app:quit', () => {
  app.quit();
});
