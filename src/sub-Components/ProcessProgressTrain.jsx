import React, { useEffect, useState } from "react";
import "./../styles/ProcessProgressTrain.css";
import API from "../CustomHooks/MasterApiHooks/api";
import useCurrentProcessStore from "../store/currentProcessStore";

const TooltipSection = ({ children }) => (
  <div className="trsection">{children}</div>
);

const ProcessProgressTrain = ({ ProjectID, lotNumber, previousProcess }) => {
  const [visibleSections, setVisibleSections] = useState(2);
  const [sectionsData, setsectionsData] = useState([]);
  const { processId, processName } = useCurrentProcessStore();

  console.log(ProjectID, lotNumber);
  useEffect(() => {
    const fetchData = async () => {
      if (ProjectID && lotNumber) {
        const projectIdInt = parseInt(ProjectID, 10);
        const lotNumberInt = parseInt(lotNumber, 10);

        const response = await API.get(
          `Transactions/Process-Train?projectId=${projectIdInt}&LotNo=${lotNumberInt}`
        );
        setsectionsData(response.data);
        console.log(response.data);
      }
    };

    fetchData();
  }, [ProjectID, lotNumber]);

  useEffect(() => {
    console.log(sectionsData);
  }, [sectionsData]);

  const handleExpand = () => {
    setVisibleSections(sectionsData.length);
  };

  const handleCollapse = () => {
    setVisibleSections(2);
  };

  // Find the previous process data in sectionsData
  const previousProcessData = sectionsData.find(
    (section) => section.processId === previousProcess?.processId
  );

  // Find the current process data in sectionsData
  const currentProcessData = sectionsData.find(
    (section) => section.processId === processId
  );

  const getCardColorClass = (section) => {
    if (
      section?.wipCount == 0 &&
      section?.wipTotalQuantity == 0 &&
      section?.remainingCatchNo == 0 &&
      section?.remainingQuantity == 0 &&
      (section?.completedCount == 0) & (section?.completedTotalQuantity == 0)
    ) {
      return "lightred-card";
    } else if (section?.wipCount !== 0 && section?.wipTotalQuantity !== 0) {
      return "lightblue-card";
    } else if (
      section?.remainingCatchNo === 0 &&
      section?.remainingQuantity === 0 &&
      section?.wipCount === 0 &&
      section?.wipTotalQuantity === 0
    ) {
      return "lightgreen-card";
    } else if (
      section?.wipCount === 0 &&
      section?.wipTotalQuantity === 0 &&
      (section?.remainingCatchNo !== 0 || section?.remainingQuantity !== 0)
    ) {
      return "lightred-card";
    }
    return ""; // Default class if none of the conditions match
  };

  return (
    <div className="trcontainer">
      {visibleSections === 2 ? (
        <>
          {previousProcessData && (
            <div className={`box ${getCardColorClass(previousProcessData)}`}>
              <div className="box2">
                {previousProcessData.processName
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")}
              </div>
              <div className="box3">
                <TooltipSection>
                  {previousProcessData.remainingCatchNo}/
                  {previousProcessData.remainingQuantity}
                </TooltipSection>
                <TooltipSection>
                  {previousProcessData.wipCount}/
                  {previousProcessData.wipTotalQuantity}
                </TooltipSection>
                <TooltipSection>
                  {previousProcessData.completedCount}/
                  {previousProcessData.completedTotalQuantity}
                </TooltipSection>
              </div>
            </div>
          )}
          <div className={`box ${getCardColorClass(currentProcessData)}`}>
            <div className="box2">
              {currentProcessData
                ? currentProcessData.processName
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")
                : "No Current Process"}
            </div>
            <div className="box3">
              <TooltipSection>
                {currentProcessData?.remainingCatchNo}/
                {currentProcessData?.remainingQuantity}
              </TooltipSection>
              <TooltipSection>
                {currentProcessData?.wipCount}/
                {currentProcessData?.wipTotalQuantity}
              </TooltipSection>
              <TooltipSection>
                {currentProcessData?.completedCount}/
                {currentProcessData?.completedTotalQuantity}
              </TooltipSection>
            </div>
          </div>
        </>
      ) : (
        sectionsData.slice(0, visibleSections).map((section, index) => (
          <div key={index} className={`box ${getCardColorClass(section)}`}>
            <div className="box2">
              {section.processName.split(" ").slice(0, 2).join(" ")}
            </div>
            <div className="box3">
              <TooltipSection>
                {section.remainingCatchNo}/{section.remainingQuantity}
              </TooltipSection>
              <TooltipSection>
                {section?.wipCount}/{section?.wipTotalQuantity}
              </TooltipSection>
              <TooltipSection>
                {section.completedCount}/{section?.completedTotalQuantity}
              </TooltipSection>
            </div>
          </div>
        ))
      )}
      {visibleSections < sectionsData.length && (
        <button onClick={handleExpand} className="expand-button">
          &gt;&gt;
        </button>
      )}
      {visibleSections > 2 && (
        <button onClick={handleCollapse} className="collapse-button">
          &lt;&lt;
        </button>
      )}
    </div>
  );
};

export default ProcessProgressTrain;
