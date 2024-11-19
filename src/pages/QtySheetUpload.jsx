import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form, Upload, Button, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import ViewQuantitySheet from './ViewQuantitySheet';
import { useParams } from 'react-router-dom';
import { IoMdEye } from "react-icons/io";
import API from '../CustomHooks/MasterApiHooks/api';
import { useTranslation } from 'react-i18next';
import { decrypt } from '../Security/Security';
import { BsCheckCircleFill } from "react-icons/bs";

// Helper function to convert Excel date number to JS Date
const convertExcelDate = (excelDate) => {
    if (!excelDate) return null;
    
    // Check if excelDate is a number (Excel serial date)
    if (!isNaN(excelDate)) {
        // Excel dates are number of days since 1/1/1900
        return new Date((excelDate - 25569) * 86400 * 1000);
    }
    
    // If it's already a date string, parse it
    return new Date(excelDate);
};

const QtySheetUpload = () => {
    const { t } = useTranslation();
    const { encryptedProjectId } = useParams();
    const projectId = decrypt(encryptedProjectId);
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const [customDark, customMid, customLight, customBtn, customDarkText, customLightText, customLightBorder, customDarkBorder] = cssClasses;
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [columns, setColumns] = useState([]);
    const [form] = Form.useForm();
    const [headers, setHeaders] = useState([]);
    const [fieldMappings, setFieldMappings] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [showMappingFields, setShowMappingFields] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showBtn, setShowBtn] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [lots, setLots] = useState([]);
    const [selectedLotNo, setSelectedLotNo] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [dispatchedLots, setDispatchedLots] = useState([]);

    useEffect(() => {
        const fetchProjectName = async () => {
            try {
                const response = await API.get(`/Project/${projectId}`);
                setProjectName(response.data.name);
            } catch (error) {
                console.error(t('failedToFetchProjectName'), error);
            }
        };

        fetchProjectName();
    }, [projectId]);

    useEffect(() => {
        const fetchDispatchedLots = async () => {
            try {
                const response = await API.get(`/Dispatch/project/${projectId}`);
                const dispatchedLotNos = response.data.map(dispatch => dispatch.lotNo);
                setDispatchedLots(dispatchedLotNos);
            } catch (error) {
                console.error('Failed to fetch dispatched lots:', error);
            }
        };

        fetchDispatchedLots();
    }, [projectId]);

    const handleUpload = async () => {
        setUploading(true);
        const mappedData = await createMappedData();

        if (!mappedData || !Array.isArray(mappedData) || mappedData.length === 0) {
            console.error(t('mappedDataInvalidOrEmpty'));
            setUploading(false);
            return;
        }

        const finalPayload = mappedData.map(item => {
            // Convert Excel date to proper date format
            const examDate = item.ExamDate ? convertExcelDate(item.ExamDate) : null;
            
            return {
                catchNo: item.CatchNo || "",
                paper: item.Paper || "",
                course: item.Course || "",
                subject: item.Subject || "",
                innerEnvelope: item.InnerEnvelope || "",
                outerEnvelope: item.OuterEnvelope || "",
                examDate: examDate ? examDate.toISOString() : "",
                examTime: item.ExamTime || "",
                lotNo: item.LotNo || "",
                quantity: Number(item.Quantity) || 0,
                percentageCatch: Number(item.percentageCatch) || 0,
                projectId: projectId,
                processId: [0],
            };
        });

        console.log(t('finalPayload'), JSON.stringify(finalPayload, null, 2));

        try {
            const response = await API.post('/QuantitySheet', finalPayload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(t('uploadSuccessful'), response.data);
            setDataSource(finalPayload);
            message.success(t('quantitySheetUploadedSuccessfully'))
            fetchLots();
            resetState();
        } catch (error) {
            console.error(t('uploadFailed'), error.response?.data || error.message);
            message.error(t('failedToUploadQuantitySheet'))
        } finally {
            setUploading(false);
        }
    };

    const createMappedData = async () => {
        const reader = new FileReader();
        return new Promise((resolve) => {
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
                const rows = jsonData.slice(1);
                const mappedData = rows.map((row) => {
                    const rowData = {};
                    for (let property in fieldMappings) {
                        const header = fieldMappings[property];
                        const index = jsonData[0].indexOf(header);
                        let value = index !== -1 ? row[index] : '';
                        
                        // Handle special cases
                        if (property === 'quantity') {
                            value = parseFloat(value) || 0;
                        } else if (property === 'examdate' && value) {
                            // Keep the raw value for later conversion
                            value = value;
                        } else {
                            value = String(value || '');
                        }
                        
                        rowData[property] = value;
                    }
                    
                    console.log(t('rowDataMapped'), rowData);
                    rowData['projectId'] = projectId;
                    rowData['percentageCatch'] = '0';
                    return rowData;
                });
                resolve(mappedData);
            };
            reader.readAsArrayBuffer(selectedFile);
        });
    };

    const getColumns = async () => {
        try {
            const response = await API.get('/QuantitySheet/Columns');
            setColumns(response.data);
        } catch (error) {
            console.error(t('failedToFetchColumns'), error);
        }
    };

    useEffect(() => {
        getColumns();
        fetchLots();
    }, []);

    const handleFileUpload = (file) => {
        setFileList([file]);
        setSelectedFile(file);
        processFile(file);
        return false;
    };

    const processFile = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
    
            // Convert the sheet to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
            // Filter out rows where all cells are empty
            const filteredData = jsonData.filter(row => row.some(cell => cell !== null && cell !== ''));
    
            if (filteredData.length === 0) {
                console.warn(t('noValidDataFoundInFile'));
                return;
            }
    
            const excelHeaders = filteredData[0];
            setHeaders(excelHeaders);
            setShowMappingFields(true);
    
            const autoMappings = {};
            columns.forEach((col) => {
                const matchingHeader = excelHeaders.find(header => header?.toLowerCase() === col?.toLowerCase());
                autoMappings[col] = matchingHeader || '';
            });
    
            setFieldMappings(autoMappings);
        };
        reader.readAsArrayBuffer(file);
    };
    
    const handleMappingChange = (property, value) => {
        setFieldMappings(prev => ({ ...prev, [property]: value }));
    };

    const getAvailableOptions = (property) => {
        const selectedValues = Object.values(fieldMappings);
        return headers
            .filter(header => !selectedValues.includes(header))
            .map(header => ({ label: header, value: header }));
    };

    const resetState = () => {
        setFieldMappings({});
        setHeaders([]);
        setShowMappingFields(false);
        setSelectedFile(null);
        setFileList([]);
        setShowTable(false);
    };

    const fetchLots = async () => {
        try {
            const response = await API.get(`/QuantitySheet/Lots?ProjectId=${projectId}`)
            setLots(response.data)
        }
        catch (error) {
            console.error(t('failedToFetchLots'))
        }
    }

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = 'path_to_your_template_file.xlsx'; // local QS file 
        link.download = 'QtySheet-Input.xlsx';
        link.click();
    };

    const handleLotClick = (lotNo) => {
        if (selectedLotNo === lotNo) {
            setShowTable(!showTable); // Toggle table visibility
            setShowBtn(!showBtn)
        } else {
            setSelectedLotNo(lotNo);
            setShowTable(true); // Show table for the selected lot
            setShowBtn(true);
        }
    };

    return (
        <div className={`container ${customDarkText} rounded shadow-lg ${customLight} ${customLightBorder}`}>
            <Row className='mt-2 mb-2'>
                <Col lg={12} className='d-flex justify-content-center'>
                    <div className="d-flex flex-column align-items-center">
                        <div className="text-center p-2 mt-3 rounded">
                            <h1 className={`${customDarkText}`}>{t('uploadQuantitySheet')}</h1>
                        </div>
                        <div className="text-center">
                            <h2 className={`${customDarkText} custom-zoom-btn `}>{projectName}</h2>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className='mt-2 mb-2'>
                <Col lg={12}>
                    <Form layout="vertical" form={form}>
                        <Form.Item name="file" rules={[{ required: true, message: t('pleaseSelectAFile') }]}>
                            <Upload
                                onRemove={(file) => {
                                    const index = fileList.indexOf(file);
                                    const newFileList = fileList.slice();
                                    newFileList.splice(index, 1);
                                    setFileList(newFileList);
                                }}
                                beforeUpload={handleFileUpload}
                                fileList={fileList}
                                className=''
                            >
                                <Button className='fs-4 custom-zoom-btn w-100 d-flex align-items-center p-3'>
                                    <UploadOutlined className='' />
                                    <span className='d-none d-sm-inline'>{t('selectFile')}</span>
                                    <span className='d-inline d-sm-none'>{t('upload')}</span>
                                </Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item>
                            {fileList.length > 0 && (  // Check if any file is selected
                                <Button
                                    className={`${customBtn}`}
                                    type="primary"
                                    onClick={handleUpload}
                                    loading={uploading}
                                >
                                    {uploading ? t('uploading') : t('upload')}
                                </Button>
                            )}
                        </Form.Item>
                        <Form.Item>
                            <div className="d-flex flex-wrap gap-2">
                                {lots.map((lotNo, index) => {
                                    const isDispatched = dispatchedLots.includes(lotNo);
                                    return (
                                        <Button
                                            key={index}
                                            className={`${selectedLotNo === lotNo ? 'bg-white text-dark border-dark' : customBtn} ${customDark === "dark-dark" ? 'border' : 'custom-light-border'} d-flex align-items-center justify-content-center p-3 `}
                                            type="primary"
                                            onClick={() => handleLotClick(lotNo)}
                                        >
                                            {t('lot')} - {lotNo} {' '}
                                            {isDispatched ? (
                                                <BsCheckCircleFill className="ms-1 text-success" />
                                            ) : (
                                                <IoMdEye className={`ms-1 ${selectedLotNo === lotNo ? '' : ''}`} />
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                            <div className="">
                                <ViewQuantitySheet project={projectId} selectedLotNo={selectedLotNo} showBtn={showBtn} showTable={showTable} lots={lots}/>
                            </div>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>

            {showMappingFields && headers.length > 0 && (
                <Row className='mt-2 mb-2'>
                    <Col lg={12}>
                        <table className="table table-bordered">
                            <thead>
                                <tr>
                                    <th>{t('fields')}</th>
                                    <th>{t('excelHeader')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(fieldMappings).map((property) => (
                                    <tr key={property}>
                                        <td>{property}</td>
                                        <td>
                                            <Select
                                                value={fieldMappings[property]}
                                                onChange={(value) => handleMappingChange(property, value)}
                                                options={getAvailableOptions(property)}
                                                style={{ width: '100%' }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default QtySheetUpload;
