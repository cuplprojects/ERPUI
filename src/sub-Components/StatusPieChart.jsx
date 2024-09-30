// import React from 'react';
// import { Pie } from 'react-chartjs-2';
// import 'chart.js/auto'; // Ensure chart.js gets automatically registered
// import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import the plugin

// const StatusPieChart = ({ data }) => {
//     const updateData = (jsonData) => {
//         let pending = 0, started = 0, completed = 0;

//         jsonData.forEach(item => {
//             if (item.status === 'Pending') {
//                 pending += 1;
//             } else if (item.status === 'Started') {
//                 started += 1;
//             } else if (item.status === 'Completed') {
//                 completed += 1;
//             }
//         });

//         return {
//             labels: ['Pending', 'Started', 'Completed'],
//             datasets: [
//                 {
//                     data: [pending, started, completed],
//                     backgroundColor: ['#FF7D7D', '#0099ff', '#008000'],
//                     hoverBackgroundColor: ['#FF5A5A', '#007acc', '#006600'],
//                     borderWidth: 2,
//                 }
//             ]
//         };
//     };

//     const chartData = updateData(data);

//     const options = {
//         responsive: true,
//         plugins: {
//             datalabels: {
//                 color: '#ffffff', // Label color
//                 formatter: (value, context) => {
//                     const total = context.chart._metasets[context.datasetIndex].total;
//                     const percentage = ((value / total) * 100).toFixed(0) + '%';
//                     return percentage; // Display the percentage inside the chart
//                 },
//                 anchor: 'end',
//                 align: 'start',
//                 offset: -10,
//                 borderRadius: 4,
//                 backgroundColor: '#000',
//                 padding: 6,
//             },
//             tooltip: {
//                 callbacks: {
//                     label: function (context) {
//                         const label = context.label || '';
//                         const value = context.raw || 0;
//                         return `${label}: ${value}`;
//                     }
//                 }
//             },
//             legend: {
//                 position: 'bottom',
//                 labels: {
//                     padding: 20,
//                     usePointStyle: true,
//                 }
//             }
//         }
//     };

//     return (
//         <div className=''>
//             <Pie
//                 data={chartData}
//                 options={options}
//                 plugins={[ChartDataLabels]} // Register the plugin
//                 width={180} // Set the width of the chart
//                 height={180}
//             />
//         </div>
//     );
// };

// export default StatusPieChart;


// --------------------------------------------------------------------------------------
// import React, { useState } from 'react';
// import { PieChart, Pie, Cell, Tooltip, Legend, Label } from 'recharts';

// const StatusPieChart = ({ data }) => {
//     // State to keep track of the selected slice
//     const [activeIndex, setActiveIndex] = useState(null);

//     const updateData = (jsonData) => {
//         let pending = 0, started = 0, completed = 0;

//         jsonData.forEach(item => {
//             if (item.status === 'Pending') {
//                 pending += 1;
//             } else if (item.status === 'Started') {
//                 started += 1;
//             } else if (item.status === 'Completed') {
//                 completed += 1;
//             }
//         });

//         return [
//             { name: 'Pending', value: pending },
//             { name: 'Started', value: started },
//             { name: 'Completed', value: completed },
//         ];
//     };

//     const chartData = updateData(data);

//     const COLORS = ['#FF7D7D', '#0099ff', '#008000'];

//     // Function to handle click on a pie slice
//     const onPieClick = (index) => {
//         if (activeIndex === index) {
//             // Deselect if the same slice is clicked again
//             setActiveIndex(null);
//         } else {
//             // Select the clicked slice
//             setActiveIndex(index);
//         }
//     };

//     return (
//         <PieChart width={350} height={350}>
//             <Pie
//                 data={chartData}
//                 cx="50%"
//                 cy="50%"
//                 labelLine={true}
//                 outerRadius={120}
//                 fill="#8884d8"
//                 dataKey="value"
//                 // label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
//                 onClick={(e, index) => onPieClick(index)} // Add click handler
//             >
//                 {chartData.map((entry, index) => (
//                     <Cell
//                         key={`cell-${index}`}
//                         fill={COLORS[index]}
//                         stroke={activeIndex === index ? '#ffffff' : '#000000'} // Highlight the selected slice
//                     />
//                 ))}
//             </Pie>

//             {/* Custom tooltip logic */}
//             {activeIndex !== null && (
//                 <Tooltip
//                     content={<div style={{ padding: '5px', background: '#fff', border: '1px solid white' }}>
//                         <strong>{chartData[activeIndex].name}</strong>: {chartData[activeIndex].value}
//                     </div>}
//                     position={{ x: '50%', y: '50%' }} // Position tooltip
//                     wrapperStyle={{ visibility: 'visible' }} // Keep tooltip visible
//                     className="rounded-4"
//                 />
//             )}

//             <Legend />
//         </PieChart>
//     );
// };

// export default StatusPieChart;
// -------------------------------------------------------------------------------------------------------
//     zzz Option 2 for pie chart @catch level zzz

// import React from 'react';
// import ReactECharts from 'echarts-for-react';

// const StatusPieChart = ({ data }) => {
//     const updateData = (jsonData) => {
//         let pending = 0, started = 0, completed = 0;

//         jsonData.forEach(item => {
//             if (item.status === 'Pending') {
//                 pending += 1;
//             } else if (item.status === 'Started') {
//                 started += 1;
//             } else if (item.status === 'Completed') {
//                 completed += 1;
//             }
//         });

//         return [
//             { value: pending, name: 'Pending' },
//             { value: started, name: 'Started' },
//             { value: completed, name: 'Completed' },
//         ];
//     };

//     const chartData = updateData(data);

//     const option = {
//         tooltip: {
//             trigger: 'item',
//             formatter: '{a} <br/>{b}: {c} ({d}%)',
//         },
//         legend: {
//             orient: 'vertical',
//             left: 'left',
//         },
//         series: [
//             {
//                 name: 'Status',
//                 type: 'pie',
//                 radius: '50%',
//                 data: chartData,
//                 emphasis: {
//                     itemStyle: {
//                         shadowBlur: 10,
//                         shadowOffsetX: 0,
//                         shadowColor: 'rgba(0, 0, 0, 0.5)',
//                     },
//                 },
//             },
//         ],
//     };

//     return (
//         // <div className="box ">
//         <ReactECharts option={option} style={{ height: '380px', width: '400px' }} className='p-md-3 pt-3' />
//         // </div>
//     );
// };

// export default StatusPieChart;

// -------------------------------------------------------------------------------------------------------

//  zzz Option 5 for pie chart @catch level zzz
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


