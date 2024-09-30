import React from 'react';
import { Modal, Button, Table, Input, Typography } from 'antd';
import { AudioOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

const CatchDetailModal = ({ show, handleClose, data }) => {
    if (!show) return null;

    // Capitalize and format keys for better display
    const formatKey = (key) => {
        return key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    // Prepare data for the table
    const tableData = Object.keys(data).filter(key => key !== 'serialNumber').map((key, index) => ({
        key: index,
        label: formatKey(key),
        value: data[key] || 'No Remarks', // Ensure value is always provided
    }));

    // Define table columns
    const columns = [
        {
            title: 'Field',
            dataIndex: 'label',
            key: 'label',
            width: '30%',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Details',
            dataIndex: 'value',
            key: 'value',
            render: (value, record) => {
                if (record.label === 'Remarks' || record.label === 'Alerts') {
                    return (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <TextArea
                                value={value} // Ensure value is passed correctly
                                readOnly
                                autoSize={{ minRows: 2, maxRows: 6 }} // Allow auto-sizing for larger text
                                bordered={false}
                                style={{ flex: 1, marginRight: '10px', overflow: 'hidden', wordWrap: 'break-word' }} // Flex to take up space
                            />
                            {record.label === 'Remarks' && (
                                <AudioOutlined
                                    style={{ fontSize: '18px', cursor: 'pointer' }} // Mic icon aligned to the right
                                    onClick={() => console.log('Play audio')}
                                    className='rounded-circle border p-2 custom-theme-dark-btn'
                                />
                            )}
                        </div>
                    );
                } else {
                    return <Text>{value}</Text>;
                }
            },
        },
    ];

    return (
        <Modal
            open={show}
            onCancel={handleClose}
            footer={[
                <Button key="close" type="primary" onClick={handleClose} className='custom-theme-dark-btn'>
                    Close
                </Button>
            ]}
            centered
            title="Catch Details"
            width={600}
            className="bg-light rounded" // Apply background class
        >
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                showHeader={false}
                bordered
                // className=""
            />
        </Modal>
    );
};

export default CatchDetailModal;
