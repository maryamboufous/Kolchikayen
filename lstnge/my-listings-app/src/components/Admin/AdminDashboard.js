import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    productCount: 0,
    totalLikes: 0,
    traffic: Math.floor(Math.random() * 1000), // Random number for traffic
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5001/admin/stats'); // Replace with correct URL if different
        console.log('Admin stats response:', response.data);
        if (response.data.status === 'ok') {
          setStats(prevStats => ({
            ...prevStats,
            ...response.data.data
          }));
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5">Total Users</Typography>
              <Typography variant="h4">{stats.userCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5">Total Products</Typography>
              <Typography variant="h4">{stats.productCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5">Total Likes</Typography>
              <Typography variant="h4">{stats.totalLikes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5">Traffic</Typography>
              <Typography variant="h4">{stats.traffic}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminDashboard;
