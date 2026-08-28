const { contextBridge, ipcRenderer } = require('electron');

// renderer process theke shudhu ei function ta call kora jabe, direct Node access nai (security)
contextBridge.exposeInMainWorld('api', {
  getStats: () => ipcRenderer.invoke('get-stats')
});