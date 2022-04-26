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

export type WeekdayWithHours = {
    [day: string]: GraphData[];
};

type GraphData = {
    x: string;
    y: number;
};

export class Aggregator {
    dbManager: any;
    constructor(dbMgr: any) {
        this.dbManager = dbMgr;
    }
    //Used for stats
    async aggregatingWeekdays(): Promise<IaggregatedWeekdays[]> {
        const weekdays: any = await this.aggregatingHours(true); //any as type: IaggregatedHoursWithEnergy
        let count = 0;
        let sumProductive = 0;
        let sumEnergy = 0;

        let avgWeekdays: any = {};

        for (let day in weekdays) {
            for (let time in weekdays[day]) {
                sumProductive = sumProductive + weekdays[day][time][measurement.productive];
                sumEnergy = sumEnergy + weekdays[day][time][measurement.energy];
                count++;
            }
            const current = { [day]: { [measurement.productive]: sumProductive / count, [measurement.energy]: sumEnergy / count } };
            avgWeekdays = { ...avgWeekdays, ...current };
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

    async createFullWeekHourBundle() {
        const data: any = await this.aggregatingHours();
        return this.fillUp(data as IaggregatedHoursWithoutEnergy);
    }

    fillUp(objectHours: IaggregatedHoursWithoutEnergy) {
        const days: WeekdayWithHours[] = [];
        const allKeys = Object.keys(objectHours);
        const enumWeekdays = Object.keys(weekdays);

        let count = 0;
        //check if object is not empty
        if (allKeys.length !== 0) {
            //go through each weekday
            for (let keyDay of enumWeekdays) {
                const day: GraphData[] = [];
                count = 0;
                //if that weekday has data
                if (allKeys.includes(keyDay)) {
                    for (let keyTime in objectHours[keyDay]) {
                        const lastKeyTime: boolean = Object.keys(objectHours[keyDay]).indexOf(keyTime) === Object.keys(objectHours[keyDay]).length - 1;
                        const [hour, minute] = keyTime.split(':');
                        //if there are times skipped - filled them up with "00:00"
                        if (count < parseInt(hour)) {
                            const tempObj = { x: keyTime, y: objectHours[keyDay][keyTime] };
                            const ifNotMidnightReached = lastKeyTime && keyTime !== '24:00';
                            const completedData = this.completeData(count, parseInt(hour), ifNotMidnightReached, tempObj);
                            count = parseInt(hour);
                            day.push(...completedData);
                        } else {
                            const tempObj = { x: keyTime, y: objectHours[keyDay][keyTime] };
                            day.push(tempObj);
                            if (lastKeyTime && day.length !== 25) {
                                const completedData = this.completeData(count + 1, 25, false);
                                day.push(...completedData);
                            }
                        }
                        count++;
                    }
                }
                //if that weekday has no data (fill it up completely with "00:00")
                else {
                    const completedData = this.completeData(0, 25, false);
                    day.push(...completedData);
                }
                const final = { [keyDay]: day };
                days.push(final);
            }
        }
        //if the complete object is empty, fill the whole week with "00:00"
        else {
            enumWeekdays.forEach((weekday) => {
                const emptyDay = this.completeData(0, 25, false);
                const final = { [weekday]: emptyDay };
                days.push(final);
            });
        }
        return days;
    }
    completeData(count: number, hour: number, midnightNotReached: boolean, temp?: GraphData) {
        const filler = [];
        let loop = true;
        let tempAlreadyAdded = false;
        while (loop) {
            while (count < hour) {
                let time = count < 10 ? `0${count}:00` : `${count}:00`;
                const tempObj = { x: time, y: 0 };
                filler.push(tempObj);
                count++;
            }
            if (temp !== undefined && !tempAlreadyAdded) {
                filler.push(temp);
                tempAlreadyAdded = true;
            }
            if (midnightNotReached && hour != 25) {
                count++;
                hour = 25;
            } else loop = false;
        }

        return filler;
    }
}
