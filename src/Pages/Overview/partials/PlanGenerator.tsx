import moment from 'moment';
import { Aggregator, weekdays } from '../../../db/Aggregator';
import { dbMgr } from '../../../db/dbMgr';

enum demandLevel {
    one = 1,
    two = 2,
    three = 3,
    four = 4,
    five = 5,
    six = 6,
    seven = 7,
    none = 0
}
interface IsortedDemand {
    [demandLevel: number]: EventObject[];
}

export class PlanGenerator {
    aggregator: Aggregator;
    calendarTasks: EventObject[] = [];
    externTasks: EventObject[];
    sortedByDemand: IsortedDemand = {};
    sortedByDeadlineAndDemand: EventObject[] = [];

    constructor(externalTasks: EventObject[]) {
        this.externTasks = externalTasks;
        const dbManager = new dbMgr();
        this.aggregator = new Aggregator(dbManager);
    }

    sortTasks() {
        if (this.externTasks.length !== 0) {
            const demandLevels = Object.keys(demandLevel);
            this.externTasks.forEach((event) => {
                let demandLevelArray = [];
                const currentDemandLevel = event.demand;
                const key = currentDemandLevel ? demandLevels[currentDemandLevel - 1] : demandLevels[demandLevels.length - 1];
                const hasDeadline = event.deadline !== undefined;
                const ifCatNotExisting = hasDeadline ? this.sortedByDeadlineAndDemand[key] === undefined : this.sortedByDemand[key] === undefined;

                //DemandLevel category not existing yet
                if (currentDemandLevel !== undefined && ifCatNotExisting) {
                    demandLevelArray.push(event);
                }
                //DemandLevel category exists already
                else if (currentDemandLevel !== undefined) {
                    demandLevelArray = hasDeadline ? this.sortedByDeadlineAndDemand : this.sortedByDemand[key];
                    if (hasDeadline) {
                        //sort with splice
                        for (let index = 0; index < demandLevelArray.length; index++) {
                            const newEventTime = new Date(event.deadline as string).getTime();
                            const existingEventTime = new Date(demandLevelArray[index].deadline).getTime();
                            if (newEventTime < existingEventTime) {
                                demandLevelArray.splice(index, 0, event);
                                break;
                            }
                            if (newEventTime === existingEventTime && (event!.demand as number) > demandLevelArray[index].demand) {
                                demandLevelArray.splice(index, 0, event);
                                break;
                            }
                        }
                        //sort with inbuilt sort
                        /*
                        demandLevelArray.sort((a: any, b: any) =>
                            new Date(a.deadline).getTime() < new Date(b.deadline).getTime() ? 1 : a.deadline === b.deadline ? (a.demand > b.demand ? 1 : -1) : -1
                        );
                        demandLevelArray.reverse();*/
                    } else demandLevelArray.push(event);
                }
                if (demandLevelArray.length !== 0)
                    if (hasDeadline) this.sortedByDeadlineAndDemand = { ...this.sortedByDeadlineAndDemand, [key]: demandLevelArray };
                    else this.sortedByDemand = { ...this.sortedByDemand, [key]: demandLevelArray };
            });
        }
    }

    async assignTasks() {
        const [weekStart, weekEnd] = this.getWeek();
        const weekProductivity: any = await this.aggregator.aggregatingHours();
        //assign first tasks with deadline
        if (this.sortedByDeadlineAndDemand.length !== 0) {
            for (let event of this.sortedByDeadlineAndDemand) {
                const deadline = new Date(event.deadline as string);
                //deadline comes up this week
                if (weekStart.getTime() < deadline.getTime() && deadline.getTime() <= weekEnd.getTime()) {
                }
            }
        }

        if (Object.keys(this.sortedByDemand).length !== 0) {
            const demandLevels = Object.keys(demandLevel);
            for (let index = demandLevels.length - 2; index >= 0; index--) {}
        }
    }

    private findFit(deadline: any, event: EventObject, weekProductivity: any) {
        let proposals = {};
        const acceptanceLimit = 0.5;
        const deadlineDay = deadline.toLocaleString('en-us', { weekday: 'long' });
        const deadlineHour = parseInt(deadline.toLocaleTimeString('en-de', { hour: '2-digit' }));
        const eventDuration = event.duration; //TODO duration missing in database (even necessary???)
        const [eventDurationHours, eventDurationMinutes] = eventDuration!.split(':');
        const consecutiveHours = parseInt(eventDurationHours) + (parseInt(eventDurationMinutes) >= 30 ? 1 : 0);

        let potentialStart;
        let consecutiveCounter = 0;
        //check weekdays
        for (let weekday in weekdays) {
            //if deadline weekday is reached stop
            if (weekday === deadlineDay) break;
            //check all the times with stored productivity
            let index = 1;

            let finished;
            const allTimesOfWeekday = Object.keys(weekProductivity[weekday]);
            let lastTime = parseInt(allTimesOfWeekday[0].split(':')[0]);
            while (!finished) {
                let timeNow = lastTime + 1;
                while (lastTime + 1 === timeNow) {
                    if (weekProductivity[weekday][allTimesOfWeekday[index]] >= (event!.demand as number) - acceptanceLimit) {
                        potentialStart = [weekday];
                        consecutiveCounter++;
                    }
                }
            }
            for (let time in weekProductivity[weekday]) {
            }
        }
    }

    private generateAvaiableSlots() {
        let data: any;
    }

    private getWeek() {
        const now = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toISOString();
        const today = new Date(now);
        const startDay = 1; //0=sunday, 1=monday etc.
        const d = today.getDay(); //get the current day
        const weekStart = new Date(today.getTime() - (d <= 0 ? 7 - startDay : d - startDay) * 86400000); //rewind to start day
        const weekEnd = new Date(weekStart.getTime() + 6 * 86400000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000); //add 6 days 23 hrs and 59 minutes
        return [weekStart, weekEnd];
    }
}
