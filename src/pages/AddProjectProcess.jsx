import React, { useEffect, useState, useCallback } from 'react';
import { Table, Spin, message, Button, Collapse, Checkbox, Select } from 'antd';
import API from '../CustomHooks/MasterApiHooks/api'; // Adjust the path as necessary
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

const { Panel } = Collapse;
const { Option } = Select;

const DragHandle = SortableHandle(({ disabled }) => (
  <span style={{ 
    cursor: disabled ? 'not-allowed' : 'grab', 
    marginRight: '8px', 
    opacity: disabled ? 0.5 : 1,
    display: disabled ? 'none' : 'inline' 
  }}>⣿</span>
));

const SortableRow = SortableElement(({ process, index, features, editingProcessId, editingFeatures, handleFeatureChange, handleSaveFeatures, handleCancelEdit, handleEdit, independentProcesses, disabled }) => {
  return (
    <tr style={{ opacity: 1, background: 'white', margin: '10px' }}>
      <td>
        {independentProcesses.some(p => p.id === process.id) && <DragHandle disabled={disabled} />}
        {process.name}
      </td>
      <td>
        {editingProcessId === process.id ? (
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            value={editingFeatures}
            onChange={handleFeatureChange}
          >
            {features.map(feature => (
              <Option key={feature.featureId} value={feature.featureId}>
                {feature.features}
              </Option>
            ))}
          </Select>
        ) : (
          <div>
            {features
              .filter(feature => process.installedFeatures.includes(feature.featureId))
              .map(feature => (
                <div key={feature.featureId} style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{feature.features}</span>
                  <span style={{ marginLeft: '8px', color: 'green' }}>✔️</span>
                </div>
              ))}
          </div>
        )}
      </td>
      <td>{process.weightage}</td>
      <td>{process.relativeWeightage.toFixed(4)}%</td>
      <td>
        {editingProcessId === process.id ? (
          <>
            <Button onClick={() => handleSaveFeatures(process.id)} type="primary">Save</Button>
            <Button onClick={handleCancelEdit}>Cancel</Button>
          </>
        ) : (
          <Button onClick={() => handleEdit(process)}>Edit</Button>
        )}
      </td>
    </tr>
  );
});

const SortableBody = SortableContainer(({ children }) => {
  return <tbody>{children}</tbody>;
});

const arrayMoveMutate = (array, from, to) => {
  array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
};

const arrayMove = (array, from, to) => {
  array = array.slice();
  arrayMoveMutate(array, from, to);
  return array;
};

