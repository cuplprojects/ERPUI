import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

const StatusHorizontalBarChart = ({ data }) => {
    const updateData = (jsonData) => {
        let pending = 0, started = 0, completed = 0;

        jsonData.forEach(item => {
            if (item.status === 'Pending') {
                pending += 1;
            } else if (item.status === 'Started') {
                started += 1;
            } else if (item.status === 'Completed') {
                completed += 1;
            }
        });

        return [
            { name: 'Pending', Pending: pending },
            { name: 'Started', Started: started },
            { name: 'Completed', Completed: completed },
        ];
    };

    const chartData = updateData(data);

    return (
        <ResponsiveContainer width="100%" height={360}>
            <BarChart
                data={chartData}
                layout="vertical" // Ensure this is set for horizontal bars
                margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                barSize={30} // Try a smaller value for thickness
                barCategoryGap={2} // Adjust to further reduce gaps
            >
                <CartesianGrid strokeDasharray="3  3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                {/* Individual bars with respective colors */}
                <Bar dataKey="Pending" fill="#FF7D7D" label={{ position: 'insideRight' }} name="Pending" />
                <Bar dataKey="Started" fill="#0099ff" label={{ position: 'insideRight' }} name="Started" />
                <Bar dataKey="Completed" fill="#008000" label={{ position: 'insideRight' }} name="Completed" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default StatusHorizontalBarChart;


