
import React, { useEffect, useState } from "react";
import { Button, Table, Row, Col, Alert } from "react-bootstrap";
import API from "../CustomHooks/MasterApiHooks/api";
import { useStore } from 'zustand';
import themeStore from '../store/themeStore';

const DashboardAlarmModal = ({ projectId, lotNo, hasResolvePermission }) => {
  const [alarmsData, setAlarmsData] = useState([]);
  const [catchData, setCatchData] = useState([]);
  const [alarmMessages, setAlarmMessages] = useState({});
  const [filteredAlarmsData, setFilteredAlarmsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [projectName, setProjectName] = useState("");

  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        console.log("No projectId provided");
        return;
      }

      try {
        console.log("Fetching data for projectId:", projectId);

        // Fetch alarms data
        const alarmsResponse = await API.get(`/Transactions/alarms?projectId=${projectId}`);
        const alarms = alarmsResponse.data;
        console.log("Alarms data:", alarms);

        // Fetch catch details data
        const catchResponse = await API.get(`/QuantitySheet/CatchByproject?ProjectId=${projectId}`);
        const catchDetails = catchResponse.data;
        console.log("Catch details:", catchDetails);

        // Fetch alarm messages
        const alarmMessagesResponse = await API.get('/alarms');
        const alarmMessagesData = alarmMessagesResponse.data;
        console.log("Alarm messages:", alarmMessagesData);

        // Fetch project details
        const projectResponse = await API.get(`/Project/${projectId}`);
        const projectDetails = projectResponse.data;
        setProjectName(projectDetails.name);
        console.log("Project details:", projectDetails);

        // Map alarm IDs to their messages dynamically
        const messageMap = alarmMessagesData.reduce((acc, alarm) => {
          acc[alarm.alarmId] = alarm.message;
          return acc;
        }, {});

        setAlarmMessages(messageMap);

        // Combine alarms with their corresponding catchNo and filter based on lotNo
        const combinedData = alarms.map((alarm) => {
          const catchInfo = catchDetails.find(
            (catchItem) => catchItem.quantitySheetId === alarm.quantitysheetId
          );
          const message = messageMap[alarm.alarmId] || `${alarm.alarmId}`;

          const combined = {
            alarmId: alarm.alarmId,
            catchNo: catchInfo ? catchInfo.catchNo : "N/A",
            alarmMessage: message,
            lotNo: catchInfo ? catchInfo.lotNo : "N/A",
            quantitySheetId: alarm.quantitysheetId,
            transactionId: alarm.transactionId,
            srNo: alarm.quantitysheetId,
            projectId: alarm.projectId,
            interimQuantity: alarm.interimQuantity,
          };
          console.log("Combined alarm data:", combined);
          return combined;
        });

        setAlarmsData(combinedData);
        setCatchData(catchDetails);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`No Alerts Found`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Filter alarms based on the selected lotNo
  useEffect(() => {
    if (lotNo && alarmsData.length > 0) {
      console.log("Filtering alarms for lotNo:", lotNo);
      const filteredData = alarmsData.filter((alert) => alert.lotNo === lotNo);
      console.log("Filtered alarms:", filteredData);
      setFilteredAlarmsData(filteredData);
    }
  }, [lotNo, alarmsData]);

  // Handle resolve functionality
  const handleResolve = async (quantitySheetId) => {
    try {
      console.log("Resolving alarm for quantitySheetId:", quantitySheetId);

      const alarmData = filteredAlarmsData.find(
        (alarm) => alarm.quantitySheetId === quantitySheetId
      );
      if (!alarmData) {
        throw new Error(
          `Alarm not found for QuantitySheetId: ${quantitySheetId}`
        );
      }

      let existingTransactionData = {};
      if (alarmData.transactionId) {
        const response = await API.get(`/Transactions/${alarmData.transactionId}`);
        existingTransactionData = response.data;
        console.log("Existing transaction data:", existingTransactionData);
      }

      const postData = {
        transactionId: alarmData.transactionId || 0,
        interimQuantity: alarmData.interimQuantity || 0,
        remarks: existingTransactionData.remarks || "",
        projectId: alarmData.projectId || projectId,
        quantitysheetId: alarmData.srNo || 0,
        processId: existingTransactionData.processId || 0,
        zoneId: existingTransactionData.zoneId || 0,
        machineId: existingTransactionData.machineId || 0,
        status: existingTransactionData.status || 0,
        alarmId: " ",
        lotNo: alarmData.lotNo || 0,
        teamId: existingTransactionData.teamId || [],
        voiceRecording: existingTransactionData.voiceRecording || "",
      };

      console.log("Sending PUT request with data:", postData);

      await API.put(`/Transactions/quantitysheet/${quantitySheetId}`, postData);

      console.log("Alarm resolved successfully");
      setSuccessMessage("Alarm resolved successfully!");

      // Remove the resolved alarm immediately
      setFilteredAlarmsData(prevData => 
        prevData.filter(alarm => alarm.quantitySheetId !== quantitySheetId)
      );

    } catch (error) {
      console.error("Error resolving alarm:", error);
      setError(`Failed to resolve alarm: ${error.message}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className={`alert alert-success ${customLight}`}>{error}</div>;
  }

  return (
    <div >
      <Row className="mb-3">
        <Col>
          <h3>Project {projectName} - Alarms</h3>
        </Col>
        <Col>
          <h3>Alarms for Lot {lotNo}</h3>
        </Col>
      </Row>

      {successMessage && (
        <Alert variant="success" className={`mb-3 ${customLight}`} onClose={() => setSuccessMessage("")} dismissible>
          {successMessage}
        </Alert>
      )}

      <Table striped bordered hover className={customLight}>
        <thead>
          <tr>
            <th>Catch No.</th>
            <th>Alarm Message</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredAlarmsData.length > 0 ? (
            filteredAlarmsData.map((data, index) => (
              <tr key={index}>
                <td>{data.catchNo}</td>
                <td>{data.alarmMessage}</td>
                <td>
                  {hasResolvePermission && (
                    <Button
                      variant="success"
                      className={`${customBtn} ${customDark === "dark-dark" ? "border" : "border-0"}`}
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
