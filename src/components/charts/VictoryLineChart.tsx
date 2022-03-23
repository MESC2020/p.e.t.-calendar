import React from 'react';
import { VictoryChart, VictoryLegend, VictoryLine, VictoryTheme } from 'victory';

export interface IVictoryLineChartProps {}

const VictoryLineChart: React.FunctionComponent<IVictoryLineChartProps> = (props) => {
    return (
        <VictoryChart width={500} theme={VictoryTheme.material}>
            <VictoryLegend
                x={150}
                y={20}
                orientation="horizontal"
                gutter={50}
                style={{ border: { stroke: '' } }}
                data={[
                    { name: 'Energy', symbol: { fill: '#2C9EE6' } },
                    { name: 'Productivity', symbol: { fill: '#c43a31' } }
                ]}
            />
            <VictoryLine
                style={{
                    data: { stroke: '#c43a31' },
                    parent: { border: '1px solid #ccc' }
                }}
                animate={{
                    duration: 2000,
                    onLoad: { duration: 1500 }
                }}
                data={[
                    { x: 'Monday', y: 2 },
                    { x: 'Tuesday', y: 3 },
                    { x: 'Wednesday', y: 5 },
                    { x: 'Thursday', y: 4 },
                    { x: 'Friday', y: 7 }
                ]}
            />
            <VictoryLine
                style={{
                    data: { stroke: '#2C9EE6' },
                    parent: { border: '1px solid #ccc' }
                }}
                animate={{
                    duration: 2000,
                    onLoad: { duration: 1500 }
                }}
                data={[
                    { x: 'Monday', y: 7 },
                    { x: 'Tuesday', y: 4 },
                    { x: 'Wednesday', y: 6 },
                    { x: 'Thursday', y: 2 },
                    { x: 'Friday', y: 3 }
                ]}
            />
        </VictoryChart>
    );
};

export default VictoryLineChart;