import React, { useEffect, useState } from 'react';
import { getProjectProcessAndFeature } from '../CustomHooks/ApiServices/projectProcessAndFeatureService';
import { useUserData } from '../store/userDataStore';
import { hasFeaturePermission } from '../CustomHooks/Services/processPermissionUtils';

const Test = () => {
  const [featureData, setFeatureData] = useState(null);
  const userData = useUserData();

  useEffect(() => {
    const fetchFeatureData = async () => {
      try {
        const projectId = 9; // Replace with actual project ID
        if (userData && userData.userId) {
          const data = await getProjectProcessAndFeature(projectId, userData.userId);
          setFeatureData(data);
          console.log('Project Process and Feature Data:', data);
        } else {
          console.error('User data not available');
        }
      } catch (err) {
        console.error('Error fetching data:', err.message);
      }
    };

    fetchFeatureData();
  }, [userData]);

  return (
    <div>
      {featureData && hasFeaturePermission(featureData[0]?.processId, 2, featureData) ? (
        <>
          <h1>Project Process and Feature Data</h1>
          {featureData ? (
            <ul>
              {featureData.map((process) => (
                <li key={process.id}>
                  <h2>Process ID: {process.processId}</h2>
                  <p>Weightage: {process.weightage}</p>
                  <p>Sequence: {process.sequence}</p>
                  <h3>Features:</h3>
                  <ul>
                    {process.featuresList.map((featureId) => (
                      <li key={featureId}>Feature ID: {featureId}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading data...</p>
          )}
        </>
      ) : (
        <h1>No Permission</h1>
      )}
    </div>
  );
};

export default Test;