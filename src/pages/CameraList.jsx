import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Form, Card, Row, Col, message, Pagination, Spin } from 'antd';
import { Modal } from 'react-bootstrap';
import API from '../CustomHooks/MasterApiHooks/api';
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseSquare } from "react-icons/ai";
import { SortAscendingOutlined, SortDescendingOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const CameraList = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('ascend');
  const [sortField, setSortField] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const getCameras = async () => {
    setLoading(true);
    try {
      const response = await API.get('/Cameras');
      setCameras(response.data);
    } catch (error) {
      console.error('Failed to fetch cameras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCameras();
  }, []);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      const newCamera = { name: values.name };
      try {
        const response = await API.post('/Cameras', newCamera);
        setCameras([...cameras, response.data]);
        form.resetFields();
        setIsModalOpen(false);
        message.success(t('Camera added successfully!'));
      } catch (error) {
        message.error(t('Error adding camera'));
      }
    });
  };

  const handleEditSave = async (index) => {
    const updatedCamera = {
      ...cameras[index],
      name: editingName,
    };

    try {
      await API.put(`/Cameras/${updatedCamera.cameraId}`, updatedCamera);
      const updatedCameras = [...cameras];
      updatedCameras[index] = updatedCamera;
      setCameras(updatedCameras);
      setEditingIndex(null);
      setEditingName('');
      message.success(t('Camera updated successfully!'));
    } catch (error) {
      message.error(t('Failed to update camera'));
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleSort = (field) => {
    const newSortOrder = field === sortField && sortOrder === 'ascend' ? 'descend' : 'ascend';
    setSortOrder(newSortOrder);
    setSortField(field);

    const sortedCameras = [...cameras].sort((a, b) => {
      if (field === 'name') {
        return newSortOrder === 'ascend'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });

    setCameras(sortedCameras);
  };

  const columns = [
    {
      title: t('SN.'),
      dataIndex: 'serial',
      key: 'serial',
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      width: '10%',
    },
    {
      title: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('Camera Name')}
          <Button
            type="text"
            onClick={() => handleSort('name')}
            icon={sortField === 'name' && sortOrder === 'ascend' ? <SortAscendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' /> : <SortDescendingOutlined style={{ color: 'white', border: '1px solid white' }} className='rounded-2 p-1' />}
          />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onPressEnter={() => handleEditSave(index)}
            onBlur={() => handleEditSave(index)}
          />
        ) : (
          <span>{text}</span>
        )
      ),
      width: '70%',
    },
    {
      title: t('actions'),
      key: 'action',
      render: (_, record, index) => (
        editingIndex === index ? (
          <div style={{ display: 'flex', justifyContent: '' }}>
            <Button type="link" onClick={() => handleEditSave(index)} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white `}>
              <SaveOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}/> 
              <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}>{t('save')}</span> 
            </Button>
            <Button type="link" onClick={() => setEditingIndex(null)} className={`${customDark === "dark-dark" ? `${customMid} border` : `${customLight} ${customDarkBorder}`} text-white ms-3`}>
              <CloseOutlined className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}/> 
              <span className={`${customDark === "dark-dark" ? `` : `${customDarkText}` } `}>{t('cancel')}</span> 
            </Button>
          </div>
        ) : (
          <Button type="link" icon={<EditOutlined />} onClick={() => {
            setEditingIndex(index);
            setEditingName(record.name);
          }} className={`${customBtn} text-white me-1`}>{t('edit')}</Button>
        )
      ),
    },
  ];

  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const paginatedCameras = filteredCameras.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      overflow: 'auto'
    }}
    className={`${customDark === "dark-dark" ? customDark : ``}`}>
      <h2 className={`${customDarkText}`}>{t('Camera List')}</h2>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '10px' : '20px'
      }}>
        <Input.Search
          placeholder={t('Search cameras')}
          allowClear
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
        <Button className={`${customBtn} ${customDark === "dark-dark" ? `` : `border-0`} custom-zoom-btn`} onClick={showModal}>
          {t('Add New Camera')}
        </Button>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={paginatedCameras}
            pagination={false}
            rowKey="cameraId"
            bordered
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
              total={filteredCameras.length}
              onChange={(page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => t('{{start}}-{{end}} of {{total}} items', { start: range[0], end: range[1], total })}
            />
          </div>
        </>
      )}

      <Modal
        show={isModalOpen}
        onHide={handleCancel}
        centered
        size={isMobile ? 'sm' : 'md'}
      >
        <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
          <Modal.Title>{t('Add New Camera')}</Modal.Title>
          <AiFillCloseSquare
            size={30}
            onClick={handleCancel}
            className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
            aria-label="Close"
            style={{ cursor: 'pointer', fontSize: '1.3rem' }}
          />
        </Modal.Header>
        <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-6 `}>{t('Camera Name')}</span>}
              rules={[{ required: true, message: t('Please enter camera name') }]}
            >
              <Input placeholder={t('Enter camera name')} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={handleOk} className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? `` : `border-0`} custom-zoom-btn`} size="small">
                {t('submit')}
              </Button>
            </Form.Item>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CameraList;
