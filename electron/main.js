const { spawn } = require("child_process");
const { app, BrowserWindow } = require("electron");
const path = require("path");
let serverProcess

function startServer() {
  let serverPath

  if (app.isPackaged) {
    // Khi đã build exe
    serverPath = path.join(process.resourcesPath, "server/index.js")
  } else {
    // Khi chạy dev
    serverPath = path.join(__dirname, "../server/index.js")
  }

  serverProcess = spawn("node", [serverPath], {
    stdio: "inherit"
  })
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      contextIsolation: true
    }
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    // DEV MODE
    win.loadURL("http://localhost:5173");
  } else {
    // PRODUCTION MODE
    win.loadFile(
      path.join(__dirname, "renderer/control-panel/index.html")
    );
  }
}

app.whenReady().then(()=>{
  startServer(); createWindow();
});
app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill()
  }
})
