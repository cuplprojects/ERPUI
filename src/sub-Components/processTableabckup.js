import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, Spinner, Row, Col } from "react-bootstrap";
import ProjectDetailsTable from "./projectDetailTable";
import StatusPieChart from "./StatusPieChart";
import StatusBarChart from "./StatusBarChart";
import "./../styles/processTable.css";
    import { Switch, Select } from "antd";
    import CatchProgressBar from "./CatchProgressBar";
import AlertBadge from "./AlertBadge";
import CatchDetailModal from "../menus/CatchDetailModal";
import themeStore from "../store/themeStore";
import { useStore } from "zustand";
import { MdPending, MdCloudUpload } from "react-icons/md";
import { Link } from "react-router-dom";
import { FaRegHourglassHalf } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import API from "../CustomHooks/MasterApiHooks/api";
import { useUserData } from "../store/userDataStore";
import {
  getProjectProcessAndFeature,
  getProjectProcessByProjectAndSequence,
} from "../CustomHooks/ApiServices/projectProcessAndFeatureService";
import useCurrentProcessStore from "../store/currentProcessStore";
import { decrypt } from "../Security/Security";
import {
  getCombinedPercentages,
  getProjectTransactionsData,
} from "../CustomHooks/ApiServices/transacationService";
import ToggleProject from "../pages/processPage/Components/ToggleProject";
import ToggleProcess from "../pages/processPage/Components/ToggleProcess";
import PreviousProcess from "../pages/processPage/Components/PreviousProcess";
import MarqueeAlert from "../pages/processPage/Components/MarqueeAlert";
import DispatchPage from "../pages/dispatchPage/DispatchPage";

