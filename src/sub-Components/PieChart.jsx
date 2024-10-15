// PieChart.js
import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register required chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ data }) => {
  // Calculate total weightage
  const totalWeightage = data.reduce((sum, item) => sum + item.percentage, 0);

  // Normalize data to ensure total percentage is 100
  const normalizedData = data.map(item => ({
    ...item,
    normalizedPercentage: (item.percentage / totalWeightage) * 100
  }));

  const chartData = {
    labels: normalizedData.map((item) => item.processName),
    datasets: [
      {
        label: "Percentage",
        data: normalizedData.map((item) => item.normalizedPercentage),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF8A80",
          "#82B1FF",
          "#B9F6CA",
          "#FFFF8D",
          "#EA80FC",
          "#FFD180"
        ],
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(2)}%`;
          }
        }
      }
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart;
