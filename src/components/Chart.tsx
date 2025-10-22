'use client'
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = ({data,labels}:{data:number[],labels:string[]}) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Score Distribution',
        data: data,
        backgroundColor: [
          '#36A2EB',
          '#FF6384',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }
    ]
  };

  return <Pie data={chartData} />;
}

export default Chart;
