import React, { useEffect, useState } from 'react';
import { Table, Switch, message } from 'antd';

const FeatureConfiguration = () => {
    const [features, setFeatures] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [featureProcessStatus, setFeatureProcessStatus] = useState({}); // Track status of each feature-process pair

    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await fetch('https://localhost:7212/api/Features');
                const data = await response.json();
                setFeatures(data);
            } catch (error) {
                console.error('Failed to fetch features:', error);
            }
        };

        const fetchProcesses = async () => {
            try {
                const response = await fetch('https://localhost:7212/api/Processes');
                const data = await response.json();
                setProcesses(data);
            } catch (error) {
                console.error('Failed to fetch processes:', error);
            }
        };

        fetchFeatures();
        fetchProcesses();
    }, []);

    // Handle switch toggle and update process status
    const handleToggle = async (featureId, process) => {
        const currentStatus = featureProcessStatus[featureId]?.[process.name] || process.status;

        // Toggle the status (on/off)
        const newStatus = !currentStatus;

        try {
            const response = await fetch(`https://localhost:7212/api/Processes/${process.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: process.id,
                    name: process.name,
                    weightage: process.weightage,
                    status: newStatus, // Update the status field
                    installedFeatures: process.installedFeatures, // Keep the installed features unchanged
                }),
            });

            if (response.ok) {
                message.success(`Process ${process.name} status updated successfully!`);

                // Update local state
                setFeatureProcessStatus(prevStatus => ({
                    ...prevStatus,
                    [featureId]: {
                        ...prevStatus[featureId],
                        [process.name]: newStatus, // Update the switch status for that feature-process pair
                    },
                }));
            } else {
                message.error('Failed to update process status.');
            }
        } catch (error) {
            console.error('Error updating process:', error);
            message.error('An error occurred while updating process status.');
        }
    };

    // Define columns for the table dynamically based on processes
    const columns = [
        {
            title: 'Feature Name',
            dataIndex: 'featureName',
            key: 'featureName',
            width: 200, // Set a specific width for the feature name column
        },
        ...processes.map(process => ({
            title: process.name, // Each process becomes a column
            dataIndex: process.name,
            key: process.name,
            width: 150, // Set a specific width for each process column
            render: (text, record) => (
                <Switch
                    checked={featureProcessStatus[record.key]?.[process.name] ?? process.status} // Checked status from API or state
                    onChange={() => handleToggle(record.key, process)} // Handle toggle to update status
                />
            ),
        })),
    ];

    // Prepare data for the table
    const dataSource = features.map(feature => {
        // Initialize each row with the feature name
        const rowData = {
            key: feature.featureId, // Unique key for each feature
            featureName: feature.features, // Feature name
        };

        // Fill in process data for the row with toggle switch status
        processes.forEach(process => {
            // Check if the feature is installed in the current process
            const isInstalled = process.installedFeatures.split(', ').includes(feature.features);
            rowData[process.name] = isInstalled; // Store installation status
        });

        return rowData;
    });

    return (
        <div>
            <h3>Feature Configuration</h3>
            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false} // Disable pagination if you want to show all items
                bordered // Optional: Adds borders to the table
                size="small" // Make the table small
                scroll={{ x: 'max-content' }} // Enable horizontal scrolling if content overflows
            />
        </div>
    );
};

export default FeatureConfiguration;
