/**
 * Message Component: Handles message management operations
 * Created by Shivom on 2023-10-05
 * Updated by Shivom on 2023-10-07
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
import { useTranslation } from 'react-i18next';

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
  const [alertMessageProps, setAlertMessageProps] = useState({ messageId: '', type: '' });
  const [showAlert, setShowAlert] = useState(false);
  const AlertMessage = useAlertMessage(alertMessageProps.messageId, alertMessageProps.type);
  const { t } = useTranslation();

  // Theme Change Section
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const customDark = cssClasses[0];
  const customMid = cssClasses[1];
  const customLight = cssClasses[2];
  const customBtn = cssClasses[3];
  const customDarkText = cssClasses[4];
  const customLightText = cssClasses[5];

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
      title: t('messageId'),
      dataIndex: "messageId",
      key: "messageId",
      sorter: (a, b) => a.messageId - b.messageId,
      width: 120,
    },
    {
      title: t('type'),
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => a.type.localeCompare(b.type),
      width: 120,
    },
    {
      title: t('status'),
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
      title: t('l1Title'),
      dataIndex: "l1Title",
      key: "l1Title",
      sorter: (a, b) => a.l1Title.localeCompare(b.l1Title),
    },
    
    {
      title: t('l1Description'),
      dataIndex: "l1Desc",
      key: "l1Desc",
      sorter: (a, b) => a.l1Desc.localeCompare(b.l1Desc),
    },
    {
      title: t('l2Title'),
      dataIndex: "l2Title",
      key: "l2Title",
      sorter: (a, b) => a.l2Title.localeCompare(b.l2Title),
    },
    {
      title: t('l2Description'),
      dataIndex: "l2Desc",
      key: "l2Desc",
      sorter: (a, b) => a.l2Desc.localeCompare(b.l2Desc),
    },
    {
      title: t('actions'),
      key: "actions",
      render: (_, record) => (
        <Button variant="primary" size="sm" onClick={() => handleEdit(record)}>
          {t('edit')}
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
    <div className={`container ${customLight} rounded py-2 shadow-lg`}>
      <h2 className={`text-center mt-2 ${customDarkText}`}>
        {t('messageManagement')}
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
                      {t('messageType')}
                    </Form.Label>
                    <Form.Control
                      as="select"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">{t('selectType')}</option>
                      <option value="success">{t('success')}</option>
                      <option value="error">{t('error')}</option>
                      <option value="info">{t('info')}</option>
                    </Form.Control>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="status">
                    <Form.Label className={`${customDarkText}`}>
                      {t('status')}
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
                      {t('l1Title')}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="l1Title"
                      value={formData.l1Title}
                      onChange={handleInputChange}
                      required
                      placeholder={t('l1Title')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="l2Title">
                    <Form.Label className={`${customDarkText}`}>
                      {t('l2Title')}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="l2Title"
                      value={formData.l2Title}
                      onChange={handleInputChange}
                      required
                      placeholder={t('l2Title')}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="l1Desc">
                    <Form.Label className={`${customDarkText}`}>
                      {t('l1Description')}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="l1Desc"
                      value={formData.l1Desc}
                      onChange={handleInputChange}
                      required
                      placeholder={t('l1Description')}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="l2Desc">
                    <Form.Label className={`${customDarkText}`}>
                      {t('l2Description')}
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="l2Desc"
                      value={formData.l2Desc}
                      onChange={handleInputChange}
                      required
                      placeholder={t('l2Description')}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-center">
                <Button variant="primary" type="submit" className="me-2">
                  {formData.messageId ? t('updateMessage') : t('addMessage')}
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
                    {t('cancel')}
                  </Button>
                )}
              </div>
            </Form>
          )}
          <div className="mt-4">
            <div className="d-flex justify-content-end mb-3">
              <Input.Search
                placeholder={t('searchMessages')}
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