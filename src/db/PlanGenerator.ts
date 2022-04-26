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

    constructor(externalTasks: EventObject[], aggregator: Aggregator) {
        this.externTasks = externalTasks;
        this.aggregator = aggregator;
        this.sortTasks();
    }

    sortTasks() {
        if (this.externTasks.length !== 0) {
            console.log('in sorting');
            const demandLevels = Object.values(demandLevel);
            this.externTasks.forEach((event) => {
                let demandLevelArray: EventObject[] = [];
                for (let className of event.classNames) {
                    if (className.includes('demand-')) {
                        event.demand = parseInt(className.split('-')[1]);
                        break;
                    }
                }
                const key = event.demand ? demandLevels[event.demand - 1] : demandLevels[demandLevels.length - 1];
                const hasDeadline = event.deadline !== undefined;
                const ifCatNotExisting = hasDeadline ? this.sortedByDeadlineAndDemand[parseInt(key)] === undefined : this.sortedByDemand[parseInt(key)] === undefined;
                //DemandLevel category not existing yet
                if (event.demand !== undefined && ifCatNotExisting) {
                    demandLevelArray.push(event);
                }
                //DemandLevel category exists already
                else if (event.demand !== undefined) {
                    demandLevelArray = hasDeadline ? this.sortedByDeadlineAndDemand[parseInt(key)] : this.sortedByDemand[parseInt(key)];
                    if (hasDeadline) {
                        //sort with splice
                        for (let index = 0; index < demandLevelArray.length; index++) {
                            let hasBeenSorted = false;
                            const newEventTime = new Date(event.deadline as string).getTime();
                            const existingEventTime = new Date(demandLevelArray[index].deadline as string).getTime();
                            if (newEventTime < existingEventTime) {
                                demandLevelArray.splice(index, 0, event);
                                hasBeenSorted = true;
                                break;
                            }
                            if (newEventTime === existingEventTime) {
                                if ((event!.demand as number) > (demandLevelArray[index].demand as number)) demandLevelArray.splice(index, 0, event);
                                else if (index + 1 < demandLevelArray.length) demandLevelArray.splice(index + 1, 0, event); //second last element
                                hasBeenSorted = true;
                                break;
                            }
                            if (index === demandLevelArray.length - 1 && !hasBeenSorted) {
                                demandLevelArray.push(event);
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
                if (demandLevelArray.length !== 0) {
                    if (hasDeadline) this.sortedByDeadlineAndDemand = { ...this.sortedByDeadlineAndDemand, [key]: demandLevelArray };
                    else this.sortedByDemand = { ...this.sortedByDemand, [key]: demandLevelArray };
                }
            });
        }
    }

    async assignTasks() {
        console.log('in assigning');
        const [weekStart, weekEnd] = this.getWeek();
        const availableSlots = await this.generateAvaiableSlots();
        const sortedByDeadlineAndDemand = await this.sortedByDeadlineAndDemand;
        //assign first tasks with deadline
        if (Object.keys(sortedByDeadlineAndDemand).length !== 0) {
            console.log('in sortbydeadline');
            for (let demandLevel in sortedByDeadlineAndDemand) {
                for (let event of sortedByDeadlineAndDemand[demandLevel]) {
                    const deadline = new Date(event.deadline as string);
                    console.log('in event');
                    //deadline comes up this week
                    if (weekStart.getTime() < deadline.getTime() && deadline.getTime() <= weekEnd.getTime()) {
                        console.log('before slot assignment');
                        console.log(availableSlots);
                        console.log(event);
                        //if event was assigned - delete it out of sorted object
                        if (this.findFit(event, weekStart, availableSlots)) this.sortedByDeadlineAndDemand[demandLevel].splice(this.sortedByDeadlineAndDemand[demandLevel].indexOf(event), 1);
                        console.log('after slot assignment');
                        console.log(availableSlots);

                        console.log(event);
                    }
                }
            }
        }

        if (Object.keys(await this.sortedByDemand).length !== 0) {
            const demandLevels = Object.keys(demandLevel);
            for (let index = demandLevels.length - 2; index >= 0; index--) {}
        }
        return this.packAndReturnEvents();
    }

    private findFit(event: EventObject, weekStart: Date, availableSlots: any): boolean {
        const deadline = new Date(event.deadline as string);
        const deadlineDay = deadline.toLocaleString('en-us', { weekday: 'long' });
        //const deadlineHour = parseInt(deadline.toLocaleTimeString('en-de', { hour: '2-digit' }));
        const roundedEventDuration = event.duration; //TODO duration missing in database (even necessary???)
        const [eventDurationHours, eventDurationMinutes] = roundedEventDuration!.split(':');
        const roundHours = parseInt(eventDurationHours) + (parseInt(eventDurationMinutes) >= 30 ? 1 : 0);

        let proposals: proposals = {};

        for (let weekday in availableSlots) {
            //if weekday is same as the deadline, accept search result and abort - unless it's Monday
            if (weekday === deadlineDay && weekday !== weekdays.Monday) {
                console.log('in break');
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
                            const durationEvaluation = this.formulaResolver(timeCategory.totalDuration, roundHours, comparison);

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
        /*
        //print
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
            const MAX_COMPARISONS = 15;
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

                                const tempResult = this.compareProposals(tempFinal.result, potentialOne, event.demand as number, roundHours, availableSlots);
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
        }

        if (finalPick.result.length !== 0) {
            this.takeSlot(availableSlots, this.formWeekdayBackToIsoDate(finalPick.weekday, weekStart), finalPick.result, event);
            this.assignedEvents.push(event);
            return true;
        }
        return false;

        //evaluate results
    }

    async generateAvaiableSlots() {
        let data: any = await this.aggregator.createFullWeekHourBundle(); //WeekdayWithHours[]
        const result: IcategorizeProductivity = {};
        const ABBERATION = 0.5;
        //go through every weekday
        for (let weekdayObject of data) {
            let lastTimeProductivity;

            const weekday = Object.keys(weekdayObject)[0];
            //go through every time
            for (let timeProdObject of weekdayObject[weekday]) {
                const time = timeProdObject.x;
                const currentTimeProductivity = timeProdObject.y;
                let notStoredYet = true;
                //at the beginning of the loop (first time-category to store)
                if (lastTimeProductivity === undefined) lastTimeProductivity = { time: `${time}`, prodLevel: currentTimeProductivity, duration: 1 };
                //if next time's productivity is in similiar to the last time's productivity (based on the abberation)
                else if (lastTimeProductivity.prodLevel - currentTimeProductivity <= 0 + ABBERATION && lastTimeProductivity.prodLevel - currentTimeProductivity >= 0 - ABBERATION) {
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
                if (weekdayObject[weekday].indexOf(timeProdObject) === weekdayObject[weekday].length - 1 && notStoredYet) {
                    const objToPush = {
                        from: lastTimeProductivity.time,
                        end: `${time}`,
                        totalDuration: lastTimeProductivity.duration,
                        avgPro: lastTimeProductivity.prodLevel
                    };
                    if (result[weekday] !== undefined) result[weekday].push(objToPush);
                    else result[weekday] = [objToPush];
                }
            }
        }
        return result;
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

    private formulaResolver(timeCategory: number, eventValue: number, comparisonType: string) {
        const f = new Function(`timeCategory`, `eventValue`, `return timeCategory ${comparisonType} eventValue`);
        let result;
        try {
            result = f(timeCategory, eventValue);
        } catch (e: any) {
            result = false;
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

    private takeSlot(availableSlots: any, weekday: string, timeCategories: timeProductivityCategory[], event: EventObject) {
        const weekdayDate = new Date(weekday);
        const weekdayString = weekdayDate.toLocaleString('en-us', { weekday: 'long' });
        const weekdayMilliseconds = weekdayDate.getTime();
        const [durationHour, durationMinute] = event.duration!.split(':');
        const roundedDurationHour = parseInt(durationHour) + (parseInt(durationMinute) >= 30 ? 1 : 0);
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
                    hourFromOriginal = (hourEndOriginal as number) - roundedDurationHour;
                }
                //time forwards
                else if (hourFrom > (hourFromOriginal as number) && hourFrom === hourEndOriginal) {
                    hourEndOriginal = (hourFromOriginal as unknown as number) + roundedDurationHour;
                }
            }
        }

        const start = weekdayMilliseconds + (hourFromOriginal as number) * 60 * 60 * 1000;

        const end = start + parseInt(durationHour) * 60 * 60 * 1000 + parseInt(durationMinute) * 60 * 1000;

        //update event
        (event.start = new Date(start).toISOString()), (event.end = new Date(end).toISOString());

        //const index = availableSlots[weekdayString].indexOf(timeCategory);
        let timeCatsArray: any[] = availableSlots[weekdayString];

        //delete slot
    }
    private updateAvalaibleSlots(timeCategories: timeProductivityCategory[], availableSlotsWeekday: timeProductivityCategory[], roundedDurationHour: number) {
        /*
for(let timeCategory of timeCategories){
    
if (timeCategory.totalDuration === roundedDurationHour) timeCatsArray.splice(index, 1);
else if (timeCategory.totalDuration < roundedDurationHour) {
    //unknown behavior
}
//update Slot
else {
    const [fromHour, fromMinute] = timeCategory.from.split(':');
    const updatedHour = parseInt(fromHour) + roundedDurationHour;
    const formatUpdatedHour = updatedHour < 10 ? `0${updatedHour}:00` : `${updatedHour}:00`;
    const updatedTimeCat = { ...timeCategory, from: formatUpdatedHour, totalDuration: timeCategory.totalDuration - roundedDurationHour };
    timeCatsArray.splice(index, 1, updatedTimeCat);
}
availableSlots[weekdayString] = timeCatsArray;
    }*/
    }

    private formWeekdayBackToIsoDate(weekday: string, weekStart: Date) {
        let searchWeekday = weekStart.toLocaleString('en-us', { weekday: 'long' });
        let newDate = weekStart;

        while (searchWeekday !== weekday) {
            newDate = new Date(newDate.getTime() + 24 * 60 * 60 * 1000);
            searchWeekday = newDate.toLocaleString('en-us', { weekday: 'long' });
        }

        if (newDate !== undefined) return newDate.toISOString();
        else return weekStart.toISOString();
    }

    private compareProposals(previous: any, potentialOne: timeProductivityCategory, eventDemand: number, roundedEventDuration: number, availableSlots: IcategorizeProductivity) {
        const weekday: weekdays = previous.weekday;
        let potentialScore = 0;
        const values = [Math.abs(eventDemand - potentialOne.avgPro), Math.abs(roundedEventDuration - potentialOne.totalDuration)];
        potentialScore = potentialScore + this.rateTimeCategory(values);
        let result;

        //when there's not enough time with this option
        if (potentialOne.totalDuration < roundedEventDuration) {
            result = this.checkForMoreTime(potentialOne, eventDemand, roundedEventDuration, availableSlots[weekday]);
            result.score = result.score + potentialScore;
        }
        //if there's enough time
        else {
            result = { score: potentialScore + 10, result: [potentialOne] };
        }
        return result;
    }
    private checkForMoreTime(
        potentialOne: timeProductivityCategory,
        eventDemand: number,
        roundedEventDuration: number,
        availableSlotsInWeekday: timeProductivityCategory[]
    ): { score: number; result: timeProductivityCategory[] } {
        const currentTimeCatIndex = availableSlotsInWeekday.indexOf(potentialOne);
        const MULTIPLE_TIME_SLOTS_PENALTY = -4;
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
        while (summedUpTime < roundedEventDuration && (continueWithBefore || continueWithForward) && (!hardLockBefore || !hardLockForward)) {
            //set up values for going backwards in time
            if (continueWithBefore && indexBackwards - 1 >= 0) {
                timeCatBefore = availableSlotsInWeekday[indexBackwards - 1];
                timeCatBeforePreviously = availableSlotsInWeekday[indexBackwards];
                [hourBefore, minuteBefore] = timeCatBefore.end.split(':');
                [hourBeforePreviously, minuteBeforePreviously] = timeCatBeforePreviously.from.split(':');
                timeBefore = timeCatBefore.totalDuration;
                prodBefore = timeCatBefore.avgPro;
            } else continueWithBefore = false;

            //set up values for going forwards in time
            if (continueWithForward && indexForward + 1 < availableSlotsInWeekday.length) {
                timeCatForwardPreviously = availableSlotsInWeekday[indexForward];
                timeCatForward = availableSlotsInWeekday[indexForward + 1];
                [hourForward, minuteForward] = timeCatForward.from.split(':');
                [hourForwardPreviously, minuteForwardPriviously] = timeCatForwardPreviously.end.split(':');
                timeForward = timeCatForward.totalDuration;
                prodForward = timeCatForward.avgPro;
            } else continueWithForward = false;

            //check if there's no time gap
            if (!hardLockBefore && parseInt(hourBefore) !== parseInt(hourBeforePreviously)) hardLockBefore = true;
            if (!hardLockForward && parseInt(hourForward) !== parseInt(hourForwardPreviously)) hardLockForward = true;

            //decide if forward or backwards is better option
            if (prodBefore !== undefined && prodForward !== undefined && timeBefore !== undefined && timeForward !== undefined && !hardLockBefore && !hardLockForward) {
                if (Math.abs(eventDemand - prodBefore) < Math.abs(eventDemand - prodForward)) {
                    totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodBefore)]) + MULTIPLE_TIME_SLOTS_PENALTY;
                    continueWithForward = false;
                    continueWithBefore = true;
                    summedUpTime = summedUpTime + timeBefore;
                    result.push(timeCatBefore as timeProductivityCategory);
                } else {
                    totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodForward)]) + MULTIPLE_TIME_SLOTS_PENALTY;
                    continueWithForward = true;
                    continueWithBefore = false;
                    summedUpTime = summedUpTime + timeForward;
                    result.push(timeCatForward as timeProductivityCategory);
                }
            } else if (prodBefore !== undefined && timeBefore !== undefined && !hardLockBefore) {
                totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodBefore)]) + MULTIPLE_TIME_SLOTS_PENALTY;
                continueWithForward = false;
                summedUpTime = summedUpTime + timeBefore;
            } else if (prodForward !== undefined && timeForward !== undefined && !hardLockForward) {
                totalScore = totalScore + this.rateTimeCategory([Math.abs(eventDemand - prodForward)]) + MULTIPLE_TIME_SLOTS_PENALTY;
                continueWithBefore = false;
                summedUpTime = summedUpTime + timeForward;
            }
        }
        if (summedUpTime < roundedEventDuration) totalScore = totalScore - 10000;
        else if (result.length <= 2) totalScore = totalScore + 3;
        return { score: totalScore, result: result };
    }

    private rateTimeCategory(values: number[]) {
        let potentialScore = 0;
        for (let value of values) {
            switch (value) {
                case 0.1:
                    potentialScore = potentialScore + 5;
                    break;
                case 0.5:
                    potentialScore = potentialScore + 4;
                    break;
                case 1:
                    potentialScore = potentialScore + 3;
                    break;
                case 1.5:
                    potentialScore = potentialScore + 2;
                    break;
                case 2:
                    potentialScore = potentialScore + 1;
                    break;
                default:
                    if (value > 0.1 && value < 0.5) potentialScore = potentialScore + 4.5;
                    if (value > 0.5 && value < 1) potentialScore = potentialScore + 3.5;
                    if (value > 1 && value < 1.5) potentialScore = potentialScore + 2.5;
                    if (value > 1.5 && value < 2) potentialScore = potentialScore + 1.5;
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

/*
private compareProposals(previous: any, potentialOne: timeProductivityCategory, eventDemand: number, roundedEventDuration: number, availableSlots: IcategorizeProductivity) {
        const weekday: weekdays = previous.weekday;
        const previousPicked: timeProductivityCategory = previous.result;
        let previousScore = 0;
        let potentialScore = 0;
        let winnerOfProdComparison = '';

        if (Math.abs(eventDemand - previousPicked.avgPro) < Math.abs(eventDemand - potentialOne.avgPro)) {
            previousScore++;
            winnerOfProdComparison = 'previous';
        } else {
            potentialScore++;
            winnerOfProdComparison = 'potential';
        }

        if()

        if (Math.abs(roundedEventDuration - previousPicked.totalDuration) < Math.abs(roundedEventDuration - potentialOne.totalDuration)) previousScore++;
        else potentialScore++;
        if (previousScore < potentialScore && previousScore !== potentialScore) return previousPicked;
        if (previousScore > potentialScore && previousScore !== potentialScore) return potentialOne;
        else if (winnerOfProdComparison === 'previous') return previousPicked;
        else return potentialOne;
    }
*/
