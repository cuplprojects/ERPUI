


import React, { useEffect, useState, useRef } from "react";

import LineChart from "./../sub-Components/LineChart";
import BarChart from "./../sub-Components/BarChart";
import { Card, Col, Row, Carousel, Container } from "react-bootstrap";
import CuDetailedAgGrid from "../sub-Components/CuDetailedAgGrid";
import PieChart from "../sub-Components/PieChart";
import Cards from "../sub-Components/Cards";
import API from '../CustomHooks/MasterApiHooks/api';
import { IoMdArrowDroprightCircle, IoMdArrowDropleftCircle } from "react-icons/io";
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';

const CuDashboard = () => {
  const [selectedLots, setSelectedLots] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [clickData, setClickData] = useState({});
  const [data, setData] = useState([]);
  const carouselRef = useRef(null);
  const [hasquantitySheet, setHasquantitySheet]= useState([])

const hasDisable = (projectid)=>{
  const hasQuantitySheet = hasquantitySheet.find(item => item.projectId === projectid);
  return hasQuantitySheet ? hasQuantitySheet.quantitySheet : false;
}

useEffect(() => {
  const fetchHasQuantitySheet = async () => {
    try {
      const response = await API.get('/QuantitySheet/check-all-quantity-sheets');
      console.log(response.data)
      setHasquantitySheet(response.data);
    } catch (error) {
      console.error("Error fetching quantity sheet data:", error);
    }
  }
  fetchHasQuantitySheet();
}, [])

  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customBtn = cssClasses[3];

  useEffect(() => {
    fetchProject();
  }, []);

  const fetchProject = async () => {
    try {
      const response = await API.get('/Project/GetActiveProjects');
      setData(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }

  const handleProjectClick = (project) => {
    setSelectedLots(project.lots || []);
  };

  const onclick = (item) => {
    setSelectedLots(item.lots || []);
    setClickData(item);
    setPieData(item.processes || []);
  };

  const handleCarouselControl = (direction) => {
    if (carouselRef.current) {
      direction === 'prev' ? carouselRef.current.prev() : carouselRef.current.next();
    }
  };

  const itemsPerSlide = 5;


  const carouselItems = [];
  for (let i = 0; i < data.length; i += itemsPerSlide) {
    carouselItems.push(
      <Carousel.Item key={i} className="px-3" style={{ background: "transparent" }}>
        <Row className="flex-nowrap justify-content-start"  style={{ background: "transparent" }}>
          {data.slice(i, i + itemsPerSlide).map((item) => (
            <Col key={item.projectId} xs="auto" className="px-1">
              <Cards item={item} onclick={onclick} disableProject={hasDisable(item.projectId)}/>
            </Col>
          ))}
        </Row>
      </Carousel.Item>
    );
  }

  return (
    <Container fluid className="px-3">
      <div className="position-relative mb-4">
        <div className="d-none d-lg-block">
          <div
            className={`position-absolute top-50 start-0 translate-middle-y rounded-circle ${customDark}`}
            style={{ zIndex: 9, left: "10px", cursor: "pointer" }}
            onClick={() => handleCarouselControl('prev')}
          >
            <IoMdArrowDropleftCircle size={40} className={`${customBtn} rounded-circle custom-zoom-btn`} />
          </div>
          <div
            className={`position-absolute top-50 end-0 translate-middle-y rounded-circle ${customDark} ${customDark === "dark-dark" ? `${customMid} border-light border-1` : "border-0"}`}
            style={{ zIndex: 9, right: "10px", cursor: "pointer" }}
            onClick={() => handleCarouselControl('next')}
          >
            <IoMdArrowDroprightCircle size={40} className={`${customBtn} rounded-circle custom-zoom-btn`} />
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

      <Row className="gx-3">
        <Col lg={8}>
          <Card
            className="dcard shadow-lg mb-3"
            style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
          >
            <LineChart data={data} onProjectClick={handleProjectClick} />
          </Card>
        </Col>

        <Col lg={4}>
          <Card
            className="dcard shadow-lg mb-3"
            style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
          >
            <PieChart data={pieData} />
          </Card>
        </Col>
      </Row>

      <Row className="gx-3">
        <Col lg={6} md={12}>
          <Card
            className="dcard shadow-lg d-flex flex-column mb-3"
            style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
          >
            <h4 className="text-dark d-flex justify-content-between p-3">
              <div>
                {console.log(clickData)}
                {clickData.name || 'Select a project'} 
              </div>
            </h4>
            <div style={{ flex: 1, overflow: "hidden", padding: "0 15px" }}>
              <CuDetailedAgGrid clickData={clickData} />
            </div>
          </Card>
        </Col>
        <Col lg={6}>
          <Card
            className="dcard shadow-lg mb-3"
            style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
          >
            <BarChart lots={selectedLots || (data[0] && data[0].lots) || []} />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CuDashboard;
