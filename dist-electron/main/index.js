import { app as o, BrowserWindow as s, ipcMain as a } from "electron";
import n from "path";
import { fileURLToPath as l } from "url";
const t = n.dirname(l(import.meta.url));
process.env.DIST = n.join(t, "../../dist");
process.env.VITE_PUBLIC = o.isPackaged ? process.env.DIST : n.join(process.env.DIST, "../public");
let e;
const i = process.env.VITE_DEV_SERVER_URL;
function r() {
  e = new s({
    icon: n.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1200,
    height: 800,
    fullscreen: !0,
    webPreferences: {
      preload: n.join(t, "../preload/index.cjs")
    }
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(n.join(process.env.DIST, "index.html"));
}
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  s.getAllWindows().length === 0 && r();
});
o.whenReady().then(r);
a.on("app:quit", () => {
  o.quit();
});
