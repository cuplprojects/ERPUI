import React, { useState, useEffect } from 'react';
import { Table, Input, Pagination, Button, message } from 'antd';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import useLanguageStore from '../../store/languageStore';
import themeStore from '../../store/themeStore';
import { useStore } from 'zustand';
import useAlertMessage from '../../CustomHooks/Services/AlertMessage';
import { fetchTextLabels, addTextLabel, updateTextLabel } from '../../CustomHooks/ApiServices/textLabelSevice';

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
  const [alertMessageProps, setAlertMessageProps] = useState({ messageId: '', type: '' });
  const [showAlert, setShowAlert] = useState(false);
  const AlertMessage = useAlertMessage(alertMessageProps.messageId, alertMessageProps.type);
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customLight = cssClasses[2];
  const customDarkText = cssClasses[4];

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
      message.error('Failed to fetch labels');
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
        <Button onClick={() => handleEdit(record)}>{t('edit')}</Button>
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
        message.success('Label added successfully');
        setShowAddForm(false);
      } else {
        await updateTextLabel(formData.textLabelId, formData);
        message.success('Label updated successfully');
        setShowEditForm(false);
      }
      fetchLabels();
      setAlertMessageProps({ messageId: '2', type: 'success' });
      setShowAlert(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      message.error('Failed to submit form');
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
      {showAlert && <AlertMessage onClose={() => setShowAlert(false)} />}
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
            <Button type="primary" htmlType="submit" className="me-2">
              {showAddForm ? t('addMessage') : t('updateMessage')}
            </Button>
            <Button onClick={() => {
              setShowEditForm(false);
              setShowAddForm(false);
            }}>{t('cancel')}</Button>
          </div>
        </Form>
      )}
      <div className="mt-4">
        <div className="d-flex justify-content-between mb-3">
          <div>
            {isDeveloper && (
              <Button onClick={handleAdd}>{t('addMessage')}</Button>
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
        />
        <div className="d-flex justify-content-end mt-3">
          <Pagination
            current={currentPage}
            total={filteredLabels.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Labels;