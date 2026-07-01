import { app, BrowserWindow, ipcMain } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.DIST = path.join(__dirname$1, "../../dist");
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, "../public");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
let win = null;
let splashWin = null;
function resolveLogoBase64() {
  const candidates = [
    path.join(__dirname$1, "logo-full-transaparent.png"),
    path.join(process.env.VITE_PUBLIC, "logo-full-transaparent.png"),
    path.join(__dirname$1, "../../public/logo-full-transaparent.png")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const data = fs.readFileSync(p).toString("base64");
      return `data:image/png;base64,${data}`;
    }
  }
  return "";
}
function createSplash() {
  splashWin = new BrowserWindow({
    width: 460,
    height: 420,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  const logoDataUrl = resolveLogoBase64();
  const logoMarkup = logoDataUrl ? `<img class="logo-img" src="${logoDataUrl}" alt="NeuroStock" />` : `<div class="logo-fallback">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
       </div>`;
  const html = (
    /* html */
    `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}

  body{
    width:100vw;height:100vh;
    background:#f5f5fa;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:'Segoe UI',system-ui,sans-serif;
    overflow:hidden;user-select:none;-webkit-app-region:drag;
  }

  /* Dégradé doux en arrière-plan */
  body::before{
    content:'';position:absolute;inset:0;
    background:
      radial-gradient(ellipse at 20% 25%, rgba(99,102,241,.1) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 75%, rgba(139,92,246,.07) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(255,255,255,1) 0%, transparent 65%);
    animation:bgPulse 3s ease-in-out infinite alternate;
  }

  /* Grille de points subtils */
  body::after{
    content:'';position:absolute;inset:0;
    background-image:radial-gradient(circle, rgba(99,102,241,.06) 1px, transparent 1px);
    background-size:28px 28px;
  }

  @keyframes bgPulse{from{opacity:.6}to{opacity:1}}

  .container{
    position:relative;z-index:10;
    display:flex;flex-direction:column;align-items:center;gap:24px;
    animation:fadeUp .55s ease-out forwards;
  }
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}

  .logo-wrapper{position:relative;display:flex;align-items:center;justify-content:center;}

  .logo-halo{
    position:absolute;width:270px;height:270px;border-radius:50%;
    background:radial-gradient(circle, rgba(99,102,241,.09) 0%, transparent 70%);
    animation:haloPulse 2.5s ease-in-out infinite alternate;
  }
  @keyframes haloPulse{from{transform:scale(.88);opacity:.5}to{transform:scale(1.1);opacity:1}}

  .logo-ring{
    position:absolute;width:220px;height:220px;border-radius:50%;
    border:1.5px solid transparent;
    background:
      linear-gradient(#f5f5fa,#f5f5fa) padding-box,
      linear-gradient(135deg,#6366f1,#a5b4fc,rgba(99,102,241,.1),#67e8f9) border-box;
    animation:spin 5s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg)}}

  .logo-img{
    position:relative;z-index:2;
    width:200px;height:200px;object-fit:contain;
    filter:drop-shadow(0 4px 20px rgba(99,102,241,.18)) drop-shadow(0 2px 6px rgba(0,0,0,.05));
    animation:float 3s ease-in-out infinite;
  }
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

  .logo-fallback{
    position:relative;z-index:2;width:96px;height:96px;border-radius:22px;
    background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 28px rgba(99,102,241,.2);
  }

  .tagline{
    font-size:.74rem;
    color:rgba(71,85,105,.5);
    letter-spacing:.13em;
    text-transform:uppercase;
  }

  .progress-section{display:flex;flex-direction:column;align-items:center;gap:9px;width:200px;}

  .track{
    width:100%;height:2.5px;
    background:rgba(99,102,241,.1);
    border-radius:999px;overflow:hidden;
  }
  .fill{
    height:100%;width:0%;border-radius:999px;
    background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);
    box-shadow:0 0 6px rgba(99,102,241,.3);
    animation:load 2.4s cubic-bezier(.4,0,.2,1) forwards;
  }
  @keyframes load{0%{width:0%}25%{width:30%}55%{width:62%}80%{width:85%}100%{width:100%}}

  .status{
    font-size:.7rem;
    color:rgba(71,85,105,.45);
    letter-spacing:.06em;
  }

  .version{
    position:absolute;bottom:16px;
    font-size:.65rem;
    color:rgba(71,85,105,.3);
    letter-spacing:.1em;
  }
</style>
</head>
<body>
<div class="container">
  <div class="logo-wrapper">
    <div class="logo-halo"></div>
    <div class="logo-ring"></div>
    ${logoMarkup}
  </div>
  <p class="tagline">Gestion de stock intelligente</p>
  <div class="progress-section">
    <div class="track"><div class="fill"></div></div>
    <div class="status" id="s">Initialisation...</div>
  </div>
</div>
<div class="version">v1.0.0</div>
<script>
  const msgs=['Initialisation...','Chargement des modules...','Connexion à la base de données...','Préparation de l\\'interface...','Presque prêt...'];
  const el=document.getElementById('s');
  let i=0;
  const t=setInterval(()=>{i++;if(i<msgs.length){el.textContent=msgs[i];}else{clearInterval(t);}},480);
<\/script>
</body>
</html>`
  );
  splashWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  splashWin.on("closed", () => {
    splashWin = null;
  });
}
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.svg"),
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/index.cjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.once("ready-to-show", () => {
    const SPLASH_MIN_DURATION = 2500;
    const readyAt = Date.now();
    const remaining = Math.max(0, SPLASH_MIN_DURATION - (Date.now() - readyAt));
    setTimeout(() => {
      if (splashWin && !splashWin.isDestroyed()) {
        splashWin.close();
      }
      if (win && !win.isDestroyed()) {
        win.show();
        win.focus();
      }
    }, remaining);
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}
app.whenReady().then(() => {
  createSplash();
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("app:quit", () => {
  app.quit();
});
