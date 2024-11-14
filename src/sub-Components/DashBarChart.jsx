import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';

const DashBarChart = ({ selectedChart, lotsData, handleBarClick, projectId }) => {
  const [processData, setProcessData] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProcessData = async () => {
      try {
        const response = await API.get(`/Transactions/combined-percentages?projectId=${projectId}`);
        setProcessData(response.data.lotProcessWeightageSum);
      } catch (error) {
        console.error("Error fetching process data:", error);
        setProcessData({});
      }
    };

    if (projectId) {
      fetchProcessData();
    }
  }, [projectId]);

  // Get the selected lot's process data
  const selectedLotProcesses = processData[selectedChart.lotNumber] || {};
  
  // Create labels for all processes (1 to 10)
  const processLabels = Array.from({ length: 10 }, (_, i) => `${t('process')} ${i + 1}`);
  
  // Get completion values for each process
  const processValues = Array.from({ length: 10 }, (_, i) => {
    const processId = (i + 1).toString();
    return selectedLotProcesses[processId] || 0;
  });

  return (
    <Card className="shadow-lg" style={{ height: "400px" }}>
      <Card.Body
        style={{
          height: "90%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          className="mt-3"
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h4 className="text-dark">
            {t('lot')} {selectedChart.lotNumber} {t('processCompletion')}
          </h4>
        </div>
        <div style={{ width: "100%", height: "90%" }}>
          <Bar
            className="mt-2"
            data={{
              labels: processLabels,
              datasets: [
                {
                  data: processValues,
                  backgroundColor: processValues.map(value => 
                    value > 0 ? "rgba(75, 192, 192, 0.6)" : "rgba(200, 200, 200, 0.6)"
                  ),
                  borderColor: processValues.map(value => 
                    value > 0 ? "rgb(75, 192, 192)" : "rgb(180, 180, 180)"
                  ),
                  borderWidth: 1,
                  borderRadius: 5,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              onClick: (event, elements) => handleBarClick(elements),
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  title: {
                    display: true,
                    text: t('completionPercentage')
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: t('processes')
                  }
                }
              },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (tooltipItem) => {
                      return `${t('completion')}: ${tooltipItem.raw.toFixed(2)}%`;
                    },
                  },
                },
              },
            }}
            height={300}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default DashBarChart;
