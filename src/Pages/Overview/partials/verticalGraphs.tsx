import React, { useEffect, useState } from 'react';
import TestChart from '../../../components/charts/VictoryTestChart';

export interface IVerticalGraphProps {
    className?: string;
    showAnimation: boolean;
}

const dataTestSet1 = [
    { x: '8:00', y: 1 },
    { x: '9:00', y: 4 },
    { x: '10:00', y: 5 },
    { x: '11:00', y: 4 },
    { x: '12:00', y: 7 },
    { x: '13:00', y: 2 },
    { x: '14:00', y: 3 },
    { x: '15:00', y: 2 },
    { x: '16:00', y: 4 },
    { x: '17:00', y: 5 }
];

const dataTestSet2 = [
    { x: '8:00', y: 3 },
    { x: '9:00', y: 4 },
    { x: '10:00', y: 5 },
    { x: '11:00', y: 5 },
    { x: '12:00', y: 6 },
    { x: '13:00', y: 7 },
    { x: '14:00', y: 2 },
    { x: '15:00', y: 3 },
    { x: '16:00', y: 1 },
    { x: '17:00', y: 5 }
];
const dataTestSet3 = [
    { x: '8:00', y: 2 },
    { x: '9:00', y: 3 },
    { x: '10:00', y: 2 },
    { x: '11:00', y: 4 },
    { x: '12:00', y: 5 },
    { x: '13:00', y: 2 },
    { x: '14:00', y: 7 },
    { x: '15:00', y: 6 },
    { x: '16:00', y: 6 },
    { x: '17:00', y: 5 }
];
const dataTestSet4 = [
    { x: '8:00', y: 3 },
    { x: '9:00', y: 2 },
    { x: '10:00', y: 5 },
    { x: '11:00', y: 7 },
    { x: '12:00', y: 7 },
    { x: '13:00', y: 6 },
    { x: '14:00', y: 7 },
    { x: '15:00', y: 6 },
    { x: '16:00', y: 4 },
    { x: '17:00', y: 5 }
];
const dataTestSet5 = [
    { x: '8:00', y: 2 },
    { x: '9:00', y: 2 },
    { x: '10:00', y: 3 },
    { x: '11:00', y: 4 },
    { x: '12:00', y: 5 },
    { x: '13:00', y: 1 },
    { x: '14:00', y: 3 },
    { x: '15:00', y: 4 },
    { x: '16:00', y: 4 },
    { x: '17:00', y: 7 }
];

interface t {
    [coordination: string]: string | number;
}
const VerticalGraph: React.FunctionComponent<IVerticalGraphProps> = (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<any>();
    useEffect(() => {
        async function getData() {
            const res = await window.api.getAggregatedHours();
            const days = await prepareData(res);
            setData(days);
            setIsLoading(!isLoading);
        }
        if (isLoading) getData();
    });

    function prepareData(objct: any) {
        const days = [];
        for (let keyDay in objct) {
            const day = [];
            let count = 0;
            for (let keyTime in objct[keyDay]) {
                if (count === 0) day.push({ x: '8:00', y: objct[keyDay][keyTime] }); //since first time has no info on productivity

                const tempObj = { x: keyTime, y: objct[keyDay][keyTime] };
                day.push(tempObj);
                count++;
            }
            day.push({ x: '', y: 7 }); // to make sure scale max is 7
            days.push(day);
        }
        return days;
    }
    return (
        <div className={`${props.className}` + ' click-through opacity-10 h-full w-full '}>
            <div className="w-full overlap-header"></div>
            {isLoading ? (
                ''
            ) : (
                <div className="flex overlap-main overflow-hidden">
                    <div className="overlap-day-box"></div>
                    <div className="overlap-day-box overflow-hidden ">
                        <TestChart showAnimation={props.showAnimation} data={data[0]} />
                    </div>
                    <div className="overlap-day-box overflow-hidden">
                        <TestChart showAnimation={props.showAnimation} data={dataTestSet2} />
                    </div>
                    <div className="overlap-day-box overflow-hidden">
                        <TestChart showAnimation={props.showAnimation} data={dataTestSet3} />
                    </div>
                    <div className="overlap-day-box overflow-hidden">
                        <TestChart showAnimation={props.showAnimation} data={dataTestSet4} />
                    </div>
                    <div className="overlap-day-box overflow-hidden">
                        <TestChart showAnimation={props.showAnimation} data={dataTestSet5} />
                    </div>
                    <div className="overlap-day-box "></div>
                </div>
            )}
        </div>
    );
};

export default VerticalGraph;
