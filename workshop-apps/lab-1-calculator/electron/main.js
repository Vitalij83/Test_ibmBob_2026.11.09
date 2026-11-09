// Workaround for Electron 33+: prevent the local node_modules/electron npm package
// from shadowing Electron's built-in native module when required from main.js
;(function patchElectronResolve() {
  const Module = require('module')
  const _orig = Module._resolveFilename.bind(Module)
  Module._resolveFilename = function(request, parent, isMain, options) {
    if (request === 'electron') return 'electron'
    return _orig(request, parent, isMain, options)
  }
})()

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

// Paths resolved lazily after app is ready (app.isPackaged not available at module load time)
function getLogDir() {
  return app.isPackaged
    ? path.join(path.dirname(app.getPath('exe')), 'logs')
    : path.join(__dirname, '..', 'logs')
}

function ensureLogDir() {
  const logDir = getLogDir()
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
}

function debug(msg) {
  try {
    ensureLogDir()
    fs.appendFileSync(
      path.join(getLogDir(), 'debug.log'),
      `${new Date().toISOString()} ${msg}\n`,
      'utf8'
    )
  } catch (_) {}
}

function writeLog(entry) {
  ensureLogDir()
  const line = `${new Date().toISOString()} | ${entry.operation.padEnd(8)} | ${entry.a} ${entry.operation} ${entry.b} = ${entry.result}\n`
  fs.appendFileSync(path.join(getLogDir(), 'calculator.log'), line, 'utf8')
}

// IPC: renderer → main: log a calculation
ipcMain.on('log-calculation', (_event, entry) => {
  writeLog(entry)
})

// IPC: renderer asks for log file path (shown in UI)
ipcMain.handle('get-log-path', () => path.join(getLogDir(), 'calculator.log'))

function createWindow() {
  const appRoot = app.getAppPath()
  const indexPath = path.join(appRoot, 'dist', 'index.html')
  const preloadPath = path.join(__dirname, 'preload.js')

  debug(`isProd=${app.isPackaged}`)
  debug(`appRoot=${appRoot}`)
  debug(`indexPath=${indexPath}`)
  debug(`indexExists=${fs.existsSync(indexPath)}`)
  debug(`preloadPath=${preloadPath}`)
  debug(`preloadExists=${fs.existsSync(preloadPath)}`)

  const win = new BrowserWindow({
    width: 480,
    height: 760,
    minWidth: 360,
    minHeight: 500,
    resizable: true,
    title: 'Lab 1 Calculator',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
  })

  win.webContents.on('did-fail-load', (_e, code, desc, url) => {
    debug(`did-fail-load code=${code} desc=${desc} url=${url}`)
  })

  win.loadFile(indexPath).catch(err => debug(`loadFile error: ${err.message}`))
  win.setMenuBarVisibility(false)
}

app.whenReady().then(() => {
  ensureLogDir()
  debug('app ready')
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