const AddProjectProcess = ({ selectedProject }) => {
  const [projectProcesses, setProjectProcesses] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allProcesses, setAllProcesses] = useState([]);
  const [selectedProcessIds, setSelectedProcessIds] = useState([]);
  const [removedProcessIds, setRemovedProcessIds] = useState([]);
  const [requiredProcessIds, setRequiredProcessIds] = useState([]);
  const [editingProcessId, setEditingProcessId] = useState(null);
  const [editingFeatures, setEditingFeatures] = useState([]);
  const [previousFeatures, setPreviousFeatures] = useState([]);
  const [independentProcesses, setIndependentProcesses] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [isTransactionExists, setIsTransactionExists] = useState(false);

  useEffect(() => {
    const fetchRequiredProcesses = async (typeId) => {
      try {
        const response = await API.get(`/PaperTypes/${typeId}/RequiredProcesses`);
        setRequiredProcessIds(response.data.map(process => process.id));
      } catch (error) {
        message.error('Unable to fetch required processes. Please try again later.');
      }
    };

    const fetchProcessesOfProject = async () => {
      try {
        const projectResponse = await API.get(`/Project/${selectedProject}`);
        const { typeId, name } = projectResponse.data;

        setProjectName(name);
        const response = await API.get(`/ProjectProcess/GetProjectProcesses/${selectedProject}`);
        if (response.data.length > 0) {
          await fetchRequiredProcesses(typeId);
          const sortedProcesses = response.data.sort((a, b) => a.sequence - b.sequence);
          const independentOnly = sortedProcesses.filter(process => process.processType !== "Dependent");
          setProjectProcesses(calculatedWeightage(independentOnly));
        } else {
          await fetchRequiredProcesses(typeId);
          await fetchProjectProcesses(typeId);
        }
      } catch (error) {
        message.error('Unable to fetch project processes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchProjectProcesses = async (typeId) => {
      try {
        const response = await API.get(`/PaperTypes/${typeId}/Processes`);
        const independentOnly = response.data.filter(process => process.processType !== "Dependent");
        setProjectProcesses(calculatedWeightage(independentOnly));
      } catch (error) {
        message.error('Unable to fetch project processes. Please try again later.');
      }
    };

    const fetchFeatures = async () => {
      try {
        const response = await API.get('/Features');
        setFeatures(response.data);
      } catch (error) {
        message.error('Unable to fetch features. Please try again later.');
      }
    };

    const fetchAllProcesses = async () => {
      try {
        const response = await API.get('/Processes');
        const independentOnly = response.data
          .filter(process => process.processType === "Independent")
          .map(process => ({
            ...process,
            rangeStart: process.rangeStart || 0,
            rangeEnd: process.rangeEnd || 0
          }));
        
        setAllProcesses(response.data);
        setIndependentProcesses(independentOnly);

      } catch (error) {
        message.error('Unable to fetch processes. Please try again later.');
      }
    };

    const checkTransactions = async () => {
      try {
        const response = await API.get(`/Transactions/exists/${selectedProject}`);
        setIsTransactionExists(response.data);
      } catch (error) {
        message.error('Error checking transaction status');
      }
    };

    checkTransactions();
    fetchFeatures();
    fetchProcessesOfProject();
    fetchAllProcesses();
  }, [selectedProject]);

  useEffect(() => {
    setSelectedProcessIds(projectProcesses.map(process => process.id));
  }, [projectProcesses]);

  const handleProcessSelect = (processId) => {
    if (isTransactionExists) return;
    const process = allProcesses.find(p => p.id === processId);

    setSelectedProcessIds((prev) => {
      const newSelection = prev.includes(processId)
        ? prev.filter(id => id !== processId)
        : [...prev, processId];

      if (prev.includes(processId)) {
        setRemovedProcessIds((prevRemoved) => [...prevRemoved, processId]);
      } else {
        setRemovedProcessIds((prevRemoved) => prevRemoved.filter(id => id !== processId));
      }

      const updatedProcesses = allProcesses.filter(process => newSelection.includes(process.id));
      const existingIds = new Set(projectProcesses.map(p => p.id));
      const processesToAdd = updatedProcesses.filter(p => !existingIds.has(p.id));
      const processesToRemove = projectProcesses.filter(p => !newSelection.includes(p.id));

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
    const projectProcessesToSubmit = projectProcesses.map((process, index) => {
      const matchingProcess = allProcesses.find(p => p.name === process.name);

      return {
        id: process.id,
        projectId: selectedProject,
        processId: matchingProcess ? matchingProcess.id : process.id,
        weightage: process.relativeWeightage,
        sequence: index+1,
        featuresList: process.installedFeatures,
        userId: process.userId || []
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
      message.error('Error updating processes. Please try again.');
    } finally {
      setRemovedProcessIds([]);
    }
  };

  const handleEdit = (process) => {
    setEditingProcessId(process.id);
    setEditingFeatures(process.installedFeatures);
    setPreviousFeatures(process.installedFeatures);
  };

  const handleCancelEdit = () => {
    setEditingProcessId(null);
    setEditingFeatures(previousFeatures);
  };

  const handleFeatureChange = (value) => {
    setEditingFeatures(value);
  };

  const handleSaveFeatures = async (processId) => {
    const updatedProcess = {
      projectId: selectedProject,
      processId: processId,
      featuresList: editingFeatures,
    };

    try {
      await API.post('/ProjectProcess/UpdateProcessFeatures', updatedProcess);

      setProjectProcesses((prevProcesses) => {
        return prevProcesses.map(process => {
          if (process.id === processId) {
            return { ...process, installedFeatures: editingFeatures };
          }
          return process;
        });
      });
      message.success('Features updated successfully!');
    } catch (error) {
      message.error('Error updating features. Please try again.');
    } finally {
      setEditingProcessId(null);
      setEditingFeatures([]);
    }
  };

  const onSortEnd = useCallback(({ oldIndex, newIndex }) => {
    if (isTransactionExists) return;
    
    const process = projectProcesses[oldIndex];
    const processWithRange = independentProcesses.find(p => p.id === process.id);
    
    if (processWithRange?.rangeStart && processWithRange?.rangeEnd) {
      const rangeStartIndex = projectProcesses.findIndex(p => p.id === processWithRange.rangeStart);
      const rangeEndIndex = projectProcesses.findIndex(p => p.id === processWithRange.rangeEnd);
      
      if (newIndex <= rangeStartIndex || newIndex >= rangeEndIndex) {
        message.error(`This process must be positioned between ${projectProcesses[rangeStartIndex]?.name} and ${projectProcesses[rangeEndIndex]?.name}`);
        return;
      }
    }
    
    setProjectProcesses(prevProcesses => {
      const newProcesses = arrayMove(prevProcesses, oldIndex, newIndex);
      return calculatedWeightage(newProcesses);
    });
  }, [projectProcesses, independentProcesses, isTransactionExists]);

  if (loading || projectProcesses.length === 0) {
    return <Spin tip="Loading..." />;
  }

  return (
    <div>
      <h4>Project: {projectName}</h4>

      <Collapse defaultActiveKey={['1']}>
        <Panel header="Manage Processes" key="1">
          {allProcesses.map(process => (
            <Checkbox
              key={process.id}
              checked={selectedProcessIds.includes(process.id)}
              onChange={() => handleProcessSelect(process.id)}
              disabled={requiredProcessIds.includes(process.id) || isTransactionExists}
            >
              {process.name}
            </Checkbox>
          ))}
        </Panel>
      </Collapse>

      <div style={{ padding: '10px', overflowX: 'auto' }}>
        <table className="table table-striped table-bordered" style={{ minWidth: '800px', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '5px', textAlign: 'left', width: '20%' }}>Process Name</th>
              <th style={{ padding: '5px', textAlign: 'left', width: '30%' }}>Installed Features</th>
              <th style={{ padding: '5px', textAlign: 'left', width: '15%' }}>Weightage</th>
              <th style={{ padding: '5px', textAlign: 'left', width: '15%' }}>Relative Weightage</th>
              <th style={{ padding: '5px', textAlign: 'left', width: '20%' }}>Action</th>
            </tr>
          </thead>
          <SortableBody
            onSortEnd={onSortEnd}
            axis="y"
            lockAxis="y"
            lockToContainerEdges={true}
            lockOffset={["30%", "50%"]}
            useDragHandle={true}
            helperClass="row-dragging"
            disabled={isTransactionExists}
          >
            {projectProcesses.map((process, index) => (
              <SortableRow
                key={process.id}
                index={index}
                process={process}
                features={features}
                editingProcessId={editingProcessId}
                editingFeatures={editingFeatures}
                handleFeatureChange={handleFeatureChange}
                handleSaveFeatures={handleSaveFeatures}
                handleCancelEdit={handleCancelEdit}
                handleEdit={handleEdit}
                independentProcesses={independentProcesses}
                disabled={isTransactionExists}
              />
            ))}
          </SortableBody>
        </table>
      </div>

      <Button 
        type="primary" 
        onClick={handleSubmit} 
        style={{ marginTop: '16px' }}
        disabled={isTransactionExists}
      >
        Submit Processes
      </Button>

      <style>
        {`
          .row-dragging {
            background: #fafafa;
            border: 1px solid #ccc;
            z-index: 9999;
          }
          .row-dragging td {
            padding: 16px;
            visibility: visible !important;
          }
          .row-dragging .drag-visible {
            visibility: visible !important;
          }
        `}
      </style>
    </div>
  );
};

export default AddProjectProcess;
