/**
 * Message Component: Handles message management operations
 * Created by Shivom on 2023-10-05
 * Updated by Assistant on 2023-10-07
 * 
 * This component uses the messageService for API requests
 */

import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap";
import { Table, Input, Pagination, Switch } from "antd";
import themeStore from "./../../store/themeStore";
import { useStore } from "zustand";
import { fetchMessages as fetchMessagesApi, updateMessage, addMessage } from "../../CustomHooks/ApiServices/messageService";
import useAlertMessage from "../../CustomHooks/Services/AlertMessage";

const Message = () => {
  const [messages, setMessages] = useState([]);
  const [formData, setFormData] = useState({
    l1Title: "",
    l1Desc: "",
    l2Title: "",
    l2Desc: "",
    status: true,
    type: "",
  });
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [showEditForm, setShowEditForm] = useState(false);
  const isDeveloper = true;
  const [language, setLanguage] = useState('en');
  const [alertMessageProps, setAlertMessageProps] = useState({ messageId: '', type: '' });
  const [showAlert, setShowAlert] = useState(false);
  const AlertMessage = useAlertMessage(alertMessageProps.messageId, alertMessageProps.type);

  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5];
  

  const languageText = {
    messageManagement: ['Message Management', 'संदेश प्रबंधन'],
    messageType: ['Message Type', 'संदेश प्रकार'],
    selectType: ['Select Type', 'प्रकार चुनें'],
    success: ['Success', 'सफलता'],
    error: ['Error', 'त्रुटि'],
    info: ['Info', 'जानकारी'],
    l1Title: ['L1 Title', 'L1 शीर्षक'],
    l1Description: ['L1 Description', 'L1 विवरण'],
    l2Title: ['L2 Title (Hindi)', 'L2 शीर्षक (हिंदी)'],
    l2Description: ['L2 Description (Hindi)', 'L2 विवरण (हिंदी)'],
    updateMessage: ['Update Message', 'संदेश अपडेट करें'],
    addMessage: ['Add Message', 'संदेश जोड़ें'],
    cancel: ['Cancel', 'रद्द करें'],
    searchMessages: ['Search messages', 'संदेश खोजें'],
    id: ['ID', 'आईडी'],
    type: ['Type', 'प्रकार'],
    actions: ['Actions', 'कार्रवाई'],
    edit: ['Edit', 'संपादित करें'],
    status: ['Status', 'स्थिति'],
  };

  const getText = (key) => languageText[key][language === 'en' ? 0 : 1];

  useEffect(() => {
    // Fetch messages from API or database
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await fetchMessagesApi();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]); // Set messages to an empty array if there's an error
    }
  };

  const columns = [
    {
      title: getText('type'),
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      width: 120,
    },
    {
      title: getText('status'),
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Switch
          checked={status}
          onChange={(checked) => handleStatusChange(checked, record)}
        />
      ),
      width: 100,
      align: "center",
    },
    {
      title: getText('l1Title'),
      dataIndex: "l1Title",
      key: "l1Title",
      sorter: (a, b) => a.l1Title.localeCompare(b.l1Title),
    },
    {
      title: getText('l2Title'),
      dataIndex: "l2Title",
      key: "l2Title",
      sorter: (a, b) => a.l2Title.localeCompare(b.l2Title),
    },
    {
      title: getText('l1Description'),
      dataIndex: "l1Desc",
      key: "l1Desc",
      sorter: (a, b) => a.l1Desc.localeCompare(b.l1Desc),
    },
    {
      title: getText('l2Description'),
      dataIndex: "l2Desc",
      key: "l2Desc",
      sorter: (a, b) => a.l2Desc.localeCompare(b.l2Desc),
    },
    {
      title: getText('actions'),
      key: "actions",
      render: (_, record) => (
        <Button variant="primary" onClick={() => handleEdit(record)}>
          {getText('edit')}
        </Button>
      ),
      width: 100,
      align: "center",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setShowAlert(false);
  };

  const handleStatusChange = async (checked, record) => {
    try {
      const updatedMessage = { ...record, status: checked };
      await updateMessage(updatedMessage);
      fetchMessages(); // Refresh the messages list
      setAlertMessageProps({  messageId: '2', type: 'success' });
      setShowAlert(true);
    } catch (error) {
      setAlertMessageProps({ messageId: '2', type: 'danger' });
      setShowAlert(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.messageId) {
        // Update existing message
        await updateMessage(formData);
        setAlertMessageProps({ messageId: '2', type: 'success' });
      } else if (isDeveloper) {
        // Add new message (only for developers)
        await addMessage(formData);
        setAlertMessageProps({ messageId: '2', type: 'success' });
      }
      setFormData({
        l1Title: "",
        l1Desc: "",
        l2Title: "",
        l2Desc: "",
        status: true,
        type: "",
      });
      setShowEditForm(false);
      fetchMessages(); // Refresh the messages list
      setShowAlert(true);
    } catch (error) {
      setAlertMessageProps({ messageId: '2', type: 'danger' });
      setShowAlert(true);
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    if (!isDeveloper) {
      setShowEditForm(true);
    }
    setShowAlert(false);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
    setShowAlert(false);
  };

  const filteredMessages = messages ? messages.filter((message) =>
    Object.values(message).some((val) =>
      val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  ) : [];

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className={`container ${customLight} rounded py-2`}>
      <h2 className={`text-center mt-2 ${customDarkText}`}>
        {getText('messageManagement')}
      </h2>
      {showAlert && <AlertMessage onClose={() => setShowAlert(false)} />}
      <div className="row justify-content-center ">
        <div className="col-12 col-md-12 px-4">
          {(isDeveloper || showEditForm) && (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="type">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('messageType')}
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">{getText('selectType')}</option>
                      <option value="success">{getText('success')}</option>
                      <option value="error">{getText('error')}</option>
                      <option value="info">{getText('info')}</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="status">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('status')}
                    </Form.Label>
                    <Form.Check
                      type="switch"
                      name="status"
                      checked={formData.status}
                      onChange={(e) => {
                        setFormData({ ...formData, status: e.target.checked });
                        setShowAlert(false);
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="l1Title">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l1Title')}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="l1Title"
                      value={formData.l1Title}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l1Title')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="l2Title">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l2Title')}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="l2Title"
                      value={formData.l2Title}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l2Title')}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="l1Desc">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l1Description')}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="l1Desc"
                      value={formData.l1Desc}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l1Description')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="l2Desc">
                    <Form.Label className={`${customDarkText}`}>
                      {getText('l2Description')}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="l2Desc"
                      value={formData.l2Desc}
                      onChange={handleInputChange}
                      required
                      placeholder={getText('l2Description')}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-center">
                <Button variant="primary" type="submit" className="me-2">
                  {formData.messageId ? getText('updateMessage') : getText('addMessage')}
                </Button>
                {!isDeveloper && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowEditForm(false);
                      setShowAlert(false);
                    }}
                    className="ms-2"
                  >
                    {getText('cancel')}
                  </Button>
                )}
              </div>
            </Form>
          )}
          <div className="mt-4">
            <div className="d-flex justify-content-end mb-3">
              <Input.Search
                placeholder={getText('searchMessages')}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
            </div>
            <Table
              columns={columns}
              dataSource={paginatedMessages}
              rowKey={(record) => record.messageId}
              pagination={false}
              scroll={{ x: true }}
              bordered
            />
            <div className="d-flex justify-content-end mt-3">
              <Pagination
                current={currentPage}
                total={filteredMessages.length}
                pageSize={pageSize}
                onChange={(page) => {
                  setCurrentPage(page);
                  setShowAlert(false);
                }}
                showSizeChanger={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;