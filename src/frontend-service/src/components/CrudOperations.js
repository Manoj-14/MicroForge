import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

function CrudOperations() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await apiService.getUsers();
      setUsers(response.data);
    } catch (error) {
      setMessage('Error loading users: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (editUser) {
        await apiService.updateUser(editUser.id, formData);
        setMessage('User updated successfully!');
      } else {
        await apiService.createUser(formData);
        setMessage('User created successfully!');
      }
      
      setFormData({ firstName: '', lastName: '', email: '' });
      setEditUser(null);
      loadUsers();
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userToEdit) => {
    setEditUser(userToEdit);
    setFormData({
      firstName: userToEdit.firstName,
      lastName: userToEdit.lastName,
      email: userToEdit.email
    });
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await apiService.deleteUser(userId);
        setMessage('User deleted successfully!');
        loadUsers();
      } catch (error) {
        setMessage('Error deleting user: ' + error.message);
      }
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        User Management (CRUD Operations)
      </Typography>
      
      {message && (
        <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {editUser ? 'Edit User' : 'Add New User'}
        </Typography>
        
        <TextField
          fullWidth
          label="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          margin="normal"
          required
        />
        
        <Box sx={{ mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ mr: 1 }}
          >
            {loading ? 'Saving...' : (editUser ? 'Update User' : 'Add User')}
          </Button>
          
          {editUser && (
            <Button
              variant="outlined"
              onClick={() => {
                setEditUser(null);
                setFormData({ firstName: '', lastName: '', email: '' });
              }}
            >
              Cancel
            </Button>
          )}
        </Box>
      </Box>

      <Typography variant="h6" gutterBottom>
        Users List
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(user)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(user.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default CrudOperations;