import { app as n, BrowserWindow as s } from "electron";
import o from "path";
import { fileURLToPath as a } from "url";
const t = o.dirname(a(import.meta.url));
process.env.DIST = o.join(t, "../dist");
process.env.VITE_PUBLIC = n.isPackaged ? process.env.DIST : o.join(process.env.DIST, "../public");
let e;
const i = process.env.VITE_DEV_SERVER_URL;
function r() {
  e = new s({
    icon: o.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1200,
    height: 800,
    webPreferences: {
      preload: o.join(t, "../preload/index.js")
    }
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(o.join(process.env.DIST, "index.html"));
}
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  s.getAllWindows().length === 0 && r();
});
n.whenReady().then(r);
