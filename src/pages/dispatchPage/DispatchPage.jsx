// import React, { useState, useEffect } from "react";
// import { Row, Col } from "react-bootstrap";
// import { Button, message, Modal, Card } from "antd";
// import {
//   getAllDispatches,
//   updateDispatch
// } from "../../CustomHooks/ApiServices/dispatchService";
// import DispatchFormModal from "../../menus/DispatchFormModal";
// import { useStore } from 'zustand';
// import themeStore from '../../store/themeStore';
// import { useTranslation } from 'react-i18next';
// import { getProcessPercentages } from "../../CustomHooks/ApiServices/transacationService";
// import { FaInfoCircle } from 'react-icons/fa';
// import API from "../../CustomHooks/MasterApiHooks/api";

// const DispatchPage = ({ projectId, processId, lotNo, fetchTransactions }) => {
//   const { t } = useTranslation();
//   const { getCssClasses } = useStore(themeStore);
//   const cssClasses = getCssClasses();
//   const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

//   const [dispatchData, setDispatchData] = useState([]);
//   const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
//   const [previousProcessStatus, setPreviousProcessStatus] = useState(false);
//   const [processDetailsModalVisible, setProcessDetailsModalVisible] = useState(false);
//   const [selectedDispatch, setSelectedDispatch] = useState(null);
//   const [processPercentages, setProcessPercentages] = useState([]);
//   const [projectProcesses, setProjectProcesses] = useState([]);

//   const fetchProjectProcesses = async () => {
//     try {
//       const response = await API.get(`/Processes`);
//       const mappedProcesses = response.data
//         .filter(process => process.id !== 14)
//         .map(process => ({
//           id: process.id,
//           name: process.name,
//           weightage: process.weightage,
//           status: process.status,
//           installedFeatures: process.installedFeatures,
//           featureNames: process.featureNames,
//           processType: process.processType,
//           rangeStart: process.rangeStart,
//           rangeEnd: process.rangeEnd
//         }));
//       setProjectProcesses(mappedProcesses);
//     } catch (err) {
//       console.error("Error fetching project processes:", err);
//     }
//   };

//   const checkPreviousProcessStatus = async () => {
//     try {
//       const { processes } = await getProcessPercentages(projectId);
//       const filteredProcesses = processes.filter(process => process.processId !== 14);
//       setProcessPercentages(filteredProcesses);
//     } catch (err) {
//       console.error("Error checking process status:", err);
//       setPreviousProcessStatus(false);
//     }
//   };

//   const fetchDispatchData = async () => {
//     try {
//       const response = await getAllDispatches(projectId, lotNo);
//       const mappedDispatchData = response.map(dispatch => ({
//         ...dispatch,
//         processes: processPercentages.map(process => {
//           const lotData = process.lots.find(lot => lot.lotNumber === dispatch.lotNo);
//           const projectProcess = projectProcesses.find(pp => pp.id === process.processId);
//           return {
//             processId: process.processId,
//             percentage: lotData?.percentage || 0,
//             sequence: projectProcess?.sequence,
//             weightage: projectProcess?.weightage,
//             name: projectProcess?.name
//           };
//         }).sort((a, b) => a.sequence - b.sequence)
//       }));
//       setDispatchData(mappedDispatchData);
//     } catch (error) {
//       console.error("Error fetching dispatch data:", error);
//     }
//   };

//   useEffect(() => {
//     if (projectId && processId && lotNo) {
//       checkPreviousProcessStatus();
//       fetchProjectProcesses();
//     }
//   }, [projectId, processId, lotNo]);

//   useEffect(() => {
//     if (processPercentages.length > 0 && projectProcesses.length > 0) {
//       fetchDispatchData();
//     }
//   }, [processPercentages, projectProcesses]);

//   const handleDispatchForm = () => {
//     setDispatchModalVisible(true);
//   };

//   const handleCloseModal = async (success = false) => {
//     setDispatchModalVisible(false);
//     if (success) {
//       await fetchDispatchData();
//       success(t("dispatchCreatedSuccess"));
//     }
//   };

//   const showConfirmModal = (dispatch) => {
//     const allProcessesComplete = processPercentages.every(process => {
//       const lotData = process.lots.find(lot => lot.lotNumber === dispatch.lotNo);
//       return lotData?.percentage === 100;
//     });

