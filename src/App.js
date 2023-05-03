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
    Legend,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
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
        return {x: parseInt(data[1]) * 1000, y: parseInt(data[0])}
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
const users = [["l.kaesberg", true], ["c.dalinghaus", true], ["s.kampen", true], ["niklas.bauer01", true], ["hbrosen", true], ["jannisemil.borutta", false], ["n.sennewald", false]]
const user_data = users.map(user => fetch(`https://gwdg.larskaesberg.de/logs/${user[0]}.log`).text())
const user_data_array = user_data.map(data => split_data(data))
const user_last_value = user_data_array.map(data => data[data.length - 2]["y"])


export const options = {
    responsive: true,
    parsing: false,
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
                    enabled: true,

                },
                mode: 'x',
                onZoomComplete: (ctx) => {
                    console.log(ctx.chart)
                    alert(ctx.chart.getZoomLevel())
                }
            },
        },
        decimation: {
            enabled: true,
            algorithm: 'lttb',
            samples: 10
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
            },
            maxRotation: 0,
            autoSkip: true
        },
    },
};


export function App() {
    const [zoomLevel, setZoomLevel] = useState(1);
    const windowDimensions = useWindowDimensions()
    options.plugins.zoom.zoom.onZoomComplete = (ctx) => {
        setZoomLevel(ctx.chart.getZoomLevel())
    }
    const data = {
        datasets:
            [...Array(users.length).keys()].map(i => ({
                    label: users[i][0],
                    color: "white",
                    data: user_data_array[i].filter((_, i, array) => (i % Math.ceil(array.length / (zoomLevel * 100 * (windowDimensions.width / 1300))) === 0) || (i === array.length - 1)),
                    backgroundColor: stc(users[i] + "green") + "80",
                    borderColor: stc(users[i] + "green"),
                    hidden: !users[i][1]
                })
            )
        ,
    };
    const chartRef = useRef(null);
    return (
        <header className="App-header">
            <Line ref={chartRef} className="chart" options={options} data={data}/>
            <div className={"chart-buttons"}>
                <Button onClick={() => {
                    chartRef.current.resetZoom()
                    setZoomLevel(1)
                }} variant="Contained">Reset Zoom</Button>
            </div>
            <br/>
            <div>Aktuell
                Erster: {users.filter((_, i) => users[i][1])[user_last_value.filter((_, i) => users[i][1]).indexOf(Math.max(...user_last_value.filter((_, i) => users[i][1])))]} ({Math.max(...user_last_value.filter((_, i) => users[i][1]))} Punkte)
            </div>
            <br/>
            {[...user_last_value].filter((_, i) => users[i][1]).sort((a, b) => (b - a)).map(value =>
                <div>{users[user_last_value.indexOf(value)]} ({(value)} Punkte)
                </div>)}
        </header>
    );
}