const ProcessTable = () => {
  const { encryptedProjectId, encryptedLotNo } = useParams();
  const id = decrypt(encryptedProjectId);
  const lotNo = decrypt(encryptedLotNo);
  const [featureData, setFeatureData] = useState(null);
  const { processId, processName } = useCurrentProcessStore();
  const { setProcess } = useCurrentProcessStore((state) => state.actions);
  const userData = useUserData();
  const { t } = useTranslation();

  // Subscribe to theme store changes
  const themeState = useStore(themeStore);
  const cssClasses = useMemo(() => themeState.getCssClasses(), [themeState]);
  const [
    customDark,
    customMid,
    customLight,
    customBtn,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder,
  ] = cssClasses;

  // Force re-render when theme changes
  useEffect(() => {
    // This empty dependency array ensures cssClasses are always fresh
  }, [cssClasses]);

  const [tableData, setTableData] = useState([]);
  const [showBarChart, setShowBarChart] = useState(false);
  const [catchDetailModalShow, setCatchDetailModalShow] = useState(false);
  const [catchDetailModalData, setCatchDetailModalData] = useState(null);
  const [selectedLot, setSelectedLot] = useState(lotNo);
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectLots, setProjectLots] = useState([]);
  const [previousProcess, setPreviousProcess] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [
    previousProcessCompletionPercentage,
    setPreviousProcessCompletionPercentage,
  ] = useState(0);
  const [previousProcessTransactions, setPreviousProcessTransactions] =
    useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [showPieChart, setShowPieChart] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [digitalandOffsetData, setDigitalandOffsetData] = useState([]);

  useEffect(() => {
    fetchCombinedPercentages();
  }, [selectedLot, previousProcess]);

  const handleProcessChange = async (value) => {
    console.log("handleProcessChange triggered with value:", value);
    const selectedProcess = processes.find((p) => p.processId === value);
    console.log("Selected Process:", selectedProcess);

    if (selectedProcess) {
      setProcess(selectedProcess.processId, selectedProcess.processName);
      setIsLoading(true);
      try {
        // Fetch new feature data for selected process
        const data = await getProjectProcessAndFeature(
          userData.userId,
          selectedProject?.value || id
        );
        const processData = data.find((p) => p.processId === value);
        setFeatureData(processData);
        if (processData.sequence > 1) {
          let previousSequence = processData.sequence - 1;
          let previousProcessData;

          // Loop to find the previous valid process based on logic
          do {
            previousProcessData = await getProjectProcessByProjectAndSequence(
              selectedProject?.value || id,
              previousSequence
            );
            if (!previousProcessData) break;

            // Add logic to skip based on your conditions
            // If current process ID is 7 and previous process ID is 6, skip 6 and check further
            if (
              processData.processId === 2 &&
              previousProcessData.processId === 3
            ) {
              previousSequence--; // Skip this and go to earlier sequence
              continue;
            }

            // If current process ID is 6, skip previous process ID 5 and 7 and check further
            if (
              processData.processId === 3 &&
              (previousProcessData.processId === 1 ||
                previousProcessData.processId === 2)
            ) {
              previousSequence--; // Skip this and go to earlier sequence
              continue;
            }

            // Check if the previous process matches conditions for Dependent or Independent
            if (
              previousProcessData.processType === "Dependent" ||
              (previousProcessData.processType === "Independent" &&
                previousProcessData.rangeStart <= processData.sequence &&
                previousProcessData.rangeEnd >= processData.sequence)
            ) {
              // If current process is Independent and previous process is Independent
              if (previousProcessData.processType === "Independent") {
                // Check if rangeEnd of previous process equals current processId
                if (previousProcessData.rangeEnd === processData.processId) {
                  // If it matches, consider this previous process
                  setPreviousProcess(previousProcessData);
                  const prevTransactions = await getProjectTransactionsData(
                    selectedProject?.value || id,
                    previousProcessData.processId
                  );
                  const mappedPrevTransactions = prevTransactions.data.map(
                    (transaction) => ({
                      ...transaction,
                      thresholdQty: previousProcessData.thresholdQty,
                    })
                  );
                  setPreviousProcessTransactions(mappedPrevTransactions);
                  break;
                } else {
                  // If it doesn't match, go to the process before this one
                  previousSequence--;
                  continue; // Skip this process and check previous
                }
              }

              // If current process is Independent, set previous process to min range
              if (
                processData.processType === "Independent" &&
                processData.rangeStart
              ) {
                previousProcessData =
                  await getProjectProcessByProjectAndSequence(
                    selectedProject?.value || id,
                    processData.rangeStart
                  );
              }

              setPreviousProcess(previousProcessData);
              const prevTransactions = await getProjectTransactionsData(
                selectedProject?.value || id,
                previousProcessData.processId
              );
              const mappedPrevTransactions = prevTransactions.data.map(
                (transaction) => ({
                  ...transaction,
                  thresholdQty: previousProcessData.thresholdQty,
                })
              );
              setPreviousProcessTransactions(mappedPrevTransactions);
              break;
            }
            previousSequence--;
          } while (previousSequence > 0);

          if (previousSequence <= 0) {
            setPreviousProcess(null);
            setPreviousProcessTransactions([]);
          }
        } else {
          setPreviousProcess(null);
          setPreviousProcessTransactions([]);
        }

        await fetchTransactions();
      } catch (error) {
        console.error("Error updating process data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  //get digital or offset data
  useEffect(() => {
    const fetchDigitalOrOffsetData = async () => {
      try {
        if (selectedProject && previousProcess?.processId === 3) {
          const digitalData = await getProjectTransactionsData(
            selectedProject?.value || id,
            2
          );
          setDigitalandOffsetData(digitalData.data);
        }
        if (selectedProject && previousProcess?.processId === 2) {
          const offsetData = await getProjectTransactionsData(
            selectedProject?.value || id,
            3
          );
          setDigitalandOffsetData(offsetData.data);
        }
      } catch (error) {
        console.error("Error fetching digital/offset data:", error);
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        });
      }
    };

    fetchDigitalOrOffsetData();
  }, [selectedProject, processId, id]);

  const handleProjectChange = async (selectedProject) => {
    if (!selectedProject || selectedProject.value === id) return;
    setSelectedProject(null);
    setProjectName("");
    setProcess(0, "");
    setFeatureData(null);
    setProcesses([]);
    setPreviousProcess(null);
    setPreviousProcessTransactions([]);
    setTableData([]);
    setProjectLots([]);
    setSelectedLot(null);
    setPreviousProcessCompletionPercentage(0);
    setSelectedProject(selectedProject);
    setProjectName(selectedProject.label);
    setIsLoading(true);

    try {
      // Fetch processes for new project
      const processData = await getProjectProcessAndFeature(
        userData.userId,
        selectedProject.value
      );

      if (Array.isArray(processData) && processData.length > 0) {
        // Set processes for dropdown
        setProcesses(
          processData.map((p) => ({
            processId: p.processId,
            processName: p.processName,
            sequence: p.sequence,
          }))
        );

        // Set first process as default for new project
        const firstProcess = processData[0];
        setProcess(firstProcess.processId, firstProcess.processName);
        setFeatureData(firstProcess);

        // Fetch lots for new project using first process
        const response = await getProjectTransactionsData(
          selectedProject.value,
          firstProcess.processId
        );
        const transactionsData = response.data;
        if (Array.isArray(transactionsData)) {
          const uniqueLots = [
            ...new Set(transactionsData.map((item) => item.lotNo)),
          ].sort((a, b) => a - b);
          setProjectLots(uniqueLots.map((lotNo) => ({ lotNo })));
          if (uniqueLots.length > 0) {
            setSelectedLot(uniqueLots[0]);
          }
        }
        if (firstProcess.sequence > 1) {
          const prevProcessData = await getProjectProcessByProjectAndSequence(
            selectedProject.value,
            firstProcess.sequence - 1
          );
          if (prevProcessData && prevProcessData.processType === "Dependent") {
            setPreviousProcess(prevProcessData);
            const prevTransactions = await getProjectTransactionsData(
              selectedProject.value,
              prevProcessData.processId
            );
            setPreviousProcessTransactions(prevTransactions.data);
          }
        }
        await fetchTransactions();
      }
    } catch (error) {
      console.error("Error updating project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCombinedPercentages = async () => {
    try {
      const data = await getCombinedPercentages(selectedProject?.value || id);
      if (data && previousProcess) {
        setPreviousProcessCompletionPercentage(
          data?.lotProcessWeightageSum[selectedLot][previousProcess.processId]
        );
      }
    } catch (error) {
      console.error("Error fetching combined percentages:", error);
    }
  };

  const hasFeaturePermission = useCallback(
    (featureId) => {
      // Check if the featureId is in the current process's featuresList
      if (featureData?.featuresList) {
        return featureData.featuresList.includes(featureId);
      }
      return false;
    },
    [featureData]
  );

  const formatQuantitySheetData = (item) => ({
    srNo: item.quantitySheetId,
    catchNumber: item.quantitySheetId,
    paper: "",
    course: "",
    subject: "",
    outerEnvelope: "",
    innerEnvelope: "",
    lotNo: item.lotNo,
    quantity: 0,
    percentageCatch: 0,
    projectId: item.projectId,
    processId: processId,
    status: item.transactions[0]?.status || 0,
    alerts: item.transactions[0]?.alarmId || "",
    interimQuantity: item.transactions[0]?.interimQuantity || 0,
    remarks: item.transactions[0]?.remarks || "",
    previousProcessStats: "",
    voiceRecording: item.transactions[0]?.voiceRecording || "",
    transactionId: item.transactions[0]?.transactionId || null,
    zoneId: item.transactions[0]?.zoneId || 0,
    machineId: item.transactions[0]?.machineId || 0,
    teamId: item.transactions[0]?.teamId || 0,
  });

  const fetchData = useCallback(async () => {
    if (!userData?.userId || id === processId) return;

    setIsLoading(true);
    try {
      const data = await getProjectProcessAndFeature(
        userData.userId,
        selectedProject?.value || id
      );
      if (Array.isArray(data) && data.length > 0) {
        const selectedProcess =
          data.find((p) => p.processId === processId) || data[0];
        setProcess(selectedProcess.processId, selectedProcess.processName);
        setFeatureData(selectedProcess);

        if (selectedProcess.sequence > 1) {
          let previousSequence = selectedProcess.sequence - 1;
          let previousProcessData;

          do {
            previousProcessData = await getProjectProcessByProjectAndSequence(
              selectedProject?.value || id,
              previousSequence
            );
            if (!previousProcessData) break;

            // Check if the previous process matches conditions for Dependent or Independent
            if (
              previousProcessData.processType === "Dependent" ||
              (previousProcessData.processType === "Independent" &&
                previousProcessData.rangeStart <= selectedProcess.sequence &&
                previousProcessData.rangeEnd >= selectedProcess.sequence)
            ) {
              setPreviousProcess(previousProcessData);
              const prevTransactions = await getProjectTransactionsData(
                selectedProject?.value || id,
                previousProcessData.processId
              );
              const mappedPrevTransactions = prevTransactions.data.map(
                (transaction) => ({
                  ...transaction,
                  thresholdQty: previousProcessData.thresholdQty,
                })
              );
              setPreviousProcessTransactions(mappedPrevTransactions);
              break;
            }
            previousSequence--;
          } while (previousSequence > 0);

          if (previousSequence <= 0) {
            setPreviousProcess(null);
            setPreviousProcessTransactions([]);
          }
        } else {
          setPreviousProcess(null);
          setPreviousProcessTransactions([]);
        }

        setProcesses(
          data.map((p) => ({
            processId: p.processId,
            processName: p.processName,
            sequence: p.sequence,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching project process data:", error);
      setProcess(0, "Unknown Process");
      setFeatureData([]);
      setProcesses([]);
    } finally {
      setIsLoading(false);
    }
  }, [userData, id, processId, setProcess, selectedProject]);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await getProjectTransactionsData(
        selectedProject?.value || id,
        processId
      );
      const transactionsData = response.data;

      if (Array.isArray(transactionsData)) {
        // Filter transactions that contain current processId in processIds array
        const validTransactions = transactionsData.filter((item) =>
          item.processIds?.includes(Number(processId))
        );

        const formDataGet = validTransactions.map((item) => {
          let previousProcessData = previousProcessTransactions.find(
            (prevTrans) => prevTrans.quantitySheetId === item.quantitySheetId
          );

          // If no previous process data found, check digitalandOffsetData
          if (
            !previousProcessData?.transactions?.length &&
            digitalandOffsetData
          ) {
            // Check if digitalandOffsetData is an array before using find
            if (Array.isArray(digitalandOffsetData)) {
              previousProcessData = digitalandOffsetData.find(
                (digitalOffset) =>
                  digitalOffset.quantitySheetId === item.quantitySheetId
              );
            } else {
              console.warn(
                "digitalandOffsetData is not an array:",
                digitalandOffsetData
              );
            }
          }

          return {
            catchNumber: item.catchNo,
            srNo: item.quantitySheetId,
            lotNo: item.lotNo,
            paper: item.paper,
            examDate: item.examDate,
            examTime: item.examTime,
            course: item.course,
            subject: item.subject,
            innerEnvelope: item.innerEnvelope,
            outerEnvelope: item.outerEnvelope,
            quantity: item.quantity,
            percentageCatch: item.percentageCatch,
            projectId: selectedProject?.value || id,
            processId: processId,
            status: item.transactions[0]?.status || 0,
            alerts: item.transactions[0]?.alarmId || "",
            interimQuantity: item.transactions[0]?.interimQuantity || 0,
            remarks: item.transactions[0]?.remarks || "",
            previousProcessData:
              previousProcessData && previousProcess
                ? {
                    status: previousProcessData.transactions[0]?.status || 0,
                    interimQuantity:
                      previousProcessData.transactions[0]?.interimQuantity || 0,
                    remarks: previousProcessData.transactions[0]?.remarks || "",
                    alarmId: previousProcessData.transactions[0]?.alarmId || "",
                    teamUserNames:
                      previousProcessData.transactions[0]?.teamUserNames || [],
                    machinename:
                      previousProcessData.transactions[0]?.machinename || [],
                    alarmMessage:
                      previousProcessData.transactions[0]?.alarmMessage || null,
                    thresholdQty: previousProcess?.thresholdQty || 0,
                  }
                : null,
            voiceRecording: item.transactions[0]?.voiceRecording || "",
            transactionId: item.transactions[0]?.transactionId || null,
            machineId: item.transactions[0]?.machineId || 0,
            machinename:
              item.transactions[0]?.machinename || "No Machine Assigned",
            zoneNo: item.transactions?.[0]?.zoneNo || "No Zone Assigned",
            zoneId: item.transactions?.[0]?.zoneId || 0,
            teamId: item.transactions[0]?.teamId || [],
            teamUserNames: item.transactions[0]?.teamUserNames || [
              "No Team Assigned",
            ],
            alarmMessage: item.transactions[0]?.alarmMessage || null,
            processIds: item.processIds || [], // like [1,3,4,5]
          };
        });

        const filteredData = selectedLot
          ? formDataGet.filter(
              (item) => Number(item.lotNo) === Number(selectedLot)
            )
          : formDataGet;

        setTableData(filteredData);

        const uniqueLots = [
          ...new Set(validTransactions.map((item) => item.lotNo)),
        ].sort((a, b) => a - b);
        setProjectLots(uniqueLots.map((lotNo) => ({ lotNo })));
      }
    } catch (error) {
      console.error("Error fetching transactions data:", error);
      setTableData([]);
      setProjectLots([]);
    }
  }, [
    id,
    processId,
    selectedLot,
    previousProcessTransactions,
    selectedProject,
    previousProcess,
  ]);

  useEffect(() => {
    fetchData();

    const fetchProjectName = async () => {
      try {
        const response = await API.get(
          `/Project/${selectedProject?.value || id}`
        );
        if (!selectedProject) {
          setSelectedProject({ value: id, label: response.data.name });
        }
        setProjectName(response.data.name);
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };
    fetchProjectName();
  }, [fetchData, id]);

  useEffect(() => {
    if (selectedLot) {
      fetchTransactions();
    }
  }, [selectedLot, fetchTransactions]);

  const handleLotClick = async (lot) => {
    if (lot !== selectedLot) {
      setSelectedLot(lot);
      setIsLoading(true);
      try {
        const response = await getProjectTransactionsData(
          selectedProject?.value || id,
          processId
        );
        const transactionsData = response.data;
        const formDataGet = transactionsData.map(formatQuantitySheetData);
        const filteredData = formDataGet.filter(
          (item) => Number(item.lotNo) === Number(lot)
        );
        setTableData(filteredData);
      } catch (error) {
        console.error("Error fetching lot data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCatchClick = (record) => {
    setCatchDetailModalShow(true);
    setCatchDetailModalData(record);
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Loading project details...</span>
      </div>
    );
  }

  const catchNumbers = tableData
    .map((item) => item.catchNumber)
    .sort((a, b) => a - b);

  const combinedTableData =
    processName !== "Digital Printing" &&
    processName !== "Offset Printing" &&
    processName !== "CTP" &&
    processName !== "Cutting"
      ? tableData.reduce((acc, item) => {
          const existingItem = acc.find(
            (i) => i.catchNumber === item.catchNumber
          );
          if (existingItem) {
            existingItem.quantity += item.quantity;
          } else {
            acc.push({ ...item });
          }
          return acc;
        }, [])
      : tableData;

  return (
    <div className="container-fluid">
      <Row className="mb-">
        <Col lg={12} md={12} xs={12} className="">
          <Card className="shadow-sm">
            <Card.Header
              as="h3"
              className={`${
                customDark === "dark-dark"
                  ? `${customDark} text-white`
                  : `${customDark} text-white`
              }`}
            >
              <Row className="d-flex align-items-center">
                <Col lg={3} md={4} xs={12}>
                  <PreviousProcess
                    previousProcess={previousProcess}
                    previousProcessCompletionPercentage={
                      previousProcessCompletionPercentage
                    }
                  />
                </Col>
                <div className="d-flex justify-content-center d-lg-none d-md-none">
                  <hr className="w-100 center" />
                </div>
                <Col lg={6} md={4} xs={12}>
                  <ToggleProject
                    projectName={projectName}
                    selectedLot={selectedLot}
                    onChange={handleProjectChange}
                  />
                </Col>
                <div className="d-flex justify-content-center d-lg-none d-md-none">
                  <hr className="w-100 center" />
                </div>
                <Col lg={3} md={4} xs={12}>
                  <ToggleProcess
                    processes={processes}
                    initialProcessId={processId}
                    onProcessChange={handleProcessChange}
                    customDark={customDark}
                  />
                </Col>
              </Row>
            </Card.Header>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12} md={12}>
          <div className="marquee-container mt-2 mb-2">
            <MarqueeAlert data={tableData} onClick={handleCatchClick} />
          </div>
        </Col>
      </Row>

      {processName !== "Dispatch" && (
        <Row className="mb-5">
          <Col lg={12} md={12}>
            <CatchProgressBar data={combinedTableData} />
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={12} md={12} className="pe-0">
          <div className="d-flex flex-wrap gap-2 justify-content-center">
            {projectLots.map((lot, index) => (
              <button
                key={index}
                className={`${
                  selectedLot === lot.lotNo
                    ? "bg-white text-dark border-dark"
                    : customBtn
                } ${
                  customDark === "dark-dark" ? "border" : "custom-light-border"
                } d-flex align-items-center justify-content-center p-2 rounded-2 ${
                  customDark === "dark-dark"
                    ? "text-dark border-dark"
                    : "text-dark"
                } ${customDarkBorder}`}
                onClick={() => handleLotClick(lot.lotNo)}
                style={{
                  minWidth: "100px",
                  transition: "all 0.2s",
                }}
              >
                {t("lot")} {lot.lotNo}
              </button>
            ))}
          </div>
        </Col>
      </Row>

      {processName === "Dispatch" ? (
        <DispatchPage
          projectId={selectedProject?.value || id}
          processId={processId}
          lotNo={selectedLot}
        />
      ) : (
        <Row className="mb-2 mt-1">
          <Col lg={12} md={12} className="">
            {tableData?.length > 0 && (
              <ProjectDetailsTable
                tableData={combinedTableData}
                fetchTransactions={fetchTransactions}
                setTableData={setTableData}
                projectId={selectedProject?.value || id}
                lotNo={selectedLot}
                featureData={featureData}
                hasFeaturePermission={hasFeaturePermission}
                processId={processId}
                projectLots={projectLots}
              />
            )}
          </Col>
        </Row>
      )}

      <Row className="mb-4 d-flex justify-content-between">
        <Col lg={8} md={12} className="mb-1">
          <div className="d-flex align-items-center gap-4">
            <div>
              <Switch
                checked={showBarChart}
                onChange={() => setShowBarChart(!showBarChart)}
              />
              <span className={`ms-2 ${customDarkText}`}>
                {t("showCatchData")}
              </span>
            </div>
            <div>
              <Switch
                checked={showPieChart}
                onChange={() => setShowPieChart(!showPieChart)}
              />
              <span className={`ms-2 ${customDarkText}`}>
                {t("showCompletionPercentage")}
              </span>
            </div>
          </div>
        </Col>

        {showBarChart && (
          <Col
            lg={12}
            md={12}
            sm={12}
            className="mt-1 d-fle justify-content-center"
          >
            <StatusBarChart
              data={combinedTableData}
              catchNumbers={catchNumbers}
            />
          </Col>
        )}

        {showPieChart && (
          <Col
            lg={12}
            md={12}
            sm={12}
            className="mt-1 d-fle justify-content-center"
          >
            <StatusPieChart data={combinedTableData} />
          </Col>
        )}
      </Row>

      <CatchDetailModal
        show={catchDetailModalShow}
        handleClose={() => setCatchDetailModalShow(false)}
        data={catchDetailModalData}
        fetchTransactions={fetchTransactions}
      />
    </div>
  );
};

export default ProcessTable;
