import React, { useState, useEffect } from "react";
import { Form, Table, Button } from "react-bootstrap";
import { Select } from "antd";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import API from "../../CustomHooks/MasterApiHooks/api";
import { BsPencilSquare } from 'react-icons/bs';

const UpdateQuantitySheet = ({ projectId, onClose }) => {
  const { t } = useTranslation();
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [mappedFields, setMappedFields] = useState({});
  const [excelData, setExcelData] = useState([]);
  const [updateMode, setUpdateMode] = useState(null);
  const [selectedLot, setSelectedLot] = useState(null);
  const [availableLots, setAvailableLots] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [selectedFieldsToUpdate, setSelectedFieldsToUpdate] = useState({});

  // Add constant for locked fields
  const LOCKED_FIELDS = ['CatchNo', 'LotNo', 'Quantity', 'Pages'];

  const fields = [
    { name: "CatchNo", type: "string" },
    { name: "LotNo", type: "string" },
    { name: "Paper", type: "string" },
    { name: "Course", type: "string" },
    { name: "Subject", type: "string" },
    { name: "ExamDate", type: "string" },
    { name: "ExamTime", type: "string" },
    { name: "InnerEnvelope", type: "string", multiSelect: true, makeIndividualColumns: true, colspan: true },
    { name: "OuterEnvelope", type: "string", multiSelect: true, makeIndividualColumns: true, colspan: true },
    { name: "Quantity", type: "string" },
    { name: "Pages", type: "string" },
  ];

  useEffect(() => {
    const fetchAvailableLots = async () => {
      try {
        const response = await API.get(`/QuantitySheet/Lots?ProjectId=${projectId}`);
        setAvailableLots(response.data);
      } catch (error) {
        console.error("Failed to fetch lots:", error);
      }
    };

    fetchAvailableLots();
  }, [projectId]);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const response = await API.get(`/QuantitySheet/CatchByproject?ProjectId=${projectId}`);
        setApiData(response.data);
      } catch (error) {
        console.error("Failed to fetch API data:", error);
      }
    };

    if (projectId) {
      fetchApiData();
    }
  }, [projectId]);

  const handleModeSelect = (mode) => {
    setUpdateMode(mode);
  };

  const handleLotSelect = (lot) => {
    setSelectedLot(lot);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const buffer = evt.target.result;
      const array = new Uint8Array(buffer);
      const binaryString = array.reduce((str, byte) => str + String.fromCharCode(byte), '');
      const wb = XLSX.read(binaryString, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Extract headers and data
      const headers = data[0];
      const rows = data.slice(1);
      
      setExcelHeaders(headers);
      setExcelData(rows);
      setMappedFields({}); // Reset mappings when new file is uploaded
    };

    reader.readAsArrayBuffer(file);
  };

  const handleHeaderMapping = (fieldName, excelHeader) => {
    setMappedFields({
      ...mappedFields,
      [fieldName]: excelHeader
    });
  };

  const getColumnData = (excelHeader) => {
    if (!excelHeader) return [];
    
    if (Array.isArray(excelHeader)) {
      // For multi-select fields, combine data from multiple columns
      return excelData.map(row => {
        return excelHeader
          .map(header => {
            const headerIndex = excelHeaders.indexOf(header);
            return row[headerIndex];
          })
          .filter(Boolean)
          .join(", ");
      });
    }

    // For single select fields
    const headerIndex = excelHeaders.indexOf(excelHeader);
    return excelData.map(row => row[headerIndex]);
  };

  // Update the handleFieldUpdateSelection to prevent changes to locked fields
  const handleFieldUpdateSelection = (fieldName) => {
    if (LOCKED_FIELDS.includes(fieldName)) {
      return; // Don't allow changes to locked fields
    }
    setSelectedFieldsToUpdate(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

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

  const handleSubmit = () => {
    const formattedData = excelData.map((row, index) => {
      const catchNoIndex = excelHeaders.indexOf(mappedFields['CatchNo']);
      const currentCatchNo = catchNoIndex !== -1 ? row[catchNoIndex]?.toString().trim() : null;
      const existingData = apiData.find(apiRow => 
        apiRow.catchNo?.toString().trim() === currentCatchNo
      );

      const examDate = convertExcelDate(getColumnData(mappedFields['ExamDate'])[index]);

      const rowData = {
        catchNo: currentCatchNo || "",
        paper: getColumnData(mappedFields['Paper'])[index]?.toString() || "",
        course: getColumnData(mappedFields['Course'])[index]?.toString() || "",
        subject: getColumnData(mappedFields['Subject'])[index]?.toString() || "",
        innerEnvelope: getColumnData(mappedFields['InnerEnvelope'])[index]?.toString() || "",
        outerEnvelope: Number(getColumnData(mappedFields['OuterEnvelope'])[index]) || 0,
        examDate: examDate ? examDate.toISOString() : "",
        examTime: getColumnData(mappedFields['ExamTime'])[index]?.toString() || "",
        lotNo: updateMode === 'lot' ? selectedLot : (getColumnData(mappedFields['LotNo'])[index]?.toString() || ""),
        quantity: Number(getColumnData(mappedFields['Quantity'])[index]) || 0,
        pages: Number(getColumnData(mappedFields['Pages'])[index]) || 0,
        percentageCatch: 0,
        projectId: projectId,
        processId: [0],
        status: 0,
        stopCatch: 0
      };

      // For existing catches, preserve original data for unselected fields
      if (existingData) {
        fields.forEach(field => {
          const key = field.name.charAt(0).toLowerCase() + field.name.slice(1);
          if (!selectedFieldsToUpdate[field.name]) {
            if (['quantity', 'outerEnvelope', 'pages'].includes(key)) {
              rowData[key] = Number(existingData[key]) || 0;
            } else if (key === 'examDate') {
              rowData[key] = existingData[key] || "";
            } else {
              rowData[key] = existingData[key]?.toString() || "";
            }
          }
        });
      }

      return rowData;
    });

    console.log('Formatted Data:', formattedData);
    // Here you would make your API call with formattedData
  };

  // Check if any fields have been mapped
  const hasAnyMappedFields = Object.keys(mappedFields).length > 0;

  // Add this function to filter data based on selected lot
  const getFilteredData = () => {
    if (!selectedLot || updateMode !== 'lot') {
      return excelData;
    }

    return excelData.filter((row, index) => {
      const lotNoHeader = mappedFields['LotNo'];
      if (!lotNoHeader) return true; // If LotNo mapping not set, show all data
      
      const lotNoIndex = excelHeaders.indexOf(lotNoHeader);
      if (lotNoIndex === -1) return true; // If header not found, show all data
      
      const rowLotNo = row[lotNoIndex]?.toString().trim();
      return rowLotNo === selectedLot.toString();
    });
  };

  const isMatchingCatch = (catchNo) => {
    if (!catchNo) return false;
    return apiData.some(apiRow => apiRow.catchNo?.toString().trim() === catchNo.toString().trim());
  };

  // Add a debug display for API data (optional, remove in production)
  useEffect(() => {
    if (apiData.length > 0) {
      console.log('API Data loaded:', apiData);
    }
  }, [apiData]);

  // Add clearFile handler
  const clearFile = () => {
    // Reset all related states
    setExcelHeaders([]);
    setMappedFields({});
    setExcelData([]);
    setSelectedFieldsToUpdate({});
    
    // Reset the file input by creating a ref
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row gap-3 p-3 bg-white shadow rounded">
            {/* Radio Buttons Group */}
            <div className="d-flex flex-column flex-sm-row justify-content-start gap-3">
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  id="lot-radio"
                  label={t("UpdateLotWise")}
                  name="updateMode"
                  checked={updateMode === 'lot'}
                  onChange={() => handleModeSelect('lot')}
                  className="fs-5"
                  style={{ 
                    transform: 'scale(1.05)',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  id="project-radio"
                  label={t("updateEntireProject")}
                  name="updateMode"
                  checked={updateMode === 'project'}
                  onChange={() => handleModeSelect('project')}
                  className="fs-5"
                  style={{ 
                    transform: 'scale(1.05)',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {/* Lot Select and File Upload Group */}
            <div className="d-flex flex-column flex-sm-row gap-3 flex-grow-1">
              {updateMode === 'lot' && (
                <div style={{ width: '250px' }}>
                  <Select
                    style={{ width: '100%' }}
                    placeholder={t("selectLot")}
                    onChange={handleLotSelect}
                    value={selectedLot}
                  >
                    {availableLots.map(lot => (
                      <Select.Option key={lot} value={lot}>
                        {t("lot")} - {lot}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="flex-grow-1 d-flex gap-2">
                <Form.Control
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={!updateMode || (updateMode === 'lot' && !selectedLot)}
                />
                {excelHeaders.length > 0 && (
                  <Button 
                    variant="outline-danger" 
                    onClick={clearFile}
                    title="Clear file"
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {(updateMode === 'project' || (updateMode === 'lot' && selectedLot)) && (
        <>
          {excelHeaders.length > 0 && (
            <div className="row">
              <div className="col-12">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      {fields.map((field) => {
                        if (field.colspan && mappedFields[field.name]) {
                          const selectedHeaders = Array.isArray(mappedFields[field.name]) 
                            ? mappedFields[field.name] 
                            : [mappedFields[field.name]];
                          return (
                            <th key={field.name} colSpan={selectedHeaders.length}>
                              <div className="d-flex align-items-center gap-2">
                                {field.name}
                                {!LOCKED_FIELDS.includes(field.name) && (
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedFieldsToUpdate[field.name] || false}
                                    onChange={() => handleFieldUpdateSelection(field.name)}
                                    label="Update existing"
                                  />
                                )}
                              </div>
                              <div>
                                <Select
                                  style={{ width: '100%' }}
                                  placeholder="Select Excel Header"
                                  onChange={(value) => handleHeaderMapping(field.name, value)}
                                  value={mappedFields[field.name]}
                                  mode={field.multiSelect ? "multiple" : undefined}
                                  virtual={false}
                                  listHeight={256}
                                >
                                  {excelHeaders.map((header) => (
                                    <Select.Option key={header} value={header}>
                                      {header}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </div>
                            </th>
                          );
                        }
                        return (
                          <th key={field.name}>
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                              {field.name}
                              {!LOCKED_FIELDS.includes(field.name) && (
                                <div className="d-flex align-items-center gap-1">
                                  <Form.Check
                                    type="checkbox"
                                    checked={selectedFieldsToUpdate[field.name] || false}
                                    onChange={() => handleFieldUpdateSelection(field.name)}
                                    className="m-0"
                                  />
                                  <BsPencilSquare size={14} title="Update existing" />
                                </div>
                              )}
                            </div>
                            <div>
                              <Select
                                style={{ width: '100%', minWidth: '100px' }}
                                placeholder="Select Excel Header"
                                onChange={(value) => handleHeaderMapping(field.name, value)}
                                value={mappedFields[field.name]}
                                mode={field.multiSelect ? "multiple" : undefined}
                                virtual={false}
                                listHeight={256}
                              >
                                {excelHeaders.map((header) => (
                                  <Select.Option key={header} value={header}>
                                    {header}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredData().map((row, rowIndex) => {
                      const catchNoIndex = excelHeaders.indexOf(mappedFields['CatchNo']);
                      const currentCatchNo = catchNoIndex !== -1 ? row[catchNoIndex] : null;
                      const existingData = apiData.find(apiRow => 
                        apiRow.catchNo?.toString().trim() === currentCatchNo?.toString().trim()
                      );
                      const isMatching = !!existingData;

                      return (
                        <tr key={rowIndex}>
                          {fields.map((field) => {
                            if (field.colspan && mappedFields[field.name]) {
                              const selectedHeaders = Array.isArray(mappedFields[field.name]) 
                                ? mappedFields[field.name] 
                                : [mappedFields[field.name]];
                              return selectedHeaders.map((header, idx) => {
                                let displayValue = '';
                                if (isMatching && !selectedFieldsToUpdate[field.name]) {
                                  // Show API data if exists and field not selected for update
                                  const key = field.name.charAt(0).toLowerCase() + field.name.slice(1);
                                  displayValue = existingData[key] || '';
                                } else {
                                  // Show Excel data
                                  displayValue = row[excelHeaders.indexOf(header)] || '';
                                }
                                return (
                                  <td key={`${field.name}-${idx}`}>
                                    {displayValue}
                                  </td>
                                );
                              });
                            }
                            
                            let displayValue = '';
                            if (isMatching && !selectedFieldsToUpdate[field.name]) {
                              // Show API data if exists and field not selected for update
                              const key = field.name.charAt(0).toLowerCase() + field.name.slice(1);
                              displayValue = existingData[key] || '';
                            } else {
                              // Show Excel data
                              const headerIndex = excelHeaders.indexOf(mappedFields[field.name]);
                              displayValue = headerIndex !== -1 ? row[headerIndex] : '';
                            }

                            return (
                              <td 
                                key={field.name}
                                style={{ 
                                  color: field.name === 'CatchNo' && isMatching ? 'blue' : field.name === 'CatchNo' ? 'green' : 'inherit'
                                }}
                              >
                                {displayValue}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {getFilteredData().length === 0 && (
                  <div className="text-center p-3">
                    <p>{t("noDataFoundForSelectedLot")}</p>
                  </div>
                )}
                <div className="text-end mt-3 mb-4">
                  <Button 
                    variant="primary" 
                    onClick={handleSubmit}
                    disabled={getFilteredData().length === 0}
                  >
                    {t("submit")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UpdateQuantitySheet;
