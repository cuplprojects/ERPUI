import React, { useState } from 'react';
import API from '../CustomHooks/MasterApiHooks/api';

const SelectZoneModal = ({ isOpen, onClose, onSelectZone }) => {
  const [selectedZone, setSelectedZone] = useState('');

  const handleSelectZone = (zone) => {
    setSelectedZone(zone);
  };

  const handleConfirm = () => {
    onSelectZone(selectedZone);
    onClose();
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