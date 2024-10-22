import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form, Upload, Button, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import ViewQuantitySheet from './ViewQuantitySheet';

import API from '../CustomHooks/MasterApiHooks/api';


const QtySheetUpload = () => {
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const customDarkText = cssClasses[4];
    const customBtn = cssClasses[3];
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


    const handleUpload = async () => {
        setUploading(true);
        const mappedData = await createMappedData();

        if (!mappedData || !Array.isArray(mappedData) || mappedData.length === 0) {
            console.error("Mapped data is invalid or empty.");
            setUploading(false);
            return;
        }

        const finalPayload = mappedData.map(item => ({
            catchNo: item.CatchNo || "",
            paper: item.Paper || "",
            course: item.Course || "",
            subject: item.Subject || "",
            innerEnvelope: item.InnerEnvelope || "",
            outerEnvelope: item.OuterEnvelope || "",
            lotNo: item.LotNo,
            quantity: Number(item.Quantity) || 0,
            percentageCatch: Number(item.percentageCatch) || 0,
            projectId: 2,
            isOverridden: item.isOverridden === 'true',
            processId: [0],
        }));

        console.log("Final payload:", JSON.stringify(finalPayload, null, 2));

        try {

            const response = await API.post('/QuantitySheet', finalPayload, {

                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Upload successful:', response.data);
            setDataSource(finalPayload);
            message.success('Quantity Sheet uploaded successfully')
            fetchLots();
            resetState();
        } catch (error) {
            console.error('Upload failed', error.response?.data || error.message);
            message.error('Failed to upload quantity sheet')
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
                        rowData[property] = index !== -1 ?
                            (property === 'quantity' ? parseFloat(row[index]) || 0 : String(row[index])) : '';
                    }
                    console.log("Row Data Mapped:", rowData);
                    rowData['projectId'] = 2;
                    rowData['isOverridden'] = 'false';
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
            console.error('Failed to fetch columns', error);
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
                console.warn("No valid data found in the file.");
                return;
            }
    
            const excelHeaders = filteredData[0];
            setHeaders(excelHeaders);
            setShowMappingFields(true);
    
            const autoMappings = {};
            columns.forEach((col) => {
                if (col) { // Check if col is defined
                    const matchingHeader = excelHeaders.find(header => header?.toLowerCase() === col?.toLowerCase());
                    autoMappings[col] = matchingHeader || '';
                } else {
                    console.warn("Column is undefined or null:", col);
                }
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

            const response = await API.get('/QuantitySheet/Lots?ProjectId=2')

            setLots(response.data)
        }
        catch (error) {
            console.error('Failed to fetch Lots')
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
        <div className={`container ${customDarkText} rounded shadow-lg`}>
            <Row className='mt-2 mb-2'>
                <Col lg={12} className='d-flex justify-content-center'>
                    <h1 className={`text-center p-2 mt-3 rounded w-50 ${customDarkText}`}>Upload Quantity Sheet</h1>
                </Col>
            </Row>

            <Row className='mt-2 mb-2'>
                <Col lg={12}>
                    <Form layout="vertical" form={form}>
                        <Form.Item name="file" rules={[{ required: true, message: 'Please select a file' }]}>
                            <Upload
                                onRemove={(file) => {
                                    const index = fileList.indexOf(file);
                                    const newFileList = fileList.slice();
                                    newFileList.splice(index, 1);
                                    setFileList(newFileList);
                                }}
                                beforeUpload={handleFileUpload}
                                fileList={fileList}
                            >
                                <Button className='fs-5 custom-zoom-btn'>
                                    <UploadOutlined className='me-2' /> Select File
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
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {lots.map((lotNo, index) => (
                                <Button
                                    key={index}

                                    className={`${customBtn} me-2`}
                                    type="primary"
                                    onClick={() => handleLotClick(lotNo)}
                                >
                                    Click to view lot {lotNo}
                                </Button>
                            ))}

                            <ViewQuantitySheet selectedLotNo={selectedLotNo} showBtn={showBtn} showTable={showTable} />

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
                                    <th>Fields</th>
                                    <th>Excel Header</th>
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
