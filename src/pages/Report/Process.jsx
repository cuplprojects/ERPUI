import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import API from "../../CustomHooks/MasterApiHooks/api";

const ProcessDetails = ({ catchData, projectName, groupName }) => {
  const [processData, setProcessData] = useState([]);
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
        console.log(response.data)
        setProcessData(response.data);
      } catch (error) {
        console.error("Error fetching process data:", error);
      }
    };

    if (catchData?.catchNo) {
      fetchProcessData();
    }
  }, [catchData?.catchNo]);

  

  const getProcessName = (processId) => {
    const process = processes.find(p => p.id === processId);
    return process ? process.name : `Process ${processId}`;
  };

  if (!catchData) return null;

  return (
    
      <div >
        <Table 
          striped 
          bordered 
          hover
          responsive
          className="shadow-sm rounded overflow-hidden bg-white w-100"
        >
          <thead>
            <tr>
              <th className="bg-primary text-white text-center fw-semibold" 
                  style={{
                    width: '15%',
                    padding: '12px 8px',
                    borderTopLeftRadius: '6px',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    borderBottom: 'none'
                  }}>
                Process
              </th>
              <th className="bg-primary text-white text-center fw-semibold" 
                  style={{
                    width: '20%',
                    padding: '12px 8px',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    borderBottom: 'none'
                  }}>
                Zone
              </th>
              <th className="bg-primary text-white text-center fw-semibold" 
                  style={{
                    width: '25%',
                    padding: '12px 8px',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    borderBottom: 'none'
                  }}>
                Team & Supervisor
              </th>
              <th className="bg-primary text-white text-center fw-semibold" 
                  style={{
                    width: '15%',
                    padding: '12px 8px',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    borderBottom: 'none'
                  }}>
                Machine
              </th>
              <th className="bg-primary text-white text-center fw-semibold" 
                  style={{
                    width: '25%',
                    padding: '12px 8px',
                    borderTopRightRadius: '6px',
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    borderBottom: 'none'
                  }}>
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            {processData.map((process) => (
              process.transactions.map((transaction, idx) => (
                <tr key={`${process.processId}-${idx}`}>
                  <td className="text-center fw-medium text-nowrap">
                    {getProcessName(process.processId)}
                  </td>
                  <td className="text-center text-secondary">
                    {transaction.zoneName || 'N/A'}
                  </td>
                  <td className="text-center">
                    <div className="d-flex flex-wrap gap-1 justify-content-center align-items-center">
                      <span className="badge bg-warning text-dark text-truncate">
                        👤 {transaction.supervisor}
                      </span>
                      
                      {transaction.teamMembers?.map((member, index) => (
                        <span key={`member-${index}`} className="badge bg-light text-dark text-truncate">
                          {member.fullName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-center text-secondary text-nowrap">
                    {transaction.machineName || 'N/A'}
                  </td>
                  <td className="text-center text-nowrap">
                    <div className="small">
                      <div>
                        <strong>Start:</strong> {new Date(transaction.startTime).toLocaleString()}
                      </div>
                      <div>
                        <strong>End:</strong> {new Date(transaction.endTime).toLocaleString()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </Table>
      </div>
   
  )
}

export default ProcessDetails
