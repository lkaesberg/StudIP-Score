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

function split_data(data) {
    return data.split("\n").map(line => {
        const data = line.split(" ")
        const d = new Date(0);
        d.setUTCSeconds(data[1]);
        return {x: d, y: parseInt(data[0])}
    })
}

const users = ["l.kaesberg", "c.dalinghaus", "s.kampen", "niklas.bauer01"]
const users_colors = [[255, 99, 132], [255, 132, 99], [99, 255, 132], [132, 99, 255]]
const user_data = users.map(user => fetch(`https://gwdg.larskaesberg.de/logs/${user}.log`).text())
const user_data_array = user_data.map(data => split_data(data))
const user_last_value = user_data_array.map(data => data[data.length - 2]["y"])


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
            beginAtZero: true,
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
    datasets:
        [...Array(users.length).keys()].map(i => ({
                label: users[i],
                color: "white",
                data: user_data_array[i],
                borderColor: `rgb(${users_colors[i][0]}, ${users_colors[i][1]}, ${users_colors[i][2]})`,
                backgroundColor: `rgba(${users_colors[i][0]}, ${users_colors[i][1]}, ${users_colors[i][2]}, 0.5)`,
            })
        )
    ,
};

export function App() {
    return (
        <header className="App-header">
            <Line className="chart" options={options} data={data}/>
            <div>Aktuell Erster: {users[user_last_value.indexOf(Math.max(...user_last_value))]} ({Math.max(...user_last_value)} Punkte)</div>
        </header>
    );
}
