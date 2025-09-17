import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Badge,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Avatar
} from '@mui/material';
import {
  Notifications,
  CheckCircle,
  Warning,
  Error,
  Info,
  MarkEmailRead,
  Refresh,
  Clear
} from '@mui/icons-material';
import { apiService } from '../services/api';

function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError(err.response?.data?.message || 'Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Error marking notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(unreadNotifications.map(n => apiService.markNotificationRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError('Error marking all as read');
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    const props = { sx: { fontSize: '1.2rem' } };
    switch (type) {
      case 'success': return <CheckCircle color="success" {...props} />;
      case 'warning': return <Warning color="warning" {...props} />;
      case 'error': return <Error color="error" {...props} />;
      default: return <Info color="info" {...props} />;
    }
  };

  const getServiceChipColor = (service) => {
    switch (service) {
      case 'login-service': return 'primary';
      case 'auth-service': return 'secondary';
      case 'notification-service': return 'success';
      case 'metadata-service': return 'warning';
      default: return 'default';
    }
  };

  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    const diff = Date.now() - date;
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    return m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : h < 24 ? `${h}h ago` : `${d}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading && notifications.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center">
          <Badge badgeContent={unreadCount} color="error">
            <Notifications sx={{ mr: 1 }} />
          </Badge>
          <Typography variant="h5">System Notifications</Typography>
          {unreadCount > 0 && (
            <Chip 
              label={`${unreadCount} unread`} 
              color="error" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </Box>
        <Box>
          <IconButton onClick={loadNotifications} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : <Refresh />}
          </IconButton>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              startIcon={<MarkEmailRead />} 
              onClick={markAllAsRead}
              sx={{ ml: 1 }}
            >
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <IconButton onClick={clearAllNotifications} sx={{ ml: 1 }}>
              <Clear />
            </IconButton>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Notifications sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System notifications will appear here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    mb: 0.5,
                    border: notification.read ? 'none' : '1px solid',
                    borderColor: 'primary.light',
                    borderRadius: 1
                  }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'transparent' }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography 
                          variant="subtitle2" 
                          sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}
                        >
                          {notification.title}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          {notification.service && (
                            <Chip
                              label={notification.service}
                              color={getServiceChipColor(notification.service)}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notification.timestamp || notification.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: notification.read ? 'text.secondary' : 'text.primary',
                          mt: 0.5
                        }}
                      >
                        {notification.message}
                      </Typography>
                    }
                  />
                  {!notification.read && (
                    <IconButton onClick={() => markAsRead(notification.id)} size="small">
                      <MarkEmailRead fontSize="small" />
                    </IconButton>
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}
      
      <Box mt={2} textAlign="center">
        <Typography variant="caption" color="text.secondary">
          Notifications are refreshed every 30 seconds
        </Typography>
      </Box>
    </Box>
  );
}

export default NotificationPanel;
