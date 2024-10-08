import React from 'react'
import { Checkbox } from 'antd'




const permissionOptions = [
    {label: 'Dashboard', value:'dashboard'},
    {label: 'Master Management', value:'masterManagement'},
    {label: 'Message Management', value:'messageManagement'},
    {label: 'Reports', value:'reports'},
];
const Permissions = ({selectedPermissions, onChange}) => {
  return (
    <div style={{marginTop: 10}}>
      <span>Permissions: </span>
      <Checkbox.Group
      options={permissionOptions}
      value={selectedPermissions}
      onChange={onChange}
      />
    </div>
  )
}

export default Permissions
