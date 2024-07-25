// Dashboard.js
import React, { useContext } from 'react';
import AddProductForm from './AddProductForm';
import { UserContext } from '../context/UserContext';

const Dashboard = () => {
  const { user } = useContext(UserContext);

  if (!user) {
    return <p>Loading...</p>; // or redirect to login page
  }

  return (
    <div>
        <Header>
      <h1>Dashboard</h1>
      <AddProductForm />
      </Header>
    </div>
  );
};

export default Dashboard;