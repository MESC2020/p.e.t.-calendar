import React from 'react';
import { VictoryChart, VictoryLegend, VictoryLine, VictoryTheme } from 'victory';
import { measurement } from '../../db/Aggregator';
export interface IVictoryLineChartProps {
    data: IaggregatedWeekdays[] | undefined;
}

const VictoryLineChart: React.FunctionComponent<IVictoryLineChartProps> = (props) => {
    function retrieveData(measure: measurement) {
        const weekData: any = [];
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let weekdayIndex = 0;
        if (props.data !== undefined) {
            props.data.forEach((data) => {
                const key = Object.keys(data)[0];
                const day = { x: weekdays[weekdayIndex], y: data[key][measure] };
                weekData.push(day);

                weekdayIndex++;
            });
        }
        return weekData;
    }
    return (
        <>
            <VictoryChart width={500} theme={VictoryTheme.material} domain={{ y: [0, 7] }}>
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
                    data={retrieveData(measurement.productive)}
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
                    data={retrieveData(measurement.energy)}
                />
            </VictoryChart>
        </>
    );
};

export default VictoryLineChart;
