const { contextBridge, ipcRenderer } = require('electron');

// Remote pages can only report filter status, never invoke desktop commands.
contextBridge.exposeInMainWorld('ReactNativeWebView', {
  postMessage: (data) => {
    if (typeof data === 'string' && data.length < 1024) {
      ipcRenderer.send('filter-result', data);
    }
  },
});
