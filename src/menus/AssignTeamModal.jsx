import React from 'react';

const AssignTeamModal = ({ show, handleClose, handleSave, data }) => {
    if (!show) return null;
  
    return (
      <div className="modal">
        <div className="modal-content">
          <h4>Assign Team</h4>
          <form>
            {data && (
              <input
                type="text"
                value={data.team}
                onChange={(e) => console.log(e.target.value)}
              />
            )}
            <button onClick={(e) => handleSave(e, data)}>Save</button>
          </form>
        </div>
      </div>
    );
  };

export default AssignTeamModal;