import { Aggregator, weekdays } from './Aggregator';
const moment = require('moment');
enum demandLevel {
    one = '1',
    two = '2',
    three = '3',
    four = '4',
    five = '5',
    six = '6',
    seven = '7',
    none = '0'
}
enum rateCategoryMode {
    time = 'time',
    prod = 'productivity'
}

enum comparisonTypes {
    equal = '===',
    smaller = '<',
    bigger = '>'
}

enum comparisonTypesRating {
    GOOD = '1',
    OK = '2',
    BAD = '3'
}

interface Isorted {
    [demandLevel: number]: EventObject[];
}

interface IcategorizeProductivity {
    [weekday: string]: timeProductivityCategory[];
}

type resultObject = {
    weekday: string;
    score: number;
    result: timeProductivityCategory[];
};

type timeProductivityCategory = {
    from: string;
    end: string;
    totalDuration: number;
    avgPro: number;
};
interface proposals {
    [proposal: string]: { [weekday: string]: timeProductivityCategory[] };
}

export class PlanGenerator {
    aggregator: Aggregator;
    calendarTasks: EventObject[] = [];
    externTasks: EventObject[];
    sortedByDemand: Isorted = {};
    sortedByDeadlineAndDemand: Isorted = [];
    timeWeekData: any;
    assignedEvents: EventObject[] = [];
    rules: any = {
        ABERRATION: 0.5,
        MAX_COMPUTATIONS: 50,
        PENALTY_MULTIPLE_SLOTS: -1,
        FAVOR_PRODUCTIVITY: 2
    };

    constructor(permissionToIncludeEventsInCalendar: boolean, aggregator: Aggregator, allEvents: any) {
        const [weekStart, weekEnd] = this.getWeek();
        const tasksToAssign: EventObject[] = [];

        allEvents.forEach((event: EventObject) => {
            if (new Date(event.start as string).getTime() > weekStart.getTime() && new Date(event.end as string).getTime() <= weekEnd.getTime() && permissionToIncludeEventsInCalendar) {
                event.start = undefined;
                event.end = undefined;
                tasksToAssign.push(event);
            } else if (event.start === undefined || event.start === null) {
                event.start = undefined;
                event.end = undefined;
                tasksToAssign.push(event);
            } else {
                this.assignedEvents.push(event);
            }
        });

        this.externTasks = tasksToAssign;
        this.aggregator = aggregator;
        this.sortTasks();
    }

    sortTasks() {
        const [weekStart, weekEnd] = this.getWeek();
        if (this.externTasks.length !== 0) {
            const demandLevels = Object.values(demandLevel);
            this.externTasks.forEach((event) => {
                let eventsList: EventObject[] = [];
                const key = event.demand ? demandLevels[event.demand - 1] : demandLevels[demandLevels.length - 1];
                let hasDeadline = event.deadline !== undefined && event.deadline !== null;
                if (hasDeadline) {
                    const deadline = new Date(event.deadline as string);
                    //deadline is passed this week
                    if (deadline.getTime() > weekEnd.getTime()) {
                        hasDeadline = false;
                    } else if (weekStart.getTime() >= deadline.getTime()) {
                        return; //works as continue
                    }
                }
                const ifCatNotExisting = hasDeadline ? this.sortedByDeadlineAndDemand[parseInt(key)] === undefined : this.sortedByDemand[parseInt(key)] === undefined;
                //DemandLevel category not existing yet
                if (event.demand !== undefined && ifCatNotExisting) {
                    eventsList.push(event);
                }
                //DemandLevel category exists already
                else if (event.demand !== undefined) {
                    eventsList = hasDeadline ? this.sortedByDeadlineAndDemand[parseInt(key)] : this.sortedByDemand[parseInt(key)];
                    if (hasDeadline) {
                        //sort with splice
                        for (let index = 0; index < eventsList.length; index++) {
                            let hasBeenSorted = false;
                            const newEventTime = new Date(event.deadline as string).getTime();
                            const existingEventTime = new Date(eventsList[index].deadline as string).getTime();
                            if (newEventTime < existingEventTime) {
                                eventsList.splice(index, 0, event);
                                hasBeenSorted = true;
                                break;
                            }
                            if (newEventTime === existingEventTime) {
                                if ((event!.demand as number) > (eventsList[index].demand as number)) eventsList.splice(index, 0, event);
                                else if (index + 1 < eventsList.length) eventsList.splice(index + 1, 0, event); //second last element
                                hasBeenSorted = true;
                                break;
                            }
                            if (index === eventsList.length - 1 && !hasBeenSorted) {
                                eventsList.push(event);
                            }
                        }
                        //sort with inbuilt sort
                        /*
                        eventsList.sort((a: any, b: any) =>
                            new Date(a.deadline).getTime() < new Date(b.deadline).getTime() ? 1 : a.deadline === b.deadline ? (a.demand > b.demand ? 1 : -1) : -1
                        );
                        eventsList.reverse();*/
                    } else eventsList.push(event);
                }
                if (eventsList.length !== 0) {
                    if (hasDeadline) this.sortedByDeadlineAndDemand = { ...this.sortedByDeadlineAndDemand, [key]: eventsList };
                    else this.sortedByDemand = { ...this.sortedByDemand, [key]: eventsList };
                }
            });
        }
    }

