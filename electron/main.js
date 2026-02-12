const { app, BrowserWindow } = require("electron")
const path = require("path")

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#000000",
    webPreferences: {
      contextIsolation: true
    }
  })

  const isDev = !app.isPackaged

  if (isDev) {
    win.loadURL("http://localhost:5173")
  } else {
    win.loadFile(
      path.join(__dirname, "../control-panel/dist/index.html")
    )
  }

  win.webContents.openDevTools() // để debug xem có lỗi gì
}

app.whenReady().then(createWindow)
