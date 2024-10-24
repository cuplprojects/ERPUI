/**
 * Labels Component: Handles label management operations
 * Created by Shivom on 2023-10-08
 * 
 * This component uses the textLabelService for API requests
 */

import React, { useState, useEffect } from 'react';
import { Table, Input, Pagination, Button } from 'antd';
import { Form, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../../store/languageStore';
import themeStore from '../../store/themeStore';
import { useStore } from 'zustand';
import useAlertMessage from '../../CustomHooks/Services/AlertMessage';
import { fetchTextLabels, addTextLabel, updateTextLabel } from '../../CustomHooks/ApiServices/textLabelSevice';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';

const Labels = () => {
  const [labels, setLabels] = useState([]);
  const [formData, setFormData] = useState({
    labelKey: '',
    englishLabel: '',
    hindiLabel: '',
  });
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState({ text: '', type: '' });
  const [showAlert, setShowAlert] = useState(false);
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  // Hardcoded developer flag
  const isDeveloper = true;

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const response = await fetchTextLabels();
      setLabels(response);
    } catch (error) {
      console.error('Error fetching labels:', error);
      setAlertMessage({ text: 'Failed to fetch labels', type: 'danger' });
      setShowAlert(true);
    }
  };

  const columns = [
    {
      title: t('id'),
      dataIndex: 'textLabelId',
      key: 'textLabelId',
      sorter: (a, b) => a.textLabelId - b.textLabelId,
    },
    {
      title: t('key'),
      dataIndex: 'labelKey',
      key: 'labelKey',
      sorter: (a, b) => a.labelKey.localeCompare(b.labelKey),
    },
    {
      title: t('englishLabel'),
      dataIndex: 'englishLabel',
      key: 'englishLabel',
      sorter: (a, b) => a.englishLabel.localeCompare(b.englishLabel),
    },
    {
      title: t('hindiLabel'),
      dataIndex: 'hindiLabel',
      key: 'hindiLabel',
      sorter: (a, b) => a.hindiLabel.localeCompare(b.hindiLabel),
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_, record) => (
        <div className="d-flex justify-content-center">
          <Button
            onClick={() => handleEdit(record)}
            className={`${customBtn} ${customLightBorder} btn-sm d-flex align-items-center`}
          >
            <EditOutlined className="me-1" />
            <span className="d-none d-sm-inline">{t('edit')}</span>
          </Button>
        </div>
      ),
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setShowAlert(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showAddForm) {
        const { labelKey, englishLabel, hindiLabel } = formData;
        await addTextLabel({ labelKey, englishLabel, hindiLabel });
        setAlertMessage({ text: 'labeladdedsuccess', type: 'success' });
        setShowAddForm(false);
      } else {
        await updateTextLabel(formData.textLabelId, formData);
        setAlertMessage({ text: 'labelUpdatedSuccess', type: 'success' });
        setShowEditForm(false);
      }
      fetchLabels();
      setShowAlert(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setAlertMessage({ text: 'failedToSubmitLabel', type: 'danger' });
      setShowAlert(true);
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    setShowEditForm(true);
    setShowAlert(false);
  };

  const handleAdd = () => {
    setFormData({ labelKey: '', englishLabel: '', hindiLabel: '' });
    setShowAddForm(true);
    setShowAlert(false);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const filteredLabels = labels.filter((label) =>
    Object.values(label).some((val) =>
      val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const paginatedLabels = filteredLabels.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={`container ${customLight} rounded py-2 shadow-lg`}>
      <h2 className={`text-center mt-2 ${customDarkText}`}>
        {t('messageManagement')}
      </h2>
      {showAlert && (
        <Alert variant={alertMessage.type} onClose={() => setShowAlert(false)} dismissible>
          {t(alertMessage.text)}
        </Alert>
      )}
      {(showEditForm || showAddForm) && (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="labelKey">
                <Form.Label className={customDarkText}>Key</Form.Label>
                <Form.Control
                  type="text"
                  name="labelKey"
                  value={formData.labelKey}
                  onChange={handleInputChange}
                  readOnly={showEditForm}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="englishLabel">
                <Form.Label className={customDarkText}>English Label</Form.Label>
                <Form.Control
                  type="text"
                  name="englishLabel"
                  value={formData.englishLabel}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="hindiLabel">
                <Form.Label className={customDarkText}>Hindi Label</Form.Label>
                <Form.Control
                  type="text"
                  name="hindiLabel"
                  value={formData.hindiLabel}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-center">
            <Button type="primary" htmlType="submit" className={`me-2 ${customBtn} ${customLightBorder}`}>
               {showAddForm ? t('addMessage') : t('updateMessage')}
            </Button>
            <Button 
              onClick={() => {
                setShowEditForm(false);
                setShowAddForm(false);
              }} 
              className={`${customBtn} ${customLightBorder} d-flex align-items-center`}
            >
              <CloseOutlined className="me-2"/> 
              <span>{t('cancel')}</span>
            </Button>
          </div>
        </Form>
      )}
      <div className="mt-4">
        <div className="d-flex justify-content-between mb-3">
          <div>
            {isDeveloper && (
              <Button onClick={handleAdd} className={`${customBtn} ${customLightBorder}`}>
                 {t('addMessage')}
              </Button>
            )}
          </div>
          <div>
            <Input.Search
              placeholder={t('searchMessages')}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={paginatedLabels}
          pagination={false}
          scroll={{ x: true }}
          bordered
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
        <div className={`d-flex justify-content-end mt-3 ${customDark === "dark-dark" ? "bg-white" : ""} rounded rounded-2 rounded-top-0 p-2`}>
          <Pagination
            current={currentPage}
            total={filteredLabels.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
            className=""
          />
        </div>
      </div>
    </div>
  );
};

export default Labels;