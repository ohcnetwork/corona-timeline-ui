import React, { ForwardedRef, useEffect, useRef } from 'react';
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
import { Line } from 'react-chartjs-2';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { ChartJsData } from '../models/chart.model';
import transitions from '@material-ui/core/styles/transitions';
import { animate } from 'highcharts';
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
interface Props {
    chartJsDataset: ChartJsData;
}
export const LineChart = ({chartJsDataset}: Props) => {
    const chartRef = useRef<ChartJSOrUndefined<"line", (number|null)[], unknown>>(null);

    useEffect(() => {
        if(!chartRef) {
            return;
        }
        console.log('chartJsDataset', chartJsDataset);
        chartRef.current!.update();
    }, [chartJsDataset])
    return (
        <Line
            data={chartJsDataset}
            ref={chartRef}
        ></Line>
    )
}