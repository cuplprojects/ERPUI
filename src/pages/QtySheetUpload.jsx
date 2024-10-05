import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { Form, Upload, Button, Input, Select, Tag, message } from 'antd';
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
import { UploadOutlined } from '@ant-design/icons';
import { IoMdCloudDownload } from "react-icons/io";
const QtySheetUpload = () => {
    //Theme Change Section
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const customDark = cssClasses[0];
    const customMid = cssClasses[1];
    const customLight = cssClasses[2];
    const customBtn = cssClasses[3];
    const customDarkText = cssClasses[4];
    const customLightText = cssClasses[5];
    const customLightBorder = cssClasses[6];
    const customDarkBorder = cssClasses[7];

    const [fileList, setFileList] = React.useState([]);
    const [uploading, setUploading] = React.useState(false);
    const [multipleLanguages, setMultipleLanguages] = React.useState(false);
    const [selectedLanguages, setSelectedLanguages] = React.useState([]);
    const [showBookletOptions, setShowBookletOptions] = React.useState(false);
    const [form] = Form.useForm();

    const handleUpload = () => {
        form.validateFields().then((values) => {
            setUploading(true);
            // Add your upload logic here
            setTimeout(() => {
                setUploading(false);
            }, 2000);
        });
    };

    const props = {
        onRemove: (file) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file) => {
            if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type !== 'application/vnd.ms-excel' && file.type !== 'text/csv') {
                message.error({
                    content: 'Invalid File Type ! Upload Excel Files Only',
                    placement: 'top',
                });
                return false;
            }
            if (fileList.length === 0) {
                setFileList([file]);
            } else {
                setFileList([...fileList, file]);
            }
            return false;
        },
        fileList,
    };

    const handleDownloadTemplate = () => {
        const link = document.createElement('a');
        link.href = 'path_to_your_template_file.xlsx'; // local QS file 
        link.download = 'QtySheet-Input.xlsx';
        link.click();
    };

    return (
        <div className={`container ${customDarkText} ${customLight} ${customDark === "dark-dark" ? "border" : "border-0"} rounded shadow-lg`}>
            <Row className='mt-2 mb-2'>
                <Col lg={12} md={12} sm={12} xs={12} className='d-flex  justify-content-center'>

                    <h1 className={`text-center p-2 mt-3 rounded w-50  ${customDarkText} ${customDarkText} `}>Upload Quantity Sheet</h1>
                </Col>
            </Row>
            <Row>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Button type="primary" onClick={handleDownloadTemplate} className={`custom-zoom-btn ${customBtn} ${customDark === "dark-dark" ? "border-white" : "border-0"}`}>
                        <IoMdCloudDownload size={25} /> Download Template
                    </Button>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                </Col>
            </Row>
            <Row className='mt-2 mb-2'>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form form={form} onFinish={handleUpload} layout="vertical">
                        <Form.Item
                            className='d-flex align-items-center'
                            name="file"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (fileList.length === 0) {
                                            return Promise.reject('Please select a file');
                                        }
                                        if (value && !['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'application/vnd.ms-excel.sheet.macroEnabled.12', 'text/csv'].includes(value.type)) {
                                            return Promise.reject('Only Excel files (.xls, .xlsx, .xlsm, .csv) are allowed');
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <span className={`${customDarkText}`}>
                                <label className='fs-5 me-2 '>Upload File</label>
                            </span>
                            <Upload {...props}>
                                <Button className='fs-5 custom-zoom-btn'>
                                    <UploadOutlined className='me-2 ' /> Select File
                                </Button>
                            </Upload>
                        </Form.Item>
                        <Form.Item className={``}>
                            <Button
                                className={`${customBtn} ${customDark === "dark-dark" ? "border" : "border-0"} custom-zoom-btn`}
                                type="submit"
                                onClick={() => {
                                    if (fileList.length === 0) {
                                        message.error({
                                            content: 'Upload at least one file',
                                            placement: 'top',
                                        });
                                    } else {
                                        setUploading(true);
                                        handleUpload();
                                    }
                                }}
                                loading={uploading}
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                </Col>
            </Row>
            <Row className='mt- mb-2'>
                <Col lg={12} md={12} sm={12} xs={12} className='mb-3'>
                    <h4 className={`text-start p-2 ${customDarkText} ${customMid} rounded w-`}>Basic Details</h4>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Multiple Languages</span>}>
                            <Select
                                style={{ height: 40 }}
                                placeholder="Multi Language?"
                                onChange={(value) => {
                                    if (value === 'yes') {
                                        setMultipleLanguages(true);
                                    } else {
                                        setMultipleLanguages(false);
                                        setSelectedLanguages([]);
                                    }
                                }}
                            >
                                <Select.Option value="yes">Yes</Select.Option>
                                <Select.Option value="no">No</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                    {multipleLanguages ? (
                        <Form layout="vertical">
                            <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Select Languages</span>}>
                                <Select
                                    mode="multiple"
                                    style={{ height: 40 }}
                                    value={selectedLanguages}
                                    onChange={(value) => setSelectedLanguages(value)}
                                    options={[
                                        { value: 'Hindi', label: 'Hindi' },
                                        { value: 'English', label: 'English' },
                                    ]}
                                />
                            </Form.Item>
                        </Form>
                    ) : (
                        <Form layout="vertical">
                            <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Default Languages</span>}>
                                <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
                                    <div className="selected-languages">
                                        <Tag className='fs-5 p-2 custom-zoom-btn'>English</Tag>
                                    </div>
                                </div>
                            </Form.Item>
                        </Form>
                    )}
                </Col>
            </Row>
            <Row>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>No. Of Questions</span>}>
                            <Select
                                style={{ height: 40 }}
                                placeholder="Select No. Of Questions"
                                onChange={(value) => {
                                }}
                            >
                                <Select.Option value="50">50</Select.Option>
                                <Select.Option value="75">75</Select.Option>
                                <Select.Option value="100">100</Select.Option>
                                <Select.Option value="150">150</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Select Type</span>}>
                            <Select
                                style={{ height: 40 }}
                                placeholder="Select Type"
                                onChange={(value) => {
                                    if (value === 'Booklet') {
                                        setShowBookletOptions(true);
                                    } else {
                                        setShowBookletOptions(false);
                                    }
                                }}
                            >
                                <Select.Option value="Paper">Paper</Select.Option>
                                <Select.Option value="Booklet">Booklet</Select.Option>
                                <Select.Option value="Books">Books</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Key Provided</span>}>
                            <Select
                                style={{ height: 40 }}
                                placeholder="Select Key Provided"
                                onChange={(value) => {
                                }}
                                disabled={!showBookletOptions}
                            >
                                <Select.Option value="yes" disabled={!showBookletOptions}>Yes</Select.Option>
                                <Select.Option value="no" disabled={!showBookletOptions}>No</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Col>
                <Col lg={6} md={6} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>No of series to be printed</span>}>
                            <Select
                                style={{ height: 40 }}
                                placeholder="Select No of series to be printed"
                                onChange={(value) => {
                                }}
                                disabled={!showBookletOptions}
                            >
                                <Select.Option value="1" disabled={!showBookletOptions}>1</Select.Option>
                                <Select.Option value="2" disabled={!showBookletOptions}>2</Select.Option>
                                <Select.Option value="3" disabled={!showBookletOptions}>3</Select.Option>
                                <Select.Option value="4" disabled={!showBookletOptions}>4</Select.Option>
                            </Select>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            <Row>
                <Col lg={4} md={4} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Duration of Exam</span>}>
                            <Row>
                                <Col lg={6} md={6} sm={12} xs={12}>
                                    <Form.Item>
                                        <Input
                                            type="number"
                                            placeholder="Hours"
                                            style={{ width: '100%', height: 40 }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col lg={6} md={6} sm={12} xs={12}>
                                    <Form.Item>
                                        <Input
                                            type="number"
                                            placeholder="Minutes"
                                            style={{ width: '100%', height: 40 }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>
                </Col>
                <Col lg={4} md={4} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Maximum Marks</span>}>
                            <Input
                                type="number"
                                placeholder="Maximum Marks"
                                style={{ width: '100%', height: 40 }}
                            />
                        </Form.Item>
                    </Form>
                </Col>
                <Col lg={4} md={4} sm={12} xs={12}>
                    <Form layout="vertical">
                        <Form.Item label={<span className={`text-capitalize ${customDarkText} fs-5`}>Select Course</span>}>
                            <Select
                                style={{ width: '100%', height: 40 }}
                                placeholder="Select Course"
                                onChange={(value) => {
                                    // handle change logic here
                                }}
                            >
                                <Select.Option value="Course 1">Course 1</Select.Option>
                                <Select.Option value="Course 2">Course 2</Select.Option>
                                <Select.Option value="Course 3">Course 3</Select.Option>
                                {/* add more options here */}
                            </Select>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            {/* row 7 */}
            <Row>
                <Col lg={12} md={12} sm={12} xs={12} className='d-flex justify-content-center'>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className={`custom-zoom-btn ${customBtn} ${customDark === "dark-dark" ? "border" : "border-0"}`}
                            onClick={() => {
                                // for now, route to /dashboard
                                window.location.href = '/dashboard';
                            }}
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Col>
            </Row>
        </div>
    );
};

export default QtySheetUpload;