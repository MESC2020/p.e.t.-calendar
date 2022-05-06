const sqlite3 = require('sqlite3');

const UNSTORED = 'unstored';
const UNLOCKED = 'unlocked';
export enum logOptions {
    isLocked = 'isLocked',
    usedAutoAssign = 'usedAutoAssign',
    updatedEventAssignment = 'updatedEventAssignment',
    updatedEventDemandLevel = 'updatedEventDemandLevel',
    updatedEventDuration = 'updatedEventDuration',
    updatedEventDeadline = 'updatedEventDeadline',
    deletedEvents = 'deletedEvents',
    lookedAtStats = 'lookedAtStats',
    usedDemandToggle = 'usedDemandToggle',
    eventsGenerated = 'eventsGenerated'
}
export class dbMgr {
    db: SQlite | undefined;

    constructor() {}

    initDb() {
        this.db = new sqlite3.Database('./DB.db', (err: error) => {
            if (err) {
                return console.error(err.message);
            }
            this.db!.serialize(() => {
                this.initTables();
                this.initLog();
            });

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

    async getAllData(tableName: string) {
        const sql = 'SELECT * FROM ' + tableName;
        const results = await this.retrieveData(sql);
        return results;
    }
    async initLog() {
        const logEntries: log[] = [
            {
                information: logOptions.isLocked,
                data: 'true'
            },
            {
                information: logOptions.usedAutoAssign,
                data: 0
            },
            {
                information: logOptions.updatedEventAssignment,
                data: 0
            },
            {
                information: logOptions.updatedEventDeadline,
                data: 0
            },
            {
                information: logOptions.updatedEventDemandLevel,
                data: 0
            },
            {
                information: logOptions.updatedEventDuration,
                data: 0
            },
            {
                information: logOptions.deletedEvents,
                data: 0
            },
            {
                information: logOptions.lookedAtStats,
                data: 0
            },
            {
                information: logOptions.usedDemandToggle,
                data: 0
            },
            {
                information: logOptions.eventsGenerated,
                data: 0
            }
        ];
        try {
            logEntries.forEach((log) => {
                this.addToLog(log);
            });
        } catch (err: any) {
            console.log(err);
        }
    }

    async initTables() {
        const tableQueries = [
            'CREATE TABLE IF NOT EXISTS Events (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, demand INTEGER NOT NULL, deadline TEXT, start TEXT, end TEXT, durationTime TEXT)',
            'CREATE TABLE IF NOT EXISTS Report (timestamp text NOT NULL PRIMARY KEY, productive INTEGER NOT NULL, energy INTEGER NOT NULL, day TEXT NOT NULL, time TEXT NOT NULL)',
            'CREATE TABLE IF NOT EXISTS Log (information text NOT NULL PRIMARY KEY, data NOT NULL, timestamp text NOT NULL)'
            /*'CREATE TABLE IF NOT EXISTS Weekday (weekday TEXT NOT NULL PRIMARY KEY, avgProductive INTEGER NOT NULL, avgEnergy INTEGER NOT NULL)'*/
        ];
        try {
            await tableQueries.forEach(async (query) => {
                await this.db!.run(query);
            });
        } catch (err: any) {
            console.log(err);
        }
    }
    deleteEvents(data: EventObject[]) {
        if (this.db != undefined) {
            for (let event of data) {
                if (event.id !== undefined) {
                    const sql = `DELETE FROM Events WHERE id = ?`;
                    this.db.run(sql, [event.id], (err: error) => {
                        if (err) {
                            return console.log(err.message);
                        }
                    });
                    this.updateLogs([{ information: logOptions.deletedEvents, data: 1 }]);
                }
            }
        }
    }

    async updateEvents(data: EventObject[]) {
        if (this.db != undefined) {
            for (let event of data) {
                this.updateLogs(await this.checkChangesForEvent(event));
                let valuesToChange = 'title = ?, demand = ?, deadline = ?';
                const demand = this.retrieveDemandLevel(event);
                const data = [event.title, demand];
                if (event.deadline != undefined) data.push(event.deadline);
                else data.push(undefined);
                console.log(event);

                if (event.start || event.start === undefined || event.start === null) {
                    valuesToChange = valuesToChange + ', start = ?, end = ?';
                    data.push(event.start, event.end);
                }
                if (event.durationTime) {
                    valuesToChange = valuesToChange + ', durationTime = ?';
                    data.push(event.durationTime);
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
    saveReport(data: ReportObject[]) {
        if (this.db != undefined) {
            for (let report of data) {
                let valuesToChange = '(timestamp, productive, energy, day, time)';
                let placeholders = '(?,?,?,?,?)';

                const data = [report.timestamp, report.productive, report.energy, report.day, report.time];

                const sql = `INSERT INTO Report ${valuesToChange} VALUES${placeholders}`;
                this.db.run(sql, data, (err: error) => {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            }
        }
    }

    saveEvents(data: EventObject[]) {
        if (this.db != undefined) {
            for (let event of data) {
                // Event is not yet stored
                if (event.id == undefined) {
                    let valuesToChange = '(title, demand';
                    let placeholders = ')';
                    const demand = this.retrieveDemandLevel(event);

                    const data = [event.title, demand];
                    if (event.start !== undefined && event.end !== undefined) {
                        valuesToChange = valuesToChange + ', start, end';
                        placeholders = ',?,?)';
                        data.push(event.start, event.end);
                    }
                    if (event.deadline != undefined) {
                        valuesToChange = valuesToChange + ', deadline';
                        placeholders = ',?' + placeholders;
                        data.push(event.deadline);
                    }
                    if (event.durationTime != undefined) {
                        valuesToChange = valuesToChange + ', durationTime)';
                        placeholders = ',?' + placeholders;
                        data.push(event.durationTime);
                    } else valuesToChange = valuesToChange + ')';

                    const sql = `INSERT INTO Events ${valuesToChange} VALUES(?,?${placeholders}`;

                    this.db.run(sql, data, (err: error) => {
                        if (err) {
                            return console.log(err.message);
                        }
                    });

                    const sql2 = 'SELECT MAX(id) FROM Events';
                    const id = this.retrieveMaxId(sql2);
                    this.updateLogs([{ information: logOptions.eventsGenerated, data: 1 }]);

                    return id;
                }
            }
        }
    }

    private async addToLog(log: log) {
        if (this.db != undefined) {
            const res = await this.retrieveLog(log.information);
            if (res !== undefined) return; //if log entry already exists, skip
            else {
                const valuesToChange = '(information, data, timestamp)';
                const placeholders = '(?,?,?)';
                const timestamp: string = new Date().toISOString();
                const data = [log.information, log.data, timestamp];

                const sql = `INSERT INTO Log ${valuesToChange} VALUES${placeholders}`;

                await this.db.run(sql, data, (err: error) => {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            }
        }
    }

    private retrieveDemandLevel(event: EventObject) {
        if (event.classNames === undefined || event.classNames === null) {
            return event.demand;
        } else {
            for (let demandLevel of event.classNames) {
                if (demandLevel.includes('-')) return parseInt(demandLevel.slice(-1));
            }
        }
    }

    async updateLogs(data: log[]) {
        if (this.db != undefined) {
            for (let log of data) {
                if (log.information !== logOptions.isLocked) {
                    await this.incrementLogsData(log);
                }
                const timestamp: string = new Date().toISOString();
                const valuesToChange = 'data = ?, timestamp = ?';
                const data = [log.data, timestamp, log.information];
                const sql = `UPDATE Log SET ${valuesToChange} WHERE information = ?`;
                this.db.run(sql, data, (err: error) => {
                    if (err) {
                        return console.log(err.message);
                    }
                });
            }
        }
    }
    private async incrementLogsData(log: log) {
        const currentData = ((await this.retrieveLog(log.information)) as log).data;
        log.data = currentData + log.data;
    }
    private async checkChangesForEvent(event: EventObject) {
        const logsToUpdate: log[] = [];
        if (event.id) {
            const eventInDatabase = (await this.retrieveEvent(event.id)) as EventObject;
            const eventProperties = Object.keys(event);
            let index = 0;
            let alreadyIncrementedDate = false;
            console.log(event);
            console.log(eventInDatabase);
            for (let property in eventInDatabase) {
                if (property === 'id') continue;
                let eventValue;
                const eventInDatabaseValue = eventInDatabase[property as keyof EventObject];
                if (eventProperties.includes(property)) {
                    eventValue = event[property as keyof EventObject];
                } else if (property === 'demand') {
                    eventValue = this.retrieveDemandLevel(event);
                }
                console.log(eventValue);
                console.log(eventInDatabaseValue);

                if (eventInDatabaseValue !== eventValue) {
                    switch (property) {
                        case 'start':
                            if (!alreadyIncrementedDate) {
                                alreadyIncrementedDate = true;
                                logsToUpdate.push({ information: logOptions.updatedEventAssignment, data: 1 });
                            }
                            break;
                        case 'end':
                            if (!alreadyIncrementedDate) {
                                alreadyIncrementedDate = true;
                                logsToUpdate.push({ information: logOptions.updatedEventAssignment, data: 1 });
                            }
                            break;
                        case 'deadline':
                            logsToUpdate.push({ information: logOptions.updatedEventDeadline, data: 1 });
                            break;
                        case 'durationTime':
                            logsToUpdate.push({ information: logOptions.updatedEventDuration, data: 1 });
                            break;
                        case 'demand':
                            logsToUpdate.push({ information: logOptions.updatedEventDemandLevel, data: 1 });
                    }
                }
            }
        }
        console.log(logsToUpdate);
        return logsToUpdate;
    }

    retrieveLog(info: string) {
        const sql = `SELECT * FROM Log where information = '${info}' `;
        const log = new Promise((resolve, reject) => {
            this!.db!.get(sql, (err: any, row: any) => {
                if (err) {
                    throw err;
                }
                resolve(row);
            });
        });
        log.then((row: any) => {
            return row;
        }).catch((err: error) => console.log(err));

        return log;
    }

    retrieveEvent(id: number) {
        const sql = `SELECT * FROM Events where id = '${id}' `;
        const event = new Promise((resolve, reject) => {
            this!.db!.get(sql, (err: any, row: any) => {
                if (err) {
                    throw err;
                }
                resolve(row);
            });
        });
        event
            .then((row: any) => {
                return row;
            })
            .catch((err: error) => console.log(err));

        return event;
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

    async returnAllTables(): Promise<any> {
        const tables = ['Events', 'Report', 'Log'];
        const data = [];
        for (let table of tables) {
            const temp = (await this.getAllData(table)) as any;
            if (table === 'Events') this.makeEventsAnonymous(temp);
            data.push({ [table]: temp });
        }

        return data;
    }
    private makeEventsAnonymous(events: EventObject[]) {
        let index = 0;

        for (let event of events) {
            event.title = this.assignAnonymTitle(index);
            index++;
        }
    }
    private assignAnonymTitle(index: number) {
        if (index < 1000) {
            if (index < 10) {
                return `000${index}`;
            } else if (index < 100) {
                return `00${index}`;
            }
            return `0${index}`;
        } else return `${index}`;
    }
    getDB() {
        return this.db;
    }
}
