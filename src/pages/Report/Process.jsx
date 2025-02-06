import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import API from "../../CustomHooks/MasterApiHooks/api";

const ProcessDetails = ({ catchData, projectName, groupName }) => {
  const [processData, setProcessData] = useState({});
  const [processes, setProcesses] = useState([]);

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await API.get('/Processes');
        setProcesses(response.data);
      } catch (error) {
        console.error("Error fetching processes:", error);
      }
    };

    fetchProcesses();
  }, []);

  useEffect(() => {
    const fetchProcessData = async () => {
      try {
        const response = await API.get(`/Reports/process-wise/${catchData.catchNo}`);
        setProcessData(response.data);
      } catch (error) {
        console.error("Error fetching process data:", error);
      }
    };

    if (catchData?.catchNo) {
      fetchProcessData();
    }
  }, [catchData?.catchNo]);

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
    processBadge: (status) => ({
      padding: "6px 12px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "500",
      backgroundColor: status === 2 ? "#2ecc71" : "#f8f9fa",
      color: status === 2 ? "white" : "#2c3e50",
      border: status === 2 ? "none" : "1px solid #dee2e6",
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
    supervisor: {
      backgroundColor: '#fff3cd', // Light yellow background
      color: '#856404', // Darker yellow text
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '13px',
      fontWeight: '500',
      display: 'inline-block',
      margin: '2px 4px',
      border: '1px solid #ffeeba'
    },
    teamMember: {
      backgroundColor: '#f8f9fa',
      color: '#495057',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '13px',
      margin: '2px 4px',
      display: 'inline-block'
    },
    memberContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '4px',
      alignItems: 'center'
    }
  };

  const getProcessName = (processId) => {
    const process = processes.find(p => p.id === parseInt(processId));
    return process ? process.name : `Process ${processId}`;
  };

  if (!catchData) return null;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          Process Details - <span style={{ color: "#3498db" }}>{catchData.catchNo}</span>
        </h3>
        <div style={styles.subtitle}>
          Project: {projectName} <span style={{ margin: "0 12px", color: "#bdc3c7" }}>|</span> Group: {groupName}
        </div>
      </div>

      <div style={styles.tableContainer}>
        <Table 
          striped 
          bordered 
          hover
          responsive
          style={{
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white',
            width: '100%',
            tableLayout: 'auto'
          }}
        >
          <thead>
            <tr>
              <th style={{...styles.tableHeader, borderTopLeftRadius: '8px', width: '15%'}}>Process</th>
              <th style={{...styles.tableHeader, width: '10%'}}>Status</th>
              <th style={{...styles.tableHeader, width: '20%'}}>Zone Description</th>
              <th style={{...styles.tableHeader, width: '25%'}}>Team & Supervisors</th>
              <th style={{...styles.tableHeader, width: '15%'}}>Machine</th>
              <th style={{...styles.tableHeader, borderTopRightRadius: '8px', width: '15%'}}>Time</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(processData).map(([processId, details]) => (
              details.map((detail, idx) => (
                <tr 
                  key={`${processId}-${idx}`}
                  style={{
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                >
                  <td style={{...styles.tableCell, fontWeight: '500', whiteSpace: 'nowrap'}}>{getProcessName(processId)}</td>
                  <td style={{...styles.tableCell, textAlign: 'center'}}>
                    <span style={{
                      ...styles.processBadge(detail.status),
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      display: 'inline-block',
                      minWidth: '80px'
                    }}>
                      {detail.status === 2 ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td style={{...styles.tableCell, color: '#4a5568', wordBreak: 'break-word'}}>{detail.zoneDescription || 'N/A'}</td>
                  <td style={styles.tableCell}>
                    <div style={{...styles.memberContainer, maxWidth: '100%'}}>
                      {/* Supervisors Section */}
                      {detail.supervisor?.map((sup, index) => (
                        <span key={`sup-${index}`} style={{...styles.supervisor, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          👤 {sup.fullName}
                        </span>
                      ))}
                      
                      {/* Team Members Section */}
                      {detail.teamMembers?.map((member, index) => (
                        <span key={`member-${index}`} style={{...styles.teamMember, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                          {member.fullName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{...styles.tableCell, color: '#4a5568', whiteSpace: 'nowrap'}}>{detail.machineName || 'N/A'}</td>
                  <td style={{...styles.tableCell, whiteSpace: 'nowrap'}}>
                    <div className="small">
                      <div>
                        <strong>Start:</strong> {new Date(detail.startTime).toLocaleString()}
                      </div>
                      <div>
                        <strong>End:</strong> {new Date(detail.endTime).toLocaleString()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

export default ProcessDetails
