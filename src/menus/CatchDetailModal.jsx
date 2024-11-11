import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Typography, message } from 'antd';
import { AudioOutlined, AudioMutedOutlined } from '@ant-design/icons';
import API from '../CustomHooks/MasterApiHooks/api';
import { hasPermission } from '../CustomHooks/Services/permissionUtils';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;
const { Text } = Typography;

const CatchDetailModal = ({ show, handleClose, data, processId, handleSave }) => {
    const { t } = useTranslation();
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioElement, setAudioElement] = useState(null);

    // Clean up audio when modal closes
    useEffect(() => {
        if (!show && audioElement) {
            audioElement.pause();
            setIsPlaying(false);
            setAudioElement(null);
        }
    }, [show, audioElement]);

    if (!show) return null;

    // Capitalize and format keys for better display
    const formatKey = (key) => {
        return key.replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase());
    };

    // Prepare data for the table
    const tableData = Object.keys(data || {})
        .filter(key => !['serialNumber', 'voiceRecording', 'teamUserNames', 'teamId', 'transactionId', 'srNo', 'projectId'].includes(key))
        .map((key, index) => {
            let value = data[key];
            if (key === 'team') {
                value = data.teamUserNames?.join(', ') || 'No team assigned';
            }
            return {
                key: index,
                label: formatKey(key),
                value: value || 'NA',
            };
        });

    // Add team members row
    if (data?.teamUserNames?.length) {
        tableData.push({
            key: 'team',
            label: 'Team Members',
            value: data.teamUserNames.join(', ')
        });
    }

    // Update handleAudioPlay function
    const handleAudioPlay = async (audioData) => {
        if (!audioData) {
            message.info('No audio recording available');
            return;
        }

        try {
            if (isPlaying && audioElement) {
                audioElement.pause();
                setIsPlaying(false);
                return;
            }

            // Convert base64 to blob
            const byteCharacters = atob(audioData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/wav' });

            // Create audio URL and play
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);

            // Add event listeners
            audio.onplay = () => setIsPlaying(true);
            audio.onpause = () => setIsPlaying(false);
            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };

            setAudioElement(audio);
            audio.play();
        } catch (error) {
            console.error('Error playing audio:', error);
            message.error('Failed to play audio recording');
            setIsPlaying(false);
        }
    };

    // Update the render function for the audio control
    const renderAudioControl = (voiceRecording) => {
        if (!voiceRecording) {
            return (
                <AudioMutedOutlined
                    style={{ fontSize: '18px', color: 'gray' }}
                    className='rounded-circle border p-2'
                />
            );
        }

        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isPlaying ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <AudioOutlined
                            style={{
                                fontSize: '18px',
                                cursor: 'pointer',
                                color: '#1890ff'
                            }}
                            onClick={() => handleAudioPlay(voiceRecording)}
                            className='rounded-circle border p-2 custom-theme-dark-btn'
                        />
                        <span
                            className="animate-pulse"
                            style={{
                                marginLeft: '8px',
                                color: '#1890ff',
                                fontSize: '12px'
                            }}
                        >
                            Playing...
                        </span>
                    </div>
                ) : (
                    <AudioOutlined
                        style={{ fontSize: '18px', cursor: 'pointer' }}
                        onClick={() => handleAudioPlay(voiceRecording)}
                        className='rounded-circle border p-2 custom-theme-dark-btn'
                    />
                )}
            </div>
        );
    };

    const handleResolve = async () => {
        try {
            await API.put(`/Transactions/${data.transactionId}`, {
                ...data,
                alarmId: "0"
            });
            handleSave("0");
            handleClose();
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

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
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <TextArea
                                    value={value}
                                    readOnly
                                    autoSize={{ minRows: 2, maxRows: 6 }}
                                    auto-sizing
                                    bordered={false}
                                    style={{ flex: 1, marginRight: '10px', overflow: 'hidden', wordWrap: 'break-word' }}
                                />
                                {record.label === 'Remarks' && renderAudioControl(data?.voiceRecording)}
                            </div>

                            {record?.label === 'Alerts' &&
                                value !== 'NA' && (
                                    <Button
                                        style={{ fontSize: '18px', cursor: 'pointer' }}
                                        onClick={handleResolve}
                                        className='d-flex align-items-center border p-2 custom-theme-dark-btn'

                                    >
                                        Resolve
                                    </Button>
                                )}

                        </>
                    );
                }
                return <Text>{value}</Text>;
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
            className="bg-light rounded"
        >
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                showHeader={false}
                bordered
            />
        </Modal>
    );
};

export default CatchDetailModal;
