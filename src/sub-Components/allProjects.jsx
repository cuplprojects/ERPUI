// import React, { useState, useEffect } from 'react';
// import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// import 'react-circular-progressbar/dist/styles.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate for navigation
// import './../styles/allProjects.css';
// import Spinner from '../components/Spinner';

// const AllProjects = () => {
//     const progressData = [
//         { id: 1, processName: 'Project A', percentage: 75, status: 'In Progress', lot: 1 },
//         { id: 2, processName: 'Project B', percentage: 50, status: 'Completed', lot: 2 },
//         { id: 3, processName: 'Project C', percentage: 90, status: 'Warning', lot: 3 },
//         { id: 4, processName: 'Project D', percentage: 20, status: 'Stopped', lot: 4 },
//         { id: 5, processName: 'Project E', percentage: 65, status: 'In Progress', lot: 5 },
//         { id: 6, processName: 'Project F', percentage: 75, status: 'In Progress', lot: 6 },
//         { id: 7, processName: 'Project G', percentage: 85, status: 'In Progress', lot: 7 },
//         // Commented out projects for demo purposes
//     ];

//     const getColor = (status) => {
//         switch (status) {
//             case 'In Progress':
//                 return '#00f'; // Blue
//             case 'Completed':
//                 return '#0f0'; // Green
//             case 'Warning':
//                 return '#ff0'; // Yellow
//             case 'Stopped':
//                 return '#f00'; // Red
//             default:
//                 return '#ddd'; // Default color
//         }
//     };

//     const [showCharts, setShowCharts] = useState(false);
//     const navigate = useNavigate(); // Initialize useNavigate hook

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setShowCharts(true);
//         }, 400); // 400ms delay

//         return () => clearTimeout(timer); // Cleanup the timer if the component unmounts
//     }, []);

//     // Function to handle navigation with project details
//     const handleNavigate = (project) => {
//         navigate(`/project-details/${project.id}`, { state: { project } }); // Pass project details as state
//     };

//     return (
//         <div className="container-fluid">
//             {/* Cards for large screens */}
//             <div className="d-none d-lg-block">
//                 <div className="row flex-nowrap overflow-auto p-1">
//                     {showCharts && progressData.length > 0 ? (
//                         progressData.slice(0, 3).map((item) => (
//                             <div key={item.id} className="col-lg-3 mb-3">
//                                 <div className="card p-1" onClick={() => handleNavigate(item)} style={{ cursor: 'pointer' }}>
//                                     <div className="card-body d-flex flex-column align-items-center justify-content-start">
//                                         <div className="position-relative" style={{ width: '110px', height: '110px' }}>
//                                             <CircularProgressbar
//                                                 value={item.percentage}
//                                                 text={`${item.percentage}%`}
//                                                 styles={buildStyles({
//                                                     strokeLinecap: "butt",
//                                                     textColor: '',
//                                                     pathColor: getColor(item.status), // Color based on status
//                                                     trailColor: '#ddd',
//                                                     strokeWidth: 15, // Increase the width of the bar
//                                                 })}
//                                             />
//                                         </div>
//                                         <span className="text-center mt-2">{item.processName}</span> {/* Label below the chart */}
//                                         <span className="text-center mt-2">Lot - {item.lot}</span> {/* Label below the chart */}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="col-lg-3 mb-3">
//                             <div className="card p-3 text-white bg-white w-100">
//                                 <div className="card-body d-flex flex-column align-items-center justify-content-center">
//                                     <div style={{ width: '110px', height: '110px', background: '#ffffff' }}>
//                                         {/* <Spinner color="custom"/> */}
//                                     </div>
//                                     <span className="text-center custom-theme-dark-text mt-2 fs-4">No Current Projects</span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//                     {progressData.length > 0 && (
//                         <div className="col-lg-3 mb-3 d-flex align-items-center justify-content-center">
//                             <Link to="/all-projects" className="btn btn-primary">View All</Link> {/* View All button */}
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* Non-card layout for small screens */}
//             <div className="d-block d-lg-none bg-white rounded">
//                 <div className="row g-2 p-2 flex-nowrap overflow-auto no-scrollbar">
//                     {showCharts && progressData.length > 0 ? (
//                         progressData.map((item) => (
//                             <div key={item.id} className="col-4 col-sm-3 col-md-2 d-flex flex-column align-items-center">
//                                 <div className="d-flex flex-column align-items-center" onClick={() => handleNavigate(item)} style={{ cursor: 'pointer' }}>
//                                     <div className="position-relative" style={{ width: '100px', height: '100px' }}>
//                                         <CircularProgressbar
//                                             value={item.percentage}
//                                             text={`${item.percentage}%`}
//                                             styles={buildStyles({
//                                                 strokeLinecap: "butt",
//                                                 textColor: '',
//                                                 pathColor: getColor(item.status), // Color based on status
//                                                 trailColor: '#ddd',
//                                                 strokeWidth: 15, // Adjust stroke width for smaller screens
//                                             })}
//                                         />
//                                     </div>
//                                     <span className="text-center mt-2">{item.processName}</span> {/* Label below the chart */}
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="col-4 col-sm-3 col-md-2 d-flex flex-column align-items-center">
//                             <div className="d-flex flex-column align-items-center">
//                                 <div className="position-relative" style={{ width: '100px', height: '100px', background: '#000' }}></div>
//                                 <span className="text-center mt-2">No Current Projects</span>
//                             </div>
//                         </div>
//                     )}
//                     {progressData.length > 0 && (
//                         <span className="d-flex align-items-center justify-content-center" style={{width:"100px"}}>
//                             <Link to="/all-projects" className="btn btn-primary">View All</Link> {/* View All button */}
//                         </span>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AllProjects;