    async assignTasks() {
        const [weekStart, weekEnd] = this.getWeek();
        const availableSlots = await this.generateAvaiableSlots();
        const sortedByDeadlineAndDemand = await this.sortedByDeadlineAndDemand;
        const sortedByDemand = await this.sortedByDemand;
        //assign first tasks with deadline
        if (Object.keys(sortedByDeadlineAndDemand).length !== 0) {
            for (let demandLevel in sortedByDeadlineAndDemand) {
                for (let index = sortedByDeadlineAndDemand[demandLevel].length - 1; index >= 0; index--) {
                    const event = sortedByDeadlineAndDemand[demandLevel][index];

                    //if event was assigned - delete it out of sorted object
                    const isAssigned = this.findFit(event, weekStart, availableSlots);

                    if (isAssigned && event.start !== undefined && event.start !== null && event.end !== undefined && event.end !== null) {
                        this.sortedByDeadlineAndDemand[demandLevel].splice(this.sortedByDeadlineAndDemand[demandLevel].indexOf(event), 1);
                    }
                }
            }
        }
        //events with no deadline or deadline is not until next week
        if (Object.keys(sortedByDemand).length !== 0) {
            for (let demandLevel in sortedByDemand) {
                for (let index = sortedByDemand[demandLevel].length - 1; index >= 0; index--) {
                    //going backwards is important since elements get deleted (messes up index)
                    const event = sortedByDemand[demandLevel][index];

                    const isAssigned = this.findFit(event, weekStart, availableSlots);

                    if (isAssigned && event.start !== undefined && event.start !== null && event.end !== undefined && event.end !== null) {
                        this.sortedByDemand[demandLevel].splice(this.sortedByDemand[demandLevel].indexOf(event), 1);
                    }
                }
            }
        }
        return this.packAndReturnEvents();
    }

