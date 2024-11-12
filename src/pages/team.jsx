import React, { useEffect, useState, useRef } from 'react';
import { Button, Form, Input, Select, Table, Card, Typography, Divider, Tag, Checkbox, notification, Switch } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import API from '../CustomHooks/MasterApiHooks/api';
import i18next from 'i18next';
import { useTranslation, initReactI18next } from 'react-i18next';
import themeStore from '../store/themeStore';
import { useStore } from 'zustand';
import { Modal } from 'react-bootstrap';
import { useUserData } from '../store/userDataStore';


const { Option } = Select;
const { Title, Text } = Typography;

const Team = () => {
  const { t } = useTranslation();
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [processes, setProcesses] = useState([]);
  const userData = useUserData();
  const modalRef = useRef(null);


  const getUsers = async () => {
    try {
      const response = await API.get('/User/operator');
      setUsers(response.data);
    } catch (error) {
      console.error(t('failedToFetchUsers'));
    }
  };

  const getTeams = async () => {
    try {
        const response = await API.get('/Teams');
        const teamsData = response.data;

        const userIds = [...new Set(teamsData.flatMap(team => team.users.map(user => user.id)))];

        const userResponse = await API.get('/User/operator');
        const usersData = userResponse.data;

        const userMap = {};
        usersData.forEach(user => {
            userMap[user.userId] = `${user.firstName} ${user.lastName}`;
        });

        const updatedTeams = teamsData.map(team => ({
            ...team,
            userNames: team.users.map(user => userMap[user.id] || t('unknown')).join(', ')
        }));

        setTeams(updatedTeams);
    } catch (error) {
        console.error(t('failedToFetchTeams'), error);
        notification.error({
            message: t('error'),
            description: t('failedToFetchTeamsOrUserDetails'),
        });
    }
};


const getProcesses = async () => {
  try {
    const response = await API.get('/Processes');
    setProcesses(response.data);
  } catch (error) {
    console.error(t('failedToFetchProcesses'), error);
    notification.error({
      message: t('error'),
      description: t('failedToFetchProcessesCheckAPI'),
    });
  }
};

  const handleOk = async () => {
    form
      .validateFields()
      .then(async (values) => {
        const newTeam = {
          teamId: 0,
          teamName: values.teamName,
          processId: values.processId,
          createdDate: new Date().toISOString(),
          status: true,
          userIds: values.teamMembers,
          userNames: values.teamMembers.map(id => users.find(user => user.userId === id)?.firstName).join(', '),
          createdBy: userData.userId,
        };
        try {
          await API.post('/Teams', newTeam);
          await getTeams();
          setIsModalVisible(false);
          form.resetFields();
          notification.success({
            message: t('teamCreated'),
            description: t('teamCreatedSuccessfully', { teamName: newTeam.teamName }),
            placement: 'topRight',
          });
        } catch (error) {
          console.error(t('failedToCreateTeam'), error);
        }
      })
      .catch((info) => {
        console.error(t('formValidationFailed'), info);
      });
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    console.log("Selected Process ID:", team.processId);
    console.log("Processes:", processes);
    form.setFieldsValue({
      teamName: team.teamName,
      teamMembers: team.users.map(user => user.id),
      processId: team.processId
    });
    setIsModalVisible(true);
  };

  const handleStatusChange = async (teamId, status) => {
    const teamToUpdate = teams.find(t => t.teamId === teamId);
    if (!teamToUpdate) return;

    const updatedTeam = {
        ...teamToUpdate,
        status: status,
    };

    try {
        await API.put(`/Teams/${teamId}`, updatedTeam);
        await getTeams();
        notification.success({
            message: t('teamStatusUpdated'),
            description: t('teamStatusUpdatedSuccessfully'),
            placement: 'topRight',
        });
    } catch (error) {
        console.error(t('failedToUpdateTeamStatus'), error);
    }
};

  const handleUpdate = async () => {
    form
      .validateFields()
      .then(async (values) => {
        const updatedTeam = {
          teamId: editingTeam.teamId,
          teamName: values.teamName,
          processId: values.processId,
          createdDate: editingTeam.createdDate,
          createdBy: editingTeam.createdBy,
          status: editingTeam.status,
          userIds: values.teamMembers,
          userNames: values.teamMembers.map(id => users.find(user => user.userId === id)?.firstName).join(', '),
        };

        try {
          await API.put(`/Teams/${editingTeam.teamId}`, updatedTeam);
          await getTeams();
          setIsModalVisible(false);
          form.resetFields();

          notification.success({
            message: t('teamUpdated'),
            description: t('teamUpdatedSuccessfully', { teamName: updatedTeam.teamName }),
            placement: 'topRight',
          });
        } catch (error) {
          console.error(t('failedToUpdateTeam'), error);
        }
      })
      .catch((info) => {
        console.error(t('formValidationFailed'), info);
      });
  };

  const columns = React.useMemo(() => {
    const baseColumns = [
      {
        title: t('srNo'),
        dataIndex: 'sn',
        key: 'sn',
        render: (text, record, index) => index + 1,
      },
      {
        title: t('teamName'),
        dataIndex: 'teamName',
        key: 'teamName',
      },
      {
        title: t('members'),
        dataIndex: 'userNames',
        key: 'userNames',
        render: (userNames) => (
            <>
                {userNames ? userNames.split(', ').map((name, index) => (
                    <Tag key={index}>{name}</Tag>
                )) : <span>{t('noMembers')}</span>} 
            </>
        ),
    },
      {
        title: t('status'),
        dataIndex: 'status',
        key: 'status',
        render: (status, record) => (
          <Switch
            checkedChildren={t('active')}
            unCheckedChildren={t('inactive')}
            checked={status}
            onChange={(checked) => handleStatusChange(record.teamId, checked)}
          />
        ),
      },
      {
        title: t('action'),
        key: 'action',
        render: (text, record) => (
            <Button onClick={() => handleEdit(record)} type="link">
              {t('edit')}
            </Button>
        ),
      },
    ];

   

  return baseColumns;
}, []);

  useEffect(() => {
    getUsers();
    getTeams();
    getProcesses();
  }, []);

  return (
    <div style={{ padding: '40px' }}>
      <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
          <Button onClick={() => setIsModalVisible(true)} size="large" className={`${customBtn} ${customDark === "dark-dark" ? `border` : `border-0`}`}>
            {t('addTeam')}
          </Button>
        </div>

        <Divider>{t('existingTeams')}</Divider>
        <Table
          columns={columns}
          dataSource={teams}
          pagination={false}
          bordered
          style={{ marginTop: '20px' }}
          rowClassName={(record, index) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark')}
        />
      </Card>

      <Modal
        show={isModalVisible}
        onHide={() => {
          setIsModalVisible(false);
          setEditingTeam(null);
          form.resetFields();
        }}
        centered
        className={`{}`}
        ref={modalRef}
      >
        <Modal.Header closeButton={false} className={customDark}>
          <Modal.Title className={`${customLightText}`}>{editingTeam ? t('editTeam') : t('addNewTeam')}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={customMid}>
          <Form form={form} layout="vertical" name="addTeamForm">
            <Form.Item
              label={<span className={customDarkText}>{t('teamName')}</span>}
              name="teamName"
              rules={[{ required: true, message: t('pleaseEnterTeamName') }]}
            >
              <Input placeholder={t('enterTeamName')} size="large" />
            </Form.Item>

            <Form.Item
              label={<span className={customDarkText}>{t('teamMembers')}</span>}
              name="teamMembers"
              rules={[{ required: true, message: t('pleaseSelectTeamMembers') }]}
            >
              <Select
                mode="multiple"
                placeholder={t('selectTeamMembers')}
                allowClear
                size="large"
              >
                {users.map((user) => (
                  <Option key={user.userId} value={user.userId}>
                    {user.firstName} {user.middleName} {user.lastName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label={t('process')}
              name="processId"
              rules={[{ required: true, message: t('pleaseSelectProcess') }]}
            >
              <Select placeholder={t('selectProcess')} size="large">
                {processes.map((process) => (
                  <Option key={process.id} value={process.id}>
                    {process.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal.Body>
        <Modal.Footer className={customDark}>
          <Button onClick={() => {
            setIsModalVisible(false);
            setEditingTeam(null);
            form.resetFields();
          }}>
            {t('cancel')}
          </Button>
          <Button className={`${customBtn}`} onClick={editingTeam ? handleUpdate : handleOk}>
            {editingTeam ? t('updateTeam') : t('addTeam')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Team;
