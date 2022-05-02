import React, { useEffect, useState } from 'react';
import ProductivityGraph from '../../../components/charts/VictoryProductivityGraph';

export interface IVerticalGraphProps {
    className?: string;
    showAnimation: boolean;
    unlockAIbutton: any;
}

type WeekdayWithHours = {
    [day: string]: GraphData[];
};

type GraphData = {
    x: string;
    y: number;
};

const VerticalGraph: React.FunctionComponent<IVerticalGraphProps> = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<WeekdayWithHours[]>();
    useEffect(() => {
        async function getData() {
            const res: WeekdayWithHours[] = await window.api.getAggregatedHours();
            if (unlockAiButton(res)) props.unlockAIbutton(true);

            setData(res);
            if (res !== undefined) setIsLoading(!isLoading);
        }
        if (isLoading) getData();
    });

    function returnGraphs() {
        if (data !== undefined) {
            return data.map((data) => (
                <div className="overlap-day-box overflow-hidden ">
                    <ProductivityGraph showAnimation={props.showAnimation} data={data[Object.keys(data)[0]]} />
                </div>
            ));
        }
    }
    function unlockAiButton(res: WeekdayWithHours[]) {
        let counterHourSlot = 0;
        let counterDifferentDays = 0;
        const MINIMUM_HOUR_SLOTS = 16;
        const MINIMUM_WEEKDAYS = 2;
        for (let weekdays of res) {
            const checkBeforeCounting = counterHourSlot;
            for (let weekday in weekdays) {
                for (let graphData of weekdays[weekday]) {
                    if (graphData.y > 0) counterHourSlot++; //count only the time slots that are not 0
                }
            }
            if (counterHourSlot - checkBeforeCounting > 0) counterDifferentDays++; //count the day only if it contains data
        }
        if (counterDifferentDays >= MINIMUM_WEEKDAYS && counterHourSlot >= MINIMUM_HOUR_SLOTS) return true;
        else return false;
    }

    return (
        <div className={`${props.className}` + ' click-through opacity-20 h-full w-full '}>
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
