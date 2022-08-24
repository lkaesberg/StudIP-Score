import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import {Line} from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
const fetch = require('sync-fetch')
const lars_data = fetch("https://gwdg.larskaesberg.de/logs/l.kaesberg.log").text()
const constantin_data = fetch("https://gwdg.larskaesberg.de/logs/c.dalinghaus.log").text()


export const options = {
    responsive: true,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    stacked: false,
    plugins: {
        title: {
            display: true,
            text: 'StudIP - Score',
        },
    },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
        },
        x: {
            type: 'linear',
            display: true,
            grid: {
                drawOnChartArea: false,
            },
        },
    },
};


export const data = {
    datasets: [
        {
            label: 'l.kaesberg',
            data: lars_data.split("\n").map(line => {
                const data = line.split(" ")
                return {x: data[1], y: data[0]}
            }),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
            label: 'c.dalinghaus',
            data: constantin_data.split("\n").map(line => {
                const data = line.split(" ")
                return {x: data[1], y: data[0]}
            }),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
};

export function App() {
    return <Line options={options} data={data}/>;
}
