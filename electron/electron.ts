// main entry point for electron

import { dbMgr, logOptions } from "../src/db/dbMgr";
import { Aggregator } from "../src/db/Aggregator";
import { PlanGenerator } from "../src/db/PlanGenerator";
import { Converter } from "../src/db/ConvertToCSV";

//dev toole extension
/*
import installExtension, {
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
*/

const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  screen,
  dialog,
  Tray,
  nativeImage,
} = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const { URL } = require("url");
let dbManager: dbMgr;
let aggregator: Aggregator;
let tray: any = null;

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
  destroy(): any;
  setVisibleOnAllWorkspaces(flag: boolean, other: any): any;
  setAlwaysOnTop(flag: boolean, option: string): any;
  setFullScreenable(flag: boolean): any;
  moveTop(): any;
};

let popupWindow: Window;
let mainWindow: Window;

// Define React App dev and prod base paths
const devBasePath = "http://localhost:3000/";
const prodBasePath = `file://${path.join(__dirname, "../index.html")}`;

const constructAppPath = (hashRoute = "") => {
  const basePath = isDev ? devBasePath : prodBasePath;
  const appPath = new URL(basePath);

  // Add hash route to base url if provided
  if (hashRoute) appPath.hash = hashRoute;

  // Return the constructed url
  return appPath.href;
};

function storeToCSV() {
  // Resolves to a Promise<Object>
  dialog
    .showOpenDialog(mainWindow, {
      title: "Select a folder where the files should be stored",
      defaultPath: path.join(__dirname, "../assets/"),
      // defaultPath: path.join(__dirname, '../assets/'),
      buttonLabel: "Select",
      // Restricting the user to only Text Files.
      properties: ["openDirectory"],
    })
    .then(async (file: any) => {
      // Stating whether dialog operation was cancelled or not.
      if (!file.canceled && file.filePaths.length !== 0) {
        const converter = new Converter(
          dbManager,
          file.filePaths[0].toString()
        );
        converter.convert();
      }
    })
    .catch((err: any) => {
      console.log(err);
    });
}

function createPopupWindow(width: any, height: any) {
  popupWindow = new BrowserWindow({
    frame: false,
    resizable: false,
    movable: false,
    focusable: false,
    alwaysOnTop: true,
    skipTaskbar: true, //this might be unnecessary since in win, this is already applied when focusable: false
    height: 450,
    width: 400,
    x: width - 400, //to get it into the right bottom corner
    y: height - 450,

    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "/preload.js"),
    },
  });
  Menu.setApplicationMenu(null);
  popupWindow.loadURL(constructAppPath("/report/"));
  // Open the DevTools.
  //popupWindow.webContents.openDevTools();

  popupWindow.on("close", (event: any) => {
    event.preventDefault();
    popupWindow.hide();
  });
  popupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  popupWindow.setAlwaysOnTop(true, "normal");
  popupWindow.setFullScreenable(false);
  // Below statement completes the flow
  popupWindow.moveTop();
}

function createWindow(width: any, height: any) {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    fullscreen: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "/preload.js"),
    },
  });
  mainWindow.loadURL(constructAppPath());
  Menu.setApplicationMenu(null);

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  mainWindow.on("close", function (event: any) {
    if (!app.isQuiting) {
      if (tray === null) {
        createTray();
      }
      event.preventDefault();
      mainWindow.hide();
    }

    return false;
  });
  mainWindow.on("minimize", (event: any) => {
    if (tray === null) {
      createTray();
    }
    event.preventDefault();
    mainWindow.hide();
  });

  function createTray() {
    const ASSETS_PATH = path.join(__dirname, "../tray.png");
    const icon = nativeImage.createFromPath(ASSETS_PATH);
    tray = new Tray(icon);
    const template = [
      {
        label: "Show App",
        click: function () {
          mainWindow.show();
        },
      },
      {
        label: "Quit",
        click: function () {
          if (popupWindow) popupWindow.destroy();
          mainWindow.destroy();
        },
      },
    ];
    const contextMenu = Menu.buildFromTemplate(template);
    tray.setContextMenu(contextMenu);
    tray.setToolTip("P.E.T. calendar");
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const mainScreen = screen.getPrimaryDisplay();
  const { width, height } = mainScreen.workAreaSize;
  //dev extensions
  /*installExtension(REACT_DEVELOPER_TOOLS, {
    loadExtensionOptions: { allowFileAccess: true },
  })
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log("An error occurred: ", err));*/

  infinitePopUpLoop(width, height);
  createWindow(width, height);

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

    popupWindow.show();
    setTimeout(() => {
      popupWindow.close();
    }, 10 * 60 * 1000);
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
ipcMain.handle("get-proposed-plan", async (event: any, args: any) => {
  if (aggregator === undefined) aggregator = new Aggregator(dbManager);
  dbManager.updateLogs([{ information: logOptions.usedAutoAssign, data: 1 }]); //log
  const planner = new PlanGenerator(
    args,
    aggregator,
    await dbManager.getAllData("Events")
  );
  const result = await planner.assignTasks();
  dbManager.updateEvents(result);
  return result;
});

//report handlers
ipcMain.on("close-popup", (event: any, args: any) => {
  if (args.value) popupWindow.close();
});

ipcMain.on("save-report", (event: any, args: any) => {
  if (args[0].productive !== 0) dbManager.saveReport(args);
  popupWindow.close();
});

ipcMain.handle("get-aggregated-hours", async (event: any, args: any) => {
  if (aggregator === undefined) aggregator = new Aggregator(dbManager);
  const result = await aggregator.createFullWeekHourBundle();
  return result;
});

ipcMain.handle("get-aggregated-weekdays", async (event: any, args: any) => {
  if (aggregator === undefined) aggregator = new Aggregator(dbManager);
  return await aggregator.aggregatingWeekdays();
});

//log handlers
ipcMain.handle("retrieve-lock-status", async (event: any, args: any) => {
  const result = await dbManager.retrieveLog(args);
  return result;
});

ipcMain.on("update-logs", (event: any, args: any) => {
  dbManager.updateLogs(args);
});

//save handlers
ipcMain.on("export-to-csv", (event: any, args: any) => {
  storeToCSV();
});
