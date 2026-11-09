;(function patchElectronResolve() {
  const Module = require('module')
  const _orig = Module._resolveFilename.bind(Module)
  Module._resolveFilename = function(request, parent, isMain, options) {
    if (request === 'electron') return 'electron'
    return _orig(request, parent, isMain, options)
  }
})()

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  logCalculation: (entry) => ipcRenderer.send('log-calculation', entry),
  getLogPath: () => ipcRenderer.invoke('get-log-path'),
})
