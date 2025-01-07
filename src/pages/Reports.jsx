import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  InputGroup,
  Table,
} from "react-bootstrap";
import { FaInfoCircle, FaFileExcel, FaChevronUp, FaChevronDown, FaSearch } from "react-icons/fa";
import API from "./../CustomHooks/MasterApiHooks/api";
import * as XLSX from "xlsx";

const ProjectReport = () => {
  const [projectData, setProjectData] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [quantitySheetData, setQuantitySheetData] = useState([]);
  const [showAll, setShowAll] = useState(true);
  const [projectDetails, setProjectDetails] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    examDate: "",
    catchNo: "",
    paper: "",
    lotNo: "",
    subject: "",
    course: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectDataResponse = await API.get("/Transactions/all-project-completion-percentages");
        setProjectData(projectDataResponse.data);

        const activeProjectsResponse = await API.get("/Project/GetActiveProjects");
        setActiveProjects(activeProjectsResponse.data);

        const projectDetailsPromises = projectDataResponse.data.map(project =>
          API.get(`/Project/${project.projectId}`)
        );

        const projectDetailsResponses = await Promise.all(projectDetailsPromises);
        const projectDetailsMap = {};
        projectDetailsResponses.forEach(response => {
          projectDetailsMap[response.data.projectId] = response.data;
        });
        setProjectDetails(projectDetailsMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const openModal = async (projectId) => {
    setSelectedProjectId(projectId);
    setShowModal(true);
  
    try {
      const response = await API.get(`/Transactions/${projectId}/withlogs`);
      const data = response.data.map((entry) => ({
        ...entry.quantitySheet,
        ...entry.transaction, // Merge transaction fields into the quantity sheet object
      }));
      setQuantitySheetData(data);
    } catch (error) {
      console.error("Error fetching quantity sheet data:", error);
    }
  };
  

  const closeModal = () => {
    setShowModal(false);
    setSelectedProjectId(null);
    setQuantitySheetData([]);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const exportTableToExcel = () => {
    if (quantitySheetData.length > 0) {
      // Remove unnecessary fields including quantitySheetId, projectId, and processId
      const cleanedData = quantitySheetData.map(({ quantitySheetId, projectId, processId, status, ...rest }) => rest);
  
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(cleanedData);
      XLSX.utils.book_append_sheet(wb, ws, `Project_${selectedProjectId}_Details`);
      XLSX.writeFile(wb, `Project_${selectedProjectId}_Details.xlsx`);
    }
  };
  

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const filteredData = quantitySheetData.filter((sheet) => {
  return (
    (filters.examDate
      ? new Date(sheet.examDate).toLocaleDateString().includes(filters.examDate)
      : true) &&
    (filters.catchNo
      ? String(sheet.catchNo).toLowerCase().includes(filters.catchNo.toLowerCase())
      : true) &&
    (filters.paper
      ? String(sheet.paper).toLowerCase().includes(filters.paper.toLowerCase())
      : true) &&
    (filters.lotNo
      ? String(sheet.lotNo).toLowerCase().includes(filters.lotNo.toLowerCase())
      : true) &&
    (filters.subject
      ? String(sheet.subject).toLowerCase().includes(filters.subject.toLowerCase())
      : true) &&
    (filters.course
      ? String(sheet.course).toLowerCase().includes(filters.course.toLowerCase())
      : true)
  );
});


  const filteredProjects = projectData.filter(project =>
    projectDetails[project.projectId]?.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const projectsToDisplay = showAll ? filteredProjects : filteredProjects.slice(0, 6);

  return (
    <Container className="mt-4">
      <h3>Project Report</h3>
      <InputGroup className="mb-4" style={{ maxWidth: "450px", margin: "0 auto", boxShadow: "0 4px 8px rgba(0, 123, 255, 0.1)", borderRadius: "20px" }}>
        <InputGroup.Text
          style={{
            backgroundColor: "#007bff",
            borderRadius: "12px 0 0 12px",
            fontSize: "18px",
            padding: "12px 18px",
            color: "#fff",
            border: "none",
          }}
        >
          <FaSearch />
        </InputGroup.Text>
        <Form.Control
          type="text"
          placeholder="Search Projects"
          value={searchInput}
          onChange={handleSearchChange}
          style={{
            borderRadius: "0 12px 12px 0",
            padding: "15px 20px",
            fontSize: "16px",
            border: "2px solid #007bff",
            transition: "all 0.3s ease",
            outline: "none",
          }}
        />
      </InputGroup>

      <Button
        variant="outline-info"
        onClick={toggleShowAll}
        className="mb-3"
        style={{
          fontWeight: "bold",
          padding: "6px 12px",
          borderRadius: "20px",
        }}
      >
        {showAll ? (
          <>
            <FaChevronUp className="me-2" /> Show Less
          </>
        ) : (
          <>
            <FaChevronDown className="me-2" /> Show All Projects
          </>
        )}
      </Button>

      <Row className="g-4">
        {projectsToDisplay.map((project) => (
          <Col sm={12} md={6} lg={12} key={project.projectId}>
            <Card
              className="shadow-lg rounded"
              style={{
                backgroundColor: project.completionPercentage > 0.5 ? "#d4edda" : "#f8d7da",
                borderLeft: `5px solid ${project.completionPercentage > 0.5 ? "#28a745" : "#dc3545"}`,
              }}
            >
              <Card.Body>
                <Card.Header className="bg-light text-center">
                  <Card.Title>
                    {projectDetails[project.projectId]?.name || `Project ${project.projectId}`}
                  </Card.Title>
                </Card.Header>
                <Card.Text
                  className="mt-3"
                  style={{
                    color:
                      project.completionPercentage > 0.75
                        ? "green"
                        : project.completionPercentage > 0.5
                          ? "orange"
                          : "red",
                  }}
                >
                  Completion Percentage: {(project.completionPercentage * 100).toFixed(2)}%
                </Card.Text>
                <Card.Text
                  style={{
                    color:
                      project.projectTotalQuantity > 1000
                        ? "darkblue"
                        : project.projectTotalQuantity > 500
                          ? "teal"
                          : "gray",
                  }}
                >
                  Total Quantity: {project.projectTotalQuantity}
                </Card.Text>
                <Button
                  variant="outline-primary"
                  onClick={() => openModal(project.projectId)}
                  className="d-flex align-items-center"
                >
                  <FaInfoCircle className="me-2" /> Show Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={closeModal} fullscreen={true} centered>
  <Modal.Header
    closeButton
    style={{
      background: "linear-gradient(45deg, #007bff, #6610f2)",
      color: "#fff",
    }}
  >
    <Modal.Title className="w-100 text-center">
      {projectDetails[selectedProjectId]?.name || `Project ${selectedProjectId}`}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body style={{ padding: "20px" }}>
  <Button
    variant="success"
    onClick={exportTableToExcel}
    style={{
      fontWeight: "bold",
      padding: "8px 16px",
      borderRadius: "8px",
      position: "absolute",
      top: "20px",
      right: "20px",
      zIndex: 10,
    }}
  >
    <FaFileExcel className="me-2" />
    Download Excel
  </Button>

  {/* Filter Controls */}
  <Form className="mb-4 p-4 shadow-sm rounded" style={{ backgroundColor: "#f8f9fa" }}>
    <Row className="gy-3">
      {Object.keys(filters).map((filterKey) => (
        <Col md={4} key={filterKey}>
          <Form.Group controlId={`filter-${filterKey}`}>
            <Form.Label
              style={{
                fontWeight: "bold",
                color: "#495057",
                fontSize: "14px",
              }}
            >
              {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={`Enter ${filterKey}`}
              value={filters[filterKey]}
              onChange={(e) => handleFilterChange(e)}
              name={filterKey}
              style={{
                borderRadius: "10px",
                padding: "10px",
                border: "1px solid #ced4da",
                fontSize: "14px",
                backgroundColor: "#fff",
              }}
            />
          </Form.Group>
        </Col>
      ))}
    </Row>
  </Form>

  {/* Data Table */}
  <Table responsive hover bordered striped>
  <thead>
    <tr>
      
     
      <th>Catch No.</th>
      <th>Paper</th>
      <th>Subject</th>
      <th>Course</th>
      <th>Exam Date</th>
      <th>Lot No.</th>
      <th>Quantity</th>
      <th>Pages</th>
      <th>Percentage Catch</th>
      <th>Interim Quantity</th>
      <th>Remarks</th>
      <th>Voice Recording</th>
      <th>Zone</th>
      <th>Machine</th>
      
      <th>Alarm</th>
      <th>Team</th>
    </tr>
  </thead>
  <tbody>
    {filteredData.map((sheet, index) => (
      <tr key={index}>
       
       
        <td>{sheet.catchNo}</td>
        <td>{sheet.paper}</td>
        <td>{sheet.subject}</td>
        <td>{sheet.course}</td>
        <td>{new Date(sheet.examDate).toLocaleDateString()}</td>
        <td>{sheet.lotNo}</td>
        <td>{sheet.quantity}</td>
        <td>{sheet.pages}</td>
        <td>{sheet.percentageCatch?.toFixed(2)}%</td>
        <td>{sheet.interimQuantity}</td>
        <td>{sheet.remarks }</td>
        <td>{sheet.voiceRecording }</td>
        <td>{sheet.zoneId}</td>
        <td>{sheet.machineId}</td>
       
        <td>{sheet.alarmId }</td>
        <td>{sheet.teamId?.join(", ") }</td>
      </tr>
    ))}
  </tbody>
</Table>

</Modal.Body>

</Modal>

    </Container>
  );
};

export default ProjectReport;

