import React, { useState, useEffect } from 'react';
import { useStore } from 'zustand';
import themeStore from './../store/themeStore';
import { Row, Col, Card, Table, DatePicker, Select, Progress, Spin } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import API from '../CustomHooks/MasterApiHooks/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const { getCssClasses } = useStore(themeStore);
  const [
    customDark,
    customMid,
    customLight,
    ,
    customDarkText,
    customLightText,
    customLightBorder,
    customDarkBorder
  ] = getCssClasses();

  const [projectData, setProjectData] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [reportType, setReportType] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [dateRange, reportType]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const response = await API.get('/Projects/status', {
        params: {
          startDate: dateRange[0]?.format('YYYY-MM-DD'),
          endDate: dateRange[1]?.format('YYYY-MM-DD'),
          reportType: reportType
        }
      });
      setProjectData(response.data);
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Project Name', dataIndex: 'name', key: 'name' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
    { title: 'Completion Date', dataIndex: 'completionDate', key: 'completionDate' },
    { 
      title: 'Progress', 
      dataIndex: 'progress', 
      key: 'progress',
      render: (progress) => <Progress percent={progress} />
    },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const chartData = projectData.map(project => ({
    name: project.name,
    progress: project.progress
  }));

  return (
    <div className={`${customDark === 'dark-dark' ? 'text-white' : customDarkText}`}>
      <h1>Project Reports</h1>
      <Row gutter={16} style={{ marginBottom: '20px' }}>
        <Col span={12}>
          <RangePicker onChange={(dates) => setDateRange(dates)} />
        </Col>
        <Col span={12}>
          <Select defaultValue="monthly" style={{ width: 120 }} onChange={(value) => setReportType(value)}>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="yearly">Yearly</Option>
          </Select>
        </Col>
      </Row>
      <Spin spinning={loading}>
        <Row gutter={16}>
          <Col span={24}>
            <Card title="Project Progress Overview">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="progress" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={24}>
            <Card title="Project Status Details">
              <Table columns={columns} dataSource={projectData} />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default Reports;
