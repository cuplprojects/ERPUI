import React, { useEffect, useState } from 'react';
import { Button, Table, Row, Col } from 'react-bootstrap';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const DashboardAlarmModal = ({ projectId, lotNo }) => {
  const [alarmsData, setAlarmsData] = useState([]);
  const [catchData, setCatchData] = useState([]);
  const [alarmMessages, setAlarmMessages] = useState({});
  const [filteredAlarmsData, setFilteredAlarmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch alarms data
        const alarmsResponse = await fetch(`https://localhost:7212/api/Transactions/alarms?projectId=${projectId}`);
        const alarms = await alarmsResponse.json();

        // Fetch catch details data
        const catchResponse = await fetch(`https://localhost:7212/api/QuantitySheet/CatchByproject?ProjectId=${projectId}`);
        const catchDetails = await catchResponse.json();

        // Fetch alarm messages
        const alarmMessagesResponse = await fetch(`https://localhost:7212/api/Alarms`);
        const alarmMessagesData = await alarmMessagesResponse.json();

        // Map alarm IDs to their messages dynamically
        const messageMap = alarmMessagesData.reduce((acc, alarm) => {
          acc[alarm.alarmId] = alarm.message;
          return acc;
        }, {});

        // Set the fetched alarm messages in state
        setAlarmMessages(messageMap);

        // Combine alarms with their corresponding catchNo and filter based on lotNo
        const combinedData = alarms.map(alarm => {
          const catchInfo = catchDetails.find(catchItem => catchItem.quantitySheetId === alarm.quantitysheetId);
          const message = messageMap[alarm.alarmId] || `${alarm.alarmId}`; // Default to alarmId if no match
          return {
            alarmId: alarm.alarmId,
            catchNo: catchInfo ? catchInfo.catchNo : 'N/A',
            alarmMessage: message,
            lotNo: catchInfo ? catchInfo.lotNo : 'N/A', // Assuming lotNo is in catchInfo
            quantitySheetId: alarm.quantitysheetId, // Store quantitySheetId for later use
            transactionId: alarm.transactionId, // Assume this comes from the response or additional transaction data
            srNo: alarm.quantitysheetId, // Assuming srNo is the quantitySheetId for sending in the request
          };
        });

        setAlarmsData(combinedData);
        setCatchData(catchDetails);

      } catch (err) {
        setError("An error occurred while fetching the data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Filter alarms based on the selected lotNo
  useEffect(() => {
    if (lotNo && alarmsData.length > 0) {
      const filteredData = alarmsData.filter(alert => alert.lotNo === lotNo);
      setFilteredAlarmsData(filteredData);
    }
  }, [lotNo, alarmsData]); // Re-run when either lotNo or alarmsData changes

  // Handle resolve functionality
  const handleResolve = async (quantitySheetId) => {
    try {
      // Find the alarm data for the specific quantitySheetId
      const alarmData = filteredAlarmsData.find(alarm => alarm.quantitySheetId === quantitySheetId);
      if (!alarmData) {
        console.error("Alarm not found for QuantitySheetId:", quantitySheetId);
        return;
      }

      let existingTransactionData = {};
      // Fetch existing transaction data only if needed
      if (alarmData.transactionId) {
        const response = await fetch(`https://localhost:7212/api/Transactions/${alarmData.transactionId}`);
        existingTransactionData = await response.json();
      }

      // Construct the dynamic POST data
      const postData = {
        transactionId: alarmData.transactionId || 0,  // Use the transactionId from alarmData, defaulting to 0
        interimQuantity: alarmData.interimQuantity || 0,  // Use interimQuantity if available
        remarks: existingTransactionData.remarks || '',  // Use remarks from the data
        projectId: alarmData.projectId || projectId,  // Default to projectId prop if not available in alarmData
        quantitysheetId: alarmData.srNo || 0,  // Use srNo as quantitySheetId, default to 0 if not available
        processId: existingTransactionData.processId || 0,  // Use processId from existingTransactionData if available
        zoneId: existingTransactionData.zoneId || 0,  // Use zoneId if available, default to 0
        machineId: existingTransactionData.machineId || 0,  // Use machineId if available, default to 0
        status: existingTransactionData.status || 0,  // Default to status 0 if not available
        alarmId: "0",  // Resolving alarm, set to 0
        lotNo: alarmData.lotNo || 0,  // Ensure lotNo is included
        teamId: existingTransactionData.teamId || [],  // Use teamId if available
        voiceRecording: existingTransactionData.voiceRecording || '',  // Use voiceRecording if available
      };

      // Send PUT request to update alarmId to '0' for the specific quantitySheetId
      const response = await fetch(`https://localhost:7212/api/Transactions/quantitysheet/${quantitySheetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve alarm');
      }

      // Update the UI to reflect that this alarm has been resolved
      setFilteredAlarmsData(prevData =>
        prevData.map(alarm =>
          alarm.quantitySheetId === quantitySheetId
            ? { ...alarm, alarmId: "0" }  // Update the alarmId to '0' for resolved alarm
            : alarm
        )
      );

      console.log(`Resolved alarm for QuantitySheet ID: ${quantitySheetId}`);
    } catch (error) {
      console.error('Error resolving alarm:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Row className="mb-3">
        <Col>
          <h3>Project {projectId} - Alarms</h3>
        </Col>
        <Col>
          <h3>Alarms for Lot {lotNo}</h3>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Catch No.</th>
            <th>Alarm Message</th>
            <th>Action</th> {/* Add an Action column for the Resolve button */}
          </tr>
        </thead>
        <tbody>
          {filteredAlarmsData.length > 0 ? (
            filteredAlarmsData.map((data, index) => (
              <tr key={index}>
                <td>{data.catchNo}</td>
                <td>{data.alarmMessage}</td>
                <td>
                  {hasPermission('2.8.3') && (
                       <Button 
                    variant="success" 
                    onClick={() => handleResolve(data.quantitySheetId)} 
                  >
                    Resolve
                  </Button>
                  )}
               
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No alarms found for this lot.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DashboardAlarmModal;