import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./../styles/allProjects.css";
import tractor from "./../assets/images/tractor.gif";
import BarGraphData from "./../store/BarGraphData.json";
import DoughnutGraphData from "./../store/doughnutChartData.json";
import DashboardGrid from "./DashboardGrid";
import { useNavigate } from "react-router";



Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip);

const ProjectChart = ({ title, chartKey, chartdata, onClick, tCatch, type }) => (
  <Col xs={12} sm={6} md={4} lg={2}> {/* Adjust sizes for different screen widths */}
    <div className="text-center p-3 chart-container c-pointer custom-zoom-btn">
      <Card className="text-center p-1 shadow-lg" onClick={onClick}>
        <h4 >{title} Lot-{chartKey}</h4>
        <h5 >Type-{type}</h5>
        <div className="chart-wrapper">
          <Doughnut
            data={{
              labels: [chartdata[0].title, chartdata[1].title],
              datasets: [
                {
                  data: [chartdata[0].value, chartdata[1].value],
                  backgroundColor: ["rgb(133, 255, 108)", "rgb(255, 99, 132)"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (tooltipItem) => {
                      return `${tooltipItem.label}: ${tooltipItem.raw}`;
                    },
                  },
                },
              },
            }}
          />
          <span className="fw-bold">Total Catches-{tCatch}</span>
          
        </div>
      </Card>
    </div>
  </Col>
);

const AllProjects = () => {
  const [selectedChart, setSelectedChart] = useState({
    label: "",
    lotNumber: "",
    barLabel: BarGraphData[0].label, // Default bar label to first bar's label
  });

  const navigate = useNavigate();

  // Set default selected chart to the first Doughnut chart
  useEffect(() => {
    if (DoughnutGraphData.length > 0) {
      setSelectedChart({
        label: DoughnutGraphData[0].label,
        lotNumber: DoughnutGraphData[0].lotId, // Lot number for the first chart
        barLabel: BarGraphData[0].label, // Default bar label set to first bar
      });
    }
  }, []);

  const handleCardClick = (chartTitle, lotNumber) => {
    setSelectedChart((prev) => ({
      ...prev,
      label: chartTitle,
      lotNumber,
    }));
  };

  const handleTitleClick = (project) => {
    navigate(`/project-details/${project.lotNumber}`, { state: { project } }); // Pass project details as state
  };

  const handleBarClick = (elements) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const clickedBarLabel = BarGraphData[clickedIndex].label;

      setSelectedChart((prev) => ({
        ...prev,
        barLabel: clickedBarLabel, // Update the state with clicked bar label
      }));
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        {DoughnutGraphData.map((data, idx) => (
          <ProjectChart
            key={idx}
            title={data.label}
            chartdata={[data.completed, data.remaining]}
            chartKey={data.lotId}
            tCatch={data.tCatch}
            type={data.type}
            onClick={() => handleCardClick(data.label, data.lotId)}
          />
        ))}
      </Row>

      <marquee className="marquee" style={{ color: "red", fontWeight: "bold" }}>
        <img
          className="mb-3"
          src={tractor}
          alt="Tractor"
          style={{
            transform: "scaleX(-1)",
            width: "80px",
            marginRight: "10px",
          }}
        />
        Important: Please review the latest updates and alerts!
      </marquee>

      <Row>
        <Col xs={12} lg={8}> {/* Adjust the width of the dashboard grid */}
          <Card className="dcard shadow-lg" style={{height: "400px" }}>
            <h4 className=" text-dark d-flex justify-content-between">
              <div>
                {selectedChart.label}  Lot- {selectedChart.lotNumber}{" "}
                {selectedChart.barLabel && `| ${selectedChart.barLabel}`}
              </div>
              <button
                type="button"
                onClick={() => handleTitleClick(selectedChart)}
                className="btn btn-outline-info "
              >
                More Info
              </button>
            </h4>
            <DashboardGrid />
          </Card>
        </Col>

        <Col xs={12} lg={4}>
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
                  {selectedChart.label}  Lot- {selectedChart.lotNumber}
                </h4>

              </div>
              <div style={{ width: "100%", height: "90%" }}>
                <Bar
                  className="mt-2"
                  data={{
                    labels: BarGraphData.map((data) => data.label),
                    datasets: [
                      {
                        data: BarGraphData.map((data) => data.value),
                        backgroundColor: [
                          "rgba(255, 99, 132, 0.6)",
                          "rgba(255, 159, 64, 0.6)",
                          "rgba(255, 205, 86, 0.6)",
                          "rgba(75, 192, 192, 0.6)",
                          "rgba(54, 162, 235, 0.6)",
                          "rgba(153, 102, 255, 0.6)",
                          "rgba(201, 203, 207, 0.6)",
                        ],
                        borderColor: [
                          "rgb(255, 125, 132)",
                          "rgb(255, 159, 64)",
                          "rgb(255, 205, 86)",
                          "rgb(75, 192, 192)",
                          "rgb(54, 162, 235)",
                          "rgb(153, 102, 255)",
                          "rgb(201, 203, 207)",
                        ],
                        borderWidth: 1,
                        borderRadius: 5,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    onClick: (event, elements) => handleBarClick(elements),
                    plugins: {
                      tooltip: {
                        enabled: true,
                        callbacks: {
                          label: (tooltipItem) => {
                            return `${tooltipItem.label}: ${tooltipItem.raw}`;
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
        </Col>
      </Row>
    </Container>
  );
};

export default AllProjects;


