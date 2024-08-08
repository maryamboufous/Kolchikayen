// src/components/AdminRoute.js
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';

const AdminRoute = () => {
  const { admin } = useContext(AdminContext);

  // If admin is not authenticated, redirect to the previous page
  if (!admin) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default AdminRoute;
