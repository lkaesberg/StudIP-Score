import React from 'react';
import './App.css';
import 'chartjs-adapter-date-fns';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend, Chart,
} from 'chart.js';
import {Line} from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
const fetch = require('sync-fetch')
const lars_data = fetch("https://gwdg.larskaesberg.de/logs/l.kaesberg.log").text()
const constantin_data = fetch("https://gwdg.larskaesberg.de/logs/c.dalinghaus.log").text()

const lars_data_array = lars_data.split("\n").map(line => {
    const data = line.split(" ")
    const d = new Date(0);
    d.setUTCSeconds(data[1]);
    return {x: d, y: data[0]}
})
const constantin_data_array = constantin_data.split("\n").map(line => {
    const data = line.split(" ")
    const d = new Date(0);
    d.setUTCSeconds(data[1]);
    return {x: d, y: data[0]}
})
const lars_last_value = lars_data_array[lars_data_array.length - 2]["y"]
const constantin_last_value = constantin_data_array[constantin_data_array.length - 2]["y"]


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
            padding: {
                top: 10,
                bottom: 30
            },
            font: {
                size: 30
            },
            color: "white"
        },
        legend: {
            display: true,
            labels: {
                color: 'white'
            }
        }
    },
    labels: {
        fontColor: "white",
        fontSize: 18
    },
    scales: {
        y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
                color: "rgba(120,120,120,0.5)"
            }, gridLines: {
                color: 'rgb(32, 83, 214)', //give the needful color
                display: true,
            },
            color: "rgba(120,120,120,0.5)",
            ticks: {
                color: "white"
            }
        },
        x: {
            type: 'time',
            time: {
                unit: 'hour',
                displayFormats: {
                    'hour': 'HH:mm'
                }, tooltipFormat: "dd.MM.yyyy HH:mm"
            },
            display: true,
            grid: {
                drawOnChartArea: false,
                color: "rgba(120,120,120,0.5)"
            }, gridLines: {
                color: 'rgb(32, 83, 214)', //give the needful color
                display: true,
            },
            color: "rgba(120,120,120,0.5)",
            ticks: {
                color: "white"
            }
        },
    },
};


export const data = {
    datasets: [
        {
            label: 'l.kaesberg',
            color: "white",
            data: lars_data_array,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
            label: 'c.dalinghaus',
            data: constantin_data_array,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
};

export function App() {
    return (
        <header className="App-header">
            <Line className="chart" options={options} data={data}/>
            <div>Aktuell Erster: {(lars_last_value < constantin_last_value) ? "l.kaesberg" : "c.dalinghaus"}</div>
            <div>Vorsprung: {Math.abs(lars_last_value - constantin_last_value)} Punkte</div>
        </header>
    );
}
