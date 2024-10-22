
// import React, { useEffect, useState } from "react";
// import LineChart from "./../sub-Components/LineChart";
// import BarChart from "./../sub-Components/BarChart";
// import { Card, Col, Row } from "react-bootstrap";
// import CuDetailedAgGrid from "../sub-Components/CuDetailedAgGrid";
// import PieChart from "../sub-Components/PieChart"; // Import PieChart component
// import Cards from "../sub-Components/Cards";
// import data from "../store/CuAgGrid.json";
// import API from '../CustomHooks/MasterApiHooks/api';

// const CuDashboard = () => {
//   // State to store the selected lots for the BarChart
//   const [selectedLots, setSelectedLots] = useState([]);

//   // State to store data for PieChart; initially, it's empty
//   const [pieData, setPieData] = useState([]);

//   // State to store the currently clicked project data
//   const [clickData, setClickData] = useState({});
//   const [data, setData] = useState([]);

//   // useEffect hook to initialize the selected lots and pie data when the component mounts
//   useEffect(() => {
//     // If rowData is available, set the selected lots to the first row's lots
//       // setSelectedLots(data?.[0].lots);
//       fetchProject();
//     // Example data for PieChart, replace with real data when available
//   }, []);

//   const fetchProject = async () => {

//     const response = await API.get('/Project/GetActiveProjects');

//     setData(response.data);
//   }

//   // Function to handle click events for projects, updates selected lots
//   const handleProjectClick = (project) => {
//     setSelectedLots(project.lots || []);
//   };

//   // Function to update the clicked project's data
//   const onclick = (item) => {
//     setSelectedLots(item.lots || []);
//     setClickData(item);
//   };

//   return (
//     <>
//       {/* Row for displaying project cards */}
//       <Row className="row-cols-lg-5 row-cols-md-2 mb-3">
//         {data.map((item) => (
//           <Col key={item.name}>

//             <Cards item={item} onclick={onclick}  />

//           </Col>
//         ))}
//       </Row>

//       {/* Row for LineChart and BarChart components */}
//       <Row>
//         <Col lg={8}>
//           <Card
//             className="dcard shadow-lg"
//             style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
//           >
//             {/* LineChart component displaying rowData, with project click handler */}
//             {/* <LineChart data={data} onProjectClick={handleProjectClick} /> {console.log(data)} */}
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card
//             className="dcard shadow-lg"
//             style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
//           >
//             {/* <PieChart data={clickData.processes} /> */}
//           </Card>
//         </Col>
//       </Row>

//       {/* Row for CuDashboardGrid and CuDetailedAgGrid with PieChart */}
//       <Row className="mt-3">
//         <Col lg={6} md={12}>
//           <Card
//             className="dcard shadow-lg d-flex flex-column"
//             style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
//           >
//             <h4 className="text-dark d-flex justify-content-between">
//               <div>
//                 {/* Displaying project name and type for the clicked project */}
//                 {clickData.projectName} | {clickData.type}
//               </div>
//             </h4>
//             <div style={{ display: "flex", height: "100%" }}>
//               {/* CuDetailedAgGrid taking up 70% width to display detailed data */}
//               <div style={{ flex: 0.7 }}>
//                 <CuDetailedAgGrid clickData={clickData} />
//               </div>
//             </div>
//           </Card>
//         </Col>
//         <Col lg={6}>
//           <Card
//             className="dcard shadow-lg"
//             style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
//           >
//             {/* <BarChart lots={selectedLots || data[0].lots} />{console.log(selectedLots)} */}
//           </Card>
//         </Col>
//       </Row>
//     </>
//   );
// };

// export default CuDashboard;


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
