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
import {valueOrDefault} from "chart.js/helpers";

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
        mode: "x",
        axis: "x",
        intersect: false,
    },
    stacked: false,
    plugins: {
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
    const [pointDifferences, setPointDifferences] = useState([]);

    const windowDimensions = useWindowDimensions()
    options.plugins.zoom.zoom.onZoomComplete = (ctx) => {
        setZoomLevel(ctx.chart.getZoomLevel());

        const xScale = ctx.chart.scales.x;
        const visiblePoints = [];

        ctx.chart.data.datasets.forEach((dataset, datasetIndex) => {
            const data = dataset.data;
            const minIndex = data.findIndex((value) => value.x > xScale.min)
            let maxIndex = data.findIndex((value) => value.x > xScale.max)
            if (maxIndex === -1) maxIndex = data.length - 2;
            if (minIndex <= maxIndex) {
                const visibleData = data.slice(minIndex, maxIndex + 1);
                visiblePoints[datasetIndex] = {
                    firstValue: visibleData[0]?.y,
                    lastValue: visibleData[visibleData.length - 1]?.y,
                };
            } else {
                visiblePoints[datasetIndex] = null;
            }
        });

        const updatedPointDifferences = user_data_array.map((user_data_array_person, index) => {
            const points = visiblePoints[index];
            if (points) {
                return points.lastValue - points.firstValue;
            } else {
                return null;
            }
        });

        setPointDifferences(updatedPointDifferences);
    };
    useEffect(() => {
        chartRef.current.resetZoom()
    }, [])
    const data_window = user_data_array.map((user_data_array_person) => user_data_array_person.filter((_, i, array) => ((i % Math.ceil(array.length / (zoomLevel * 100 * (windowDimensions.width / 1300))) === 0) || (i === array.length - 2))))
    const data = {
        datasets:
            [...Array(users.length).keys()].map(i => ({
                    label: users[i][0],
                    color: "white",
                    data: data_window[i],
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
            <h1>StudIP - Score</h1>
            <div className="content-container">
                <div className="chart-container">
                    <Line ref={chartRef} className="chart" options={options} data={data}/>
                    <Button
                        onClick={() => {
                            chartRef.current.resetZoom();
                            setZoomLevel(1);
                        }}
                        variant="Contained"
                    >
                        Reset Zoom
                    </Button>
                </div>
                <div className="leaderboard">
                    <h2>Leaderboard</h2>
                    <ul>
                        {[...user_last_value]
                            .sort((a, b) => b - a)
                            .map((value, place) => {
                                const index = user_last_value.indexOf(value);
                                return (
                                    <li key={index} className={place === 0 ? 'highlighted' : ''}>
                                        <span className="position">{place + 1}</span>
                                        <span className="username">{users[index][0]}</span>
                                        <span className="points">{value}</span>
                                        <span className="difference">
                    {pointDifferences[index] && (
                        <span className="difference-value">
                        ({pointDifferences[index] > 0 ? '+' : ''}
                            {pointDifferences[index]})
                      </span>
                    )}
                  </span>
                                    </li>
                                );
                            })}
                    </ul>
                </div>
            </div>
        </header>
    );
}