// import React, { useEffect, useState } from "react";
// import LineChart from "./../sub-Components/LineChart";
// import BarChart from "./../sub-Components/BarChart";
// import rowData from "./../store/PieData.json";
// import { Card, Col, Row } from "react-bootstrap";
// import CuDashboardGrid from "../sub-Components/CuDashboardGrid";
// import CuDetailedAgGrid from "../sub-Components/CuDetailedAgGrid";
// import PieChart from "../sub-Components/PieChart"; // Import PieChart component
// import Cards from "../sub-Components/Cards";
// import data from "../store/CuAgGrid.json";

// const CuDashboard = () => {

//   const [selectedLots, setSelectedLots] = useState([]);
//   const [pieData, setPieData] = useState([]);
//   const [clickData, setClickData] = useState(data?.[0]);

//   useEffect(() => {

//     if (rowData.length > 0) {
//       setSelectedLots(rowData[0].lots || []);
//     }

//     // Example pie chart data; replace with real data as needed
//     setPieData([
//       {
//         "processName": "Planning",
//         "percentage": 50
//       },{
//         "processName": "Planning",
//         "percentage": 50
//       },
//     ]);
//   }, []);

//   const handleProjectClick = (project) => {
//     setSelectedLots(project.lots || []);
//   };

//   const onclick = (item) => {
//     setClickData(item);
//   };

//   return (
//     <>
//       <Row>
//         <Col lg={6}>
//           <Card className="dcard shadow-lg" style={{ height: "400px" }}>
//             <LineChart data={rowData} onProjectClick={handleProjectClick} />
//           </Card>
//         </Col>

//         <Col lg={6}>
//           <Card className="dcard shadow-lg" style={{ height: "400px" }}>
//             <BarChart lots={selectedLots} />
//           </Card>
//         </Col>
//       </Row>
//       <Row className="mt-3">
//       <Col lg={4}>
//   <Card className="dcard shadow-lg" style={{ height: "500px" }}>
//     <h4 className="text-dark d-flex justify-content-between">
//       <div>All Projects</div>
//     </h4>

//     <Row>
//       {data.map((item) => (
//         <Col xs={6} key={item.projectName}>
//           <Cards item={item} onclick={onclick} />
//         </Col>
//       ))}
//     </Row>
//     {/* <CuDashboardGrid setClickData={setClickData} /> */}
//   </Card>
// </Col>

//         <Col lg={8}>
//           <Card
//             className="dcard shadow-lg d-flex flex-column"
//             style={{ height: "500px" }}
//           >
//             <h4 className="text-dark d-flex justify-content-between">
//               <div>
//                 {clickData.projectName} | {clickData.type}
//               </div>
//             </h4>
//             <div style={{ display: "flex", height: "100%" }}>
//               {/* CuDetailedAgGrid taking up 70% width */}
//               <div style={{ flex: 0.7 }}>
//                 <CuDetailedAgGrid clickData={clickData} />
//               </div>
//               {/* PieChart taking up 30% width */}
//               <div style={{ flex: 0.3, padding: "10px" }}>
//                 <PieChart data={clickData.processes} />
//               </div>
//             </div>
//           </Card>
//         </Col>
//       </Row>
//     </>
//   );
// };

// export default CuDashboard;

import React, { useEffect, useState } from "react";
import LineChart from "./../sub-Components/LineChart";
import BarChart from "./../sub-Components/BarChart";
import { Card, Col, Row } from "react-bootstrap";
import CuDetailedAgGrid from "../sub-Components/CuDetailedAgGrid";
import PieChart from "../sub-Components/PieChart"; // Import PieChart component
import Cards from "../sub-Components/Cards";
import data from "../store/CuAgGrid.json";
import API from '../CustomHooks/MasterApiHooks/api';

const CuDashboard = () => {
  // State to store the selected lots for the BarChart
  const [selectedLots, setSelectedLots] = useState([]);

  // State to store data for PieChart; initially, it's empty
  const [pieData, setPieData] = useState([]);

  // State to store the currently clicked project data
  const [clickData, setClickData] = useState({});
  const [data, setData] = useState([]);

  // useEffect hook to initialize the selected lots and pie data when the component mounts
  useEffect(() => {
    // If rowData is available, set the selected lots to the first row's lots
      // setSelectedLots(data?.[0].lots);
      fetchProject();
    // Example data for PieChart, replace with real data when available
  }, []);

  const fetchProject = async () => {
    const response = await API.get('/Project/GetActiveProjects');
    setData(response.data);
  }

  // Function to handle click events for projects, updates selected lots
  const handleProjectClick = (project) => {
    setSelectedLots(project.lots || []);
  };

  // Function to update the clicked project's data
  const onclick = (item) => {
    setSelectedLots(item.lots || []);
    setClickData(item);
  };

  return (
    <>
      {/* Row for displaying project cards */}
      <Row className="row-cols-lg-5 row-cols-md-2 mb-3">
        {data.map((item) => (
          <Col key={item.name}>
            <Cards item={item} onclick={onclick}  />
          </Col>
        ))}
      </Row>

      {/* Row for LineChart and BarChart components */}
      <Row>
        <Col lg={8}>
          <Card
            className="dcard shadow-lg"
            style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
          >
            {/* LineChart component displaying rowData, with project click handler */}
            {/* <LineChart data={data} onProjectClick={handleProjectClick} /> {console.log(data)} */}
          </Card>
        </Col>

        <Col lg={4}>
          <Card
            className="dcard shadow-lg"
            style={{ height: "400px", background: "rgba(255,255,255,0.6)" }}
          >
            {/* <PieChart data={clickData.processes} /> */}
          </Card>
        </Col>
      </Row>

      {/* Row for CuDashboardGrid and CuDetailedAgGrid with PieChart */}
      <Row className="mt-3">
        <Col lg={6} md={12}>
          <Card
            className="dcard shadow-lg d-flex flex-column"
            style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
          >
            <h4 className="text-dark d-flex justify-content-between">
              <div>
                {/* Displaying project name and type for the clicked project */}
                {clickData.projectName} | {clickData.type}
              </div>
            </h4>
            <div style={{ display: "flex", height: "100%" }}>
              {/* CuDetailedAgGrid taking up 70% width to display detailed data */}
              <div style={{ flex: 0.7 }}>
                <CuDetailedAgGrid clickData={clickData} />
              </div>
            </div>
          </Card>
        </Col>
        <Col lg={6}>
          <Card
            className="dcard shadow-lg"
            style={{ height: "500px", background: "rgba(255,255,255,0.6)" }}
          >
            {/* <BarChart lots={selectedLots || data[0].lots} />{console.log(selectedLots)} */}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CuDashboard;
