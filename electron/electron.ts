// main entry point for electron
// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "../build/index.html"));
  } else {
    mainWindow.loadURL("http://localhost:3000");
  }

  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')
  //mainWindow.loadFile(path.join(__dirname,'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const sqlite3 = require("sqlite3");

// Initializing a new database
const db = new sqlite3.Database("./db/testDB.db", (err: any) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to SQlite database");
});

const getNames = (db: any) => {
  const sql = "SELECT * FROM family";
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err: any, rows: any) => {
      if (err) {
        throw err;
      }
      const list: any = [];
      rows.forEach((row: any) => {
        list.push(row);
      });
      resolve(list);
    });
  });
};

ipcMain.handle("get-names", async (event: any, args: any) => {
  console.log("we're in handler");
  const results = getNames(db)
    .then((list) => {
      return list;
    })
    .catch((err) => console.log(err));
  return results;
});
export {};
