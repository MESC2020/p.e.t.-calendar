import React from 'react';
import { VictoryChart, VictoryLegend, VictoryLine, VictoryTheme } from 'victory';
import { measurement, weekdays } from '../../db/Aggregator';
export interface IVictoryLineChartProps {
    data: IaggregatedWeekdays;
    width?: any;
    height?: any;
}

const VictoryLineChart: React.FunctionComponent<IVictoryLineChartProps> = (props) => {
    function transformDataToArray(measure: measurement) {
        const weekData: any = [];
        if (props.data !== undefined) {
            for (let weekday in weekdays) {
                const day = { x: weekday, y: props.data[weekday][measure] };
                weekData.push(day);
            }
        }
        return weekData;
    }
    return (
        <>
            <VictoryChart width={props.width ? props.width : 500} height={props.height ? props.height : 500} theme={VictoryTheme.material} domain={{ y: [0, 7] }}>
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
                    data={transformDataToArray(measurement.productive)}
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
                    data={transformDataToArray(measurement.energy)}
                />
            </VictoryChart>
        </>
    );
};

export default VictoryLineChart;
