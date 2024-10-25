import React, { useEffect, useState } from 'react';
import { Table, Spin, message, Button, Collapse, Checkbox } from 'antd';
import API from '../CustomHooks/MasterApiHooks/api'; // Adjust the path as necessary
import axios from 'axios';

const { Panel } = Collapse;

const AddProjectProcess = ({ selectedProject }) => {
  const [projectProcesses, setProjectProcesses] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProcesses, setAllProcesses] = useState([]);
  const [selectedProcessIds, setSelectedProcessIds] = useState([]);
  const [removedProcessIds, setRemovedProcessIds] = useState([]);
  const [requiredProcessIds, setRequiredProcessIds] = useState([]); // New state for required processes

  useEffect(() => {
    const fetchRequiredProcesses = async (typeId) => {
      try {
        const response = await API.get(`/PaperTypes/${typeId}/RequiredProcesses`);
        setRequiredProcessIds(response.data.map(process => process.id)); // Set required process IDs
      } catch (error) {
        console.error('Failed to fetch required processes', error);
        message.error('Unable to fetch required processes. Please try again later.');
      }
    };
  
    const fetchProcessesOfProject = async () => {
      try {
        const projectResponse = await API.get(`/Project/${selectedProject}`);
        const { typeId } = projectResponse.data; // Get typeId from project details
        
        const response = await API.get(`/ProjectProcess/GetProjectProcesses/${selectedProject}`);
        if (response.data.length > 0) {
          console.log(response.data);
          await fetchRequiredProcesses(typeId);
          setProjectProcesses(calculatedWeightage(response.data));
        } else {
          await fetchRequiredProcesses(typeId); // Fetch required processes with typeId
          await fetchProjectProcesses(typeId);
        }
      } catch (error) {
        console.error('Failed to fetch project processes', error);
        message.error('Unable to fetch project processes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    const fetchProjectProcesses = async (typeId) => {
      try {
        const response = await API.get(`/PaperTypes/${typeId}/Processes`);
        setProjectProcesses(calculatedWeightage(response.data));
      } catch (error) {
        console.error('Failed to fetch project processes', error);
        message.error('Unable to fetch project processes. Please try again later.');
      }
    };
  
    const fetchFeatures = async () => {
      try {
        const response = await API.get('/Features');
        setFeatures(response.data);
      } catch (error) {
        console.error('Failed to fetch features', error);
        message.error('Unable to fetch features. Please try again later.');
      }
    };
  
    const fetchAllProcesses = async () => {
      try {
        const response = await API.get('/Processes');
        setAllProcesses(response.data);
      } catch (error) {
        console.error('Failed to fetch processes', error);
        message.error('Unable to fetch processes. Please try again later.');
      }
    };
  
    fetchFeatures();
    fetchProcessesOfProject(); // Check project processes first
    fetchAllProcesses(); // Fetch all processes
  }, [selectedProject]);
  

  useEffect(() => {
    // Update selectedProcessIds based on projectProcesses
    setSelectedProcessIds(projectProcesses.map(process => process.id));
  }, [projectProcesses]);

  const handleProcessSelect = (processId) => {
    setSelectedProcessIds((prev) => {
      const newSelection = prev.includes(processId)
        ? prev.filter(id => id !== processId) // Uncheck
        : [...prev, processId]; // Check

      // Update removedProcessIds
      if (prev.includes(processId)) {
        setRemovedProcessIds((prevRemoved) => [...prevRemoved, processId]); // Add to removal list
      } else {
        setRemovedProcessIds((prevRemoved) => prevRemoved.filter(id => id !== processId)); // Remove from removal list
      }

      const updatedProcesses = allProcesses.filter(process => newSelection.includes(process.id));
      const existingIds = new Set(projectProcesses.map(p => p.id));
      const processesToAdd = updatedProcesses.filter(p => !existingIds.has(p.id));
      const processesToRemove = projectProcesses.filter(p => !newSelection.includes(p.id));

      // Update project processes directly
      setProjectProcesses((prev) => calculatedWeightage([
        ...prev.filter(p => !processesToRemove.includes(p)),
        ...processesToAdd,
      ]));

      return newSelection;
    });
  };

  const calculatedWeightage = (processes) => {
    const totalWeightage = processes.reduce((sum, process) => sum + (process.weightage || 0), 0);
    return processes.map(process => ({
      ...process,
      relativeWeightage: totalWeightage > 0 ? ((process.weightage || 0) / totalWeightage) * 100 : 0
    }));
  };

  const handleSubmit = async () => {
    const projectProcessesToSubmit = projectProcesses.map(process => {
      const matchingProcess = allProcesses.find(p => p.name === process.name);

      return {
        id: process.id,
        projectId: selectedProject,
        processId: matchingProcess ? matchingProcess.id : 0,
        weightage: process.weightage,
        sequence: process.id,
        featuresList: process.installedFeatures,
        userId: [] // Replace with actual user IDs if needed
      };
    });

    const data = { projectProcesses: projectProcessesToSubmit };
    const deleteData = { projectId: selectedProject, processIds: removedProcessIds };

    try {
      await API.post('/ProjectProcess/AddProcessesToProject', data);
      if (removedProcessIds.length > 0) {
        await API.post('/ProjectProcess/DeleteProcessesFromProject', deleteData);
      }
      message.success('Processes updated successfully!');
    } catch (error) {
      console.error('Error updating processes:', error);
      message.error('Error updating processes. Please try again.');
    } finally {
      // Reset the removal list
      setRemovedProcessIds([]);
    }
  };

  const columns = [
    {
      title: 'Process Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Installed Features',
      dataIndex: 'installedFeatures',
      key: 'installedFeatures',
      render: (installedFeatures) => (
        <div>
          {features
            .filter(feature => installedFeatures.includes(feature.featureId))
            .map(feature => (
              <div key={feature.featureId} style={{ display: 'flex', alignItems: 'center' }}>
                <span>{feature.features}</span>
                <span style={{ marginLeft: '8px', color: 'green' }}>✔️</span>
              </div>
            ))}
        </div>
      ),
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status) => (status ? 'Active' : 'Inactive'),
    // },
    {
      title: 'Weightage',
      dataIndex: 'weightage',
      key: 'weightage',
    },
    {
      title: 'Relative Weightage',
      dataIndex: 'relativeWeightage',
      key: 'relativeWeightage',
      render: (relativeWeightage) => `${relativeWeightage.toFixed(2)}%`,
    },
  ];

  if (loading) {
    return <Spin tip="Loading..." />;
  }

  return (
    <div>
      <Collapse defaultActiveKey={['1']}>
        <Panel header="Manage Processes" key="1">
          {allProcesses.map(process => (
            <Checkbox
              key={process.id}
              checked={selectedProcessIds.includes(process.id)}
              onChange={() => handleProcessSelect(process.id)}
              disabled={requiredProcessIds.includes(process.id)} // Disable checkbox if it's a required process
            >
              {process.name}
            </Checkbox>
          ))}
        </Panel>
      </Collapse>

      <Table
        columns={columns}
        dataSource={projectProcesses}
        rowKey="id"
        pagination={false}
        bordered
      />
      <Button type="primary" onClick={handleSubmit} style={{ marginTop: '16px' }}>
        Submit Processes
      </Button>
    </div>
  );
};

export default AddProjectProcess;
