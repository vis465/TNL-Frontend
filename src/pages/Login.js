import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // Check for error from URL params and handle Steam login
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    const token = searchParams.get('token');
    const steamLogin = searchParams.get('steam_login');
    const accountExists = searchParams.get('account_exists');
    
    if (errorParam === 'steam_auth_failed') {
      setError('Steam authentication failed. Please try again.');
    } else if (accountExists === 'true') {
      setError('Account already exists with this Steam ID. Please login with your credentials or contact admin for password reset.');
    } else if (token && steamLogin === 'true') {
      // Handle Steam login
      localStorage.setItem('token', token);
      // Get user data from token (you might want to decode JWT or make an API call)
      // For now, we'll navigate to dashboard and let the auth context handle it
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Attempting login with:', { identifier: formData.identifier });
      const payload = formData.identifier.includes('@')
        ? { email: formData.identifier, password: formData.password }
        : { username: formData.identifier, password: formData.password };
      const response = await axiosInstance.post('/auth/login', payload);

      console.log('Login response:', response.data);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update auth context
      login(user, token);
      
      // Navigate to home page
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email or Username"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Login
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link href="/forgot-password" underline="hover">
                Forgot your password?
              </Link>
            </Box>
          </form>
          
          
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 