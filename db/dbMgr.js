const sqlite3 = require("sqlite3");

// Initializing a new database
const db = new sqlite3.Database("./storage.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to SQlite database");
});

/*
db.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Closed the database connection");
});


isDev
    ? path.join(__dirname, "../db/prefs.db") // my root folder if in dev mode
    : path.join(process.resourcesPath, "db/prefs.db"), // the resources path if in production build
  (err) => {
    if (err) {
      console.log(`Database Error: ${err}`);
    } else {
      console.log("Database Loaded");
    }
  }
);



const sql = "SELECT * FROM test";

db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row.name);
  });
});*/
