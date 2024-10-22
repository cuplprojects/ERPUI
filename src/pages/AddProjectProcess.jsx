import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, message, Checkbox, Drawer } from "antd";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { getProjectById } from "../CustomHooks/ApiServices/projectService";
import API from "../CustomHooks/MasterApiHooks/api";
import { MenuOutlined } from "@ant-design/icons";
import Table from "react-bootstrap/Table";
import { Container, Card } from "react-bootstrap";
import { useStore } from "zustand";
import themeStore from "../store/themeStore";

const DraggableRow = ({
  process,
  index,
  moveProcess,
  features,
  checkedFeatures,
  setCheckedFeatures,
}) => {
  if (!process) return null;

  const [, ref] = useDrag({
    type: "PROCESS",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "PROCESS",
    hover(item) {
      if (item.index !== index) {
        moveProcess(item.index, index);
        item.index = index;
      }
    },
  });

  const handleCheckboxChange = (featureId) => {
    const updatedCheckedFeatures = checkedFeatures[process.id] || [];
    if (updatedCheckedFeatures.includes(featureId)) {
      updatedCheckedFeatures.splice(updatedCheckedFeatures.indexOf(featureId), 1);
    } else {
      updatedCheckedFeatures.push(featureId);
    }
    setCheckedFeatures((prev) => ({
      ...prev,
      [process.id]: updatedCheckedFeatures,
    }));
  };
  
  console.log("Add ProjectProcess called")

  return (
    <tr ref={(node) => ref(drop(node))}>
      <td style={{ textAlign: "center", width: "5%" }}>{index + 1}</td>
      <td style={{ textAlign: "center", width: "20%" }}>
        {process.name || "Unnamed Process"}
      </td>
      {features.map((feature) => {
        const isChecked = (checkedFeatures[process.id] || []).includes(feature.featureId) ||
          (process.installedFeatures && process.installedFeatures.includes(feature.featureId));
        return (
          <td
            key={feature.featureId}
            style={{
              textAlign: "center",
              width: `${(75 / features.length).toFixed(2)}%`,
            }}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckboxChange(feature.featureId)}
            />
          </td>
        );
      })}
    </tr>
  );
};