    private findFit(event: EventObject, weekStart: Date, availableSlots: any): boolean {
        let deadlineDay;
        if (event.deadline !== undefined && event.deadline !== null) {
            const deadline = new Date(event.deadline as string);
            deadlineDay = deadline.toLocaleString('en-us', { weekday: 'long' });
        }
        //const deadlineHour = parseInt(deadline.toLocaleTimeString('en-de', { hour: '2-digit' }));
        const eventDuration = event.durationTime; //TODO duration missing in database (even necessary???)
        const [eventDurationHours, eventDurationMinutes] = eventDuration!.split(':');
        const exactHours = parseInt(eventDurationHours) + parseInt(eventDurationMinutes) / 60;

        let proposals: proposals = {};

        for (let weekday in availableSlots) {
            //if weekday is same as the deadline, accept search result and abort
            if (deadlineDay !== undefined && weekday === deadlineDay) {
                break;
            } else {
                for (let timeCategory of availableSlots[weekday]) {
                    //analyze productivity between timeCategory and event
                    for (let comparison of Object.values(comparisonTypes)) {
                        const productivityEvaluation = this.formulaResolver(timeCategory.avgPro, event.demand as number, comparison);
                        if (productivityEvaluation === undefined) continue;

                        //analyze duration between timeCategory and event
                        for (let comparison of Object.values(comparisonTypes)) {
                            //.filter((x) => typeof x === 'string')
                            const durationEvaluation = this.formulaResolver(timeCategory.totalDuration, exactHours, comparison);

                            if (durationEvaluation === undefined) continue;

                            //storing proposal
                            const propose = `${productivityEvaluation}:${durationEvaluation}`;
                            if (proposals[propose] === undefined) proposals[propose] = { [weekday]: [timeCategory] };
                            else if (proposals[propose] !== undefined && proposals[propose][weekday] === undefined)
                                proposals[propose] = {
                                    ...proposals[propose],
                                    [weekday]: [timeCategory]
                                };
                            else proposals[propose][weekday].push(timeCategory);
                        }
                    }
                }
            }
        }

        //print
        /*
        for (let rating in proposals) {
            console.log(rating);
            for (let weekday in proposals[rating]) {
                console.log(weekday);
                for (let result of proposals[rating][weekday]) console.log(result);
            }
        }*/

        const ratingCombinations = [
            `${comparisonTypesRating.GOOD}:${comparisonTypesRating.GOOD}`,
            `${comparisonTypesRating.GOOD}:${comparisonTypesRating.OK}`,
            `${comparisonTypesRating.OK}:${comparisonTypesRating.GOOD}`,
            `${comparisonTypesRating.OK}:${comparisonTypesRating.OK}`,
            `${comparisonTypesRating.GOOD}:${comparisonTypesRating.BAD}`,
            `${comparisonTypesRating.OK}:${comparisonTypesRating.BAD}`,
            `${comparisonTypesRating.BAD}:${comparisonTypesRating.GOOD}`,
            `${comparisonTypesRating.BAD}:${comparisonTypesRating.OK}`,
            `${comparisonTypesRating.BAD}:${comparisonTypesRating.BAD}`
        ];
        let finalPick: resultObject = {
            weekday: '' as string,
            score: 0 as number,
            result: [] as timeProductivityCategory[]
        };
        if (Object.keys(proposals).length > 0) {
            const MAX_COMPARISONS = this.rules.MAX_COMPUTATIONS;
            let counterComparisons = 0;
            for (let ratingCombination of ratingCombinations) {
                if (counterComparisons > MAX_COMPARISONS) break;
                if (proposals[ratingCombination] !== undefined) {
                    const weekdays = Object.keys(proposals[ratingCombination]);

                    // GOOD:OK/BAD  or  OK/BAD:GOOD  or  OK/BAD:OK/BAD
                    if (ratingCombination.includes(comparisonTypesRating.OK) || ratingCombination.includes(comparisonTypesRating.BAD)) {
                        for (let weekday of weekdays) {
                            let tempFinal: resultObject = {
                                weekday: `${weekday}`,
                                score: 0 as number,
                                result: [] as timeProductivityCategory[]
                            };
                            for (let timeCategory of proposals[ratingCombination][weekday]) {
                                const potentialOne = timeCategory;

                                const tempResult = this.compareProposals(tempFinal, potentialOne, event.demand as number, exactHours, availableSlots);
                                if (tempFinal.score < tempResult.score) {
                                    tempFinal.result = tempResult.result;
                                    tempFinal.score = tempResult.score;
                                }
                                counterComparisons++;
                            }

                            if (finalPick.score < tempFinal.score) {
                                finalPick = tempFinal;
                                counterComparisons++;
                            }
                        }
                    }

                    // GOOD:GOOD
                    else {
                        finalPick.weekday = weekdays[0];
                        finalPick.score = 100000;
                        finalPick.result.push(proposals[ratingCombination][weekdays[0]][0]); //pick first weekday, and first available time slot

                        break;
                    }
                }
            }
        } else return false;

        if (finalPick.result.length !== 0) {
            this.takeSlot(availableSlots[finalPick.weekday], this.formWeekdayBackToIsoDate(finalPick.weekday), finalPick.result, event);
            this.assignedEvents.push(event);
            return true;
        }
        return false;

        //evaluate results
    }

