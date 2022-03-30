const sqlite3 = require('sqlite3');
export class dbMgr {
    db: SQlite | undefined;

    constructor() {}

    initDb() {
        this.db = new sqlite3.Database('./DB.db', (err: error) => {
            if (err) {
                return console.error(err.message);
            }
            console.log('Connected to SQlite database');
        });
    }

    closeDb() {
        if (this.db != undefined) {
            this.db.close((err: error) => {
                if (err) {
                    return console.error(err.message);
                }
                console.log('Closed the database connection');
            });
        }
    }

    getAllData(tableName: string): any {
        const sql = 'SELECT * FROM ' + tableName;
        const results = this.retrieveData(sql);
        return results;
    }

    private retrieveData(sql: string) {
        const results = new Promise((resolve, reject) => {
            if (this.db != undefined) {
                this.db.all(sql, [], (err: any, rows: any) => {
                    if (err) {
                        throw err;
                    }
                    const list: any = [];
                    rows.forEach((row: any) => {
                        list.push(row);
                    });
                    resolve(list);
                });
            } else {
                throw console.error('Database is not iniated');
            }
        });

        results
            .then((list: any) => {
                return list;
            })
            .catch((err: error) => console.log(err));
        return results;
    }
}
