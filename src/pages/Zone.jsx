import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Select, Input, Space, Button, Typography, Row, Col, Checkbox, Form, Dropdown, Menu, message, Switch } from 'antd';
import { Card, Modal } from 'react-bootstrap';
import { EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined, SettingOutlined, SearchOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseSquare } from 'react-icons/ai';
import { BsFunnelFill } from "react-icons/bs";
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const { Option } = Select;
const { Title } = Typography;

const Zone = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;

  const [zones, setZones] = useState([]);
  const [camera, setCamera] = useState([]);
  const [machine, setMachine] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingZone, setEditingZone] = useState({});
  const [originalZone, setOriginalZone] = useState({});

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [sortedInfo, setSortedInfo] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({
    zoneNo: true,
    zoneDescription: true,
    cameraNames: true,
    machineNames: true,
  });
  const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const getZone = useCallback(async () => {
    try {
      const response = await API.get('/Zones');
      setZones(response.data);
    } catch (error) {
      console.error("Failed to fetch zones", error);
      message.error(t('failedToFetchZones'));
    }
  }, [t]);

  const getCamera = useCallback(async () => {
    try {
      const response = await API.get('/Cameras');
      setCamera(response.data);
    } catch (error) {
      console.error("Failed to fetch cameras", error);
      message.error(t('failedToFetchCameras'));
    }
  }, [t]);

  const getMachine = useCallback(async () => {
    try {
      const response = await API.get('/Machines');
      setMachine(response.data);
    } catch (error) {
      console.error("Failed to fetch machines", error);
      message.error(t('failedToFetchMachines'));
    }
  }, [t]);

  useEffect(() => {
    getZone();
    getCamera();
    getMachine();
  }, [getZone, getCamera, getMachine]);

  const handleAddZone = useCallback(async (values) => {
    const { zoneNo, zoneDescription, cameraIds, machineId } = values;
    const existingZone = zones.find(zone => zone.zoneNo === zoneNo);
    if (existingZone) {
      message.error(t('zoneNameExists'));
      return;
    }

    const assignedCameras = zones.flatMap(zone => zone.cameraIds);
    const alreadyAssignedCameras = cameraIds.filter(id => assignedCameras.includes(id));
    if (alreadyAssignedCameras.length > 0) {
      const cameraNames = alreadyAssignedCameras.map(id => camera.find(c => c.cameraId === id)?.name).join(', ');
      message.error(t('camerasAlreadyAssigned', { cameraNames }));
      return;
    }

    const newZone = {
      zoneNo,
      zoneDescription,
      cameraIds: Array.isArray(cameraIds) ? cameraIds : [cameraIds],
      machineId: Array.isArray(machineId) ? machineId : [machineId],
    };

    try {
      await API.post('/Zones', newZone);
      getZone();
      form.resetFields();
      setIsModalVisible(false);
      message.success(t('zoneAddedSuccessfully'));
    } catch (error) {
      console.error("Failed to add zone", error);
      message.error(t('errorAddingZone'));
    }
  }, [zones, camera, form, getZone, t]);

  const handleEditZone = useCallback(async (index) => {
    const updatedZone = {
      ...originalZone,
      ...editingZone,
      cameraIds: editingZone.cameraIds || originalZone.cameraIds,
      machineId: editingZone.machineId || originalZone.machineId,
    };

    const existingZone = zones.find(zone => zone.zoneNo === updatedZone.zoneNo && zone.zoneNo !== originalZone.zoneNo);
    if (existingZone) {
      message.error(t('zoneNameExists'));
      return;
    }

    const assignedCameras = zones.flatMap(zone => zone.zoneId !== updatedZone.zoneId ? zone.cameraIds : []);
    const alreadyAssignedCameras = updatedZone.cameraIds.filter(id => assignedCameras.includes(id));
    if (alreadyAssignedCameras.length > 0) {
      const cameraNames = alreadyAssignedCameras.map(id => camera.find(c => c.cameraId === id)?.name).join(', ');
      message.error(t('camerasAlreadyAssigned', { cameraNames }));
      return;
    }

    try {
      await API.put(`/Zones/${originalZone.zoneId}`, updatedZone);
      getZone();
      message.success(t('zoneUpdatedSuccessfully'));
    } catch (error) {
      console.error("Failed to update zone", error);
      message.error(t('failedToUpdateZone'));
    } finally {
      setEditingIndex(null);
      setEditingZone({});
      setOriginalZone({});
    }
  }, [zones, camera, originalZone, editingZone, getZone, t]);

  const handleTableChange = (pagination, filters, sorter) => {
    setSortedInfo(sorter);
  };

  const handleColumnVisibilityChange = useCallback((e, column) => {
    setVisibleColumns(prev => ({ ...prev, [column]: e.target.checked }));
  }, []);

  const columns = useMemo(() => [
    {
      title: t('sn'),
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: 80,
    },
    visibleColumns.zoneNo && {
      title: t('zoneName'),
      dataIndex: 'zoneNo',
      key: 'zoneNo',
      sorter: (a, b) => a.zoneNo.localeCompare(b.zoneNo),
      sortOrder: sortedInfo.columnKey === 'zoneNo' && sortedInfo.order,
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingZone.zoneNo || record.zoneNo}
            onChange={(e) => setEditingZone({ ...editingZone, zoneNo: e.target.value })}
            onPressEnter={() => handleEditZone(index)}
            onBlur={() => handleEditZone(index)}
          />
        ) : (
          <span>{text}</span>
        )
      ),
      width: 200,
    },
    visibleColumns.zoneDescription && {
      title: t('zoneDescription'),
      dataIndex: 'zoneDescription',
      key: 'zoneDescription',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input.TextArea
            value={editingZone.zoneDescription || record.zoneDescription}
            onChange={(e) => setEditingZone({ ...editingZone, zoneDescription: e.target.value })}
            onPressEnter={() => handleEditZone(index)}
            onBlur={() => handleEditZone(index)}
            style={{ resize: 'none' }}
            rows={1}
          />
        ) : (
          <span>{text}</span>
        )
      ),
      width: 200,
    },
    visibleColumns.cameraNames && {
      title: t('assignCameraNames'),
      dataIndex: 'cameraNames',
      key: 'cameraNames',
      render: (cameraNames, record, index) => (
        editingIndex === index ? (
          <Select
            mode="multiple"
            value={editingZone.cameraIds || record.cameraIds}
            onChange={(value) => setEditingZone({ ...editingZone, cameraIds: value })}
            onBlur={() => handleEditZone(index)}
          >
            {camera.map(c => (
              <Option key={c.cameraId} value={c.cameraId} disabled={zones.some(zone => zone.zoneId !== record.zoneId && zone.cameraIds.includes(c.cameraId))}>
                {c.name}
              </Option>
            ))}
          </Select>
        ) : (
          <span>{cameraNames.join(', ')}</span>
        )
      ),
      width: 200,
    },
    visibleColumns.machineNames && {
      title: t('assignMachineNames'),
      dataIndex: 'machineNames',
      key: 'machineNames',
      render: (machineNames, record, index) => (
        editingIndex === index ? (
          <Select
            mode="multiple"
            value={editingZone.machineId || record.machineId}
            onChange={(value) => setEditingZone({ ...editingZone, machineId: value })}
            onBlur={() => handleEditZone(index)}
          >
            {machine.map(m => (
              <Option key={m.machineId} value={m.machineId}>
                {m.machineName}
              </Option>
            ))}
          </Select>
        ) : (
          <span>{machineNames.join(', ')}</span>
        )
      ),
      width: 200,
    },
    {
      title: t('action'),
      key: 'action',
      render: (_, record, index) => (
        editingIndex === index ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleEditZone(index)}
              type="primary"
              className={customBtn}
            >
              {t('save')}
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                setEditingIndex(null);
                setEditingZone({});
                setOriginalZone({});
              }}
            >
              {t('cancel')}
            </Button>
          </Space>
        ) : (
          <Button
            type="link"
            onClick={() => {
              setEditingIndex(index);
              setEditingZone({ 
                zoneNo: record.zoneNo, 
                zoneDescription: record.zoneDescription,
                cameraIds: record.cameraIds,
                machineId: record.machineId
              });
              setOriginalZone(record);
            }}
            disabled={!hasPermission('2.1.4.3')}
          >
            {t('edit')}
          </Button>
        )
      ),
      width: 150,
    },
  ].filter(Boolean), [visibleColumns, editingIndex, editingZone, handleEditZone, currentPage, pageSize, sortedInfo, camera, machine, zones, customBtn, t]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const filteredZones = zones.filter(zone => 
    zone.zoneNo.toLowerCase().includes(searchText.toLowerCase()) ||
    zone.zoneDescription.toLowerCase().includes(searchText.toLowerCase())
  );

  const columnSettingsMenu = (
    <Menu>
      {Object.entries(visibleColumns).map(([column, isVisible]) => (
        <Menu.Item key={column}>
          <Checkbox
            checked={isVisible}
            onChange={(e) => handleColumnVisibilityChange(e, column)}
          >
            {t(column)}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Card
      className={`${customDark === "dark-dark" ? `${customDark}` : `${customLight}`}`}
      bordered={true}
      style={{ padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: '20px' }}>
        <Title level={3} className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}`}>{t('zoneManagement')}</Title>
        <Col>
          <Space>
            <Input
              placeholder={t('searchZones')}
              suffix={<SearchOutlined />}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Dropdown overlay={columnSettingsMenu} trigger={['click']} visible={columnSettingsVisible} onVisibleChange={setColumnSettingsVisible}>
              <Button icon={<SettingOutlined />} className={`${customDark === "dark-dark" ? "text-dark" : customDarkText} border-0`}>
              </Button>
            </Dropdown>
            <Button onClick={showModal} className={`${customBtn} border-0`}>
              {t('addZone')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={filteredZones}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredZones.length,
          onChange: (page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          },
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
        rowKey="zoneId"
        bordered
        onChange={handleTableChange}
        className={`${customDark === "default-dark" ? "thead-default" : ""}
                    ${customDark === "red-dark" ? "thead-red" : ""}
                    ${customDark === "green-dark" ? "thead-green" : ""}
                    ${customDark === "blue-dark" ? "thead-blue" : ""}
                    ${customDark === "dark-dark" ? "thead-dark" : ""}
                    ${customDark === "pink-dark" ? "thead-pink" : ""}
                    ${customDark === "purple-dark" ? "thead-purple" : ""}
                    ${customDark === "light-dark" ? "thead-light" : ""}
                    ${customDark === "brown-dark" ? "thead-brown" : ""} `}
      />
      <Modal
        show={isModalVisible}
        onHide={handleCancel}
        centered
        className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}  `}
      >
        <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>{t('addZone')}</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={handleCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label="Close"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body className={` ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
          <Form form={form} onFinish={handleAddZone} layout="vertical">
            <Form.Item
              name="zoneNo"
              label={<span className={customDarkText}>{t('zoneName')} <span className="text-danger">*</span></span>}
              rules={[{ required: true, message: t('pleaseEnterZoneName') }]}
            >
              <Input placeholder={t('enterZoneName')} />
            </Form.Item>
            <Form.Item
              name="zoneDescription"
              label={<span className={customDarkText}>{t('zoneDescription')} <span className="text-danger">*</span></span>}
              rules={[{ required: true, message: t('pleaseEnterZoneDescription') }]}
            >
              <Input.TextArea placeholder={t('enterZoneDescription')} />
            </Form.Item>
            <Form.Item
              name="cameraIds"
              label={<span className={customDarkText}>{t('assignCamera')} <span className="text-danger">*</span></span>}
              rules={[{ required: true, message: t('pleaseSelectCamera') }]}
            >
              <Select mode="multiple" placeholder={t('selectCamera')}>
                {camera.map(c => (
                  <Option key={c.cameraId} value={c.cameraId} disabled={zones.some(zone => zone.cameraIds.includes(c.cameraId))}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="machineId"
              label={<span className={customDarkText}>{t('assignMachine')}</span>}
            >
              <Select mode="multiple" placeholder={t('selectMachine')}>
                {machine.map(m => (
                  <Option key={m.machineId} value={m.machineId}>
                    {m.machineName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal.Body>
        <Modal.Footer className={` ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Button variant="secondary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={form.submit}>
            {t('save')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default Zone;