    async generateAvaiableSlots(noZeros: boolean = true) {
        let data: any = await this.aggregator.createFullWeekHourBundle(); //WeekdayWithHours[]
        const [weekStart, weekEnd] = this.getWeek();
        const weekStartTime = weekStart.toLocaleTimeString('en-de', { hour: '2-digit', minute: '2-digit' });
        const [weekStartHour, weekStartMinute] = weekStartTime.split(':');
        const result: IcategorizeProductivity = {};
        const ABERRATION = this.rules.ABERRATION;
        //go through every weekday
        for (let weekdayObject of data) {
            let lastTimeProductivity;

            const weekday = Object.keys(weekdayObject)[0];
            const weekdayNumber = new Date(this.formWeekdayBackToIsoDate(weekday)).getDay();

            // if today is any day but sunday and weekdayNumber is any bigger day or sunday     OR     today is sunday and weekdayNumber is sunday too
            if ((weekStart.getDay() !== 0 && (weekdayNumber === 0 || weekdayNumber >= weekStart.getDay())) || (weekStart.getDay() === 0 && weekdayNumber === 0)) {
                let timeTresholdReached = false;
                //go through every time
                for (let timeProdObject of weekdayObject[weekday]) {
                    if (timeProdObject.x === '00:00') continue; //00:00 is only a data filler and not actual real data
                    const time = this.substractFromTime(timeProdObject.x);
                    //const time = timeProdObject.x;
                    if (weekdayNumber === weekStart.getDay() && !timeTresholdReached) {
                        if (this.checkIfTimeHasAlreadyPassed(time, parseInt(weekStartHour))) continue;
                        else timeTresholdReached = true;
                    }
                    const currentTimeProductivity = timeProdObject.y;

                    let notStoredYet = true;
                    //at the beginning of the loop (first time-category to store)
                    if (lastTimeProductivity === undefined) lastTimeProductivity = { time: `${time}`, prodLevel: currentTimeProductivity, duration: 1 };
                    //if next time's productivity is in similiar to the last time's productivity (based on the abberation)
                    else if (lastTimeProductivity.prodLevel - currentTimeProductivity <= 0 + ABERRATION && lastTimeProductivity.prodLevel - currentTimeProductivity >= 0 - ABERRATION) {
                        lastTimeProductivity.prodLevel = (lastTimeProductivity.prodLevel * lastTimeProductivity.duration + currentTimeProductivity) / (lastTimeProductivity.duration + 1);
                        lastTimeProductivity.duration++;
                    }

                    //if next time's productivity is too far away - create new time-category and store the last one
                    else {
                        notStoredYet = false;
                        const objToPush = {
                            from: lastTimeProductivity.time,
                            end: `${time}`,
                            totalDuration: lastTimeProductivity.duration,
                            avgPro: lastTimeProductivity.prodLevel
                        };

                        if (result[weekday] !== undefined) result[weekday].push(objToPush);
                        else result[weekday] = [objToPush];
                        lastTimeProductivity = { time: `${time}`, prodLevel: currentTimeProductivity, duration: 1 };
                    }
                    //if last times are of same category (there won't be a category switch) then save them before moving on to next weekday
                    if (weekdayObject[weekday].indexOf(timeProdObject) === weekdayObject[weekday].length - 1 && (notStoredYet || lastTimeProductivity.time === '23:00')) {
                        const objToPush = {
                            from: lastTimeProductivity.time,
                            end: `24:00`, //because of substracting form 24:00 (which is then 23:00), the actual time 24:00 is never reached
                            totalDuration: lastTimeProductivity.duration, //thus also plus another hour
                            avgPro: lastTimeProductivity.prodLevel
                        };
                        if (result[weekday] !== undefined) result[weekday].push(objToPush);
                        else result[weekday] = [objToPush];
                    }
                }
            }
        }

        //this fix, to prevent assignment to time slots with prod of 0 has been added later, thus making other attempts of preventing the assignment of tasks to 0-prod-slots irrelevant - these attempts shold be removed in the code
        if (noZeros) {
            for (let weekday in result) {
                for (let timeslot of result[weekday]) {
                    if (timeslot.avgPro === 0) {
                        const index = result[weekday].indexOf(timeslot);
                        result[weekday].splice(index, 1);
                    }
                }
            }
        }
        return result;
    }

    private substractFromTime(time: string) {
        let [timeHour] = time.split(':');
        return parseInt(timeHour) <= 10 ? `0${parseInt(timeHour) - 1}:00` : `${parseInt(timeHour) - 1}:00`;
    }
    private checkIfTimeHasAlreadyPassed(time: string, weekStartHour: number): boolean {
        const [timeHour, timeMinute] = time.split(':');

        if (parseInt(timeHour) <= weekStartHour || parseInt(timeHour) === 24) return true;
        else return false;
    }