//     if (!allProcessesComplete) {
//       error(t("cannotCompleteDispatchAllProcessesIncomplete"));
//       return;
//     }

//     Modal.confirm({
//       title: t("confirmStatusUpdate"),
//       content: (
//         <div>
//           <p>{t("confirmDispatchComplete")}</p>
//           <table className="table table-borderless table-sm">
//             <tbody>
//               <tr>
//                 <th>{t("messengerName")}:</th>
//                 <td>{dispatch.messengerName}</td>
//               </tr>
//               {dispatch.driverName && (
//                 <tr>
//                   <th>{t("driverName")}:</th>
//                   <td>{dispatch.driverName}</td>
//                 </tr>
//               )}
//               <tr>
//                 <th>{t("lotNo")}:</th>
//                 <td>{dispatch.lotNo}</td>
//               </tr>
//               <tr>
//                 <th>{t("projectId")}:</th>
//                 <td>{dispatch.projectId}</td>
//               </tr>
//               <tr>
//                 <th>{t("dispatchId")}:</th>
//                 <td>{dispatch.id}</td>
//               </tr>
//               <tr>
//                 <th>{t("boxCount")}:</th>
//                 <td>{dispatch.boxCount}</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       ),
//       okText: t("yesComplete"),
//       cancelText: t("cancel"),
//       onOk: () => handleStatusUpdate(dispatch),
//     });
//   };

//   const handleStatusUpdate = async (dispatch) => {
//     try {
//       await updateDispatch(dispatch.id, {
//         ...dispatch,
//         status: true,
//         completedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString(),
//         updatedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString()
//       });
//       success(t("statusUpdateSuccess"));
//       fetchDispatchData();
//     } catch (error) {
//       console.error("Error updating status:", error);
//       error(t("statusUpdateFailed"));
//     }
//   };

//   const showProcessDetailsModal = (dispatch) => {
//     setSelectedDispatch(dispatch);
//     setProcessDetailsModalVisible(true);
//   };

//   return (
//     <Row className="mt-4 mb-4 justify-content-center">
//       <Col xs={12} className="mb-3">
//         <div className="d-flex justify-content-between align-items-center">
//           <h4 className={`${customDarkText}`}>{t("dispatchDetails")}</h4>
//           {dispatchData.length === 0 && (
//             <Button type="primary" onClick={handleDispatchForm}>
//               {t("createDispatch")}
//             </Button>
//           )}
//         </div>
//       </Col>

//       {dispatchData.length > 0 ? (
//         dispatchData.map((dispatch) => (
//           <Col xs={12} md={6} key={dispatch.id}>
//             <Card className={`mb-3 ${customLight}`} bordered>
//               <div className="d-flex justify-content-end">
//                 <FaInfoCircle className="text-primary" size={20} title={t("processDetails")} onClick={() => showProcessDetailsModal(dispatch)} />
//               </div>
//               <div className="table-responsive">
//                 <table className="table table-borderless m-0 table-bordered table-striped">
//                   <tbody>
//                     <tr>
//                       <th width="50%">{t("dispatchId")}</th>
//                       <td>{dispatch.id}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("boxCount")}</th>
//                       <td>{dispatch.boxCount}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("messenger")}</th>
//                       <td>{dispatch.messengerName}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("messengerMobile")}</th>
//                       <td>{dispatch.messengerMobile}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("dispatchMode")}</th>
//                       <td>{dispatch.dispatchMode}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("vehicleNumber")}</th>
//                       <td>{dispatch.vehicleNumber || '-'}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("driver")}</th>
//                       <td>{dispatch.driverName || '-'}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("driverMobile")}</th>
//                       <td>{dispatch.driverMobile || '-'}</td>
//                     </tr>
//                     <tr>
//                       <th>{t("status")}</th>
//                       <td>
//                         <span className={`badge ${dispatch.status ? 'bg-success' : 'bg-danger'} px-3 pt-2`}>
//                           {dispatch.status ? t("completed") : t("pending")}
//                         </span>
//                       </td>
//                     </tr>
//                     {!dispatch.status && processPercentages.every(process =>
//                       process.lots.find(lot =>
//                         lot.lotNumber === dispatch.lotNo
//                       )?.percentage === 100
//                     ) && (
//                         <tr>
//                           <th>{t("actions")}</th>
//                           <td>
//                             <Button
//                               type="primary"
//                               size="small"
//                               onClick={() => showConfirmModal(dispatch)}
//                             >
//                               {t("markAsComplete")}
//                             </Button>
//                           </td>
//                         </tr>
//                       )}
//                   </tbody>
//                 </table>
//               </div>
//             </Card>
//           </Col>
//         ))
//       ) : (
//         <Col xs={12} md={6}>
//           <Card className={customLight}>
//             <div className={`text-center p-3 ${customDarkText} fs-4 fw-bold`}>
//               {t("noDispatchData")}
//             </div>
//           </Card>
//         </Col>
//       )}

