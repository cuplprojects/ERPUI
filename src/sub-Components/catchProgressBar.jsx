import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import './../styles/catchProgressBar.css'; // Assuming you use external CSS
import themeStore from './../store/themeStore';
import { useStore } from 'zustand';
const CatchProgressBar = ({ data }) => {

    //Theme Change Section
    const { getCssClasses } = useStore(themeStore);
    const cssClasses = getCssClasses();
    const customDark = cssClasses[0];
    const customMid = cssClasses[1];
    const customLight = cssClasses[2];
    const customBtn = cssClasses[3];
    const customDarkText = cssClasses[4];

    const updateData = (jsonData) => {
      let completed = 0;
  
      jsonData.forEach((item) => {
        if (item.status === 'Completed') {
          completed += 1;
        }
      });
  
      const total = jsonData.length || 1; // Prevent division by 0
  
      return {
        completedPercent: (completed / total) * 100,
        completed,
        total,
      };
    };
  
    const { completedPercent, completed, total } = updateData(data);
  
    return (
      <div className="progress-container">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className={`${customDarkText}`}>Overall Progress : {`${completedPercent.toFixed(0)}% Completed`} </h5>
          <h5 className={`${customDarkText}`}>{completed} / {total} Completed</h5>
        </div>
        <ProgressBar className={`progress-bar-custom border border-2 ${customDark === 'dark-dark' ? customDark : customDarkText}`}>
          <ProgressBar striped variant="success" now={completedPercent} key={3} />
        </ProgressBar>
      </div>
    );
  };

export default CatchProgressBar;