    private getWeek() {
        //full week
        /*
        const now = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toISOString();
        const today = new Date(now);
        const startDay = 1; //0=sunday, 1=monday etc.
        const d = today.getDay(); //get the current day
        const weekStart = new Date(today.getTime() - (d <= 0 ? 7 - startDay : d - startDay) * 86400000); //rewind to start day
        const weekEnd = new Date(weekStart.getTime() + 6 * 86400000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000); //add 6 days 23 hrs and 59 minutes
        */
        // current day till end of week
        const today = new Date();
        const d = today.getDay(); //get the current day
        const weekStart = today; //rewind to start day
        const weekStartMidnight = new Date(moment().hours(0).minutes(0).seconds(0).milliseconds(0).toISOString());
        const weekEnd = new Date(weekStartMidnight.getTime() + (7 - d) * 86400000 + 23 * 60 * 60 * 1000 + 59 * 60 * 1000); //add 6 days 23 hrs and 59 minutes
        return [weekStart, weekEnd];
    }

    private formulaResolver(timeCategory: number, eventValue: number, comparisonType: string) {
        const f = new Function(`timeCategory`, `eventValue`, `return timeCategory ${comparisonType} eventValue`);
        let result;
        try {
            result = f(timeCategory, eventValue);
        } catch (e: any) {
            result = false;
        }
        //in case the difference is not that huge, that's still good

        if (timeCategory - eventValue < 1 && timeCategory - eventValue > 0 && comparisonType === comparisonTypes.bigger) {
            return comparisonTypesRating.GOOD;
        }

        if (result) {
            switch (comparisonType) {
                case comparisonTypes.equal:
                    return comparisonTypesRating.GOOD;
                case comparisonTypes.smaller:
                    return comparisonTypesRating.BAD;
                case comparisonTypes.bigger:
                    return comparisonTypesRating.OK;
            }
        }
    }