//       <DispatchFormModal
//         show={dispatchModalVisible}
//         handleClose={handleCloseModal}
//         processId={processId}
//         projectId={projectId}
//         lotNo={lotNo}
//         fetchDispatchData={fetchDispatchData}
//       />

//       <Modal
//         title={t("processDetails")}
//         open={processDetailsModalVisible}
//         footer={null}
//         onCancel={() => setProcessDetailsModalVisible(false)}
//       >
//         <div>
//           <div className="d-flex justify-content-around fw-bold">
//             <p>{t("lotNo")} {selectedDispatch?.lotNo}</p>
//             <p>{t("projectId")} {selectedDispatch?.projectId}</p>
//           </div>
//           <table className="table table-bordered table-sm">
//             <thead>
//               <tr>
//                 <th className="text-center">{t("processId")}</th>
//                 <th className="text-center">{t("processName")}</th>
//                 <th className="text-center">{t("percentage")}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {selectedDispatch?.processes?.map(process => (
//                 <tr key={process.processId}>
//                   <td className="text-center">{process.processId}</td>
//                   <td className="ps-3">{process.name}</td>
//                   <td className="text-center">{process.percentage}%</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </Modal>
//     </Row>
//   );
// };

// export default DispatchPage;

//================================================================================================================================

import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Button, message, Card, Table, Modal } from "antd";
import { Modal as BootstrapModal, Button as Btn } from 'react-bootstrap';
import { IoClose } from "react-icons/io5";
import {
  getAllDispatches,
  updateDispatch
} from "../../CustomHooks/ApiServices/dispatchService";
import DispatchFormModal from "../../menus/DispatchFormModal";
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import { useTranslation } from 'react-i18next';
import { getProcessPercentages } from "../../CustomHooks/ApiServices/transacationService";
import { FaInfoCircle } from 'react-icons/fa';
import API from "../../CustomHooks/MasterApiHooks/api";
import { error, success } from "../../CustomHooks/Services/AlertMessageService";

