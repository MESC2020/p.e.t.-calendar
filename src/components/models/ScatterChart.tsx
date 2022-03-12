import React from 'react';
import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import faker from '@faker-js/faker';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

export const options = {
    scales: {
        y: {
            beginAtZero: true
        },
        x: {
            grid: {
                offset: true
            },
            ticks: {
                padding: 3
            }
        }
    }
};
const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const data = {
    datasets: [
        {
            label: 'A dataset',
            data: Array.from({ length: 20 }, () => ({
                y: faker.datatype.number({ min: 1, max: 7 })
            })),
            backgroundColor: 'rgba(255, 99, 132, 1)'
        }
    ]
};

export interface IScatterChartProps {}

const ScatterChart: React.FunctionComponent<IScatterChartProps> = (props) => {
    return <Scatter options={options} data={data} />;
};

export default ScatterChart;
