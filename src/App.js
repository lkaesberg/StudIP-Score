import React, {useRef} from 'react';
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
import zoomPlugin, {resetZoom} from 'chartjs-plugin-zoom';
import {Line} from 'react-chartjs-2';
import {useState, useEffect} from 'react';
import Button from '@mui/material/Button';

ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin
);
const stc = require('string-to-color');
const fetch = require('sync-fetch')

function split_data(data) {
    return data.split("\n").map(line => {
        const data = line.split(" ")
        const d = new Date(0);
        d.setUTCSeconds(data[1]);
        return {x: d, y: parseInt(data[0])}
    })
}

function getWindowDimensions() {
    const {innerWidth: width, innerHeight: height} = window;
    return {
        width,
        height
    };
}

export default function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
const users = ["l.kaesberg", "c.dalinghaus", "s.kampen", "niklas.bauer01", "hbrosen"]
const user_data = users.map(user => fetch(`https://gwdg.larskaesberg.de/logs/${user}.log`).text())
const user_data_array = user_data.map(data => split_data(data).filter((_, i, array) => i % Math.ceil(array.length / 100) === 0 || i === array.length - 1))
const user_last_value = user_data_array.map(data => data[data.length - 2]["y"])


export const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: "nearest",
        axis: "x",
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
        zoom: {
            zoom: {
                drag: {
                    enabled: true
                },
                mode: 'x',
            },
        },
        legend: {
            display: true,
            labels: {
                color: 'white'
            }
        },
        tooltip: {
            itemSort: function (a, b) {
                return b.raw["y"] - a.raw["y"];
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
                unit: 'day',
                displayFormats: {
                    'hour': 'dd.MM.yyyy'
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
                backgroundColor: stc(users[i] + "green") + "80",
                borderColor: stc(users[i] + "green"),
            })
        )
    ,
};

export function App() {
    const chartRef = useRef(null);
    return (
        <header className="App-header">
            <Line ref={chartRef} className="chart" options={options} data={data}/>
            <div className={"chart-buttons"}>
                <Button onClick={() => chartRef.current.resetZoom()} variant="Contained">Reset Zoom</Button>
            </div>
            <br/>
            <div>Aktuell
                Erster: {users[user_last_value.indexOf(Math.max(...user_last_value))]} ({Math.max(...user_last_value)} Punkte)
            </div>
            <br/>
            {[...user_last_value].sort((a, b) => (b - a)).map(value =>
                <div>{users[user_last_value.indexOf(value)]} ({(value)} Punkte)
                </div>)}

        </header>
    );
}
