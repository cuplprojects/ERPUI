// BarChart.js
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const BarChart = ({ lots = [] }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: lots.map(lot => lot.name),
        datasets: [
          {
            label: 'Completion %',
            data: lots.map(lot => lot.completion),
            backgroundColor: '#29ce6a',
          },
          {
            label: 'Remaining %',
            data: lots.map(lot => lot.remaining),
            backgroundColor: '#ff6384',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: '#000000', // Set x-axis label color to dark black
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#000000', // Set y-axis label color to dark black
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: '#000000', // Set legend text color to dark black
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [lots]);

  return <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default BarChart;
