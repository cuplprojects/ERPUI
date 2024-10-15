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
            backgroundColor: '#47ff02',
          },
          {
            label: 'Remaining %',
            data: lots.map(lot => lot.remaining),
            backgroundColor: 'red',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100 },
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
