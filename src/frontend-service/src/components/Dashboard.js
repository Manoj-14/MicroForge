import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CrudOperations from './CrudOperations';
import DeploymentInfo from './DeploymentInfo';
import NotificationPanel from './NotificationPanel';
import ServiceHealthMonitoring from './ServiceHealthMonitoring';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Dashboard() {
  const [tabValue, setTabValue] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Microservices Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.firstName} {user?.lastName}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ServiceHealthMonitoring />
          </Grid>
          
          <Grid item xs={12}>
            <Paper sx={{ width: '100%' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab label="CRUD Operations" />
                <Tab label="Deployment Metadata" />
                <Tab label="Notifications" />
              </Tabs>
              
              <TabPanel value={tabValue} index={0}>
                <CrudOperations />
              </TabPanel>
              
              <TabPanel value={tabValue} index={1}>
                <DeploymentInfo />
              </TabPanel>
              
              <TabPanel value={tabValue} index={2}>
                <NotificationPanel />
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Dashboard;
