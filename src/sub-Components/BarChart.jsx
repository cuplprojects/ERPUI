// BarChart.js
import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';

Chart.register(...registerables);

const BarChart = ({ projectId }) => {
  const { t } = useTranslation();
  const chartRef = useRef(null);
  const [lotData, setLotData] = useState(null);

  useEffect(() => {
    const fetchLotPercentages = async () => {
      try {
        const response = await API.get(`/Transactions/combined-percentages?projectId=${projectId}`);
        setLotData(response.data.totalLotPercentages);
      } catch (error) {
        console.error("Error fetching lot percentages:", error);
      }
    };

    if (projectId) {
      fetchLotPercentages();
    }
  }, [projectId]);

  useEffect(() => {
    if (!lotData || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    const lotNumbers = Object.keys(lotData);
    const percentages = Object.values(lotData);

    const chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: lotNumbers.map(num => `${t("lot")} ${num}`),
        datasets: [
          {
            label: t('completion%'),
            data: percentages,
            backgroundColor: '#29ce6a',
          },
          {
            label: t('remaining%'),
            data: percentages.map(value => 100 - value),
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
              color: '#000000'
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#000000'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#000000'
            }
          }
        }
      }
    });

    return () => {
      chartInstance.destroy();
    };
  }, [lotData, t]);

  return <canvas ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default BarChart;