const AddProjectProcess = ({ selectedProject }) => {
  const projectId = selectedProject;
  const [processes, setProcesses] = useState([]);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [features, setFeatures] = useState([]);
  const [checkedFeatures, setCheckedFeatures] = useState({});
  const [project, setProject] = useState("");
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const { getCssClasses } = useStore(themeStore);
  const cssClasses = getCssClasses();
  const [customDark, customLight, customLightBorder, customDarkBorder] = cssClasses;


  useEffect(() => {
    fetchProjectData();
    fetchUpdatedProcesses();
    
  }, [selectedProject]);

  const fetchUpdatedProcesses = async () => {
    try {
        const response = await API.get('/Project/AddProcessesToProject');
        setProcesses(response.data);
        console.log('Fetched processes:', response.data);
    } catch (error) {
        console.error("Failed to fetch processes", error);
    }
};



  const fetchProjectData = async () => {
    try {
      const project = await getProjectById(projectId);
      setProject(project);
      const processesResponse = await API.get(
        `/PaperTypes/${project.typeId}/Processes`
      );
      const fetchedProcesses = processesResponse.data.map(process => ({
        ...process,
        status: true,
      }));
      console.log(fetchedProcesses)
      setProcesses(fetchedProcesses);
      setSelectedProcesses(fetchedProcesses); // Set all processes as selected by default

      const featuresResponse = await API.get("/Features");
      const fetchedFeatures = featuresResponse.data;
      setFeatures(fetchedFeatures);

      // Initialize checkedFeatures with all features selected for each process
      const defaultCheckedFeatures = {};
      fetchedProcesses.forEach((proc) => {
        defaultCheckedFeatures[proc.id] = proc.installedFeatures || [];
      });
      console.log(defaultCheckedFeatures)
      setCheckedFeatures(defaultCheckedFeatures);
    } catch (error) {
      console.error("Failed to fetch project data", error);
      message.error("Failed to fetch project data");
    }
  };

//   const handleCheckboxChange = (featureId, proc) => {
//     const updatedCheckedFeatures = checkedFeatures[proc.id] || [];
//     if (updatedCheckedFeatures.includes(featureId)) {
//         updatedCheckedFeatures.splice(updatedCheckedFeatures.indexOf(featureId), 1);
//     } else {
//         updatedCheckedFeatures.push(featureId);
//     }
//     setCheckedFeatures((prev) => ({
//         ...prev,
//         [proc.id]: updatedCheckedFeatures,
//     }));

//     // Update the process on checkbox change
//     updateProcess(proc.id, updatedCheckedFeatures);
// };

const handleCheckboxChange = (featureId, proc) => {
  if (!proc || !proc.id) {
      console.error("Process is undefined or does not have an id", proc);
      return; // Exit the function early if proc is not valid
  }

  const updatedCheckedFeatures = checkedFeatures[proc.id] || [];
  if (updatedCheckedFeatures.includes(featureId)) {
      updatedCheckedFeatures.splice(updatedCheckedFeatures.indexOf(featureId), 1);
  } else {
      updatedCheckedFeatures.push(featureId);
  }
  setCheckedFeatures((prev) => ({
      ...prev,
      [proc.id]: updatedCheckedFeatures,
  }));

  // Update the process on checkbox change
  updateProcess(proc.id, updatedCheckedFeatures);
};



//   const updateProcess = async (processId, featuresList) => {
//     try {
//         await API.put('/Project/UpdateProcesses', {
//             projectProcesses: [{
//                 projectId: parseInt(projectId),
//                 processId,
//                 featuresList,
//             }]
//         });
//         message.success("Process updated successfully!");
//     } catch (error) {
//         message.error("Error updating process");
//     }
// };

const updateProcess = async (processId, featuresList) => {
  try {
      await API.post('/Project/AddProcessesToProject', {
          projectProcesses: [{
              projectId: parseInt(projectId),
              processId,
              weightage: 0, // Set your weightage logic here
              sequence: selectedProcesses.findIndex(p => p.id === processId) + 1,
              featuresList,
              userId: [] // Set userId as needed
          }]
      });
      message.success("Process updated successfully!");
  } catch (error) {
      message.error("Error updating process");
  }
};

  const moveProcess = (fromIndex, toIndex) => {
    const updatedProcesses = [...selectedProcesses];
    const [movedProcess] = updatedProcesses.splice(fromIndex, 1);
    updatedProcesses.splice(toIndex, 0, movedProcess);
    setSelectedProcesses(updatedProcesses);
  };

  // const handleSubmit = async () => {
  //   const projectProcesses = selectedProcesses.map((proc, index) => {
  //     const featuresList = checkedFeatures[proc.id] || [];
  //     return {
  //       projectId: parseInt(projectId),
  //       processId: proc.id,
  //       weightage: 0,
  //       sequence: index + 1,
  //       featuresList: featuresList,
  //       userId: [] // Set userId as an empty array
  //     };
  //   });

  //   try {
  //     await API.post(
  //       "/Project/AddProcessesToProject",
  //       { projectProcesses },
  //       { headers: { "Content-Type": "application/json" } }
  //     );
  //     message.success("Processes added successfully!");
  //     //setSelectedProcesses([]);
  //     //setCheckedFeatures({});
  //     fetchProjectData();
  //     fetchUpdatedProcesses();
  //   } catch (error) {
  //     message.error("Error adding processes");
  //   }
  // };

  const handleSubmit = async () => {
    const projectProcesses = selectedProcesses.map((proc, index) => {
        const featuresList = checkedFeatures[proc.id] || [];
        return {
            projectId: parseInt(projectId),
            processId: proc.id,
            weightage: 0, // Use your logic to set weightage
            sequence: index + 1,
            featuresList,
            userId: [] // Add user ID logic if necessary
        };
    });

    try {
        await API.post("/Project/AddProcessesToProject", { projectProcesses });
        message.success("Processes updated successfully!");
        //fetchProjectData();
        fetchUpdatedProcesses();
    } catch (error) {
        message.error("Error adding processes");
    }
};

  return (

    <DndProvider backend={HTML5Backend}>
      <div className={`mb-4 shadow-lg p-0 border-0 ${customDark === "dark-dark" ? `${customLightBorder}` : "border-0"}`}>
        <div className={`d-flex justify-content-between align-items-center ${customDark === "dark-dark" ? `${customDark} text-white ${customLightBorder}` : `text-white ${customDark}`}`}>
         <div classNames="ms-2">
          <Button 
            icon={<MenuOutlined />}
            onClick={() => setIsDrawerVisible(!isDrawerVisible)}
            className="responsive-button"
          />
         </div>
          
          <h5 className="text-center me-2 mt-2">Project: {project.name}</h5>
        </div>

        <Card.Body className={`${customDark === "dark-dark" ? `${customLightBorder}` : ""}`}>
          <Drawer
            title=""
            placement="left"
            closable
            onClose={() => setIsDrawerVisible(false)}
            open={isDrawerVisible}
            width={250}
          >
            <p>Select The Process</p>
            {processes.map((proc) => (
              <p key={proc.id}>
                <Checkbox
                  checked={selectedProcesses.some(
                    (selectedProc) => selectedProc.id === proc.id
                  )}
                  onChange={() => handleCheckboxChange(proc)}
                >
                  {proc.name}
                </Checkbox>
              </p>
            ))}
          </Drawer>

          <div className={`table-responsive ${customLight} ${customDark === 'dark-dark' ? `${customDarkBorder} border-1` : "border-light"}`}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ textAlign: "center", width: "5%" }}>SN</th>
                  <th style={{ textAlign: "center", width: "25%" }}>Process Name</th>
                  {features.map((feature) => (
                    <th
                      key={feature.featureId}
                      style={{
                        textAlign: "center",
                        width: `${(70 / features.length).toFixed(2)}%`,
                      }}
                    >
                      {feature.features}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedProcesses.map((process, index) => (
                  <React.Fragment key={process.id}>
                    <DraggableRow
                      process={process}
                      index={index}
                      moveProcess={moveProcess}
                      features={features}
                      checkedFeatures={checkedFeatures}
                      setCheckedFeatures={setCheckedFeatures}
                    />
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          </div>
          <div className="d-flex justify-content-end">
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={selectedProcesses.length === 0}
              style={{ marginTop: "20px", width: "25%" }}
              className="responsive-submit-button"
            >
              Submit
            </Button>
          </div>
        </Card.Body>
      </div>
    </DndProvider>

  );
};

export default AddProjectProcess;


