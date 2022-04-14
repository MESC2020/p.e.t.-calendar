export interface IaggregatedHoursWithoutEnergy {
    [day: string]: { [time: string]: number };
}

export interface IaggregatedHoursWithEnergy {
    [day: string]: { [time: string]: { [measurement: string]: number } };
}

export type aggregatedHours = IaggregatedHoursWithoutEnergy | IaggregatedHoursWithEnergy;

export enum measurement {
    productive = 'productive',
    energy = 'energy'
}
export interface IaggregatedWeekdays {
    [day: string]: { [measurement: string]: number };
}
export class Aggregator {
    dbManager: any;
    constructor(dbMgr: any) {
        this.dbManager = dbMgr;
    }

    async aggregatingWeekdays(): Promise<IaggregatedWeekdays[]> {
        const weekdays: any = await this.aggregatingHours(true);
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

    aggregatingHours(includeEnergy: boolean = false) {
        const today = new Date();
        const db = this.dbManager.db;
        const sql = `SELECT day, time, AVG(productive)${includeEnergy ? ',AVG(energy) ' : ' '}FROM Report GROUP BY day, time ORDER BY time ASC`;
        console.log(sql);
        let result;
        if (db !== undefined) {
            result = new Promise((resolve, reject) => {
                db.all(sql, [], (err: any, rows: any) => {
                    if (err) {
                        throw err;
                    }
                    const objc: aggregatedHours = {};
                    console.log(rows);
                    rows.forEach((row: any) => {
                        objc[row.day] = { ...objc[row.day], [row.time]: includeEnergy ? { productive: row['AVG(productive)'], energy: row['AVG(energy)'] } : row['AVG(productive)'] };
                        console.log(objc);
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
