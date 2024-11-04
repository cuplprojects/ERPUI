import React, { useEffect, useState } from 'react';
import { Input, Button, Select, Table, Form, message, Pagination } from 'antd';
import { Modal } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseSquare } from "react-icons/ai";
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { useTranslation } from 'react-i18next';
import { SortAscendingOutlined, SortDescendingOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const { Option } = Select;
const { Search } = Input;

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
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const canaddzone = hasPermission('2.5.1');
  const caneditzone = hasPermission('2.5.3');

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getCamera(), getMachine()]);
      await getZone();
    };

    fetchData();
  }, []);

  const getZone = async () => {
    try {
      const response = await API.get('/Zones');
      setZones(response.data);
    } catch (error) {
      console.error(t("Failed to fetch zones"), error);
    }
  };

  const getCamera = async () => {
    try {
      const response = await API.get('/Cameras');
      setCamera(response.data);
    } catch (error) {
      console.error(t("Failed to fetch cameras"), error);
    }
  };

  const getMachine = async () => {
    try {
      const response = await API.get('/Machines');
      setMachine(response.data);
    } catch (error) {
      console.error(t("Failed to fetch machines"), error);
    }
  };

  const handleAddZone = async (values) => {
    const { zoneNo, zoneDescription, cameraIds, machineId } = values;
    const existingZone = zones.find(zone => zone.zoneNo === zoneNo);
    if (existingZone) {
      message.error(t('Zone Name already exists!'));
      return;
    }

    const assignedCameras = zones.flatMap(zone => zone.cameraIds);
    const alreadyAssignedCameras = cameraIds.filter(id => assignedCameras.includes(id));
    if (alreadyAssignedCameras.length > 0) {
      const cameraNames = alreadyAssignedCameras.map(id => camera.find(c => c.cameraId === id)?.name).join(', ');
      message.error(t('The following cameras are already assigned to other zones: {{cameraNames}}', { cameraNames }));
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
      message.success(t('Zone added successfully!'));
    } catch (error) {
      console.error(t("Failed to add zone"), error);
      message.error(t('Failed to add zone. Please try again.'));
    }
  };

  const handleEditZone = async (index) => {
    const updatedZone = {
      ...originalZone,
      ...editingZone,
      cameraIds: editingZone.cameraIds || originalZone.cameraIds,
      machineId: editingZone.machineId || originalZone.machineId,
    };

    const existingZone = zones.find(zone => zone.zoneNo === updatedZone.zoneNo && zone.zoneNo !== originalZone.zoneNo);
    if (existingZone) {
      message.error(t('Zone Name already exists!'));
      return;
    }

    const assignedCameras = zones.flatMap(zone => zone.zoneId !== updatedZone.zoneId ? zone.cameraIds : []);
    const alreadyAssignedCameras = updatedZone.cameraIds.filter(id => assignedCameras.includes(id));
    if (alreadyAssignedCameras.length > 0) {
      const cameraNames = alreadyAssignedCameras.map(id => camera.find(c => c.cameraId === id)?.name).join(', ');
      message.error(t('The following cameras are already assigned to other zones: {{cameraNames}}', { cameraNames }));
      return;
    }

    try {
      await API.put(`/Zones/${originalZone.zoneId}`, updatedZone);
      const updatedZones = [...zones];
      updatedZones[index] = updatedZone;
      setZones(updatedZones);
      getZone();
      message.success(t('Zone updated successfully!'));
    } catch (error) {
      console.error(t("Failed to update zone"), error);
      message.error(t('Failed to update zone. Please try again.'));
    } finally {
      setEditingIndex(null);
      setEditingZone({});
      setOriginalZone({});
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingZone({});
    setOriginalZone({});
  };

  const columns = [
    {
      title: t('SN.'),
      key: 'serial',
      render: (text, record, index) => index + 1,
    },
    {
      title: t('Zone Name'),
      dataIndex: 'zoneNo',
      key: 'zoneNo',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingZone.zoneNo || record.zoneNo}
            onChange={(e) => setEditingZone({ ...editingZone, zoneNo: e.target.value })}
            onPressEnter={() => handleEditZone(index)}
          />
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ zoneNo: record.zoneNo });
            setOriginalZone(record);
          }}>{text}</span>
        )
      ),
    },
    {
      title: t('Zone Description'),
      dataIndex: 'zoneDescription',
      key: 'zoneDescription',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input.TextArea
            value={editingZone.zoneDescription || record.zoneDescription}
            onChange={(e) => setEditingZone({ ...editingZone, zoneDescription: e.target.value })}
            onPressEnter={() => handleEditZone(index)}
            style={{ resize: 'none' }}
            rows={1}
            cols={1}
          />
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ zoneDescription: record.zoneDescription });
            setOriginalZone(record);
          }}>{text}</span>
        )
      ),
    },
    {
      title: t('Assign Camera Names'),
      dataIndex: 'cameraNames',
      key: 'cameraNames',
      render: (cameraNames, record, index) => (
        editingIndex === index ? (
          <Select
            mode="multiple"
            value={editingZone.cameraIds || record.cameraIds}
            onChange={(value) => setEditingZone({ ...editingZone, cameraIds: value })}
          >
            {camera.map(cam => (
              <Option key={cam.cameraId} value={cam.cameraId} disabled={zones.some(zone => zone.zoneId !== record.zoneId && zone.cameraIds.includes(cam.cameraId))}>
                {cam.name}
              </Option>
            ))}
          </Select>
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ cameraIds: record.cameraIds });
            setOriginalZone(record);
          }}>{cameraNames.join(', ')}</span>
        )
      ),
    },
    {
      title: t('Assign Machine Names'),
      dataIndex: 'machineNames',
      key: 'machineNames',
      render: (machineNames, record, index) => (
        editingIndex === index ? (
          <Select
            mode="multiple"
            value={editingZone.machineId || record.machineId}
            onChange={(value) => setEditingZone({ ...editingZone, machineId: value })}

          >
            {machine.map(mach => (
              <Option key={mach.machineId} value={mach.machineId}>
                {mach.machineName}
              </Option>
            ))}
          </Select>
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ machineId: record.machineId });
            setOriginalZone(record);
          }}>{machineNames.join(', ')}</span>
        )
      ),
    },
    {
      title: t('actions'),
      key: 'action',
      render: (_, record, index) => (
        editingIndex === index ? (
          <>
            <Button type="link" icon={<SaveOutlined />} onClick={() => handleEditZone(index)} className={`${customBtn} ms-`}>{t('save')}</Button>
            <Button type="link" icon={<CloseOutlined />} onClick={handleCancelEdit} className={`${customBtn} ms-2`}>{t('cancel')}</Button>
          </>
        ) : (
          <Button type="link" disabled={!caneditzone} icon={<EditOutlined />} onClick={() => {
            setEditingIndex(index);
            setEditingZone({ 
              zoneNo: record.zoneNo, 
              zoneDescription: record.zoneDescription,
              cameraIds: record.cameraIds,
              machineId: record.machineId
            });
            setOriginalZone(record);
          }} className={`${customBtn}`}>{t('edit')}</Button>
        )
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const responsiveColumns = isMobile ? columns.slice(0, 2) : isTablet ? columns.slice(0, 4) : columns;

  const filteredZones = zones.filter(zone => 
    zone.zoneNo.toLowerCase().includes(searchText.toLowerCase()) ||
    zone.zoneDescription.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedZones = filteredZones.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', maxWidth: '100%', overflowX: 'auto' }} className={`${customDark === "dark-dark" ? `${customDark}` : ""}`}>
      <h2 style={{ marginBottom: '20px', fontSize: isMobile ? '1.5rem' : '2rem' }} className={`${customDarkText}`}>{t('Zone Management')}</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Search
          placeholder={t("Search zones")}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />

        {canaddzone && (
          <Button onClick={showModal} className={`${customBtn}`}>
            {t('Add Zone')}
          </Button>
        )}
      </div>

      <Table
        dataSource={paginatedZones.map((zone, index) => ({ ...zone, key: index }))}
        columns={responsiveColumns}
        pagination={false}
        bordered
        style={{ marginTop: '20px', background: 'white' }}
        scroll={{ x: 'max-content' }}
        className={`${customDark === "default-dark" ? "thead-default" : ""}
                    ${customDark === "red-dark" ? "thead-red" : ""}
                    ${customDark === "green-dark" ? "thead-green" : ""}
                    ${customDark === "blue-dark" ? "thead-blue" : ""}
                    ${customDark === "dark-dark" ? "thead-dark" : ""}
                    ${customDark === "pink-dark" ? "thead-pink" : ""}
                    ${customDark === "purple-dark" ? "thead-purple" : ""}
                    ${customDark === "light-dark" ? "thead-light" : ""}
                    ${customDark === "brown-dark" ? "thead-brown" : ""} rounded-2`}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', background: 'white', padding: '10px' }} className='rounded-2 rounded-top-0'>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredZones.length}
          onChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize);
          }}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => t('{{start}}-{{end}} of {{total}} items', { start: range[0], end: range[1], total })}
        />
      </div>

      <Modal
        show={isModalVisible}
        onHide={handleCancel}
        centered
        size={isMobile ? "sm" : "lg"}
        className={`rounded-2 ${customDark === "" ? `${customDark}` : ''}  `}
      >
        <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>{t('Add Zone')}</Modal.Title>
          <AiFillCloseSquare
            size={35}
            onClick={handleCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label="Close"
            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
          />
        </Modal.Header>
        <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
          <Form form={form} onFinish={handleAddZone} layout="vertical">
            <Form.Item 
              name="zoneNo" 
              label={<span className={customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}>{t('Zone Name')} <span className="text-danger">*</span></span>}
            >
              <Input placeholder={t("Zone Name")} required />
            </Form.Item>
            <Form.Item 
              name="zoneDescription"
              label={<span className={customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}>{t('Zone Description')} <span className="text-danger">*</span></span>}
            >
              <Input.TextArea placeholder={t("Zone Description")} required />
            </Form.Item>
            <Form.Item 
              name="cameraIds"
              label={<span className={customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}>{t('Assign Camera')} <span className="text-danger">*</span></span>}
            >
              <Select mode="multiple" placeholder={t("Select Camera")} required>
                {camera.map(c => (
                  <Option key={c.cameraId} value={c.cameraId} disabled={zones.some(zone => zone.cameraIds.includes(c.cameraId))}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item 
              name="machineId" 
              label={<span className={customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}>{t('Assign Machine')}</span>}
            >
              <Select mode="multiple" placeholder={t("Select Machine")}>
                {machine.map(m => (
                  <Option key={m.machineId} value={m.machineId}>
                    {m.machineName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button htmlType="submit" className={`${customBtn}`}>
                {t('Add Zone')} 
              </Button>
            </Form.Item>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Zone;
