import React, { useEffect, useState } from 'react';
import { VictoryLabel, VictoryPie } from 'victory';

export interface IVictoryPieChartProps {
    data: number;
    max: number;
    inPrecent: boolean;
}

const VictoryPieChart: React.FunctionComponent<IVictoryPieChartProps> = (props) => {
    const wantedGraphicData = [
        { x: ' ', y: 100 - (props.data * 100) / props.max },
        { x: ' ', y: (props.data * 100) / props.max }
    ];
    const defaultGraphicData = [
        { x: ' ', y: 100 },
        { x: ' ', y: 0 }
    ];
    const [graphicData, setGraphicData] = useState(defaultGraphicData);
    useEffect(() => {
        setTimeout(() => {
            setGraphicData(wantedGraphicData);
        }, 3); // Setting the data that we want to display
    }, []);
    return (
        <svg className="relative w-full" viewBox="0 0 400 400">
            <VictoryPie
                animate={{ easing: 'exp' }}
                standalone={false}
                width={400}
                height={400}
                data={graphicData}
                innerRadius={68}
                labelRadius={100}
                style={{ labels: { fontSize: 20, fill: 'white' } }}
                colorScale={['white', 'navy']}
            />
            <VictoryLabel textAnchor="middle" style={{ fontSize: 60 }} x={200} y={200} text={`${props.data}${props.inPrecent ? '%' : ''}`} />
        </svg>
    );
};

export default VictoryPieChart;
