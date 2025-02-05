import React, { useState, useEffect } from "react";
import { Form, Table, Button } from "react-bootstrap";
import { Select, Pagination, Popover } from "antd";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import API from "../../CustomHooks/MasterApiHooks/api";
import { BsPencilSquare, BsInfoCircle } from "react-icons/bs";

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
  const [selectedCatchToupdate, setSelectedCatchToupdate] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Add constant for locked fields
  const LOCKED_FIELDS = ["CatchNo", "LotNo", "Quantity", "Pages"];

  const fields = [
    { name: "CatchNo", type: "string" },
    { name: "LotNo", type: "string" },
    { name: "Paper", type: "string" },
    { name: "Course", type: "string" },
    { name: "Subject", type: "string" },
    { name: "ExamDate", type: "string" },
    { name: "ExamTime", type: "string" },
    {
      name: "InnerEnvelope",
      type: "string",
      multiSelect: true,
      envelopeTypes: ["E10", "E20", "E30", "E40", "E50", "E60", "E80", "E100"],
      colspan: true
    },
    {
      name: "OuterEnvelope",
      type: "string",
      multiSelect: true,
    },
    { name: "Quantity", type: "string" },
    { name: "Pages", type: "string" },
  ];

  const formatDateForDB = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month}-${day}`; // Convert to "YYYY-MM-DD"
};

  useEffect(() => {
    const fetchAvailableLots = async () => {
      try {
        const response = await API.get(
          `/QuantitySheet/Lots?ProjectId=${projectId}`
        );
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
        const response = await API.get(
          `/QuantitySheet/CatchByproject?ProjectId=${projectId}`
        );
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
    setCurrentPage(1); // Reset to first page when mode changes
  };

  const handleLotSelect = (lot) => {
    setSelectedLot(lot);
    setCurrentPage(1); // Reset to first page when lot changes
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const buffer = evt.target.result;
      const array = new Uint8Array(buffer);
      const binaryString = array.reduce(
        (str, byte) => str + String.fromCharCode(byte),
        ""
      );
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
      setCurrentPage(1); // Reset to first page when new file is uploaded
    };

    reader.readAsArrayBuffer(file);
  };

  const handleHeaderMapping = (fieldName, excelHeader) => {
    setMappedFields({
      ...mappedFields,
      [fieldName]: excelHeader,
    });
  };

  const getColumnData = (excelHeader) => {
    if (!excelHeader) return [];

    if (Array.isArray(excelHeader)) {
      // For multi-select fields, combine data from multiple columns
      return excelData.map((row) => {
        if (excelHeader === mappedFields["InnerEnvelope"]) {
          // Special handling for InnerEnvelope
          const envelopeData = [];
          fields.find(f => f.name === "InnerEnvelope").envelopeTypes.forEach(envelopeType => {
            const header = excelHeader.find(h => h.includes(envelopeType));
            if (header) {
              const headerIndex = excelHeaders.indexOf(header);
              const value = row[headerIndex];
              if (value) {
                envelopeData.push(`${envelopeType}: ${value}`);
              }
            }
          });
          return envelopeData.join(", "); // Return as single string
        }
        
        return excelHeader
          .map((header) => {
            const headerIndex = excelHeaders.indexOf(header);
            return row[headerIndex];
          })
          .filter(Boolean)
          .join(", ");
      });
    }

    // For single select fields
    const headerIndex = excelHeaders.indexOf(excelHeader);
    return excelData.map((row) => row[headerIndex]);
  };

  // Update the handleFieldUpdateSelection to prevent changes to locked fields
  const handleFieldUpdateSelection = (fieldName) => {
    if (LOCKED_FIELDS.includes(fieldName)) {
      return; // Don't allow changes to locked fields
    }
    setSelectedFieldsToUpdate((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const convertExcelDate = (excelDate) => {
    if (!excelDate) return null;
    let date;
    // Check if excelDate is a number (Excel serial date)
    if (!isNaN(excelDate)) {
      // Excel dates are number of days since 1/1/1900
      date = new Date((excelDate - 25569) * 86400 * 1000);
    } else {
      // If it's already a date string, parse it
      date = new Date(excelDate);
    }
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const handleSubmit = async () => {
    // Get filtered data based on selected lot
    const filteredData = getFilteredData();

    const formattedData = filteredData.map((row, index) => {
      const catchNoIndex = excelHeaders.indexOf(mappedFields["CatchNo"]);
      const currentCatchNo =
        catchNoIndex !== -1 ? row[catchNoIndex]?.toString().trim() : null;
      const existingData = apiData.find(
        (apiRow) => apiRow.catchNo?.toString().trim() === currentCatchNo
      );

      const examDate = convertExcelDate(
        getColumnData(mappedFields["ExamDate"])[index]
      );

      const rowData = {
        quantitySheetId: existingData?.quantitySheetId || 0,
        catchNo: currentCatchNo || "",
        paper: getColumnData(mappedFields["Paper"])[index]?.toString() || "",
        course: getColumnData(mappedFields["Course"])[index]?.toString() || "",
        subject:
          getColumnData(mappedFields["Subject"])[index]?.toString() || "",
        innerEnvelope:
          getColumnData(mappedFields["InnerEnvelope"])[index] || "",
        outerEnvelope:
          Number(getColumnData(mappedFields["OuterEnvelope"])[index]) || 0,
        examDate: formatDateForDB(examDate) || "",
        examTime:
          getColumnData(mappedFields["ExamTime"])[index]?.toString() || "",
        lotNo:
          updateMode === "lot"
            ? selectedLot
            : getColumnData(mappedFields["LotNo"])[index]?.toString() || "",
        quantity: Number(getColumnData(mappedFields["Quantity"])[index]) || 0,
        pages: Number(getColumnData(mappedFields["Pages"])[index]) || 0,
        percentageCatch: 0,
        projectId: projectId,
        processId: [0],
        status: 0,
        stopCatch: 0,
      };

      // For existing catches, preserve original data for unselected fields
      if (existingData) {
        fields.forEach((field) => {
          const key = field.name.charAt(0).toLowerCase() + field.name.slice(1);
          if (!selectedFieldsToUpdate[field.name]) {
            if (["quantity", "outerEnvelope", "pages"].includes(key)) {
              rowData[key] = Number(existingData[key]) || 0;
            } else if (key === "examDate") {
              rowData[key] = existingData[key] || "";
            } else {
              rowData[key] = existingData[key]?.toString() || "";
            }
          }
        });
      }

      return rowData;
    });

    try {
      const response = await API.put("/QuantitySheet", formattedData);
      console.log("Update successful:", response);
      onClose();
    } catch (error) {
      console.error("Failed to update quantity sheet:", error);
    }
  };

  // Check if any fields have been mapped
  const hasAnyMappedFields = Object.keys(mappedFields).length > 0;

  // Modified getFilteredData to strictly filter by lot number
  const getFilteredData = () => {
    if (updateMode !== "lot") {
      return excelData;
    }

    return excelData.filter((row, index) => {
      const lotNoHeader = mappedFields["LotNo"];
      if (!lotNoHeader) return false; // Skip if LotNo mapping not set

      const lotNoIndex = excelHeaders.indexOf(lotNoHeader);
      if (lotNoIndex === -1) return false; // Skip if header not found

      const rowLotNo = row[lotNoIndex]?.toString().trim();
      return rowLotNo === selectedLot.toString();
    });
  };

  const isMatchingCatch = (catchNo) => {
    if (!catchNo) return false;
    return apiData.some(
      (apiRow) =>
        apiRow.catchNo?.toString().trim() === catchNo.toString().trim()
    );
  };

  // Add a debug display for API data (optional, remove in production)
  useEffect(() => {
    if (apiData.length > 0) {
      console.log("API Data loaded:", apiData);
    }
  }, [apiData]);

  // Add clearFile handler
  const clearFile = () => {
    // Reset all related states
    setExcelHeaders([]);
    setMappedFields({});
    setExcelData([]);
    setSelectedFieldsToUpdate({});
    setCurrentPage(1);

    // Reset the file input by creating a ref
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
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
                  checked={updateMode === "lot"}
                  onChange={() => handleModeSelect("lot")}
                  className="fs-5"
                  style={{
                    transform: "scale(1.05)",
                    cursor: "pointer",
                  }}
                />
              </div>
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  id="project-radio"
                  label={t("updateEntireProject")}
                  name="updateMode"
                  checked={updateMode === "project"}
                  onChange={() => handleModeSelect("project")}
                  className="fs-5"
                  style={{
                    transform: "scale(1.05)",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>

            {/* Lot Select and File Upload Group */}
            <div className="d-flex flex-column flex-sm-row gap-3 flex-grow-1">
              {updateMode === "lot" && (
                <div style={{ width: "250px" }}>
                  <Select
                    style={{ width: "100%" }}
                    placeholder={t("selectLot")}
                    onChange={handleLotSelect}
                    value={selectedLot}
                  >
                    {availableLots.map((lot) => (
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
                  disabled={
                    !updateMode || (updateMode === "lot" && !selectedLot)
                  }
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

      {(updateMode === "project" || (updateMode === "lot" && selectedLot)) && (
        <>
          {excelHeaders.length > 0 && (
            <div className="row">
              <div className="col-12">
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      {fields.map((field) => {
                        if (field.colspan && mappedFields[field.name]) {
                          const selectedHeaders = Array.isArray(
                            mappedFields[field.name]
                          )
                            ? mappedFields[field.name]
                            : [mappedFields[field.name]];
                          return (
                            <>
                              <th
                                key={field.name}
                                colSpan={selectedHeaders.length}
                                className="text-center"
                              >
                                <div className="d-flex align-items-center gap-2">
                                  {field.name}
                                  {!LOCKED_FIELDS.includes(field.name) && (
                                    <Form.Check
                                      type="checkbox"
                                      checked={
                                        selectedFieldsToUpdate[field.name] ||
                                        false
                                      }
                                      onChange={() =>
                                        handleFieldUpdateSelection(field.name)
                                      }
                                      label="Update existing"
                                    />
                                  )}
                                </div>
                                <div>
                                  <Select
                                    style={{ width: "100%" }}
                                    placeholder="Select Excel Header"
                                    onChange={(value) =>
                                      handleHeaderMapping(field.name, value)
                                    }
                                    value={mappedFields[field.name]}
                                    mode={
                                      field.multiSelect ? "multiple" : undefined
                                    }
                                    virtual={false}
                                    listHeight={256}
                                  >
                                    {excelHeaders.map((header) => (
                                      <Select.Option
                                        key={header}
                                        value={header}
                                      >
                                        {header}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </div>
                              </th>
                            </>
                          );
                        }
                        return (
                          <th key={field.name} className="text-center">
                            <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                              {field.name}
                              {!LOCKED_FIELDS.includes(field.name) && (
                                <div className="d-flex align-items-center gap-1">
                                  <Form.Check
                                    type="checkbox"
                                    checked={
                                      selectedFieldsToUpdate[field.name] ||
                                      false
                                    }
                                    onChange={() =>
                                      handleFieldUpdateSelection(field.name)
                                    }
                                    className="m-0"
                                  />
                                  <BsPencilSquare
                                    size={14}
                                    title="Update existing"
                                  />
                                </div>
                              )}
                            </div>
                            <div>
                              <Select
                                style={{ width: "100%", minWidth: "100px" }}
                                placeholder="Select Excel Header"
                                onChange={(value) =>
                                  handleHeaderMapping(field.name, value)
                                }
                                value={mappedFields[field.name]}
                                mode={
                                  field.multiSelect ? "multiple" : undefined
                                }
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
                    {getPaginatedData().map((row, rowIndex) => {
                      const catchNoIndex = excelHeaders.indexOf(
                        mappedFields["CatchNo"]
                      );
                      const currentCatchNo =
                        catchNoIndex !== -1 ? row[catchNoIndex] : null;
                      const existingData = apiData.find(
                        (apiRow) =>
                          apiRow.catchNo?.toString().trim() ===
                          currentCatchNo?.toString().trim()
                      );
                      const isMatching = !!existingData;

                      return (
                        <tr key={rowIndex}>
                          {fields.map((field) => {
                            if (field.colspan && mappedFields[field.name]) {
                              const selectedHeaders = Array.isArray(
                                mappedFields[field.name]
                              )
                                ? mappedFields[field.name]
                                : [mappedFields[field.name]];
                              return selectedHeaders.map((header, idx) => {
                                let displayValue = "";
                                let oldValue = "";
                                if (
                                  isMatching &&
                                  !selectedFieldsToUpdate[field.name]
                                ) {
                                  // Show API data if exists and field not selected for update
                                  const key =
                                    field.name.charAt(0).toLowerCase() +
                                    field.name.slice(1);
                                  displayValue = existingData[key] || "";
                                } else {
                                  // Show Excel data
                                  displayValue =
                                    row[excelHeaders.indexOf(header)] || "";
                                  if (isMatching) {
                                    const key =
                                      field.name.charAt(0).toLowerCase() +
                                      field.name.slice(1);
                                    oldValue = existingData[key] || "";
                                  }
                                }
                                return (
                                  <td
                                    key={`${field.name}-${idx}`}
                                    style={{
                                      color:
                                        isMatching &&
                                        !selectedFieldsToUpdate[field.name]
                                          ? "blue"
                                          : "green",
                                      position: "relative",
                                      textAlign: "center"
                                    }}
                                  >
                                    {displayValue}
                                    {isMatching && oldValue && oldValue !== displayValue && (
                                      <div style={{position: "absolute", top: 2, right: 2}}>
                                        <Popover 
                                          content={<div style={{whiteSpace: "pre-wrap", maxWidth: "200px"}}>{`Previous value: ${oldValue}`}</div>}
                                          trigger="click"
                                          placement="topRight"
                                        >
                                          <BsInfoCircle 
                                            style={{cursor: 'pointer', color: '#1890ff'}}
                                          />
                                        </Popover>
                                      </div>
                                    )}
                                  </td>
                                );
                              });
                            }

                            let displayValue = "";
                            let oldValue = "";
                            if (
                              isMatching &&
                              !selectedFieldsToUpdate[field.name]
                            ) {
                              // Show API data if exists and field not selected for update
                              const key =
                                field.name.charAt(0).toLowerCase() +
                                field.name.slice(1);
                              displayValue = existingData[key] || "";
                            } else {
                              // Show Excel data
                              const headerIndex = excelHeaders.indexOf(
                                mappedFields[field.name]
                              );
                              displayValue =
                                headerIndex !== -1 ? row[headerIndex] : "";
                              if (isMatching) {
                                const key =
                                  field.name.charAt(0).toLowerCase() +
                                  field.name.slice(1);
                                oldValue = existingData[key] || "";
                              }
                            }

                            // Format date if the field is ExamDate
                            if (field.name === "ExamDate") {
                              displayValue = convertExcelDate(displayValue);
                              oldValue = convertExcelDate(oldValue);
                            }

                            return (
                              <td
                                key={field.name}
                                style={{
                                  color:
                                    isMatching &&
                                    !selectedFieldsToUpdate[field.name]
                                      ? "blue"
                                      : "green",
                                  position: "relative",
                                  textAlign: "center"
                                }}
                              >
                                {displayValue}
                                {isMatching && oldValue && oldValue !== displayValue && (
                                  <div style={{position: "absolute", top: 2, right: 2}}>
                                    <Popover 
                                      content={<div style={{whiteSpace: "pre-wrap", maxWidth: "200px"}}>{`Previous value: ${oldValue}`}</div>}
                                      trigger="click"
                                      placement="topRight"
                                    >
                                      <BsInfoCircle 
                                        style={{cursor: 'pointer', color: '#1890ff'}}
                                      />
                                    </Popover>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
                {getFilteredData().length === 0 ? (
                  <div className="text-center p-3">
                    <p>{t("noDataFoundForSelectedLot")}</p>
                  </div>
                ) : (
                  <div className="d-flex justify-content-center mt-3">
                    <Pagination
                      current={currentPage}
                      total={getFilteredData().length}
                      pageSize={pageSize}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                    />
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
