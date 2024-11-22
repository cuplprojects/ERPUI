import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Button, message, Modal, Card } from "antd";
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

const DispatchPage = ({ projectId, processId, lotNo, fetchTransactions }) => {
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
        .filter(process => process.id !== 10)
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
    } catch (error) {
      console.error("Error fetching project processes:", error);
    }
  };

  const checkPreviousProcessStatus = async () => {
    try {
      const { processes } = await getProcessPercentages(projectId);
      const filteredProcesses = processes.filter(process => process.processId !== 10);
      setProcessPercentages(filteredProcesses);
    } catch (error) {
      console.error("Error checking process status:", error);
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
    } catch (error) {
      console.error("Error fetching dispatch data:", error);
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

  const handleCloseModal = async (success = false) => {
    setDispatchModalVisible(false);
    if (success) {
      await fetchDispatchData();
      message.success(t("dispatchCreatedSuccess"));
    }
  };

  const showConfirmModal = (dispatch) => {
    const allProcessesComplete = processPercentages.find(process => 
      process.lots.find(lot => lot.lotNumber === dispatch.lotNo)
    )?.lots.find(lot => 
      lot.lotNumber === dispatch.lotNo
    )?.percentage === 100;

    if (!allProcessesComplete) {
      message.error(t("cannotCompleteDispatchAllProcessesIncomplete"));
      return;
    }

    Modal.confirm({
      title: t("confirmStatusUpdate"), 
      content: (
        <div>
          <p>{t("confirmDispatchComplete")}</p>
          <table className="table table-borderless table-sm">
            <tbody>
              <tr>
                <th>{t("messengerName")}:</th>
                <td>{dispatch.messengerName}</td>
              </tr>
              {dispatch.driverName && (
                <tr>
                  <th>{t("driverName")}:</th>
                  <td>{dispatch.driverName}</td>
                </tr>
              )}
              <tr>
                <th>{t("lotNo")}:</th>
                <td>{dispatch.lotNo}</td>
              </tr>
              <tr>
                <th>{t("projectId")}:</th>
                <td>{dispatch.projectId}</td>
              </tr>
              <tr>
                <th>{t("dispatchId")}:</th>
                <td>{dispatch.id}</td>
              </tr>
              <tr>
                <th>{t("boxCount")}:</th>
                <td>{dispatch.boxCount}</td>
              </tr>
            </tbody>
          </table>
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
      message.success(t("statusUpdateSuccess"));
      fetchDispatchData();
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(t("statusUpdateFailed"));
    }
  };

  const showProcessDetailsModal = (dispatch) => {
    setSelectedDispatch(dispatch);
    setProcessDetailsModalVisible(true);
  };

  return (
    <Row className="mt-4 mb-4 justify-content-center">
      <Col xs={12} className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className={`${customDarkText}`}>{t("dispatchDetails")}</h4>
          {dispatchData.length === 0 && (
            <Button type="primary" onClick={handleDispatchForm}>
              {t("createDispatch")}
            </Button>
          )}
        </div>
      </Col>

      {dispatchData.length > 0 ? (
        dispatchData.map((dispatch) => (
          <Col xs={12} md={6} key={dispatch.id}>
            <Card className={`mb-3 ${customLight}`} bordered>
              <div className="d-flex justify-content-end">
                <FaInfoCircle className="text-primary" size={20} title={t("processDetails")} onClick={() => showProcessDetailsModal(dispatch)} />
              </div>
              <table className="table table-borderless m-0 table-bordered table-striped">
                <tbody>
                  <tr>
                    <th width="40%">{t("dispatchId")}</th>
                    <td>{dispatch.id}</td>
                  </tr>
                  <tr>
                    <th>{t("boxCount")}</th>
                    <td>{dispatch.boxCount}</td>
                  </tr>
                  <tr>
                    <th>{t("messenger")}</th>
                    <td>{dispatch.messengerName}</td>
                  </tr>
                  <tr>
                    <th>{t("messengerMobile")}</th>
                    <td>{dispatch.messengerMobile}</td>
                  </tr>
                  <tr>
                    <th>{t("dispatchMode")}</th>
                    <td>{dispatch.dispatchMode}</td>
                  </tr>
                  <tr>
                    <th>{t("vehicleNumber")}</th>
                    <td>{dispatch.vehicleNumber || '-'}</td>
                  </tr>
                  <tr>
                    <th>{t("driver")}</th>
                    <td>{dispatch.driverName || '-'}</td>
                  </tr>
                  <tr>
                    <th>{t("driverMobile")}</th>
                    <td>{dispatch.driverMobile || '-'}</td>
                  </tr>
                  <tr>
                    <th>{t("status")}</th>
                    <td>
                      <span className={`badge ${dispatch.status ? 'bg-success' : 'bg-danger'} px-3 pt-2`}>
                        {dispatch.status ? t("completed") : t("pending")}
                      </span>
                    </td>
                  </tr>
                  {!dispatch.status && processPercentages.some(process => 
                    process.lots.some(lot => 
                      lot.lotNumber === lotNo && lot.percentage === 100
                    )
                  ) && (
                    <tr>
                      <th>{t("actions")}</th>
                      <td>
                        <Button 
                          type="primary"
                          size="small"
                          onClick={() => showConfirmModal(dispatch)}
                        >
                          {t("markAsComplete")}
                        </Button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

      <Modal
        title={t("processDetails")}
        open={processDetailsModalVisible}
        footer={null}
        onCancel={() => setProcessDetailsModalVisible(false)}
      >
        <div>
          <div className="d-flex justify-content-around fw-bold">
            <p>{t("lotNo")} {selectedDispatch?.lotNo}</p>
            <p>{t("projectId")} {selectedDispatch?.projectId}</p>
          </div>
          <table className="table table-bordered table-sm">
            <thead>
              <tr>
                <th className="text-center">{t("processId")}</th>
                <th className="text-center">{t("processName")}</th>
                <th className="text-center">{t("percentage")}</th>
              </tr>
            </thead>
            <tbody>
              {selectedDispatch?.processes?.map(process => (
                <tr key={process.processId}>
                  <td className="text-center">{process.processId}</td>
                  <td className="ps-3">{process.name}</td>
                  <td className="text-center">{process.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </Row>
  );
};

export default DispatchPage;
