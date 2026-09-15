const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  selectLetter: (letter) => ipcRenderer.send('select-letter', letter),
  reload: () => ipcRenderer.send('reload-pages'),
  onStatus: (callback) => ipcRenderer.on('status', (_event, status) => callback(status)),
});
