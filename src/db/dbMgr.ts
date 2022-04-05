const sqlite3 = require('sqlite3');

const UNSTORED = 'unstored';
export class dbMgr {
    db: SQlite | undefined;

    constructor() {}

    initDb() {
        this.db = new sqlite3.Database('./DB.db', (err: error) => {
            if (err) {
                return console.error(err.message);
            }
            this.createTable();

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

    createTable() {
        if (this.db != undefined) {
            try {
                this.db.run(
                    //Creates Table "Events" in the very first run
                    'CREATE TABLE IF NOT EXISTS Events (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, demand INTEGER NOT NULL, deadline TEXT, start TEXT, end TEXT)'
                );
            } catch (err: any) {
                console.log(err);
            }
        }
    }

    getAllData(tableName: string): any {
        const sql = 'SELECT * FROM ' + tableName;
        const results = this.retrieveData(sql);
        return results;
    }

    updateEvents(data: EventObject[]) {
        if (this.db != undefined) {
            for (let event of data) {
                let valuesToChange = 'title = ?, demand = ?';
                const demand = this.retrieveDemandLevel(event.classNames);
                const data = [event.title, demand];
                if (event.deadline != undefined) {
                    valuesToChange = valuesToChange + ', deadline = ?';
                    data.push(event.deadline);
                }
                if (event.start) {
                    valuesToChange = valuesToChange + ', start = ?, end = ?';
                    data.push(event.start, event.end);
                }
                data.push(event.id);
                const sql = `UPDATE Events SET ${valuesToChange} WHERE id = ?`;
                this.db.run(sql, data, (err: error) => {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            }
        }
    }

    saveEvents(data: EventObject[]) {
        console.log('Start saving...');
        if (this.db != undefined) {
            for (let event of data) {
                // Event is not yet stored
                if (event.id == undefined) {
                    let valuesToChange = '(title, demand';
                    let placeholders = ')';
                    const demand = this.retrieveDemandLevel(event.classNames);

                    const data = [event.title, demand];
                    if (event.start !== undefined && event.end !== undefined) {
                        valuesToChange = valuesToChange + ', start, end';
                        placeholders = ',?,?)';
                        data.push(event.start, event.end);
                    }
                    if (event.deadline != undefined) {
                        valuesToChange = valuesToChange + ', deadline)';
                        placeholders = ',?' + placeholders;
                        data.push(event.deadline);
                    } else valuesToChange = valuesToChange + ')';

                    const sql = `INSERT INTO Events ${valuesToChange} VALUES(?,?${placeholders}`;
                    console.log(sql);

                    this.db.run(sql, data, (err: error) => {
                        if (err) {
                            return console.log(err.message);
                        }
                    });

                    const sql2 = 'SELECT MAX(id) FROM Events';
                    const id = this.retrieveMaxId(sql2);

                    return id;
                }
            }
        }
    }

    private retrieveDemandLevel(classNames: string[]) {
        for (let demandLevel of classNames) {
            if (demandLevel.includes('-')) return parseInt(demandLevel.slice(-1));
        }
    }

    private retrieveMaxId(sql: string) {
        const id = new Promise((resolve, reject) => {
            this!.db!.get(sql, (err: any, row: any) => {
                if (err) {
                    throw err;
                }
                let object = { value: row['MAX(id)'] };
                resolve(object);
            });
        });
        id.then((row: any) => {
            return row;
        }).catch((err: error) => console.log(err));

        return id;
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
/*const sqlCheck = 'SELECT EXISTS(SELECT * from Events WHERE id=4)';
                    this.db.get(sqlCheck, (err, row) => { */
