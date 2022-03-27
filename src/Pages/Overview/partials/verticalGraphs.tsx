import React from 'react';
import TestChart from '../../../components/charts/VictoryTestChart';

export interface IVerticalGraphProps {
    className?: string;
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
const VerticalGraph: React.FunctionComponent<IVerticalGraphProps> = (props) => {
    return (
        <div className={`${props.className}` + ' opacity-40 h-full w-full '}>
            <div className="w-full overlap-header"></div>
            <div className="flex overlap-main overflow-hidden">
                <div className="overlap-day-box"></div>
                <div className="overlap-day-box overflow-hidden ">
                    <TestChart data={dataTestSet1} />
                </div>
                <div className="overlap-day-box overflow-hidden">
                    <TestChart data={dataTestSet2} />
                </div>
                <div className="overlap-day-box overflow-hidden">
                    <TestChart data={dataTestSet3} />
                </div>
                <div className="overlap-day-box overflow-hidden">
                    <TestChart data={dataTestSet4} />
                </div>
                <div className="overlap-day-box overflow-hidden">
                    <TestChart data={dataTestSet5} />
                </div>
                <div className="overlap-day-box "></div>
            </div>
        </div>
    );
};

export default VerticalGraph;
