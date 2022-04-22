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
                        { name: 'Energy', symbol: { fill: '#F56853' } },
                        { name: 'Productivity', symbol: { fill: '#3b83f6' } }
                    ]}
                />
                <VictoryLine
                    style={{
                        data: { stroke: '#3b83f6' },
                        parent: { border: '1px solid #ccc' }
                    }}
                    data={transformDataToArray(measurement.productive)}
                    animate={{
                        duration: 2000
                    }}
                />
                <VictoryLine
                    style={{
                        data: { stroke: '#F56853' },
                        parent: { border: '1px solid #ccc' }
                    }}
                    data={transformDataToArray(measurement.energy)}
                    animate={{
                        duration: 4000
                    }}
                />
            </VictoryChart>
        </>
    );
};

export default VictoryLineChart;
