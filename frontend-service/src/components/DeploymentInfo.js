import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Cloud,
  Computer,
  NetworkCheck,
  Speed,
  Memory,
  PlayArrow,
  Stop,
  Refresh
} from '@mui/icons-material';
import { apiService } from '../services/api';

function DeploymentInfo() {
  const [instanceData, setInstanceData] = useState(null);
  const [deploymentData, setDeploymentData] = useState(null);
  const [networkData, setNetworkData] = useState(null);
  const [stressStatus, setStressStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stressDialog, setStressDialog] = useState(false);
  const [stressConfig, setStressConfig] = useState({
    duration: 5, // minutes
    type: 'cpu'
  });

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadStressStatus, 5000); // Update stress status every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [instanceResp, deploymentResp, networkResp, stressResp] = await Promise.all([
        apiService.getInstanceMetadata(),
        apiService.getDeploymentInfo(), 
        apiService.getNetworkInfo(),
        apiService.getStressStatus()
      ]);
      
      setInstanceData(instanceResp.data.data);
      setDeploymentData(deploymentResp.data.data);
      setNetworkData(networkResp.data.data);
      setStressStatus(stressResp.data.data);
      
    } catch (err) {
      console.error('Error loading deployment data:', err);
      setError('Error loading deployment information');
    } finally {
      setLoading(false);
    }
  };

  const loadStressStatus = async () => {
    try {
      const response = await apiService.getStressStatus();
      setStressStatus(response.data.data);
    } catch (err) {
      // Silently fail for stress status updates
    }
  };

  const startStressTest = async () => {
    try {
      setError('');
      await apiService.startStressTest(stressConfig.duration, stressConfig.type);
      setStressDialog(false);
      loadStressStatus();
    } catch (err) {
      setError('Error starting stress test: ' + err.response?.data?.error || err.message);
    }
  };

  const stopStressTest = async () => {
    try {
      setError('');
      await apiService.stopStressTest();
      loadStressStatus();
    } catch (err) {
      setError('Error stopping stress test: ' + err.response?.data?.error || err.message);
    }
  };

  const getEnvironmentChip = (environment) => {
    const colors = {
      aws: 'warning',
      kubernetes: 'info', 
      local: 'default',
      demo: 'secondary'
    };
    
    return (
      <Chip
        label={environment?.toUpperCase() || 'UNKNOWN'}
        color={colors[environment] || 'default'}
        size="small"
      />
    );
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading && !instanceData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Deployment Information</Typography>
        <Button
          startIcon={<Refresh />}
          onClick={loadAllData}
          disabled={loading}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Instance Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Computer sx={{ mr: 1 }} />
                <Typography variant="h6">Instance Details</Typography>
              </Box>
              
              {instanceData && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Environment</Typography>
                    <Box mt={0.5}>
                      {getEnvironmentChip(instanceData.environment)}
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Platform</Typography>
                    <Typography variant="body1">{instanceData.platform}</Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Instance ID</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {instanceData.instance_id}
                    </Typography>
                  </Grid>
                  
                  {instanceData.instance_type && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Instance Type</Typography>
                      <Typography variant="body1">{instanceData.instance_type}</Typography>
                    </Grid>
                  )}
                  
                  {instanceData.node_name && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Node Name</Typography>
                      <Typography variant="body1">{instanceData.node_name}</Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Hostname</Typography>
                    <Typography variant="body1">{instanceData.hostname}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Network Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <NetworkCheck sx={{ mr: 1 }} />
                <Typography variant="h6">Network Details</Typography>
              </Box>
              
              {instanceData && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Private IP</Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {instanceData.private_ip}
                    </Typography>
                  </Grid>
                  
                  {instanceData.public_ip && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Public IP</Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {instanceData.public_ip}
                      </Typography>
                    </Grid>
                  )}
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Region</Typography>
                    <Typography variant="body1">{instanceData.region}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Availability Zone</Typography>
                    <Typography variant="body1">{instanceData.availability_zone}</Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Metrics & Stress Testing */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Speed sx={{ mr: 1 }} />
                  <Typography variant="h6">System Performance & Load Testing</Typography>
                </Box>
                
                <Box>
                  {stressStatus?.active ? (
                    <Button
                      startIcon={<Stop />}
                      onClick={stopStressTest}
                      color="error"
                      variant="contained"
                    >
                      Stop Stress Test
                    </Button>
                  ) : (
                    <Button
                      startIcon={<PlayArrow />}
                      onClick={() => setStressDialog(true)}
                      color="primary"
                      variant="contained"
                    >
                      Start Stress Test
                    </Button>
                  )}
                </Box>
              </Box>

              {stressStatus && (
                <Grid container spacing={3}>
                  {/* Current Metrics */}
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">CPU Usage</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <LinearProgress
                          variant="determinate"
                          value={stressStatus.metrics?.cpu_percent || 0}
                          sx={{ width: '100%', mr: 2 }}
                          color={stressStatus.metrics?.cpu_percent > 80 ? 'error' : 'primary'}
                        />
                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                          {Math.round(stressStatus.metrics?.cpu_percent || 0)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Memory Usage</Typography>
                      <Box display="flex" alignItems="center" mt={1}>
                        <LinearProgress
                          variant="determinate"
                          value={stressStatus.metrics?.memory_percent || 0}
                          sx={{ width: '100%', mr: 2 }}
                          color={stressStatus.metrics?.memory_percent > 80 ? 'error' : 'primary'}
                        />
                        <Typography variant="body2" sx={{ minWidth: 50 }}>
                          {Math.round(stressStatus.metrics?.memory_percent || 0)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Box mt={1}>
                        {stressStatus.active ? (
                          <Chip
                            label={`${stressStatus.type?.toUpperCase()} - ${stressStatus.remaining_seconds}s remaining`}
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip label="IDLE" color="success" size="small" />
                        )}
                      </Box>
                    </Box>
                  </Grid>

                  {/* Load Average */}
                  {stressStatus.metrics?.load_average && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Load Average (1m, 5m, 15m)</Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                        {stressStatus.metrics.load_average.map(load => load.toFixed(2)).join(', ')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Info Table */}
        {deploymentData && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>Additional Information</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Service Name</strong></TableCell>
                        <TableCell>{deploymentData.service_name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Version</strong></TableCell>
                        <TableCell>{deploymentData.version}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Deployment Type</strong></TableCell>
                        <TableCell>{deploymentData.deployment_type}</TableCell>
                      </TableRow>
                      {deploymentData.cloud_provider && (
                        <TableRow>
                          <TableCell><strong>Cloud Provider</strong></TableCell>
                          <TableCell>{deploymentData.cloud_provider}</TableCell>
                        </TableRow>
                      )}
                      {instanceData?.note && (
                        <TableRow>
                          <TableCell><strong>Note</strong></TableCell>
                          <TableCell><em>{instanceData.note}</em></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Stress Test Configuration Dialog */}
      <Dialog open={stressDialog} onClose={() => setStressDialog(false)}>
        <DialogTitle>Configure Stress Test</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Stress Type</InputLabel>
              <Select
                value={stressConfig.type}
                label="Stress Type"
                onChange={(e) => setStressConfig({...stressConfig, type: e.target.value})}
              >
                <MenuItem value="cpu">CPU Stress</MenuItem>
                <MenuItem value="memory">Memory Stress</MenuItem>
                <MenuItem value="mixed">Mixed (CPU + Memory)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Duration</InputLabel>
              <Select
                value={stressConfig.duration}
                label="Duration"
                onChange={(e) => setStressConfig({...stressConfig, duration: e.target.value})}
              >
                <MenuItem value={1}>1 minute</MenuItem>
                <MenuItem value={5}>5 minutes</MenuItem>
                <MenuItem value={10}>10 minutes</MenuItem>
                <MenuItem value={15}>15 minutes</MenuItem>
                <MenuItem value={30}>30 minutes</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStressDialog(false)}>Cancel</Button>
          <Button onClick={startStressTest} variant="contained">
            Start Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DeploymentInfo;