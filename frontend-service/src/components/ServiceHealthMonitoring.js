import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Speed,
  Memory,
  NetworkCheck
} from '@mui/icons-material';
import { loadConfig } from "../config";

function ServiceHealthMonitoring() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  // Load config on component mount
  useEffect(() => {
    const initConfig = async () => {
      try {
        const cfg = await loadConfig();
        setConfig(cfg);
      } catch (err) {
        setError('Failed to load configuration: ' + err.message);
      } finally {
        setConfigLoading(false);
      }
    };

    initConfig();
  }, []);

  // Load service health after config is loaded
  useEffect(() => {
    if (config) {
      loadServiceHealth();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadServiceHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [config]);

  const checkServiceHealth = async (service) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const startTime = Date.now();
      const response = await fetch(service.healthUrl, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors'
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          ...service,
          status: 'healthy',
          responseTime: `${responseTime}ms`,
          lastCheck: new Date().toISOString(),
          error: null
        };
      } else {
        return {
          ...service,
          status: 'unhealthy',
          responseTime: `${responseTime}ms`,
          lastCheck: new Date().toISOString(),
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        ...service,
        status: 'unhealthy',
        responseTime: 'timeout',
        lastCheck: new Date().toISOString(),
        error: error.name === 'AbortError' ? 'Timeout' : error.message
      };
    }
  };

  const loadServiceHealth = async () => {
    if (!config) return;
    
    setLoading(true);
    setError('');
    
    try {
      const {
        REACT_APP_LOGIN_SERVICE_URL: LOGIN_SERVICE_URL,
        REACT_APP_AUTH_SERVICE_URL: AUTH_SERVICE_URL,
        REACT_APP_NOTIFICATION_SERVICE_URL: NOTIFICATION_SERVICE_URL,
        REACT_APP_METADATA_SERVICE_URL: METADATA_SERVICE_URL,
      } = config;

      const serviceConfigs = [
        {
          name: 'Frontend',
          port: 3000,
          healthUrl: `${window.location.origin}`,
          endpoints: 4,
          technology: 'React',
          uptime: 'Running',
          memory: 'N/A',
          cpu: 'N/A',
          version: '1.0.0'
        },
        {
          name: 'Login Service',
          port: 8081,
          healthUrl: `${LOGIN_SERVICE_URL}/actuator/health`,
          endpoints: 6,
          technology: 'Spring Boot',
          uptime: 'N/A',
          memory: 'N/A',
          cpu: 'N/A',
          version: '1.0.0'
        },
        {
          name: 'Auth Service',
          port: 8082,
          healthUrl: `${AUTH_SERVICE_URL}/api/health`,
          endpoints: 3,
          technology: 'Go',
          uptime: 'N/A',
          memory: 'N/A',
          cpu: 'N/A',
          version: '1.0.0'
        },
        {
          name: 'Notification Service',
          port: 8083,
          healthUrl: `${NOTIFICATION_SERVICE_URL}/api/health`,
          endpoints: 8,
          technology: 'Node.js',
          uptime: 'N/A',
          memory: 'N/A',
          cpu: 'N/A',
          version: '1.0.0'
        },
        {
          name: 'Metadata Service',
          port: 8084,
          healthUrl: `${METADATA_SERVICE_URL}/api/health`,
          endpoints: 4,
          technology: 'Python',
          uptime: 'N/A',
          memory: 'N/A',
          cpu: 'N/A',
          version: '1.0.0'
        }
      ];

      // Check health of all services concurrently
      const healthChecks = await Promise.all(
        serviceConfigs.map(service => checkServiceHealth(service))
      );
      
      setServices(healthChecks);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError('Error loading service health: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while config is loading
  if (configLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
        <Typography sx={{ ml: 2 }}>Loading configuration...</Typography>
      </Box>
    );
  }

  // Rest of your component remains the same...
  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'unhealthy':
        return <Error sx={{ color: 'error.main' }} />;
      default:
        return <Warning sx={{ color: 'warning.main' }} />;
    }
  };

  const getStatusChip = (status) => {
    const chipProps = { size: 'small', sx: { minWidth: 80 } };

    switch (status) {
      case 'healthy':
        return <Chip label="Healthy" color="success" {...chipProps} />;
      case 'unhealthy':
        return <Chip label="Unhealthy" color="error" {...chipProps} />;
      default:
        return <Chip label="Unknown" color="warning" {...chipProps} />;
    }
  };

  const getTechnologyColor = (tech) => {
    switch (tech) {
      case 'React': return '#61DAFB';
      case 'Spring Boot': return '#6DB33F';
      case 'Go': return '#00ADD8';
      case 'Node.js': return '#339933';
      case 'Python': return '#3776AB';
      default: return '#666';
    }
  };

  const getResponseTimeColor = (responseTime) => {
    if (responseTime === 'timeout') return 'error';
    const time = parseInt(responseTime);
    if (time < 100) return 'success';
    if (time < 300) return 'warning';
    return 'error';
  };

  const formatLastCheck = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const healthyCount = services.filter(s => s.status === 'healthy').length;
  const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
  const overallHealth = unhealthyCount === 0 && healthyCount > 0 ? 'healthy' : 'warning';

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Service Health Monitoring
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {formatLastCheck(lastUpdated)}
          </Typography>
          <Button
            variant="outlined"
            startIcon={loading ? <LinearProgress sx={{ width: 20 }} /> : <Refresh />}
            onClick={loadServiceHealth}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Overall Health Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              {getStatusIcon(overallHealth)}
              <Typography variant="h6" sx={{ mt: 1 }}>
                Overall Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {healthyCount}/{services.length} Services Running
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ color: 'primary.main' }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Avg Response
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {services.length > 0 && services.filter(s => s.responseTime !== 'timeout').length > 0
                  ? Math.round(services
                      .filter(s => s.responseTime !== 'timeout')
                      .reduce((sum, s) => sum + parseInt(s.responseTime), 0) / 
                      services.filter(s => s.responseTime !== 'timeout').length)
                  : 'N/A'}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <NetworkCheck sx={{ color: 'success.main' }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Services Online
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {healthyCount} of {services.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Memory sx={{ color: 'info.main' }} />
              <Typography variant="h6" sx={{ mt: 1 }}>
                Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unhealthyCount === 0 ? 'All Systems Go' : `${unhealthyCount} Issues`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Services Detail Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Service Details
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Technology</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Port</TableCell>
                  <TableCell>Last Check</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map((service) => (
                  <TableRow 
                    key={service.name}
                    sx={{ 
                      backgroundColor: service.status === 'unhealthy' ? 'error.light' : 'inherit',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getStatusIcon(service.status)}
                        <Box ml={1}>
                          <Typography variant="body2" fontWeight="medium">
                            {service.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusChip(service.status)}
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={service.technology}
                        size="small"
                        sx={{
                          backgroundColor: getTechnologyColor(service.technology),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={service.responseTime}
                        color={getResponseTimeColor(service.responseTime)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {service.port}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatLastCheck(service.lastCheck)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      {service.error && (
                        <Chip 
                          label={service.error}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Health checks run every 30 seconds • Only running services will show as healthy
        </Typography>
      </Box>
    </Box>
  );
}

export default ServiceHealthMonitoring;
