interface Weekday {
    [weekday: string]: [productive: number, energy: number];
}

interface Hour {
    [hour: string]: [productive: number, energy: number];
}

interface test {
    [day: string]: { [time: string]: number };
}

export class Aggregator {
    dbManager: any;
    constructor(dbMgr: any) {
        this.dbManager = dbMgr;
    }

    async aggregatingWeekdays() {
        const weekdays: any = await this.aggregatingHours();
        console.log(weekdays);
        let count = 0;
        let sum = 0;
        const avgWeekdays = [];

        for (let day in weekdays) {
            for (let time in weekdays[day]) {
                sum = sum + weekdays[day][time];
                count++;
            }
            const objc = { [day]: sum / count };
            avgWeekdays.push(objc);
            (sum = 0), (count = 0);
        }
        console.log(avgWeekdays);
        return avgWeekdays;
    }

    aggregatingHours() {
        const today = new Date();
        const db = this.dbManager.db;
        const sql = 'SELECT day, time, AVG(productive) FROM Report GROUP BY day, time ORDER BY time ASC';
        let result;
        if (db !== undefined) {
            result = new Promise((resolve, reject) => {
                db.all(sql, [], (err: any, rows: any) => {
                    if (err) {
                        throw err;
                    }
                    const objc: test = {};
                    rows.forEach((row: any) => {
                        const allKeys: any = objc.keys;
                        //if(allKeys.includes(row.day)) objc[`${row.day}`] =
                        objc[row.day] = { ...objc[row.day], [row.time]: row['AVG(productive)'] };
                    });
                    resolve(objc);
                });
            });
            result
                .then((row: any) => {
                    return row;
                })
                .catch((err: error) => console.log(err));
        }
        return result;
    }
}
