import React, { useState, useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { Button, message, Modal, Card } from "antd";
import {
  getAllDispatches,
  updateDispatch,
} from "../../CustomHooks/ApiServices/dispatchService";
import DispatchFormModal from "../../menus/DispatchFormModal";
import { useStore } from 'zustand';
import themeStore from '../../store/themeStore';
import { useTranslation } from 'react-i18next';

const DispatchPage = ({ projectId, processId, lotNo, fetchTransactions }) => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const [dispatchData, setDispatchData] = useState([]);
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [previousProcessStatus, setPreviousProcessStatus] = useState(true);

  const fetchDispatchData = async () => {
    try {
      const response = await getAllDispatches(projectId, lotNo);
      setDispatchData(response);
    } catch (error) {
      console.error("Error fetching dispatch data:", error);
    }
  };

  useEffect(() => {
    if (projectId && processId && lotNo) {
      fetchDispatchData();
    }
  }, [projectId, processId, lotNo]);

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
        status: true
      });
      message.success(t("statusUpdateSuccess"));
      fetchDispatchData();
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(t("statusUpdateFailed"));
    }
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
                  {!dispatch.status && previousProcessStatus && (
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
            <div className={`text-center p-3 ${customDarkText}`}>
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
    </Row>
  );
};

export default DispatchPage;
