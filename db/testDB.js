exports.getNames = () => {
  let dbmgr = require("./dbMgr");
  let db = dbmgr.db;
  const sql = "SELECT * FROM coldTest";
  const result = db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    return rows;
  });

  return result;
};
