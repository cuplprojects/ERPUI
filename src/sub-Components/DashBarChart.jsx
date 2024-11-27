import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { Switch } from 'antd';
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';

const DashBarChart = ({ selectedChart, lotsData, handleBarClick, projectId }) => {
  const [processData, setProcessData] = useState({});
  const [processNames, setProcessNames] = useState({});
  const [showRemaining, setShowRemaining] = useState(false);
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
        console.log(nameMapping);
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
  
  // Create labels only for existing processes
  const processLabels = Object.keys(processNames).map(processId => 
    processNames[processId] || `${t('process')} ${processId}`
  );
  
  // Get completion values only for existing processes
  const processValues = Object.keys(processNames).map(processId => {
    const value = selectedLotProcesses[processId] || 0;
    return showRemaining ? 100 - value : value;
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
            {t('lot')} {selectedChart.lotNumber} {showRemaining ? t('remainingWork') : t('processCompletion')}
          </h4>
          <Switch
            checkedChildren={t('showCompleted')}
            unCheckedChildren={t('showRemaining')}
            checked={showRemaining}
            onChange={(checked) => setShowRemaining(checked)}
            style={{ marginLeft: '10px' }}
          />
        </div>
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
  <Bar
    className="mt-2"
    data={{
      labels: processLabels,
      datasets: [
        {
          data: processValues,
          backgroundColor: processValues.map(value => {
            const actualValue = showRemaining ? 100 - value : value;
            return actualValue > 0 
              ? showRemaining 
                ? "rgba(255, 99, 132, 0.6)" // Red for remaining
                : "rgba(75, 192, 192, 0.6)" // Green for completed
              : "rgba(200, 200, 200, 0.6)";
          }),
          borderColor: processValues.map(value => {
            const actualValue = showRemaining ? 100 - value : value;
            return actualValue > 0 
              ? showRemaining 
                ? "rgb(255, 99, 132)" // Red for remaining
                : "rgb(75, 192, 192)" // Green for completed
              : "rgb(180, 180, 180)";
          }),
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
            text: showRemaining ? t('remainingPercentage') : t('completionPercentage')
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
              const processId = Object.keys(processNames)[tooltipItem.dataIndex];
              const processName = processNames[processId] || `${t('process')} ${processId}`;
              return `${processName}: ${tooltipItem.raw.toFixed(2)}% ${showRemaining ? t('remaining') : t('completed')}`;
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
