const sqlite3 = require("sqlite3");

const db = new sqlite3.Database("testDB.db", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to SQlite database");
});

const sql = "SELECT * FROM family";
list = db.all(sql, [], (err, rows) => {
  if (err) {
    throw err;
  }

  rows.forEach((row) => {
    list.push(row);
  });
});
console.log(list);
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
