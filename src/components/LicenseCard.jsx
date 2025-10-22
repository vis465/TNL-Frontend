import React, { useState, useRef, useEffect } from 'react';
import { toPng, toCanvas } from 'html-to-image';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Paper
} from '@mui/material';
import { Download, Refresh, Person, LocalShipping, VerifiedUser } from '@mui/icons-material';
import tnlLogo from '../img/tnllogo.jpg';
import axiosInstance from '../utils/axios';

const LicenseCard = ({ userData, riderData }) => {
  const elementRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [memberData, setMemberData] = useState(null);

  // Generate license number using employeeID or user ID
  const generateLicenseNumber = (employeeId) => {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TNL ${randomNum}-${employeeId}`;
  };

  useEffect(() => {
    if (userData || riderData) {
      const employeeId = riderData?.employeeID || userData?.user_id || userData?.id || '0000';
      setLicenseNumber(generateLicenseNumber(employeeId));
      setMemberData({
        ...userData,
        ...riderData,
        employeeID: riderData?.employeeID || userData?.user_id || userData?.id,
        joinDate: riderData?.createdAt || userData?.createdAt || new Date().toISOString()
      });
    }
    console.log("memberData",memberData)
    console.log("riderData",riderData)
    console.log("userData",userData)
  }, [userData, riderData]);

 

  if (!memberData) {
    return (
      <Card sx={{ p: 3, textAlign: 'center' }}>
        <LocalShipping sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No user data available
        </Typography>
      </Card>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          TNL License
        </Typography>
        <Stack direction="row" spacing={1}>
          
          
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* License Card Container */}
      <Box
        ref={elementRef}
        sx={{
          width: 720,
          height: 450,
          minWidth: 720,
          minHeight: 450,
          maxWidth: '100%',
          position: 'relative',
          mx: 'auto',
          // Ensure proper rendering for html-to-image
          boxSizing: 'border-box',
          fontFamily: 'Arial, sans-serif',
          overflow: 'hidden'
        }}
      >
        {/* License Card */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)`,
            borderRadius: 3.75,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            border: '3px solid #ffd700',
            boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
            boxSizing: 'border-box'
          }}
        >
        {/* Title Section - Top */}
        <Box sx={{
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 3
        }}>
          <Typography variant="h6" sx={{
            color: '#ffd700',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            mb: 0.75
          }}>
            TAMILNADU LOGISTICS
          </Typography>
          <Typography variant="body2" sx={{
            color: '#ffd700',
            fontSize: '1.05rem',
            fontWeight: '500',
            opacity: 0.8
          }}>
            ரௌத்திரம் பழகு
          </Typography>
        </Box>

        {/* India Flag - Top Right */}
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 3
        }}>
          <Box sx={{
            width: 36,
            height: 24,
            borderRadius: 0.75,
            overflow: 'hidden',
            border: '1.5px solid rgba(255, 255, 255, 0.3)'
          }}>
            <img
              crossOrigin="anonymous"
              alt="India Flag"
              src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
        </Box>

        {/* Background TNL Logo */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            right: '-15%',
            transform: 'translateY(-50%)',
            width: '40%',
            height: '40%',
            opacity: 0.1,
            zIndex: 1
          }}
        >
          <img
            src={tnlLogo}
            alt="TNL Background"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </Box>

        {/* Left Section - Photo Area */}
        <Box sx={{
          flex: '0 0 120px',
          p: 2,
          pt: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Photo Area */}
          <Box sx={{
            width: 80,
            height: 100,
            background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
            borderRadius: 1.5,
            border: '2px solid #ffd700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1.5,
            overflow: 'hidden',
            position: 'relative'
          }}>
            <Box sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #fff',
              position: 'absolute'
            }}>
              {riderData?.avatar ? (
                <img
                  src={riderData.avatar}
                  alt="Avatar"
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    borderRadius: '50%' 
                  }}
                />
              ) : (
                <Typography variant="h5" sx={{
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {memberData.username?.charAt(0).toUpperCase() || 'U'}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Verification Badge */}
          <Box sx={{
            background: 'linear-gradient(135deg, #4caf50, #45a049)',
            color: '#fff',
            px: 1.5,
            py: 0.3,
            borderRadius: 1,
            fontWeight: '600',
            fontSize: '8px',
            border: '1px solid #fff',
            display: 'flex',
            alignItems: 'center',
            gap: 0.3
          }}>
            <Box sx={{
              width: 3,
              height: 3,
              borderRadius: '50%',
              background: '#fff'
            }} />
            VERIFIED
          </Box>
        </Box>

        {/* Right Section - Personal Details */}
        <Box sx={{
          flex: 1,
          p: 3,
          pt: 9,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Member Name */}
          <Typography variant="h4" sx={{
            color: '#fff',
            fontWeight: '600',
            fontSize: '1.95rem',
            mb: 1.5
          }}>
            {memberData.name || memberData.username || 'Member'}
          </Typography>

          {/* Role */}
          <Box sx={{
            background: 'rgba(255, 215, 0, 0.1)',
            p: 1.5,
            borderRadius: 1.5,
            border: '1.5px solid rgba(255, 215, 0, 0.3)',
            mb: 2.25,
            display: 'inline-block'
          }}>
            <Typography variant="body1" sx={{
              color: '#ffd700',
              fontWeight: '500',
              fontSize: '1.2rem'
            }}>
              {userData?.role || 'Member'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#ccc', fontSize: '1.05rem', mt: 0.75 }}>
              <strong>ID:</strong> {memberData.employeeID || 'N/A'}
            </Typography>
          </Box>

          {/* Member Since */}
          
        </Box>

        {/* TNL Administration - Bottom Right */}
        <Box sx={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          zIndex: 3,
          textAlign: 'center'
        }}>
          <Box sx={{
            borderRadius: 1.5,
            textAlign: 'center',
            minWidth: 150
          }}>
            <Typography variant="caption" sx={{
              color: '#ffd700',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              display: 'block'
            }}>
              TNL ADMINISTRATION
            </Typography>
            <Typography variant="caption" sx={{
              color: '#ccc',
              fontSize: '0.75rem',
              display: 'block',
              mt: 0.3
            }}>
              Authorized Signatory
            </Typography>
          </Box>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LicenseCard;
