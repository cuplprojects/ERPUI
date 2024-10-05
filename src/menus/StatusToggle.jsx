import React, { useState, useEffect } from "react";
import { Switch } from "antd";

const defaultStatusSteps = [
  { status: "Pending", color: "red" },
  { status: "Started", color: "blue" },
  { status: "Completed", color: "#00F700" },
];

const StatusToggle = ({ initialStatusIndex, onStatusChange, disabled, statusSteps = defaultStatusSteps }) => {
    const [statusIndex, setStatusIndex] = useState(
      Math.min(initialStatusIndex, statusSteps.length - 1)
    );
    const [toggling, setToggling] = useState(false);
    const [statusChecked, setStatusChecked] = useState(false);

    // Ensure statusSteps[statusIndex] exists before destructuring
    const { status = "", color = "gray" } = statusSteps[statusIndex] || {};

    const handleToggle = () => {
      if (statusIndex < statusSteps.length - 1 && !toggling) {
        setToggling(true);
        setStatusChecked(true); // Move the toggle temporarily

        setTimeout(() => {
          setStatusChecked(false); // Reset toggle
          const nextIndex = Math.min(statusIndex + 1, statusSteps.length - 1);
          setStatusIndex(nextIndex); // Move to the next status
          setToggling(false);
          onStatusChange(nextIndex); // Notify parent component about the change
        }, 500);
      }
    };

    useEffect(() => {
      setStatusIndex(initialStatusIndex); // Sync the initial status
    }, [initialStatusIndex]);

    return (
      <Switch
        checkedChildren={status} // Display status when checked
        unCheckedChildren={status} // Display status when unchecked
        style={{
          backgroundColor: color, // Change background color based on status
          borderColor: color,
          color: "white",
          transition: "background-color 2.0s ease",
          width: 110, // Fixed width for the toggle button
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        checked={statusChecked}
        onClick={handleToggle} // Handle status change
        // disabled={disabled || status === "Completed"} // Disable after "Completed" status
      />
    );
};

export default StatusToggle;

//--------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------------------
// import React, { useState, useEffect } from "react";
// import "./../styles/statusToggle.css"; // Import the external CSS

// const defaultStatusSteps = [
//   { status: "Pending", color: "red" },
//   { status: "Started", color: "blue" },
//   { status: "Completed", color: "green" },
// ];

// const StatusToggle = ({ initialStatus = "Pending", onStatusChange }) => {
//   const [statusIndex, setStatusIndex] = useState(
//     defaultStatusSteps.findIndex(step => step.status === initialStatus)
//   );
//   const [isLocked, setIsLocked] = useState(false);
//   const [isToggled, setIsToggled] = useState(false);
//   const [isToggling, setIsToggling] = useState(false);
//   const [moveText, setMoveText] = useState(false);

//   const handleToggle = () => {
//     if (isToggling || isLocked) return;

//     setIsToggling(true);
//     setIsToggled(true);
//     setMoveText(true);

//     setTimeout(() => {
//       const nextIndex = Math.min(statusIndex + 1, defaultStatusSteps.length - 1);
//       setStatusIndex(nextIndex);
//       if (nextIndex === defaultStatusSteps.length - 1) {
//         setIsLocked(true); // Lock when completed
//       }

//       onStatusChange(nextIndex); // Notify parent component about the change

//       setTimeout(() => {
//         setIsToggled(false);
//         setMoveText(false);
//         setIsToggling(false);
//       }, 500);
//     }, 500);
//   };

//   useEffect(() => {
//     const initialIndex = defaultStatusSteps.findIndex(step => step.status === initialStatus);
//     setStatusIndex(initialIndex);
//   }, [initialStatus]);

//   const { color, status } = defaultStatusSteps[statusIndex];

//   return (
//     <div
//       className={`toggle-container ${isLocked ? "locked" : ""}`}
//       style={{ border: `2px solid ${color}` }}
//       onClick={isLocked || isToggling ? undefined : handleToggle}
//     >
//       <div
//         className="toggle-slider"
//         style={{ left: isToggled ? "95px" : "5px", backgroundColor: color }}
//       />
//       <span
//         className={`toggle-text ${moveText ? "move" : "reset"}`}
//         style={{ color }}
//       >
//         {status}
//       </span>
//     </div>
//   );
// };

// export default StatusToggle;

// ---------------------------------------------------------------------------------------
