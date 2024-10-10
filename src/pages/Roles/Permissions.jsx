// import React from 'react'
// import { Checkbox } from 'antd'




// const permissionOptions = [
//     {label: 'Dashboard', value:1},
//     {label: 'Master Management', value:2},
//     {label: 'Message Management', value:3},
//     {label: 'Reports', value:4},
// ];
// const Permissions = ({selectedPermissions, onChange}) => {
//   return (
//     <div style={{marginTop: 10}}>
//       <span>Permissions: </span>
//       <Checkbox.Group
//       options={permissionOptions}
//       value={selectedPermissions}
//       onChange={onChange}
//       />
//     </div>
//   )
// }

// export default Permissions


import React from 'react';
import { Checkbox } from 'antd';


const permissionOptions = [
  { label: 'Dashboard', value: 1 },
  {
      label: 'Master Management',
      value: 2,
      children: [
          { label: 'User Management', 
          value: 2.1 ,
          children:[
            {label:'RolePage', value: '2.1.1'},
            {label:'addUser', value: '2.1.2'},
            {label:'allUsers', value: '2.1.3'},
            {label:'securityQuestions', value:'2.1.4'}
          ]
        },
          { label: 'Group', value: 2.2 },
          { label: 'Type', value: 2.3 },
          { label: 'Project', value: 2.4 },
          { label: 'Zone', value: 2.5 },
          { label: 'Camera', value: 2.6 },
          { label: 'Machines', value: 2.7 },
          { label: 'Alarm', value: 2.8 },
          { label: 'Team', value: 2.9 },
          { label: 'Process Settings', value: 2.10 },
      ],
  },
  { label: 'Message Management', value: 3 },
  { label: 'Reports', value: 4 },
];

const Permissions = ({ selectedPermissions = [], onChange }) => {
    const handleParentChange = (value) => {
        const isChecked = selectedPermissions.includes(value);
        const newPermissions = isChecked
            ? selectedPermissions.filter(item => item !== value && !item.toString().startsWith(value))
            : [...selectedPermissions, value];

        onChange(newPermissions);
    };

    const handleChildChange = (value, isChecked) => {
        const newPermissions = isChecked
            ? [...selectedPermissions, value]
            : selectedPermissions.filter(item => item !== value);
        onChange(newPermissions);
    };

    const renderOptions = (options) => {
        return options.map(option => (
            <div key={option.value}>
                <Checkbox
                    value={option.value}
                    checked={selectedPermissions.includes(option.value)}
                    onChange={() => handleParentChange(option.value)}
                >
                    {option.label}
                </Checkbox>
                {option.children && (
                    <div style={{ marginLeft: 20 }}>
                        {option.children.map(child => (
                            <Checkbox
                                key={child.value}
                                value={child.value}
                                checked={selectedPermissions.includes(child.value)}
                                onChange={(e) => handleChildChange(child.value, e.target.checked)}
                            >
                                {child.label}
                            </Checkbox>
                        ))}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div style={{ marginTop: 10 }}>
            <span>Permissions: </span>
            <Checkbox.Group value={selectedPermissions} onChange={onChange}>
                {renderOptions(permissionOptions)}
            </Checkbox.Group>
        </div>
    );
};

export default Permissions;
