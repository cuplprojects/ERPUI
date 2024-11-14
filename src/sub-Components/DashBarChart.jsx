import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';

const DashBarChart = ({ selectedChart, lotsData, handleBarClick, projectId }) => {
  const [processData, setProcessData] = useState({});
  const [processNames, setProcessNames] = useState({});
  const { t } = useTranslation();

  // Fetch process completion data
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

  // Fetch process names
  useEffect(() => {
    const fetchProcessNames = async () => {
      try {
        const response = await API.get(`/ProjectProcess/GetProjectProcesses/${projectId}`);
        // Create a mapping of process ID to process name
        const nameMapping = response.data.reduce((acc, process) => {
          acc[process.id] = process.name;
          return acc;
        }, {});
        setProcessNames(nameMapping);
      } catch (error) {
        console.error("Error fetching process names:", error);
        setProcessNames({});
      }
    };

    if (projectId) {
      fetchProcessNames();
    }
  }, [projectId]);

  // Get the selected lot's process data
  const selectedLotProcesses = processData[selectedChart.lotNumber] || {};
  
  // Create labels for all processes using their actual names
  const processLabels = Array.from({ length: 10 }, (_, i) => {
    const processId = i + 1;
    return processNames[processId] || `${t('process')} ${processId}`;
  });
  
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
                  },
                  ticks: {
                    maxRotation: 45,
                    minRotation: 45
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
                      const processName = processNames[tooltipItem.dataIndex + 1] || `${t('process')} ${tooltipItem.dataIndex + 1}`;
                      return `${processName}: ${tooltipItem.raw.toFixed(2)}%`;
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
