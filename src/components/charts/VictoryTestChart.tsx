import { translateRect } from '@fullcalendar/react';
import React from 'react';
import { transform } from 'typescript';
import { VictoryArea, VictoryChart, VictoryLegend, VictoryLine, VictoryScatter, VictoryTheme } from 'victory';

export interface ITestChartProps {
    data?: DataObject[];
}
type DataObject = {
    x: string;
    y: number;
};
const TestChart: React.FunctionComponent<ITestChartProps> = (props) => {
    return (
        // 163.41 * 700
        // viewBox = <min-x> <min-y> <width> <height>
        <svg className="" width={800} height={262} viewBox="0 0 800 262" transform="rotate(90), translate(220,320)">
            <VictoryChart theme={VictoryTheme.material} horizontal={false} standalone={false} width={800} height={262}>
                <VictoryArea
                    style={{
                        data: {
                            fill: '#c43a31',
                            stroke: '#c43a31'
                        },
                        parent: { border: '1px solid #ccc' }
                    }}
                    animate={{
                        duration: 2000,
                        onLoad: { duration: 1500 }
                    }}
                    data={props.data}
                />
            </VictoryChart>
        </svg>
    );
};

export default TestChart;
