import React from 'react';
import { Tabs, Tab, Container } from 'react-bootstrap';
import AddUsers from './../sub-Components/addUsers'; 
import AllUsers from './../sub-Components/allUsers';  

const UserManagement = () => {
  return (
    <Container>
      <Tabs defaultActiveKey="add" id="user-management-tabs" className="mb-3">
        <Tab eventKey="add" title="Add Users">
          <AddUsers />
        </Tab>
        <Tab eventKey="all" title="All Users">
          <AllUsers />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default UserManagement;
