const { ipcRenderer, contextBridge } = require("electron");
//ipcRenderer: sends signals that can be caught with ipcMain in electron.ts
//contextBridge: bridge between React and Electron

contextBridge.exposeInMainWorld("api", {
  // Invoke Methods
  testInvoke: (args: any) => ipcRenderer.invoke("test-invoke", args),
  // Send Methods
  testSend: (args: any) => ipcRenderer.send("test-send", args),
  // Receive Methods
  testReceive: (callback: any) =>
    ipcRenderer.on("test-receive", (event: any, data: any) => {
      callback(data);
    }),

  getNames: (args: any) => ipcRenderer.invoke("get-names", args),
});
export {};