    private takeSlot(availableSlots: timeProductivityCategory[], ISOweekday: string, timeCategories: timeProductivityCategory[], event: EventObject) {
        const weekdayDate = new Date(ISOweekday);
        const weekdayMilliseconds = weekdayDate.getTime();
        const [durationHour, durationMinute] = event.durationTime!.split(':');
        const exactDurationHour = parseInt(durationHour) + parseInt(durationMinute) / 60;
        let hourFromOriginal;
        let hourEndOriginal;
        for (let timeCat of timeCategories) {
            //the first timeCat is either the only result or the original (all the others are either before or afterwards timewise)
            if (timeCategories.indexOf(timeCat) === 0) {
                hourFromOriginal = parseInt(timeCat.from.split(':')[0]);
                hourEndOriginal = parseInt(timeCat.end.split(':')[0]);
            } else {
                let hourFrom = parseInt(timeCat.from.split(':')[0]);
                let hourEnd = parseInt(timeCat.end.split(':')[0]);
                //time backwards
                if (hourFrom < (hourFromOriginal as number) && hourEnd === hourFromOriginal) {
                    const timeToSubstract: number =
                        (hourEndOriginal as number) - (hourFromOriginal as number) + timeCat.totalDuration <= exactDurationHour
                            ? (hourEndOriginal as number) - hourFromOriginal + timeCat.totalDuration
                            : (hourEndOriginal as number) - hourFromOriginal + (exactDurationHour - ((hourEndOriginal as number) - hourFromOriginal));
                    hourFromOriginal = (hourEndOriginal as number) - timeToSubstract;
                }
                //time forwards
                else if (hourFrom > (hourFromOriginal as number) && hourFrom === hourEndOriginal) {
                    const timeToAdd: number =
                        hourEndOriginal - (hourFromOriginal as number) + timeCat.totalDuration <= exactDurationHour ? timeCat.totalDuration : exactDurationHour - timeCat.totalDuration;
                    hourEndOriginal = (hourEndOriginal as unknown as number) + timeToAdd;
                }
            }
        }

        const start = weekdayMilliseconds + (hourFromOriginal as number) * 60 * 60 * 1000;

        const end = start + parseInt(durationHour) * 60 * 60 * 1000 + parseInt(durationMinute) * 60 * 1000;

        //update event
        (event.start = new Date(start).toISOString()), (event.end = new Date(end).toISOString());

        this.updateAvalaibleSlots(timeCategories, availableSlots, exactDurationHour, hourFromOriginal as number, hourEndOriginal as number);
    }
    private updateAvalaibleSlots(
        timeCategories: timeProductivityCategory[],
        availableSlotsWeekday: timeProductivityCategory[],
        exactDurationHour: number,
        eventHourStart: number,
        eventHourEnd: number
    ) {
        for (let timeCategory of timeCategories) {
            const [fromHour, fromMinute] = timeCategory.from.split(':');
            const [endHour, endMinute] = timeCategory.end.split(':');

            //if this timeslot wasn't enough but fully used
            if (eventHourStart <= parseInt(fromHour) && eventHourEnd >= parseInt(endHour)) {
                availableSlotsWeekday.splice(availableSlotsWeekday.indexOf(timeCategory), 1); // delete

                continue;
            }

            //if this timeslot is needed and more afterwards
            if (eventHourStart === parseInt(fromHour) && eventHourEnd > parseInt(endHour)) {
                availableSlotsWeekday.splice(availableSlotsWeekday.indexOf(timeCategory), 1); // delete
                continue;
            }

            //if this timeslot is needed and more before
            else if (eventHourEnd === parseInt(endHour) && eventHourStart < parseInt(fromHour)) {
                availableSlotsWeekday.splice(availableSlotsWeekday.indexOf(timeCategory), 1); // delete
                continue;
            }
            //if eventEndTime is somewhere in the middle of timeCategory's from - end time
            if (parseInt(fromHour) <= eventHourEnd && parseInt(endHour) > eventHourEnd) {
                const copy = { ...timeCategory };
                copy.from = this.returnHourInTimeFormat(eventHourEnd);
                copy.totalDuration = parseInt(endHour) - eventHourEnd;
                availableSlotsWeekday.splice(availableSlotsWeekday.indexOf(timeCategory), 1, copy); // delete and replace

                continue;
            }
            //if eventEndStart is somewhere in the middle of timeCategory's from - end time
            else if (parseInt(fromHour) <= eventHourStart && parseInt(endHour) < eventHourEnd) {
                const copy = { ...timeCategory };
                copy.end = this.returnHourInTimeFormat(eventHourStart);
                copy.totalDuration = eventHourStart - parseInt(fromHour);
                availableSlotsWeekday.splice(availableSlotsWeekday.indexOf(timeCategory), 1, copy); // delete and replace
                continue;
            }
        }
    }

    private returnHourInTimeFormat(hour: number) {
        let time = { minute: 0, hour: 0, hasMinutes: false };

        const hasMinutes = (time: any) => {
            let min = hour % 1;
            if (min !== 0) {
                time.minute = min * 60;
                time.hour = Math.floor(hour);
                time.hasMinutes = true;
            }
        };
        hasMinutes(time);
        const hourAdapted = time.hasMinutes ? time.hour : hour;
        const minutes = time.hasMinutes ? (time.minute < 10 ? `0${time.minute}` : `${time.minute}`) : `00`;
        const formatUpdatedHour = hourAdapted < 10 ? `0${hourAdapted}:${minutes}` : `${hourAdapted}:${minutes}`;
        return formatUpdatedHour;
    }
    private formWeekdayBackToIsoDate(weekday: string) {
        const weekStart = new Date(moment().hours(0).minutes(0).seconds(0).milliseconds(0).toISOString());

        let searchWeekday = weekStart.toLocaleString('en-us', { weekday: 'long' });
        let newDate = weekStart;

        while (searchWeekday !== weekday) {
            newDate = new Date(newDate.getTime() + 24 * 60 * 60 * 1000);
            searchWeekday = newDate.toLocaleString('en-us', { weekday: 'long' });
        }

        if (newDate !== undefined) {
            return newDate.toISOString();
        } else {
            return weekStart.toISOString();
        }
    }

