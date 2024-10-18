// import React, { useEffect, useRef } from 'react';
// import { Chart, registerables } from 'chart.js';

// Chart.register(...registerables);

// const LineChart = ({ data, onProjectClick }) => {
//   const chartRef = useRef(null);

//   useEffect(() => {
//     const ctx = chartRef.current.getContext('2d');

//     const chartInstance = new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: data.map(item => item.period),
//         datasets: [
//           {
//             label: 'Completed',
//             data: data.map(item => item.completed),
//             borderColor: '#29ce6a',
//             fill: true,
//             tension: 0.4,
//           },
//           {
//             label: 'Remaining',
//             data: data.map(item => item.remaining),
//             borderColor: '#ff6384',
//             fill: true,
//             tension: 0.4,
//           },
//         ],
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         onClick: (event, elements) => {
//           if (elements.length > 0) {
//             const index = elements[0].index;
//             onProjectClick(data[index]);
//           }
//         },
//         plugins: {
//           legend: {
//             labels: {
//               color: '#000', // Set legend text color to black
//             },
//           },
//           tooltip: {
//             titleColor: '#ffffff', // Tooltip title color
//             bodyColor: '#ffffff',  // Tooltip body text color
//           },
//         },
//         scales: {
//           x: {
//             ticks: {
//               color: '#000', // X-axis tick labels in black
//             },
//           },
//           y: {
//             ticks: {
//               color: '#000', // Y-axis tick labels in black
//             },
//           },
//         },
//       },
//     });

//     return () => {
//       chartInstance.destroy();
//     };
//   }, [data, onProjectClick]);

//   return <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />;
// };

// export default LineChart;




import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const LineChart = ({ data, onProjectClick }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(item => item.projectName),
        datasets: [
          {
            label: 'Completed',
            data: data.map(item => item.completed),
            borderColor: '#29ce6a',
            backgroundColor: 'rgba(41, 206, 106, 0.2)',
            fill: false,  // Disable area fill for line chart
            tension: 0.4,
          },
          {
            label: 'Remaining',
            data: data.map(item => item.remaining),
            borderColor: '#ff6384',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,  // Disable area fill for line chart
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            onProjectClick(data[index]);
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#000', // Set legend text color to black
            },
          },
          tooltip: {
            titleColor: '#ffffff', // Tooltip title color
            bodyColor: '#ffffff',  // Tooltip body text color
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#000', // X-axis tick labels in black
            },
          },
          y: {
            ticks: {
              color: '#000', // Y-axis tick labels in black
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [data, onProjectClick]);

  return <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default LineChart;

