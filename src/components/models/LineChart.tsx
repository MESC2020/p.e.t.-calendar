import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import faker from '@faker-js/faker';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const
        },
        title: {
            display: true,
            text: 'Productivity and energy behavior'
        }
    },
    scales: {
        x: {
            grid: {
                offset: true
            }
        }
    }
};

const labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const data = {
    labels,
    datasets: [
        {
            label: 'Productivity',
            data: labels.map(() => faker.datatype.number({ min: 1, max: 7 })),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)'
        },
        {
            label: 'Energy',
            data: labels.map(() => faker.datatype.number({ min: -1, max: 7 })),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)'
        }
    ]
};

export interface ILineChartProps {}

const LineChart: React.FunctionComponent<ILineChartProps> = (props) => {
    return <Line options={options} data={data} />;
};

export default LineChart;
