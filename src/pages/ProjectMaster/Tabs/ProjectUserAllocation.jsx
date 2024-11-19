import React, { useEffect, useState } from 'react';
import { Select, Table, Button, message } from 'antd';
import API from '../../../CustomHooks/MasterApiHooks/api';

const { Option } = Select;

const ProjectUserAllocation = ({ selectedProject }) => {
  const [processes, setProcesses] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSelections, setUserSelections] = useState({});
  const [projectName, setProjectName] = useState(''); // State for project name


  useEffect(() => {
    if (selectedProject) {
      fetchProjectName(selectedProject); // Fetch project name when selectedProject changes
      fetchProcessesWithUsers();
    }
    fetchUsers();
  }, [selectedProject]);
  const fetchProjectName = async (projectId) => {
    try {
      const response = await API.get(`/Project/${projectId}`);
      setProjectName(response.data.name); // Assuming response has a 'name' field
    } catch (error) {
      console.error("Failed to fetch project name", error);
      message.error("Failed to fetch project name");
    }
  };


  useEffect(() => {
    fetchProcessesWithUsers();
    fetchUsers();
  }, [selectedProject]); // Fetch when selectedProject changes

  const fetchUsers = async () => {
    try {
      const response = await API.get("/User");
      const filteredUsers = response.data.filter(user => user.roleId === 5 || user.roleId === 1);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
      message.error("Failed to fetch users");
    }
  };

  const fetchProcessesWithUsers = async () => {
    try {
      const response = await API.get(`/ProjectProcess/GetProcessesWithUsers/${selectedProject}`);
      const { processes } = response.data;

      setProcesses(processes);

      // Prepare userSelections based on the fetched processes
      const newUserSelections = {};
      processes.forEach(process => {
        newUserSelections[process.processId] = process.userId || []; // Default to an empty array if userId is not present
      });
      setUserSelections(newUserSelections);
    } catch (error) {
      console.error("Failed to fetch processes", error);
      message.error("Failed to fetch processes");
    }
  };

  const handleUserChange = (processId, selectedUsers) => {
    setUserSelections(prev => ({
      ...prev,
      [processId]: selectedUsers,
    }));
  };

  const handleSubmit = async () => {
    try {
      const userAssignments = Object.entries(userSelections).reduce((acc, [processId, userIds]) => {
        acc[parseInt(processId, 10)] = userIds.map(userId => parseInt(userId, 10));
        return acc;
      }, {});

      await API.post(`/ProjectProcess/UpdateProcessUsers/${selectedProject}`, userAssignments);
      message.success("Users assigned successfully!");
      fetchProcessesWithUsers(selectedProject); // Refresh the process list
    } catch (error) {
      console.error("Failed to assign users", error);
      message.error("Failed to assign users");
    }
  };

  const columns = [
    {
      title: 'Process Name',
      dataIndex: 'processName',
      key: 'processName',
    },
    {
      title: 'Assign Supervisor',
      key: 'assignUser',
      render: (text, record) => (
        <Select
          mode="multiple"
          placeholder="Select Users"
          value={userSelections[record.processId] || []}
          onChange={(selectedUsers) => handleUserChange(record.processId, selectedUsers)}
          style={{  width: 400, whiteSpace: 'nowrap' }}
        >
          {users.map(user => (
            <Option key={user.userId} value={user.userId}>
              {user.userName}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <div>
      <h3>Project User Allocation for : {projectName}</h3>
      <Table
        dataSource={processes}
        columns={columns}
        rowKey="processId" // Ensure this matches your data structure
        pagination={false}
      />
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
        Submit User Assignments
      </Button>
    </div>
  );
};

export default ProjectUserAllocation;
