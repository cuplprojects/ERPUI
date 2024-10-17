import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Table, Select, Input, Space, Button, Typography, Row, Col, Checkbox, Form, Dropdown, Menu, message, Switch } from 'antd';
import { Card, Modal } from 'react-bootstrap';
import { EyeOutlined, EditOutlined, SaveOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import API from '../CustomHooks/MasterApiHooks/api';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseSquare } from 'react-icons/ai';
import { BsFunnelFill } from "react-icons/bs";
import { useTranslation } from 'react-i18next';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';

const { Option } = Select;
const { Title } = Typography;

const Type = () => {
    const { t } = useTranslation();
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [types, setTypes] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [processMap, setProcessMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingType, setEditingType] = useState('');
    const [editingProcessIds, setEditingProcessIds] = useState([]);
    const [editingStatus, setEditingStatus] = useState(true);
    const [originalData, setOriginalData] = useState({});
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [visibleColumns, setVisibleColumns] = useState({
        status: true,
        associatedProcess: true,
    });
    const [columnSettingsVisible, setColumnSettingsVisible] = useState(false);

    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

    const fetchTypes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.get('/PaperTypes');
            setTypes(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchProcesses = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.get('/Processes');
            setProcesses(response.data);
            const map = response.data.reduce((acc, proc) => {
                acc[proc.id] = proc.name;
                return acc;
            }, {});
            setProcessMap(map);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTypes();
        fetchProcesses();
    }, [fetchTypes, fetchProcesses]);

    const handleAddType = useCallback(async (values) => {
        try {
            const response = await API.post('/PaperTypes', values);
            setTypes(prev => [...prev, response.data]);
            message.success(t("typeCreatedSuccessfully"));
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error(error);
            message.error('Failed to add Type')
        }
    }, [form, t]);

    const handleEditSave = useCallback(async (index) => {
        const updatedType = {
            ...types[index],
            types: editingType,
            associatedProcessId: editingProcessIds,
            status: editingStatus,
        };

        try {
            await API.put(`/PaperTypes/${updatedType.typeId}`, updatedType);
            const updatedTypes = [...types];
            updatedTypes[index] = updatedType;
            setTypes(updatedTypes);
            message.success(t('typeUpdatedSuccessfully'));
            setEditingIndex(null);
        } catch (error) {
            console.error(error);
            message.error(t('failedToUpdateType'));
        }
    }, [types, editingType, editingProcessIds, editingStatus, t]);

    const handleCancelEdit = useCallback(() => {
        setEditingIndex(null);
        setEditingType(originalData.types);
        setEditingProcessIds(originalData.associatedProcessId);
        setEditingStatus(originalData.status);
    }, [originalData]);

    const handleColumnVisibilityChange = useCallback((e, column) => {
        setVisibleColumns(prev => ({ ...prev, [column]: e.target.checked }));
    }, []);

    const columns = useMemo(() => [
        {
            title: t('sn'),
            dataIndex: 'serial',
            key: 'serial',
            render: (_, __, index) => index + 1,
            width: 80,
        },
        {
            title: t('type'),
            dataIndex: 'types',
            key: 'types',
            sorter: (a, b) => a.types.localeCompare(b.types),
            render: (text, record, index) => (
                editingIndex === index ? (
                    <Input
                        value={editingType}
                        onChange={(e) => setEditingType(e.target.value)}
                        onPressEnter={() => handleEditSave(index)}
                        onBlur={() => handleEditSave(index)}
                    />
                ) : (
                    <span>{text}</span>
                )
            ),
            width: 200,
        },
        visibleColumns.associatedProcess && {
            title: t('associatedProcess'),
            dataIndex: 'associatedProcessId',
            key: 'associatedProcessId',
            render: (ids, record, index) => (
                editingIndex === index ? (
                    <Select
                        mode="multiple"
                        value={editingProcessIds}
                        onChange={setEditingProcessIds}
                        style={{ width: '100%' }}
                        onBlur={() => handleEditSave(index)}
                    >
                        {processes.map(proc => (
                            <Option key={proc.id} value={proc.id}>
                                {proc.name}
                            </Option>
                        ))}
                    </Select>
                ) : (
                    ids.map(id => processMap[id]).join(', ')
                )
            ),
            width: 300,
        },
        visibleColumns.status && {
            title: t('status'),
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => (
                editingIndex === index ? (
                    <Switch
                        checked={editingStatus}
                        onChange={setEditingStatus}
                        onBlur={() => handleEditSave(index)}
                    />
                ) : (
                    <Switch checked={status} disabled />
                )
            ),
            width: 100,
        },
        {
            title: t('actions'),
            key: 'action',
            render: (_, record, index) => {
                const hasEditPermission = hasPermission('2.3.3');
                return (
                    editingIndex === index ? (
                        <Space>
                            <Button type="primary" onClick={() => handleEditSave(index)} disabled={!hasEditPermission} className={customBtn}>{t('save')}</Button>
                            <Button onClick={handleCancelEdit} disabled={!hasEditPermission}>{t('cancel')}</Button>
                        </Space>
                    ) : (
                        <Button onClick={() => {
                            if (hasEditPermission) {
                                setEditingIndex(index);
                                setEditingType(record.types);
                                setEditingProcessIds(record.associatedProcessId);
                                setEditingStatus(record.status);
                                setOriginalData(record);
                            }
                        }} disabled={!hasEditPermission}>{t('edit')}</Button>
                    )
                );
            },
            width: 150,
        },
    ].filter(Boolean), [visibleColumns, editingIndex, editingType, editingProcessIds, editingStatus, processes, processMap, handleEditSave, handleCancelEdit, t, customBtn]);

    const handleClose = useCallback(() => {
        setIsModalVisible(false);
        form.resetFields();
    }, [form]);

    const columnSettingsMenu = (
        <Menu>
            {Object.entries(visibleColumns).map(([column, isVisible]) => (
                <Menu.Item key={column}>
                    <Checkbox
                        checked={isVisible}
                        onChange={(e) => handleColumnVisibilityChange(e, column)}
                    >
                        {t(column)}
                    </Checkbox>
                </Menu.Item>
            ))}
        </Menu>
    );

    return (
        <div className={`p-${isMobile ? '2' : '4'} bg-white rounded shadow overflow-auto`}>
            <div className={`d-flex justify-content-between align-items-center mb-${isMobile ? '2' : '4'}`}>
                <Title level={3} className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`}`}>{t('projectType')}</Title>
                <Space>
                    <Input.Search
                        placeholder={t('searchTypes')}
                        onSearch={(value) => setSearchText(value)}
                        style={{ width: '300px' }}
                    />
                    <Dropdown overlay={columnSettingsMenu} trigger={['click']} visible={columnSettingsVisible} onVisibleChange={setColumnSettingsVisible}>
                        <Button icon={<SettingOutlined />} className={`${customDark === "dark-dark" ? "text-dark" : customDarkText} border-0`} />
                    </Dropdown>
                    {hasPermission('2.3.1') && (
                        <Button type="primary" onClick={() => setIsModalVisible(true)} className={customBtn}>
                            {t('addType')}
                        </Button>
                    )}
                </Space>
            </div>

            <Table
                dataSource={types.filter(type => 
                    type.types.toLowerCase().includes(searchText.toLowerCase())
                ).map((item, index) => ({ ...item, serial: index + 1 }))}
                columns={columns}
                rowKey="typeId"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
                bordered
                scroll={{ x: 'max-content' }}
                loading={loading}
                className={`thead-${customDark.split('-')[0]}`}
            />

            <Modal
                show={isModalVisible}
                onHide={handleClose}
                centered
                size={isMobile ? 'sm' : 'lg'}
            >
                <Modal.Header closeButton={false} className={`rounded-top-2 ${customDark} ${customLightText} ${customDark === "dark-dark" ? `border ` : `border-0`} border d-flex justify-content-between `}>
                    <Modal.Title>{t('addType')}</Modal.Title>
                    <AiFillCloseSquare
                        size={35}
                        onClick={handleClose}
                        className={`rounded-2 ${customDark === "dark-dark" ? "text-dark bg-white " : `${customDark} custom-zoom-btn text-white  ${customDarkBorder}`}`}
                        aria-label="Close"
                        style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                    />
                </Modal.Header>
                <Modal.Body className={`rounded-bottom-2 ${customMid} ${customDark === "dark-dark" ? `border border-top-0` : `border-0`}`}>
                    <Form
                        form={form}
                        onFinish={handleAddType}
                        layout="vertical"
                    >
                        <Form.Item
                            name="types"
                            label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t("type")}</span>}
                            rules={[
                                { required: true, message: t('pleaseInputType') },
                                {
                                    validator: (_, value) => {
                                        const isNumeric = /^\d+$/;
                                        if (value && isNumeric.test(value)) {
                                            return Promise.reject(new Error(t('typeCannotContainOnlyNumbers')));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input placeholder={t("type")} />
                        </Form.Item>
                        <Form.Item
                            name="associatedProcessId"
                            label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t("associatedProcess")}</span>}
                            rules={[{ required: true, message: t('pleaseSelectProcess') }]}
                        >
                            <Select mode="multiple" placeholder={t("selectProcess")}>
                                {processes.map(proc => (
                                    <Option key={proc.id} value={proc.id}>
                                        {proc.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="status" label={<span className={`${customDark === "dark-dark" || customDark === "blue-dark" ? `text-white` : `${customDarkText}`} fs-5 `}>{t("status")}</span>} valuePropName="checked" initialValue={true}>
                            <Switch
                                checkedChildren={t("active")}
                                unCheckedChildren={t("inactive")}
                                defaultChecked
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" className={`rounded-2 ${customBtn} ${customDark === "dark-dark" ? `` : `border-0`} custom-zoom-btn`}>
                                {t("submit")}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Type;