    private compareProposals(previous: any, potentialOne: timeProductivityCategory, eventDemand: number, exactHours: number, availableSlots: IcategorizeProductivity) {
        const weekday: weekdays = previous.weekday;
        let potentialScore = 0;
        const values = [{ value: Math.abs(eventDemand - potentialOne.avgPro), mode: rateCategoryMode.prod }, Math.abs(exactHours - potentialOne.totalDuration)];
        potentialScore = potentialScore + this.rateTimeCategory(values);
        let result = {
            score: 0,
            result: [] as timeProductivityCategory[]
        };

        //when there's not enough time with this option
        if (potentialOne.totalDuration < exactHours) {
            result = this.checkForMoreTime(potentialOne, eventDemand, exactHours, availableSlots[weekday]);
            result.score = result.score + potentialScore;
        }
        //if there's enough time
        else if (potentialOne.totalDuration >= exactHours && potentialScore > 5) {
            result = { score: potentialScore + 10, result: [potentialOne] };
        }
        return result;
    }
    private checkForMoreTime(
        potentialOne: timeProductivityCategory,
        eventDemand: number,
        exactHours: number,
        availableSlotsInWeekday: timeProductivityCategory[]
    ): { score: number; result: timeProductivityCategory[] } {
        const currentTimeCatIndex = availableSlotsInWeekday.indexOf(potentialOne);
        const MULTIPLE_TIME_SLOTS_PENALTY = this.rules.PENALTY_MULTIPLE_SLOTS;
        let summedUpTime = potentialOne.totalDuration;
        let indexForward = currentTimeCatIndex;
        let indexBackwards = currentTimeCatIndex;
        let result = [potentialOne];
        let totalScore = 0;

        let continueWithBefore = true;
        let continueWithForward = true;
        let hardLockBefore = false;
        let hardLockForward = false;

        let timeCatBefore;
        let timeCatBeforePreviously;
        let [hourBefore, minuteBefore] = ['', ''];
        let [hourBeforePreviously, minuteBeforePreviously] = ['', ''];

        let timeCatForwardPreviously;
        let timeCatForward;
        let [hourForward, minuteForward] = ['', ''];
        let [hourForwardPreviously, minuteForwardPriviously] = ['', ''];

        let timeBefore;
        let timeForward;
        let prodBefore;
        let prodForward;
        //go back/forward as much as needed
        while (summedUpTime < exactHours && (continueWithBefore || continueWithForward) && (!hardLockBefore || !hardLockForward)) {
            //set up values for going backwards in time
            if (continueWithBefore && indexBackwards - 1 >= 0) {
                timeCatBefore = availableSlotsInWeekday[indexBackwards - 1];
                timeCatBeforePreviously = availableSlotsInWeekday[indexBackwards];
                [hourBefore, minuteBefore] = timeCatBefore.end.split(':');
                [hourBeforePreviously, minuteBeforePreviously] = timeCatBeforePreviously.from.split(':');
                timeBefore = timeCatBefore.totalDuration;
                prodBefore = timeCatBefore.avgPro;
            } else if (indexBackwards - 1 < 0) {
                continueWithBefore = false;
                hardLockBefore = true;
            }

            //set up values for going forwards in time
            if (continueWithForward && indexForward + 1 < availableSlotsInWeekday.length) {
                timeCatForwardPreviously = availableSlotsInWeekday[indexForward];
                timeCatForward = availableSlotsInWeekday[indexForward + 1];
                [hourForward, minuteForward] = timeCatForward.from.split(':');
                [hourForwardPreviously, minuteForwardPriviously] = timeCatForwardPreviously.end.split(':');
                timeForward = timeCatForward.totalDuration;
                prodForward = timeCatForward.avgPro;
            } else if (indexBackwards - 1 < 0) {
                continueWithForward = false;
                hardLockForward = true;
            }

            //check if there's no time gap
            if (!hardLockBefore && parseInt(hourBefore) !== parseInt(hourBeforePreviously)) hardLockBefore = true;
            if (!hardLockForward && parseInt(hourForward) !== parseInt(hourForwardPreviously)) hardLockForward = true;

            //decide if forward or backwards is better option
            if (prodBefore !== undefined && prodForward !== undefined && timeBefore !== undefined && timeForward !== undefined && !hardLockBefore && !hardLockForward) {
                if (Math.abs(eventDemand - prodBefore) < Math.abs(eventDemand - prodForward)) {
                    totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodBefore)], rateCategoryMode.prod) + MULTIPLE_TIME_SLOTS_PENALTY;
                    if (prodBefore === 0) totalScore = totalScore - 10000;
                    continueWithForward = false;
                    continueWithBefore = true;
                    summedUpTime = summedUpTime + timeBefore;
                    result.push(timeCatBefore as timeProductivityCategory);
                } else {
                    totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodForward)], rateCategoryMode.prod) + MULTIPLE_TIME_SLOTS_PENALTY;
                    if (prodForward === 0) totalScore = totalScore - 10000;
                    continueWithForward = true;
                    continueWithBefore = false;
                    summedUpTime = summedUpTime + timeForward;
                    result.push(timeCatForward as timeProductivityCategory);
                }
            } else if (!hardLockBefore && prodBefore !== undefined && timeBefore !== undefined) {
                totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodBefore)], rateCategoryMode.prod) + MULTIPLE_TIME_SLOTS_PENALTY;
                if (prodBefore === 0) totalScore = totalScore - 10000;
                continueWithForward = false;
                if (!result.includes(timeCatForward as timeProductivityCategory)) {
                    summedUpTime = summedUpTime + timeBefore;
                    result.push(timeCatBefore as timeProductivityCategory);
                }
            } else if (!hardLockForward && prodForward !== undefined && timeForward !== undefined) {
                totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodForward)], rateCategoryMode.prod) + MULTIPLE_TIME_SLOTS_PENALTY;
                if (prodForward === 0) totalScore = totalScore - 10000;
                continueWithBefore = false;
                if (!result.includes(timeCatForward as timeProductivityCategory)) {
                    summedUpTime = summedUpTime + timeForward;
                    result.push(timeCatForward as timeProductivityCategory);
                }
            }

            indexBackwards--;

            indexForward++;
        }

        if (summedUpTime < exactHours) totalScore = totalScore - 10000;
        else if (result.length <= 2) totalScore = totalScore + 3;

        return { score: totalScore, result: result };
    }

    private rateTimeCategory(values: number[] | any[], mode?: rateCategoryMode) {
        let potentialScore = 0;
        for (let value of values) {
            const modeToUse = value?.mode !== undefined ? value.mode : mode !== undefined ? mode : undefined;
            const valueToUse = value?.value !== undefined ? value.value : value;
            const CONSTANT = modeToUse !== undefined ? (modeToUse === rateCategoryMode.prod ? this.rules.FAVOR_PRODUCTIVITY : 1) : 1; //productivity should be weighted more
            switch (valueToUse) {
                case 0.1:
                    potentialScore = potentialScore + 5 * CONSTANT;
                    break;
                case 0.5:
                    potentialScore = potentialScore + 4 * CONSTANT;
                    break;
                case 1:
                    potentialScore = potentialScore + 3 * CONSTANT;
                    break;
                case 1.5:
                    potentialScore = potentialScore + 2 * CONSTANT;
                    break;
                case 2:
                    potentialScore = potentialScore + 1 * CONSTANT;
                    break;
                default:
                    if (value > 0.1 && value < 0.5) potentialScore = potentialScore + 4.5 * CONSTANT;
                    if (value > 0.5 && value < 1) potentialScore = potentialScore + 3.5 * CONSTANT;
                    if (value > 1 && value < 1.5) potentialScore = potentialScore + 2.5 * CONSTANT;
                    if (value > 1.5 && value < 2) potentialScore = potentialScore + 1.5 * CONSTANT;
            }
        }
        return potentialScore;
    }

    private packAndReturnEvents(): EventObject[] {
        const assignedEvents: EventObject[] = this.assignedEvents;

        for (let demand in this.sortedByDeadlineAndDemand) {
            //send unassigned Deadline Events back
            if (this.sortedByDeadlineAndDemand[demand].length > 0) {
                this.sortedByDeadlineAndDemand[demand].forEach((event) => {
                    assignedEvents.push(event);
                });
            }
        }
        for (let demand in this.sortedByDemand) {
            //send unassigned Events back
            if (this.sortedByDemand[demand].length > 0) {
                this.sortedByDemand[demand].forEach((event) => {
                    assignedEvents.push(event);
                });
            }
        }

        return assignedEvents;
    }
}
