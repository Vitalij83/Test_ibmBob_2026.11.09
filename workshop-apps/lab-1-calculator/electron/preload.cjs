const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  logCalculation: (entry) => ipcRenderer.send('log-calculation', entry),
  getLogPath: () => ipcRenderer.invoke('get-log-path'),
})
