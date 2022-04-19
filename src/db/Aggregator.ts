export enum measurement {
    productive = 'productive',
    energy = 'energy'
}

export enum weekdays {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday'
}

export class Aggregator {
    dbManager: any;
    constructor(dbMgr: any) {
        this.dbManager = dbMgr;
    }
    //Used for stats
    async aggregatingWeekdays(): Promise<IaggregatedWeekdays[]> {
        const weekdays: any = await this.aggregatingHours(true); //any as type: IaggregatedHoursWithEnergy
        console.log(weekdays);
        let count = 0;
        let sumProductive = 0;
        let sumEnergy = 0;

        const avgWeekdays: IaggregatedWeekdays[] = [];

        for (let day in weekdays) {
            for (let time in weekdays[day]) {
                sumProductive = sumProductive + weekdays[day][time][measurement.productive];
                sumEnergy = sumEnergy + weekdays[day][time][measurement.energy];
                count++;
            }
            const objc: IaggregatedWeekdays = { [day]: { [measurement.productive]: sumProductive / count, [measurement.energy]: sumEnergy / count } };
            avgWeekdays.push(objc);
            sumProductive = 0;
            sumEnergy = 0;
            count = 0;
        }
        return avgWeekdays;
    }
    //used for graphs in the calendar
    aggregatingHours(includeEnergy: boolean = false) {
        const db = this.dbManager.db;
        const sql = `SELECT day, time, AVG(productive)${includeEnergy ? ',AVG(energy) ' : ' '}FROM Report GROUP BY day, time ORDER BY time ASC`;
        let result;
        if (db !== undefined) {
            result = new Promise((resolve, reject) => {
                db.all(sql, [], (err: any, rows: any) => {
                    if (err) {
                        throw err;
                    }
                    const objc: aggregatedHours = {};
                    rows.forEach((row: any) => {
                        objc[row.day] = { ...objc[row.day], [row.time]: includeEnergy ? { productive: row['AVG(productive)'], energy: row['AVG(energy)'] } : row['AVG(productive)'] };
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
