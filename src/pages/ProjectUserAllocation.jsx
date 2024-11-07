// import React, { useEffect, useState } from 'react';
// import { Select, Table, Button, message } from 'antd';
// import API from '../CustomHooks/MasterApiHooks/api';

// const { Option } = Select;

// const ProjectUserAllocation = () => {
//   const [projects, setProjects] = useState([]);
//   const [selectedProjectId, setSelectedProjectId] = useState(null);
//   const [processes, setProcesses] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [userSelections, setUserSelections] = useState({}); // Store selected users for each process

//   useEffect(() => {
//     fetchProjects();
//     fetchUsers();
//   }, []);

//   const fetchProjects = async () => {
//     try {
//       const response = await API.get("/Project");
//       setProjects(response.data);
//     } catch (error) {
//       console.error("Failed to fetch projects", error);
//       message.error("Failed to fetch projects");
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await API.get("/User");
//       setUsers(response.data);
//     } catch (error) {
//       console.error("Failed to fetch users", error);
//       message.error("Failed to fetch users");
//     }
//   };

//   // const fetchProcessesWithUsers = async (projectId) => {
//   //   try {
//   //     const response = await API.get(`/ProjectProcess/GetProcessesWithUsers/${projectId}`);
//   //     setProcesses(response.data.processes);
//   //     setUserSelections({}); // Reset user selections when project changes
//   //   } catch (error) {
//   //     console.error("Failed to fetch processes", error);
//   //     message.error("Failed to fetch processes");
//   //   }
//   // };

//   const fetchProcessesWithUsers = async (projectId) => {
//     try {
//       const response = await API.get(`/ProjectProcess/GetProcessesWithUsers/${projectId}`);
//       const { processes } = response.data;
  
//       // Update state for processes
//       setProcesses(processes);
  
//       // Set user selections based on the fetched processes and their allocated users
//       const newUserSelections = {};
//       processes.forEach(process => {
//         newUserSelections[process.processId] = process.assignedUsers.map(user => user.userId); // Assuming assignedUsers contains userId
//       });
//       setUserSelections(newUserSelections); // Update user selections based on allocated users
//     } catch (error) {
//       console.error("Failed to fetch processes", error);
//       message.error("Failed to fetch processes");
//     }
//   };
  
//   const handleProjectChange = (projectId) => {
//     setSelectedProjectId(projectId);
//     fetchProcessesWithUsers(projectId);
//   };

//   const handleUserChange = (processId, selectedUsers) => {
//     setUserSelections(prev => ({
//       ...prev,
//       [processId]: selectedUsers, // Update user selections for the specific process
//     }));
//   };

//   const handleSubmit = async () => {
//     try {
//         // Prepare the data to post
//         const userAssignments = Object.entries(userSelections).reduce((acc, [processId, userIds]) => {
//             acc[parseInt(processId, 10)] = userIds.map(userId => parseInt(userId, 10)); // Ensure IDs are integers
//             return acc;
//         }, {});

//         // Log the prepared data for debugging
//         console.log(userAssignments); // Optional: Check the format before sending

//         // Make a POST request with the selected user assignments
//         await API.post(`/ProjectProcess/UpdateProcessUsers/${selectedProjectId}`, userAssignments);
//         message.success("Users assigned successfully!");
//         fetchProcessesWithUsers(selectedProjectId); // Refresh the process list
//     } catch (error) {
//         console.error("Failed to assign users", error);
//         message.error("Failed to assign users");
//     }
// };


//   const columns = [
//     {
//       title: 'Process Name',
//       dataIndex: 'processName',
//       key: 'processName',
//     },
//     {
//       title: 'Assign Supervisor',
//       key: 'assignUser',
//       render: (text, record) => (
//         <Select
//           mode="multiple"
//           placeholder="Select Users"
//           defaultValue={userSelections[record.processId] || []}
//           onChange={(selectedUsers) => handleUserChange(record.processId, selectedUsers)}
//           style={{ width: '100%' }}
//         >
//           {users.map(user => (
//             <Option key={user.userId} value={user.userId}>
//               {user.userName}
//             </Option>
//           ))}
//         </Select>
//       ),
//     },
//   ];

//   return (
//     <div>
//       <h3>Project User Allocation</h3>
//       <Select
//         placeholder="Select Project"
//         style={{ width: '100%', marginBottom: '20px' }}
//         onChange={handleProjectChange}
//       >
//         {projects.map(project => (
//           <Option key={project.projectId} value={project.projectId}>
//             {project.name}
//           </Option>
//         ))}
//       </Select>
//       <Table
//         dataSource={processes}
//         columns={columns}
//         rowKey="id"
//         pagination={false}
//       />
//       <Button type="primary" onClick={handleSubmit} style={{ marginTop: '20px' }}>
//         Submit User Assignments
//       </Button>
//     </div>
//   );
// };

// export default ProjectUserAllocation;


import React, { useEffect, useState } from 'react';
import { Select, Table, Button, message } from 'antd';
import API from '../CustomHooks/MasterApiHooks/api';

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
      const filteredUsers = response.data.filter(user => user.roleId === 4 || user.roleId === 1);
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
