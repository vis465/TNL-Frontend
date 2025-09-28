import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const steps = ['Steam Authentication', 'Account Details', 'Additional Information', 'Review & Confirm'];

const SteamRegistration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [steamData, setSteamData] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    vtcName: 'Tamilnadu Logistics',
    name: '',
    tmpIngameName: '',
    truckershubId: '',
    truckersmpId: '',
    age: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [externalIds, setExternalIds] = useState({
    truckersmp: null,
    truckershub: null,
    loading: false
  });

  // Check if coming from Steam OAuth callback
  useEffect(() => {
    const steamDataParam = searchParams.get('steamData');
    const error = searchParams.get('error');

    if (error) {
      setError('Steam authentication failed. Please try again.');
      return;
    }

    if (steamDataParam) {
      try {
        const steamData = JSON.parse(decodeURIComponent(steamDataParam));
        setSteamData(steamData);
        setActiveStep(1); // Move to account details step
        
        // Search for external IDs
        if (steamData.steamId) {
          searchExternalIds(steamData.steamId);
        }
      } catch (err) {
        setError('Invalid Steam data received. Please try again.');
      }
    }
  }, [searchParams]);

  const handleSteamLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL }/auth/steam`;
  };

  const searchExternalIds = async (steamId) => {
    setExternalIds(prev => ({ ...prev, loading: true }));
    try {
      const response = await axiosInstance.post('/auth/search-external-ids', { steamId });
      console.log(response.data);
      if (response.data.success) {
        setExternalIds({
          truckersmp: response.data.data.truckersmp,
          truckershub: response.data.data.truckershub,
          loading: false
        });
        
        // Auto-populate fields if found
        if (response.data.data.truckersmp) {
          setFormData(prev => ({
            ...prev,
            truckersmpId: response.data.data.truckersmp.id.toString()
          }));
        }
        if (response.data.data.truckershub) {
          setFormData(prev => ({
            ...prev,
            truckershubId: response.data.data.truckershub.id.toString()
          }));
        }
      }
    } catch (error) {
      console.error('Error searching external IDs:', error);
      setExternalIds(prev => ({ ...prev, loading: false }));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate account details
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    if (activeStep === 2) {
      // Validate additional information
      if (!formData.vtcName) {
        setError('VTC Name is required');
        return;
      }
    }
    setError('');
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      const registrationData = {
        username: steamData.steamProfile.personaName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        email: formData.email,
        password: formData.password,
        vtcName: formData.vtcName,
        steamId: steamData.steamId, // Fixed: changed from steamID to steamId
        name: formData.name || steamData.steamProfile.personaName,
        tmpIngameName: formData.tmpIngameName || steamData.steamProfile.personaName,
        age: parseInt(formData.age) || null,
        truckershubId: formData.truckershubId || null,
        truckersmpId: formData.truckersmpId || null,
        gamesOwned: steamData.games.ets2 && steamData.games.ats ? ['ets2', 'ats'] : 
                   steamData.games.ets2 ? ['ets2'] : 
                   steamData.games.ats ? ['ats'] : [],
        dlcsOwned: {
          ets2: steamData.dlcs.ets2 || [],
          ats: steamData.dlcs.ats || []
        }
      };

      const response = await axiosInstance.post('/auth/register', registrationData);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Update auth context
      login(user, token);
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 1: Connect with Steam
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Sign in with your Steam account to automatically detect your game ownership and profile information.
            </Typography>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSteamLogin}
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
              Sign in with Steam
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 2: Account Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create your account credentials and basic information.
            </Typography>

            {steamData && (
              <Card sx={{ mb: 3}}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar src={steamData.steamProfile.avatarFull} />
                    <Box>
                      <Typography variant="subtitle1">
                        {steamData.steamProfile.personaName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Steam ID: {steamData.steamId}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Games and DLCs Display */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Detected Games & DLCs:
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {steamData.games.ets2 && (
                        <Chip 
                          label="ETS2" 
                          color="primary" 
                          size="small"
                          icon={<Box component="span">🚛</Box>}
                        />
                      )}
                      {steamData.games.ats && (
                        <Chip 
                          label="ATS" 
                          color="secondary" 
                          size="small"
                          icon={<Box component="span">🚚</Box>}
                        />
                      )}
                    </Box>
                    
                    {steamData.dlcs.ets2.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          ETS2 DLCs: {steamData.dlcs.ets2.length} detected
                        </Typography>
                      </Box>
                    )}
                    {steamData.dlcs.ats.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          ATS DLCs: {steamData.dlcs.ats.length} detected
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            <TextField
              fullWidth
              label="Email Address"
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
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />
           
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 3: Additional Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Provide additional details to complete your profile. External IDs will be auto-populated if found.
            </Typography>

            {/* External ID Search Results */}
            {externalIds.loading && (
              <Box sx={{ mb: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Searching for external accounts...
                </Typography>
              </Box>
            )}

            {(externalIds.truckersmp || externalIds.truckershub) && (
              <Card sx={{ mb: 3}}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Found External Accounts:
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {externalIds.truckersmp && (
                      <Chip 
                        label={`TruckersMP: ${externalIds.truckersmp.username}`}
                        
                        size="small"
                      />
                    )}
                    {externalIds.truckershub && (
                      <Chip 
                        label={`TruckersHub: ${externalIds.truckershub.username}`}
                        
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              placeholder={steamData?.steamProfile?.personaName || ''}
            />
            <TextField
              fullWidth
              label="In-Game Name"
              name="tmpIngameName"
              value={externalIds.truckersmp.username}
              disabled={!!externalIds.truckersmp} 
              onChange={handleChange}
              margin="normal"
              placeholder={steamData?.steamProfile?.personaName || ''}
            />
            <TextField
              fullWidth
              label="TruckersHub ID"
              name="truckershubId"
              value={formData.truckershubId}
              disabled={!!externalIds.truckershub}
              onChange={handleChange}
              margin="normal"
              helperText={externalIds.truckershub ? "Auto-populated from search" : "Enter your TruckersHub ID"}
            />
            <TextField
              fullWidth
              label="TruckersMP ID"
              name="truckersmpId"
              value={formData.truckersmpId}
              disabled={!!externalIds.truckersmp}
              onChange={handleChange}
              margin="normal"
              helperText={externalIds.truckersmp ? "Auto-populated from search" : "Enter your TruckersMP ID"}
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              margin="normal"
            />
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Step 4: Review & Confirm
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Please review all your information before creating your account.
            </Typography>

            {/* Steam Profile Review */}
            {steamData && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Steam Profile
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar src={steamData.steamProfile.avatarFull} />
                    <Box>
                      <Typography variant="subtitle2">
                        {steamData.steamProfile.personaName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Steam ID: {steamData.steamId}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      <strong>Games Owned:</strong>
                    </Typography>
                    <Box display="flex" gap={1} mb={1}>
                      {steamData.games.ets2 && (
                        <Chip label="ETS2" color="primary" size="small" />
                      )}
                      {steamData.games.ats && (
                        <Chip label="ATS" color="secondary" size="small" />
                      )}
                    </Box>
                    
                    {steamData.dlcs.ets2.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ETS2 DLCs: {steamData.dlcs.ets2.length} detected
                      </Typography>
                    )}
                    {steamData.dlcs.ats.length > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        ATS DLCs: {steamData.dlcs.ats.length} detected
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Account Details Review */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Account Details
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{formData.email}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">VTC Name</Typography>
                    <Typography variant="body1">{formData.vtcName}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Additional Information Review */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Additional Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Full Name</Typography>
                    <Typography variant="body1">{formData.name || steamData?.steamProfile?.personaName || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">In-Game Name</Typography>
                    <Typography variant="body1">{formData.tmpIngameName || steamData?.steamProfile?.personaName || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">TruckersHub ID</Typography>
                    <Typography variant="body1">{formData.truckershubId || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">TruckersMP ID</Typography>
                    <Typography variant="body1">{formData.truckersmpId || 'Not provided'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Age</Typography>
                    <Typography variant="body1">{formData.age || 'Not provided'}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* External Accounts Review */}
            {(externalIds.truckersmp || externalIds.truckershub) && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    External Accounts Found
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {externalIds.truckersmp && (
                      <Chip 
                        label={`TruckersMP: ${externalIds.truckersmp.username}`}
                        color="primary"
                        size="small"
                      />
                    )}
                    {externalIds.truckershub && (
                      <Chip 
                        label={`TruckersHub: ${externalIds.truckershub.username}`}
                        color="secondary"
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register with Steam
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  color="success"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 0 && !steamData}
                >
                  {activeStep === steps.length - 2 ? 'Review' : 'Next'}
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Button 
                variant="text" 
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                Login here
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SteamRegistration;