const DispatchPage = ({ projectId, processId, lotNo, fetchTransactions , projectName}) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const [dispatchData, setDispatchData] = useState([]);
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [previousProcessStatus, setPreviousProcessStatus] = useState(false);
  const [processDetailsModalVisible, setProcessDetailsModalVisible] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);
  const [processPercentages, setProcessPercentages] = useState([]);
  const [projectProcesses, setProjectProcesses] = useState([]);

  const fetchProjectProcesses = async () => {
    try {
      const response = await API.get(`/Processes`);
      const mappedProcesses = response.data
        .filter(process => process.id !== 14)
        .map(process => ({
          id: process.id,
          name: process.name,
          weightage: process.weightage,
          status: process.status,
          installedFeatures: process.installedFeatures,
          featureNames: process.featureNames,
          processType: process.processType,
          rangeStart: process.rangeStart,
          rangeEnd: process.rangeEnd
        }));
      setProjectProcesses(mappedProcesses);
    } catch (err) {
      console.error("Error fetching project processes:", err);
    }
  };

  const checkPreviousProcessStatus = async () => {
    try {
      const { processes } = await getProcessPercentages(projectId);
      const filteredProcesses = processes.filter(process => process.processId !== 14);
      setProcessPercentages(filteredProcesses);
    } catch (err) {
      console.error("Error checking process status:", err);
      setPreviousProcessStatus(false);
    }
  };

  const fetchDispatchData = async () => {
    try {
      const response = await getAllDispatches(projectId, lotNo);
      const mappedDispatchData = response.map(dispatch => ({
        ...dispatch,
        processes: processPercentages.map(process => {
          const lotData = process.lots.find(lot => lot.lotNumber === dispatch.lotNo);
          const projectProcess = projectProcesses.find(pp => pp.id === process.processId);
          return {
            processId: process.processId,
            percentage: lotData?.percentage || 0,
            sequence: projectProcess?.sequence,
            weightage: projectProcess?.weightage,
            name: projectProcess?.name
          };
        }).sort((a, b) => a.sequence - b.sequence)
      }));
      setDispatchData(mappedDispatchData);
    } catch (err) {
      console.error("Error fetching dispatch data:", err);
    }
  };

  useEffect(() => {
    if (projectId && processId && lotNo) {
      checkPreviousProcessStatus();
      fetchProjectProcesses();
    }
  }, [projectId, processId, lotNo]);

  useEffect(() => {
    if (processPercentages.length > 0 && projectProcesses.length > 0) {
      fetchDispatchData();
    }
  }, [processPercentages, projectProcesses]);

  const handleDispatchForm = () => {
    setDispatchModalVisible(true);
  };

  const handleCloseModal = async (successs = false) => {
    setDispatchModalVisible(false);
    if (successs) {
      await fetchDispatchData();
      success(t("dispatchCreatedSuccess"));
    }
  };

  const showConfirmModal = (dispatch) => {
    const allProcessesComplete = processPercentages.every(process => {
      const lotData = process.lots.find(lot => lot.lotNumber === dispatch.lotNo);
      return lotData?.percentage === 100;
    });

    if (!allProcessesComplete) {
      error(t("cannotCompleteDispatchAllProcessesIncomplete"));
      return;
    }

    Modal.confirm({
      title: t("confirmStatusUpdate"),
      content: (
        <div>
          <p>{t("confirmDispatchComplete")}</p>
          <Table
            dataSource={[
              { label: t("messengerName"), value: dispatch.messengerName },
              { label: t("driverName"), value: dispatch.driverName },
              { label: t("lotNo"), value: dispatch.lotNo },
              { label: t("projectId"), value: dispatch.projectId },
              { label: t("dispatchId"), value: dispatch.id },
              { label: t("boxCount"), value: dispatch.boxCount }
            ]}
            columns={[
              { title: t("field"), dataIndex: "label", key: "label" },
              { title: t("value"), dataIndex: "value", key: "value" }
            ]}
            pagination={false}
            bordered
            size="small"
          />
        </div>
      ),
      okText: t("yesComplete"),
      cancelText: t("cancel"),
      onOk: () => handleStatusUpdate(dispatch),
    });
  };

  const handleStatusUpdate = async (dispatch) => {
    try {
      await updateDispatch(dispatch.id, {
        ...dispatch,
        status: true,
        completedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString(),
        updatedAt: new Date(new Date().getTime() + (5.5 * 60 * 60 * 1000)).toISOString()
      });
      success(t("statusUpdateSuccess"));
      fetchDispatchData();
    } catch (err) {
      console.error("Error updating status:", err);
      error(t("statusUpdateFailed"));
    }
  };

  const showProcessDetailsModal = (dispatch) => {
    setSelectedDispatch(dispatch);
    setProcessDetailsModalVisible(true);
  };

  const dispatchTableColumns = [
    { title: t("processId"), dataIndex: "processId", key: "processId", align: "center" },
    { title: t("processName"), dataIndex: "name", key: "name" },
    { title: t("percentage"), dataIndex: "percentage", key: "percentage", align: "center" }
  ];

  return (
    <Row className="mt-4 mb-4 justify-content-center">
      <Col xs={12} className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className={`${customDarkText}`}>{t("dispatchDetails")}</h4>
          {dispatchData.length === 0 && (
            <Button type="primary" className={`${customDark} text-white ${customDark==='dark-dark'? "border":""}`} onClick={handleDispatchForm}>
              {t("createDispatch")}
            </Button>
          )}
        </div>
      </Col>

      {dispatchData.length > 0 ? (
        dispatchData.map((dispatch) => (
          <Col xs={12} md={12} lg={8} key={dispatch.id} className="">
            <Card className={`mb-3 ${customLight} shadow-lg`} bordered={false}>
              <div className="d-flex justify-content-end">
                <FaInfoCircle className="text-primary" size={20} title={t("processDetails")} onClick={() => showProcessDetailsModal(dispatch)} />
              </div>
              <Table
                // style={{minWidth:'600px'}}
                className={`${customDark === "default-dark" ? "thead-default" : ""}
               ${customDark === "red-dark" ? "thead-red" : ""}
               ${customDark === "green-dark" ? "thead-green" : ""}
               ${customDark === "blue-dark" ? "thead-blue" : ""}
               ${customDark === "dark-dark" ? "thead-dark" : ""}
               ${customDark === "pink-dark" ? "thead-pink" : ""}
               ${customDark === "purple-dark" ? "thead-purple" : ""}
               ${customDark === "light-dark" ? "thead-light" : ""}
               ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination shadow-lg`}
                dataSource={[
                  { label: t("dispatchId"), value: dispatch.id },
                  { label: t("boxCount"), value: dispatch.boxCount },
                  { label: t("messenger"), value: dispatch.messengerName },
                  { label: t("messengerMobile"), value: dispatch.messengerMobile },
                  { label: t("dispatchMode"), value: dispatch.dispatchMode },
                  { label: t("vehicleNumber"), value: dispatch.vehicleNumber || '-' },
                  { label: t("driver"), value: dispatch.driverName || '-' },
                  { label: t("driverMobile"), value: dispatch.driverMobile || '-' },
                  { label: t("status"), value: dispatch.status ? t("completed") : t("pending") }
                ]}
                columns={[
                  { title: t("field"), dataIndex: "label", key: "label" },
                  { title: t("value"), dataIndex: "value", key: "value" }
                ]}
                pagination={false}
                bordered
                size="small"
              />
              {!dispatch.status && processPercentages.every(process =>
                process.lots.find(lot =>
                  lot.lotNumber === dispatch.lotNo
                )?.percentage === 100
              ) && (
                  <div className="text-center mt-3">
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => showConfirmModal(dispatch)}
                    >
                      {t("markAsComplete")}
                    </Button>
                  </div>
                )}
            </Card>
          </Col>
        ))
      ) : (
        <Col xs={12} md={6}>
          <Card className={customLight}>
            <div className={`text-center p-3 ${customDarkText} fs-4 fw-bold`}>
              {t("noDispatchData")}
            </div>
          </Card>
        </Col>
      )}

      <DispatchFormModal
        show={dispatchModalVisible}
        handleClose={handleCloseModal}
        processId={processId}
        projectId={projectId}
        lotNo={lotNo}
        fetchDispatchData={fetchDispatchData}
      />

      <BootstrapModal
        show={processDetailsModalVisible}
        onHide={() => setProcessDetailsModalVisible(false)}
        size="lg" // You can adjust the size as needed
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className=""
      >
        <BootstrapModal.Header className={`d-flex justify-content-between align-items-center ${customDark} ${customLightText} `}>
          <BootstrapModal.Title id="contained-modal-title-vcenter">
            {t("processDetails")}
          </BootstrapModal.Title>
          <Btn
            variant="link" // Use 'link' variant for a cleaner look
            className={customLightText} // Apply your custom class
            onClick={() => setProcessDetailsModalVisible(false)} // Close the modal
          >
            <IoClose size={30}/>
          </Btn>
        </BootstrapModal.Header>
        <BootstrapModal.Body class={`${customLight} p-3`}>
          <div>
            <div className={`d-flex justify-content-around fw-bold ${customDarkText}`}>
              <p>{t("lotNo")} - {selectedDispatch?.lotNo}</p>
              {/* <p>{t("projectId")} {selectedDispatch?.projectId}</p> */}
              <p>{t("projectName")} - {projectName}</p>
            </div>
            <Table
              dataSource={selectedDispatch?.processes || []}
              columns={dispatchTableColumns}
              pagination={false}
              bordered
              size="small"
              className={`${customDark === "default-dark" ? "thead-default" : ""}
                     ${customDark === "red-dark" ? "thead-red" : ""}
                     ${customDark === "green-dark" ? "thead-green" : ""}
                     ${customDark === "blue-dark" ? "thead-blue" : ""}
                     ${customDark === "dark-dark" ? "thead-dark" : ""}
                     ${customDark === "pink-dark" ? "thead-pink" : ""}
                     ${customDark === "purple-dark" ? "thead-purple" : ""}
                     ${customDark === "light-dark" ? "thead-light" : ""}
                     ${customDark === "brown-dark" ? "thead-brown" : ""} custom-pagination shadow-lg`}
            />
          </div>
        </BootstrapModal.Body>
      </BootstrapModal>
    </Row>
  );
};

export default DispatchPage;

