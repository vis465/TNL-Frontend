import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

const SteamCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSteamCallback = async () => {
      try {
        const steamDataParam = searchParams.get('steamData');
        const error = searchParams.get('error');

        if (error) {
          console.error('Steam authentication error:', error);
          navigate('/register?error=steam_auth_failed');
          return;
        }

        if (steamDataParam) {
          // Redirect to registration page with Steam data
          navigate(`/register/steam?steamData=${steamDataParam}`);
        } else {
          console.error('Missing Steam data');
          navigate('/register?error=steam_auth_failed');
        }
      } catch (error) {
        console.error('Steam callback error:', error);
        navigate('/register?error=steam_auth_failed');
      }
    };

    handleSteamCallback();
  }, [searchParams, navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="primary">
        Processing Steam authentication...
      </Typography>
    </Box>
  );
};

export default SteamCallback;
