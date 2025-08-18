import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { Download, Refresh, Person, LocalShipping, VerifiedUser } from '@mui/icons-material';
import image from '../img/image.png';
import html2canvas from 'html2canvas';
import API_CONFIG from '../config/api';
import tnlLogo from '../img/tnllogo.jpg';
import axiosInstance from '../utils/axios';

const LicenseGenerator = () => {
  const [truckersmpId, setTruckersmpId] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const licenseRef = useRef(null);

  // Generate random license number
  const generateLicenseNumber = () => {
    const randomNum = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `TNL ${randomNum.slice(0, 4)}-${randomNum.slice(4)}`;
  };

  useEffect(() => {
    if (memberData) {
      // Use license number from backend if available, otherwise generate locally
      if (memberData.licenseNumber) {
        setLicenseNumber(memberData.licenseNumber);
      } else {
        setLicenseNumber(generateLicenseNumber());
      }
    }
  }, [memberData]);

  const fetchMemberData = async () => {
    if (!truckersmpId.trim()) {
      setError('Please enter a TruckersMP ID');
      return;
    }

    setLoading(true);
    setError('');
    setMemberData(null);

    try {
      const response = await axiosInstance.post('/vtc/license', {
        memberId: truckersmpId
      });

      if (response.data.error) {
        throw new Error(response.data.error || 'Member not found');
      }

      setMemberData(response.data.response);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 404) {
        setError('Member not found');
      } else {
        setError('Failed to fetch member data');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadLicense = async () => {
    if (!licenseRef.current) return;

    try {
      setLoading(true);
      const canvas = await html2canvas(licenseRef.current, {
        scale: 2,
        backgroundColor: '#1a1a1a',
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `TNL_License_${memberData.username}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      setError('Failed to generate license image');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTruckersmpId('');
    setMemberData(null);
    setError('');
    setLicenseNumber('');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        TNL License Generator
      </Typography>

      <Grid container spacing={4}>
        {/* Input Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Generate Your License
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your TruckersMP ID to generate your official TNL license
            </Typography>

            <TextField
              fullWidth
              label="TruckersMP ID"
              value={truckersmpId}
              onChange={(e) => setTruckersmpId(e.target.value)}
              placeholder="Enter your TruckersMP ID"
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={fetchMemberData}
              disabled={loading || !truckersmpId.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <Person />}
              sx={{ mb: 2 }}
            >
              {loading ? 'Fetching...' : 'Fetch Member Data'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {memberData && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Member Information
                </Typography>
                <Typography variant="body2">
                  <strong>Username:</strong> {memberData.username}
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> {memberData.role || (memberData.roles && memberData.roles[0] ? memberData.roles[0].name : 'Member')}
                </Typography>
                <Typography variant="body2">
                  <strong>Join Date:</strong> {new Date(memberData.joinDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* License Preview */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5">
                License Preview
              </Typography>
              {memberData && (
                <Button
                  variant="outlined"
                  onClick={resetForm}
                  startIcon={<Refresh />}
                >
                  Reset
                </Button>
              )}
            </Box>

            {!memberData ? (
              <Card sx={{
                height: 450,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1a1a1a',
                color: 'white'
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <LocalShipping sx={{ fontSize: 80, color: '#666', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Enter your TruckersMP ID to preview your license
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box>
                {/* License Card */}
                <Box
                  ref={licenseRef}
                  sx={{
                    width: '100%',
                    height: '100%',
                    background: '#0a0a0a',
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                  }}
                >
                  {/* Background Pattern */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `
                          linear-gradient(45deg, transparent 40%, rgba(255, 215, 0, 0.03) 50%, transparent 60%)
                        `,
                      zIndex: 1
                    }}
                  />

                  {/* Header Section */}
                  <Box sx={{
                    background: '#1a1a1a',
                    p: 3,
                    position: 'relative',
                    zIndex: 2,
                    borderBottom: '1px solid rgba(255, 215, 0, 0.2)'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* TNL Logo & Brand */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 45,
                            height: 45,
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #ffd700'
                          }}
                        >
                          <img
                            src={tnlLogo}
                            alt="TNL Logo"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#ffd700', fontWeight: 600, lineHeight: 1.1 }}>
                            TAMILNADU LOGISTICS
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999', lineHeight: 1.1 }}>
                            Professional Transport Solutions
                          </Typography>
                        </Box>
                      </Box>

                      {/* License ID Badge */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            background: 'rgba(255, 215, 0, 0.1)',
                            color: '#ffd700',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            fontSize: '11px',
                            fontWeight: '600',
                            textAlign: 'center',
                            minWidth: 75,
                            border: '1px solid rgba(255, 215, 0, 0.3)'
                          }}
                        >
                          {licenseNumber || 'TNL LICENSE'}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5, fontSize: '10px' }}>
                          🇮🇳 INDIA
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Main Content */}
                  <Box sx={{
                    display: 'flex',
                    flex: 1,
                    p: 3,
                    zIndex: 2,
                    position: 'relative',
                    gap: 3
                  }}>
                    {/* Left Panel - Minimalist Design */}
                    <Box sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Abstract Geometric Design */}
                      <Box
                        sx={{
                          width: '100%',
                          height: 180,
                          position: 'relative',
                          mb: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Main Circle */}
                        <Box
                          sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
                            border: '2px solid rgba(255, 215, 0, 0.3)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {/* Inner Elements */}
                          <Box
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              background: 'rgba(255, 215, 0, 0.05)',
                              border: '1px solid rgba(255, 215, 0, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="h4" sx={{
                              color: '#ffd700',
                              fontWeight: 300,
                              fontSize: '2.5rem'
                            }}>
                              TNL
                            </Typography>
                          </Box>
                        </Box>

                        {/* Decorative Lines */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 140,
                            height: 140,
                            border: '1px solid rgba(255, 215, 0, 0.1)',
                            borderRadius: '50%'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 160,
                            height: 160,
                            border: '1px solid rgba(255, 215, 0, 0.05)',
                            borderRadius: '50%'
                          }}
                        />
                      </Box>

                      {/* Verification Badge */}
                      <Box
                        sx={{
                          background: 'rgba(76, 175, 80, 0.1)',
                          color: '#4caf50',
                          px: 3,
                          py: 1,
                          borderRadius: 2,
                          fontWeight: '500',
                          fontSize: '12px',
                          border: '1px solid rgba(76, 175, 80, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#4caf50'
                          }}
                        />
                        VERIFIED
                      </Box>
                    </Box>

                    {/* Right Panel - Personal Details */}
                    <Box sx={{
                      flex: 1,
                      color: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: 3
                    }}>
                      {/* Member Name */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{
                          mb: 1,
                          fontWeight: 300,
                          color: '#ffd700',
                          fontSize: '2.5rem'
                        }}>
                          {memberData.username}
                        </Typography>
                        <Typography variant="body1" sx={{
                          color: '#ccc',
                          fontSize: '0.9rem'
                        }}>
                          Member
                        </Typography>
                      </Box>

                      {/* Role */}
                      <Box sx={{
                        background: 'rgba(255, 215, 0, 0.05)',
                        p: 2,
                        borderRadius: 2,
                        textAlign: 'center',
                        border: '1px solid rgba(255, 215, 0, 0.1)'
                      }}>
                        <Typography variant="h6" sx={{
                          color: '#ffd700',
                          fontWeight: '400',
                          fontSize: '1rem'
                        }}>
                          {memberData.role || (memberData.roles && memberData.roles[0] ? memberData.roles[0].name : 'Member')}
                        </Typography>
                      </Box>

                      {/* License Number */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{
                          color: '#999',
                          mb: 1,
                          fontSize: '0.8rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          License Number
                        </Typography>
                        <Typography variant="h5" sx={{
                          color: '#ffd700',
                          fontWeight: '500',
                          fontSize: '1.2rem',
                          letterSpacing: '1px'
                        }}>
                          {licenseNumber || 'Generating...'}
                        </Typography>
                      </Box>

                      {/* Member Since */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" sx={{
                          color: '#666',
                          fontSize: '0.75rem'
                        }}>
                          Member since {memberData ? new Date(memberData.joinDate).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Bottom Disclaimer */}
                  <Box sx={{
                    p: 2,
                    textAlign: 'center',
                    zIndex: 2,
                    position: 'relative',
                    borderTop: '1px solid rgba(255, 215, 0, 0.1)'
                  }}>
                    <Typography variant="caption" sx={{
                      color: '#666',
                      fontSize: '8px',
                      fontStyle: 'italic'
                    }}>
                      Entertainment purposes only
                    </Typography>
                  </Box>
                </Box>

                {/* Download Button */}
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={downloadLicense}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <Download />}
                    sx={{
                      backgroundColor: '#ffd700',
                      color: '#000',
                      '&:hover': {
                        backgroundColor: '#ffed4e'
                      }
                    }}
                  >
                    {loading ? 'Generating...' : 'Download License'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LicenseGenerator;
