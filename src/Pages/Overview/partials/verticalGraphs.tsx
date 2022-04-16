import React, { useEffect, useState } from 'react';
import ProductivityGraph from '../../../components/charts/VictoryProductivityGraph';
import { weekdays } from '../../../db/Aggregator';

export interface IVerticalGraphProps {
    className?: string;
    showAnimation: boolean;
}

type GraphData = {
    x: string;
    y: number;
};

const VerticalGraph: React.FunctionComponent<IVerticalGraphProps> = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<GraphData[][]>();
    useEffect(() => {
        async function getData() {
            const res: IaggregatedHoursWithoutEnergy = await window.api.getAggregatedHours();
            const days: any = await prepareData(res);
            console.log(days);
            setData(days);
            if (days !== undefined) setIsLoading(!isLoading);
        }
        if (isLoading) getData();
    });

    function prepareData(objectHours: any) {
        const days = [];
        const allKeys = Object.keys(objectHours);
        const enumWeekdays = Object.keys(weekdays);
        const sizeObjectHours = allKeys.length;

        let count = 0;
        //check if object is not empty
        if (allKeys.length !== 0) {
            //go through each weekday
            for (let keyDay of enumWeekdays) {
                const day = [];
                count = 0;
                //if that weekday has data
                if (allKeys.includes(keyDay)) {
                    for (let keyTime in objectHours[keyDay]) {
                        const [hour, minute] = keyTime.split(':');
                        //if there are times skipped - filled them up with "00:00"
                        if (count < parseInt(hour)) {
                            const tempObj = { x: keyTime, y: objectHours[keyDay][keyTime] };
                            const ifNotMidnightReached = Object.keys(objectHours[keyDay]).indexOf(keyTime) === Object.keys(objectHours[keyDay]).length - 1 && keyTime !== '24:00';
                            const completedData = completeData(count, parseInt(hour), ifNotMidnightReached, tempObj);
                            count = parseInt(hour);

                            day.push(...completedData);
                        } else {
                            const tempObj = { x: keyTime, y: objectHours[keyDay][keyTime] };
                            day.push(tempObj);
                        }
                        count++;
                    }
                }
                //if that weekday has no data (fill it up completely with "00:00")
                else {
                    const completedData = completeData(0, 25, false);
                    day.push(...completedData);
                }
                const final = { [keyDay]: day };
                days.push(final);
            }
        }
        //if the complete object is empty, fill the whole week with "00:00"
        else {
            enumWeekdays.forEach((weekday) => {
                const emptyDay = completeData(0, 25, false);
                const final = { [weekday]: emptyDay };
                days.push(final);
            });
        }
        return days;
    }

    function completeData(count: number, hour: number, midnightNotReached: boolean, temp?: any) {
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
    /*
    function completeAndRetrieveData() {
        let result;
        if (data !== undefined) {
            if (data.length < 7) result = [...data, ...placeholderData.slice(data.length)];
            else result = [...data];
        } else result = placeholderData;
        return result;
    }*/

    function returnGraphs() {
        if (data !== undefined) {
            return data.map((data) => (
                <div className="overlap-day-box overflow-hidden ">
                    <ProductivityGraph showAnimation={props.showAnimation} data={data[Object.keys(data)[0]]} />
                </div>
            ));
        }
    }

    return (
        <div className={`${props.className}` + ' click-through opacity-10 h-full w-full '}>
            <div className="w-full overlap-header"></div>
            {isLoading ? (
                ''
            ) : (
                <div className="flex overlap-main overflow-hidden">
                    <>{returnGraphs()}</>
                </div>
            )}
        </div>
    );
};

export default VerticalGraph;
