import React, { useEffect, useState } from "react";
import LineChart from "./../sub-Components/LineChart";
import BarChart from "./../sub-Components/BarChart";
import rowData from "./../store/PieData.json";
import { Card, Col, Row } from "react-bootstrap";
import CuDashboardGrid from "../sub-Components/CuDashboardGrid";
import CuDetailedAgGrid from "../sub-Components/CuDetailedAgGrid";
import PieChart from "../sub-Components/PieChart"; // Import PieChart component
import Cards from "../sub-Components/Cards";
import data from "../store/CuAgGrid.json";

const CuDashboard = () => {

  const [selectedLots, setSelectedLots] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [clickData, setClickData] = useState(data?.[0]);

  useEffect(() => {

    if (rowData.length > 0) {
      setSelectedLots(rowData[0].lots || []);
    }

    // Example pie chart data; replace with real data as needed
    setPieData([
      {
        "processName": "Planning",
        "percentage": 50
      },{
        "processName": "Planning",
        "percentage": 50
      },
    ]);
  }, []);

  const handleProjectClick = (project) => {
    setSelectedLots(project.lots || []);
  };

  const onclick = (item) => {
    setClickData(item);
  };

  return (
    <>
      <Row>
        <Col lg={6}>
          <Card className="dcard shadow-lg" style={{ height: "400px" }}>
            <LineChart data={rowData} onProjectClick={handleProjectClick} />
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="dcard shadow-lg" style={{ height: "400px" }}>
            <BarChart lots={selectedLots} />
          </Card>
        </Col>
      </Row>
      <Row className="mt-3">
      <Col lg={4}>
  <Card className="dcard shadow-lg" style={{ height: "500px" }}>
    <h4 className="text-dark d-flex justify-content-between">
      <div>All Projects</div>
    </h4>
    

    <Row>
      {data.map((item) => (
        <Col xs={6} key={item.projectName}>
          <Cards item={item} onclick={onclick} />
        </Col>
      ))}
    </Row>
    {/* <CuDashboardGrid setClickData={setClickData} /> */}
  </Card>
</Col>

        <Col lg={8}>
          <Card
            className="dcard shadow-lg d-flex flex-column"
            style={{ height: "500px" }}
          >
            <h4 className="text-dark d-flex justify-content-between">
              <div>
                {clickData.projectName} | {clickData.type}
              </div>
            </h4>
            <div style={{ display: "flex", height: "100%" }}>
              {/* CuDetailedAgGrid taking up 70% width */}
              <div style={{ flex: 0.7 }}>
                <CuDetailedAgGrid clickData={clickData} />
              </div>
              {/* PieChart taking up 30% width */}
              <div style={{ flex: 0.3, padding: "10px" }}>
                <PieChart data={clickData.processes} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default CuDashboard;
