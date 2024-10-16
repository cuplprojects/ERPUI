import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Card, Carousel, Button } from "react-bootstrap";
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
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { IoMdArrowDroprightCircle } from "react-icons/io";
import { IoMdArrowDropleftCircle } from "react-icons/io";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip);

const ProjectChart = ({ title, chartKey, chartdata, onClick, tCatch, type }) => (
  <Col xs={12} sm={6} md={4} lg={3} xl={2}>
    <div className="text-center p-3 chart-container c-pointer custom-zoom-btn">
      <Card className="text-center p-1 shadow-lg" onClick={onClick}>
        <h4>{title} Lot-{chartKey}</h4>
        <h5>Type-{type}</h5>
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
                legend: {
                  display: false, // This line removes the legend
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    label: (tooltipItem) => {
                      return `${tooltipItem.label}: ${tooltipItem.raw}%`;
                    },
                  },
                },
              },
            }}
          />
          <span className="">Total Catches-{tCatch}</span>
        </div>
      </Card>
    </div>
  </Col>
);
const AllProjects = () => {

  //Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5]
  const customLightBorder = cssClasses[6]
  const customDarkBorder = cssClasses[7]
  const customThead = cssClasses[8]

  const [selectedChart, setSelectedChart] = useState({
    label: "",
    lotNumber: "",
    barLabel: BarGraphData[0].label,
  });

  const navigate = useNavigate();
  const carouselRef = useRef(null);

  useEffect(() => {
    if (DoughnutGraphData.length > 0) {
      setSelectedChart({
        label: DoughnutGraphData[0].label,
        lotNumber: DoughnutGraphData[0].lotId,
        barLabel: BarGraphData[0].label,
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
    navigate(`/project-details/${project.lotNumber}`, { state: { project } });
  };

  const handleBarClick = (elements) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index;
      const clickedBarLabel = BarGraphData[clickedIndex].label;

      setSelectedChart((prev) => ({
        ...prev,
        barLabel: clickedBarLabel,
      }));
    }
  };

  const handleCarouselControl = (direction) => {
    if (carouselRef.current) {
      if (direction === 'prev') {
        carouselRef.current.prev();
      } else {
        carouselRef.current.next();
      }
    }
  };

  const itemsPerSlide = 6; // Adjust this number based on how many items you want per slide

  const carouselItems = [];
  for (let i = 0; i < DoughnutGraphData.length; i += itemsPerSlide) {
    carouselItems.push(
      <Carousel.Item key={i} style={{ background: "transparent" }}>
        <Row className="flex-nowrap">
          {DoughnutGraphData.slice(i, i + itemsPerSlide).map((data, idx) => (
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
      </Carousel.Item>
    );
  }

  return (
    <Container fluid>
      <div className="position-relative mb-4 ">

        <div className="d-none d-lg-block">
          <div
            className={`position-absolute top-50 start-0 translate-middle-y rounded-circle  ${customDark}`} style={{ zIndex: "9", width: "0px", height: "0px" }}
            onClick={() => handleCarouselControl('prev')}

          >
            <IoMdArrowDropleftCircle size={40} className={`${customBtn}  rounded-circle custom-zoom-btn`} />
          </div>
          <div
            className={`position-absolute top-50 end- translate-middle-y rounded-circle ${customDark} ${customDark === "dark-dark" ? `${customMid} border-light border-1` : "border-0"}`} style={{ zIndex: "9", width: "0px", height: "0px", right: "20px" }}
            onClick={() => handleCarouselControl('next')}

          >
            <IoMdArrowDroprightCircle size={40} className={`${customBtn}  rounded-circle custom-zoom-btn`} />
          </div>
        </div>

        <Carousel
          ref={carouselRef}
          interval={null}
          indicators={false}
          controls={false}
          touch={true}
          slide={true}
        >
          {carouselItems}
        </Carousel>
      </div>

      <marquee className="marquee" style={{ color: "red", fontWeight: "bold" }}>
        <img
          className="mb-3"
          src={tractor}
          alt="Tractor"
          style={{
            transform: "scaleX(-1)",
            width: "80px",
            marginRight: 10 + "px",
          }}
        />
        Important: Please review the latest updates and alerts!
      </marquee>

      <Row>
        <Col xs={12} lg={8}>
          <Card className="dcard shadow-lg" style={{ height: "400px" }}>
            <h4 className="text-dark d-flex justify-content-between">
              <div>
                {selectedChart.label} Lot- {selectedChart.lotNumber}{" "}
                {selectedChart.barLabel && `| ${selectedChart.barLabel}`}
              </div>
              <button
                type="button"
                onClick={() => handleTitleClick(selectedChart)}
                className="btn btn-outline-info"
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
                  {selectedChart.label} Lot- {selectedChart.lotNumber}
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
      legend: {
        display: false, // This line removes the legend
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw}%`;
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