import React, { useState } from 'react';

const SelectZoneModal = ({ isOpen, onClose, onSelectZone }) => {
  const [selectedZone, setSelectedZone] = useState('');

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
  };


  useEffect(() => {
    getZone();
  }, []); 

  const handleConfirm = async () => {
    try {
      let existingTransactionData;
      if (data.transactionId) {
        const response = await API.get(`/Transactions/${data.transactionId}`);
        existingTransactionData = response.data;
      }

      const postData = {
        transactionId: data.transactionId || 0,
        interimQuantity: data.interimQuantity, // Adjust based on actual data
        remarks: existingTransactionData ? existingTransactionData.remarks : '',
        projectId: data.projectId,
        quantitysheetId: data.srNo || 0,
        processId: processId,
        zoneId: zoneId, // Use the selected zone here
        machineId: existingTransactionData ? existingTransactionData.machineId : 0,
        status: existingTransactionData ? existingTransactionData.status : 0,
        alarmId: existingTransactionData ? existingTransactionData.alarmId : "",
        lotNo: data.lotNo,
        teamId: existingTransactionData ? existingTransactionData.teamId : 0,
        voiceRecording: existingTransactionData? existingTransactionData.voiceRecording : ""
      };

      if (data.transactionId) {
        await API.put(`/Transactions/${data.transactionId}`, postData);
      } else {
        await API.post('/Transactions', postData);
      }
      handleSave(zoneId)
      handleClose();
    } catch (error) {
      console.error('Error updating interim quantity:', error);
    }

  };

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Zone</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>Zone:</label>
              <select
                className="form-control"
                value={selectedZone}
                onChange={(e) => handleSelectZone(e.target.value)}
              >
                <option value="">Select Zone</option>
                <option value="Zone 1">Zone 1</option>
                <option value="Zone 2">Zone 2</option>
                <option value="Zone 3">Zone 3</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleConfirm}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectZoneModal;