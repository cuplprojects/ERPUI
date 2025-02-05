import React from "react";
import { Table } from "react-bootstrap";

const CatchDetails = ({ catchData, projectName, groupName }) => {
  const styles = {
    container: {
      padding: "24px",
      backgroundColor: "#ffffff", 
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    header: {
      marginBottom: "24px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "600",
      color: "#2c3e50",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#7f8c8d",
      fontSize: "14px",
    },
    tableContainer: {
      overflowX: "auto",
    },
    tableHeader: {
      backgroundColor: "#3498db",
      color: "white",
      padding: "12px",
    },
    tableCell: {
      padding: "12px",
      verticalAlign: "middle",
    },
    statusBadge: (status) => ({
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "500",
      backgroundColor: status === "Completed" ? "#2ecc71" : status === "Running" ? "#f1c40f" : "#95a5a6",
      color: status === "Running" ? "#2c3e50" : "white",
    }),
    teamContainer: {
      marginBottom: "4px",
    },
    teamName: {
      fontWeight: "600",
      color: "#34495e",
    },
    teamMembers: {
      color: "#7f8c8d",
      fontSize: "13px",
    },
    processBadge: (isCurrentProcess) => ({
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "500",
      backgroundColor: isCurrentProcess ? "#e74c3c" : "#f8f9fa",
      color: isCurrentProcess ? "white" : "#2c3e50",
      border: isCurrentProcess ? "none" : "1px solid #dee2e6",
    }),
  };

  if (!catchData) return null;

  const headers = [
    "Catch Number",
    "Exam Date",
    "Exam Time",
    "Lot Number",
    "Quantity",
    "Status",
    "Zones",
    "Teams",
    "Machines",
    "Process Names"
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          Catch Details - <span style={{ color: "#3498db" }}>{catchData.catchNo}</span>
        </h3>
        <div style={styles.subtitle}>
          Project: {projectName} <span style={{ margin: "0 12px", color: "#bdc3c7" }}>|</span> Group: {groupName}
        </div>
      </div>

      <div style={styles.tableContainer}>
        <Table striped bordered hover>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} style={styles.tableHeader}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.tableCell}>{catchData.catchNo}</td>
              <td style={styles.tableCell}>{new Date(catchData.examDate).toLocaleDateString()}</td>
              <td style={styles.tableCell}>{catchData.examTime}</td>
              <td style={styles.tableCell}>{catchData.lotNo}</td>
              <td style={styles.tableCell}>{catchData.quantity}</td>
              <td style={styles.tableCell}>
                <span style={styles.statusBadge(catchData.catchStatus)}>
                  {catchData.catchStatus}
                </span>
              </td>
              <td style={styles.tableCell}>
                {catchData.transactionData?.zoneDescriptions?.join(", ") || "N/A"}
              </td>
              <td style={styles.tableCell}>
                {catchData.transactionData?.teamDetails?.map(team => (
                  <div key={team.teamName} style={styles.teamContainer}>
                    <span style={styles.teamName}>{team.teamName}</span>
                    {": "}
                    <span style={styles.teamMembers}>{team.userNames.join(', ')}</span>
                  </div>
                )) || "N/A"}
              </td>
              <td style={styles.tableCell}>
                {catchData.transactionData?.machineNames?.join(", ") || "N/A"}
              </td>
              <td style={styles.tableCell}>
                {catchData.processNames?.map((process, idx) => (
                  <span
                    key={idx}
                    style={styles.processBadge(process === catchData.currentProcessName)}
                  >
                    {process}
                  </span>
                ))}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CatchDetails;
