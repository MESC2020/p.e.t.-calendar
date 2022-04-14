const { ipcRenderer, contextBridge } = require("electron");
//ipcRenderer: sends signals that can be caught with ipcMain in electron.ts
//contextBridge: bridge between React and Electron

contextBridge.exposeInMainWorld("api", {
  // Receive Methods
  testReceive: (callback: any) =>
    ipcRenderer.on("test-receive", (event: any, data: any) => {
      callback(data);
    }),

  //event handling
  saveEvents: (args: any) => ipcRenderer.invoke("save-events", args),
  deleteEvents: (args: any) => ipcRenderer.send("delete-events", args),
  updateEvents: (args: any) => ipcRenderer.send("update-events", args),
  getAllEvents: (args: any) => ipcRenderer.invoke("get-all-events", args),

  //report handling
  closePopup: (args: any) => ipcRenderer.send("close-popup", args),
  saveReport: (args: any) => ipcRenderer.send("save-report", args),
  getAggregatedHours: (args: any) =>
    ipcRenderer.invoke("get-aggregated-hours", args),
  getAggregatedWeekdays: (args: any) =>
    ipcRenderer.invoke("get-aggregated-weekdays", args),
});
export {};
