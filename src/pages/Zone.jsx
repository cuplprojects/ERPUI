import React, { useEffect, useState } from 'react';
import { Input, Button, Select, Table, Form, message, Modal } from 'antd';
const { Option } = Select;
import API from '../CustomHooks/MasterApiHooks/api';

const Zone = () => {
  const [zones, setZones] = useState([]);
  const [camera, setCamera] = useState([]);
  const [machine, setMachine] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingZone, setEditingZone] = useState({});
  const [originalZone, setOriginalZone] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getCamera(), getMachine()]);
      await getZone();
    };

    fetchData();
  }, []);

  const getZone = async () => {
    try {
      const response = await API.get('/Zones');
      setZones(response.data);
    } catch (error) {
      console.error("Failed to fetch zones", error);
    }
  };

  const getCamera = async () => {
    try {
      const response = await API.get('/Cameras');
      setCamera(response.data);
    } catch (error) {
      console.error("Failed to fetch cameras", error);
    }
  };

  const getMachine = async () => {
    try {
      const response = await API.get('/Machines');
      setMachine(response.data);
    } catch (error) {
      console.error("Failed to fetch machines", error);
    }
  };

  const handleAddZone = async (values) => {
    const { zoneNo, zoneDescription, cameraIds, machineId } = values;
    const existingZone = zones.find(zone => zone.zoneNo === zoneNo);
    if (existingZone) {
      message.error('Zone Name already exists!');
      return;
    }

    const newZone = {
      zoneNo,
      zoneDescription,
      cameraIds: Array.isArray(cameraIds) ? cameraIds : [cameraIds],
      machineId: Array.isArray(machineId) ? machineId : [machineId],
    };

    try {
      await API.post('/Zones', newZone);
      getZone();
      form.resetFields();
      setIsModalVisible(false);
      message.success('Zone added successfully!');
    } catch (error) {
      console.error("Failed to add zone", error);
      message.error('Failed to add zone. Please try again.');
    }
  };

  const handleEditZone = async (index) => {
    const updatedZone = {
      ...originalZone,
      ...editingZone,
      cameraIds: editingZone.cameraIds || originalZone.cameraIds,
      machineId: editingZone.machineId || originalZone.machineId,
    };

    const existingZone = zones.find(zone => zone.zoneNo === updatedZone.zoneNo && zone.zoneNo !== originalZone.zoneNo);
    if (existingZone) {
      message.error('Zone Name already exists!');
      return;
    }

    try {
      await API.put(`/Zones/${originalZone.zoneId}`, updatedZone);
      const updatedZones = [...zones];
      updatedZones[index] = updatedZone;
      setZones(updatedZones);
      getZone();
      message.success('Zone updated successfully!');
    } catch (error) {
      console.error("Failed to update zone", error);
      message.error('Failed to update zone. Please try again.');
    } finally {
      setEditingIndex(null);
      setEditingZone({});
      setOriginalZone({});
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingZone({});
    setOriginalZone({});
  };

  const columns = [
    {
      title: 'SN.',
      key: 'serial',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Zone Name',
      dataIndex: 'zoneNo',
      key: 'zoneNo',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input
            value={editingZone.zoneNo || record.zoneNo}
            onChange={(e) => setEditingZone({ ...editingZone, zoneNo: e.target.value })}
            onPressEnter={() => handleEditZone(index)}
            onBlur={() => handleEditZone(index)}
          />
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ zoneNo: record.zoneNo });
            setOriginalZone(record);
          }}>{text}</span>
        )
      ),
    },
    {
      title: 'Zone Description',
      dataIndex: 'zoneDescription',
      key: 'zoneDescription',
      render: (text, record, index) => (
        editingIndex === index ? (
          <Input.TextArea
            value={editingZone.zoneDescription || record.zoneDescription}
            onChange={(e) => setEditingZone({ ...editingZone, zoneDescription: e.target.value })}
            onPressEnter={() => handleEditZone(index)}
            onBlur={() => handleEditZone(index)}
          />
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ zoneDescription: record.zoneDescription });
            setOriginalZone(record);
          }}>{text}</span>
        )
      ),
    },
    {
      title: 'Assign Camera Names',
      dataIndex: 'cameraNames',
      key: 'cameraNames',
      render: (cameraNames, record, index) => (
        editingIndex === index ? (
          <Select
            mode="multiple"
            value={editingZone.cameraIds || record.cameraIds}
            onChange={(value) => setEditingZone({ ...editingZone, cameraIds: value })}
            onBlur={() => handleEditZone(index)}
          >
            {camera.map(c => (
              <Option key={c.cameraId} value={c.cameraId}>
                {c.name}
              </Option>
            ))}
          </Select>
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ cameraIds: record.cameraIds });
            setOriginalZone(record);
          }}>{cameraNames.join(', ')}</span>
        )
      ),
    },
    {
      title: 'Assign Machine Names',
      dataIndex: 'machineNames',
      key: 'machineNames',
      render: (machineNames, record, index) => (
        editingIndex === index ? (
          <Select
            mode="multiple"
            value={editingZone.machineId || record.machineId}
            onChange={(value) => setEditingZone({ ...editingZone, machineId: value })}
            onBlur={() => handleEditZone(index)}
          >
            {machine.map(m => (
              <Option key={m.machineId} value={m.machineId}>
                {m.machineName}
              </Option>
            ))}
          </Select>
        ) : (
          <span onClick={() => {
            setEditingIndex(index);
            setEditingZone({ machineId: record.machineId });
            setOriginalZone(record);
          }}>{machineNames.join(', ')}</span>
        )
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        editingIndex === index ? (
          <>
            <Button type="link" onClick={() => handleEditZone(index)}>Save</Button>
            <Button type="link" onClick={handleCancelEdit}>Cancel</Button>
          </>
        ) : (
          <Button type="link" onClick={() => {
            setEditingIndex(index);
            setEditingZone({ 
              zoneNo: record.zoneNo, 
              zoneDescription: record.zoneDescription,
              cameraIds: record.cameraIds,
              machineId: record.machineId
            });
            setOriginalZone(record);
          }}>Edit</Button>
        )
      ),
    },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ marginBottom: '20px' }}>Zone</h2>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button type="primary" onClick={showModal}>
          Add Zone
        </Button>
      </div>

      <Table
        dataSource={zones.map((zone, index) => ({ ...zone, key: index }))}
        columns={columns}
        pagination={false}
        bordered
        style={{ marginTop: '20px' }}
      />

      <Modal
        title="Add Zone"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleAddZone} layout="vertical">
          <Form.Item name="zoneNo" label="Zone Name" rules={[{ required: true, message: 'Please input Zone Name!' }]}>
            <Input placeholder="Zone Name" />
          </Form.Item>
          <Form.Item name="zoneDescription" label="Zone Description" rules={[{ required: true, message: 'Please input Zone Description!' }]}>
            <Input.TextArea placeholder="Zone Description" />
          </Form.Item>
          <Form.Item name="cameraIds" label="Assign Camera ID" rules={[{ required: true, message: 'Please select Camera ID!' }]}>
            <Select mode="multiple" placeholder="Select Camera">
              {camera.map(c => (
                <Option key={c.cameraId} value={c.cameraId}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="machineId" label="Assign Machine ID" rules={[{ required: true, message: 'Please select Machine ID!' }]}>
            <Select mode="multiple" placeholder="Select Machine">
              {machine.map(m => (
                <Option key={m.machineId} value={m.machineId}>
                  {m.machineName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Zone
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Zone;
