import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export const options = {
    elements: {
        center: {
            text: 'Red is 2/3 of the total numbers',
            color: '#FF6384', // Default is #000000
            fontStyle: 'Arial', // Default is Arial
            sidePadding: 20, // Default is 20 (as a percentage)
            minFontSize: 25, // Default is 20 (in px), set to false and text will not wrap.
            lineHeight: 25 // Default is 25 (in px), used for when text wraps
        }
    }
};

export const data = {
    labels: ['Finished on time'],
    datasets: [
        {
            label: '# of Votes',
            data: [80, 20],
            backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(54, 10, 235, 0.2)'],
            borderColor: ['rgba(54, 162, 235, 10)', 'rgba(54, 10, 235, 0.5)'],
            borderWidth: 2
        }
    ]
};

export interface IPieChartProps {}

const PieChart: React.FunctionComponent<IPieChartProps> = (props) => {
    return <Pie data={data} />;
};

export default PieChart;
