import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    vtcName: 'Tamilnadu Logistics',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for error from URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'steam_auth_failed') {
      setError('Steam authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/register', formData);
      const { token, user, message } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Show success message about pending approval
      if (message && message.includes('pending approval')) {
        setSuccess(message);
        setError('');
        // Show message for 5 seconds then navigate
        setTimeout(() => {
          navigate('/');
        }, 5000);
      } else {
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleSteamRegistration = () => {
    navigate('/register/steam');
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register New Event Teammate
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {success}
            <Typography variant="body2" sx={{ mt: 1 }}>
              You will receive an email once your account is approved by HR/Admin.
            </Typography>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
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
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSteamRegistration}
            sx={{ 
              mt: 2,
              backgroundColor: '#171a21',
              color: 'white',
              borderColor: '#171a21',
              '&:hover': {
                backgroundColor: '#2a475e',
                borderColor: '#2a475e',
              }
            }}
          >
            <Box component="img" 
              src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_01.png" 
              alt="Steam"
              sx={{ height: 20, mr: 1 }}
            />
            Register with Steam
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link href="/login" underline="hover">
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 