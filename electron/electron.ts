// main entry point for electron

import { dbMgr } from "../src/db/dbMgr";
import { Aggregator } from "../src/db/Aggregator";

//dev toole extension
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, Menu, screen } = require("electron");
const path = require("path");
let dbManager: dbMgr;
let aggregator: Aggregator;

type Window = {
  minimize(): any;
  loadURL(url: string): any;
  maximaze(): any;
  close(): any;
  loadFile(path: any): any;
  webContents: any;
  show(): any;
  hide(): any;
  on(eventListening: string, func: any): any;
};

let popupWindow: Window;

function createPopupWindow(width: any, height: any) {
  popupWindow = new BrowserWindow({
    frame: false,
    resizable: false,
    movable: false,
    focusable: false,
    alwaysOnTop: true,
    skipTaskbar: true, //this might be unnecessary since in win, this is already applied when focusable: false
    height: 300,
    width: 400,
    x: width - 400, //to get it into the right bottom corner
    y: height - 300,

    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "/preload.js"),
    },
  });
  Menu.setApplicationMenu(null);
  popupWindow.loadURL("http://localhost:3000/#/report");
  //popupWindow.webContents.openDevTools();
  popupWindow.on("closed", (event: any) => {
    //win = null
    console.log(event);
    event.preventDefault();
    popupWindow.hide();
  });

  popupWindow.on("close", (event: any) => {
    //win = null
    console.log(event);
    event.preventDefault();
    popupWindow.hide();
  });
}

function createWindow(width: any, height: any) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "/preload.js"),
    },
  });
  //mainWindow.loadFile(path.join(__dirname, "../index.html"));
  mainWindow.loadURL("http://localhost:3000");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const mainScreen = screen.getPrimaryDisplay();
  const { width, height } = mainScreen.workAreaSize;
  installExtension(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: { allowFileAccess: true },
  })
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));
  infinitePopUpLoop(width, height);
  createWindow(width, height);
  //createPopupWindow(width, height);
  dbManager = new dbMgr();
  dbManager.initDb();
  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(width, height);
  });
});

function infinitePopUpLoop(width: any, height: any) {
  setInterval(() => {
    if (popupWindow === undefined || popupWindow === null)
      createPopupWindow(width, height);
    else if (popupWindow) popupWindow.close();
    popupWindow.show();
    //createPopupWindow(width, height);
  }, 60 * 60 * 1000);
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    dbManager.closeDb();
    app.quit();
  }
});

//events handlers
ipcMain.handle("get-all-events", async (event: any, args: any) => {
  const results = await dbManager.getAllData("Events");
  return results;
});

ipcMain.handle("save-events", async (event: any, args: any) => {
  return await dbManager.saveEvents(args);
});

ipcMain.on("update-events", (event: any, args: any) => {
  dbManager.updateEvents(args);
});

ipcMain.on("delete-events", (event: any, args: any) => {
  dbManager.deleteEvents(args);
});

//report handlers
ipcMain.on("close-popup", (event: any, args: any) => {
  if (args.value) popupWindow.close();
});

ipcMain.on("save-report", (event: any, args: any) => {
  dbManager.saveReport(args);
  popupWindow.close();
});

ipcMain.handle("get-aggregated-hours", async (event: any, args: any) => {
  aggregator = new Aggregator(dbManager);
  return await aggregator.aggregatingHours();
});

ipcMain.handle("get-aggregated-weekdays", async (event: any, args: any) => {
  aggregator = new Aggregator(dbManager);
  return await aggregator.aggregatingWeekdays();
});
