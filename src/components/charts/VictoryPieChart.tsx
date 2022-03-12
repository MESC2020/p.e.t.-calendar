import React, { useEffect, useState } from 'react';
import { VictoryLabel, VictoryPie } from 'victory';

export interface IVictoryPieChartProps {}

const VictoryPieChart: React.FunctionComponent<IVictoryPieChartProps> = (props) => {
    const wantedGraphicData = [
        { x: ' ', y: 20 },
        { x: ' ', y: 80 }
    ];
    const defaultGraphicData = [
        { x: ' ', y: 100 },
        { x: ' ', y: 0 }
    ];
    const [graphicData, setGraphicData] = useState(defaultGraphicData);
    useEffect(() => {
        setGraphicData(wantedGraphicData); // Setting the data that we want to display
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
            <VictoryLabel textAnchor="middle" style={{ fontSize: 60 }} x={200} y={200} text={`${graphicData[1].y}` + '%'} />
        </svg>
    );
};

export default VictoryPieChart;
