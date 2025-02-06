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
          style={{
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: 'white'
          }}
        >
          <thead>
            <tr>
              <th style={{...styles.tableHeader, borderTopLeftRadius: '8px'}}>Process</th>
              <th style={{...styles.tableHeader, borderTopRightRadius: '8px'}}>Status</th>
              <th style={styles.tableHeader}>Zone Description</th>
              <th style={styles.tableHeader}>Teams & Members</th>
              <th style={styles.tableHeader}>Machine</th>
             
            </tr>
          </thead>
          <tbody>
            {Object.entries(processData).map(([processId, processDetails]) => (
              processDetails.map((detail, idx) => (
                <tr 
                  key={`${processId}-${idx}`}
                  style={{
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                >
                  <td style={{...styles.tableCell, fontWeight: '500'}}>{getProcessName(processId)}</td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.processBadge(detail.status),
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s'
                    }}>
                      {detail.status === 2 ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td style={{...styles.tableCell, color: '#4a5568'}}>{detail.zoneDescription || 'N/A'}</td>
                  <td style={styles.tableCell}>
                    {detail.teamDetails?.map(team => (
                      <div key={team.teamName} style={{
                        ...styles.teamContainer,
                        padding: '4px 0'
                      }}>
                        <span style={{
                          ...styles.teamName,
                          backgroundColor: '#e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          marginRight: '6px'
                        }}>{team.teamName}</span>
                        <span style={{
                          ...styles.teamMembers,
                          fontStyle: 'italic'
                        }}>
                          {team.userDetails.map(user => user.fullName).join(', ')}
                        </span>
                      </div>
                    ))}
                  </td>
                  <td style={{...styles.tableCell, color: '#4a5568'}}>{detail.machineName || 'N/A'}</td>
                  
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
