// CuDashboard.js
import React, { useEffect, useState } from "react";
import LineChart from "./../sub-Components/LineChart";
import BarChart from "./../sub-Components/BarChart";
import rowData from "./../store/PieData.json";
import { Card, Col, Row } from "react-bootstrap";

const CuDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedLots, setSelectedLots] = useState([]);

  useEffect(() => {
    setData(rowData);
    // Set default lots to first project's lots if available
    if (rowData.length > 0) {
      setSelectedLots(rowData[0].lots || []);
    }
  }, []);

  const handleProjectClick = (project) => {
    setSelectedLots(project.lots || []);
  };

  return (
    <Row>
      <Col lg={6}>
        <Card className="dcard shadow-lg" style={{ height: "400px" }}>
          <LineChart data={data} onProjectClick={handleProjectClick} />
        </Card>
      </Col>

      <Col lg={6}>
        <Card className="dcard shadow-lg" style={{ height: "400px" }}>
          <BarChart lots={selectedLots} />
        </Card>
      </Col>
    </Row>
  );
};

export default CuDashboard;
