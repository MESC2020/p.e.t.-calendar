const { ipcRenderer, contextBridge } = require("electron");
//ipcRenderer: sends signals that can be caught with ipcMain in electron.ts
//contextBridge: bridge between React and Electron

contextBridge.exposeInMainWorld("api", {
  // Invoke Methods
  testInvoke: (args) => ipcRenderer.invoke("test-invoke", args),
  // Send Methods
  testSend: (args) => ipcRenderer.send("test-send", args),
  // Receive Methods
  testReceive: (callback) =>
    ipcRenderer.on("test-receive", (event, data) => {
      callback(data);
    }),

  getNames: (args) => ipcRenderer.invoke("get-names", args),
});
