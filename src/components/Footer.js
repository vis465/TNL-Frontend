import React from 'react';
import { Box, Container, Grid, Typography, IconButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import DiscordIcon from '@mui/icons-material/Chat';
import YouTube from '@mui/icons-material/YouTube';

const StyledFooter = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  borderTop: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
  padding: theme.spacing(6, 0),
  marginTop: 'auto',
  position: 'relative',
  overflow: 'hidden',
}));

const BrandText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(4),
  fontSize: '8rem',
  fontWeight: 700,
  opacity: 0.03,
  transform: 'rotate(-15deg)',
  userSelect: 'none',
  [theme.breakpoints.down('sm')]: {
    fontSize: '4rem',
    right: theme.spacing(2),
  },
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  cursor: 'pointer',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const SocialIcon = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateY(-3px)',
  },
}));

const Footer = () => {
  const theme = useTheme();

  return (
    <StyledFooter>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              About TNL
            </Typography>
            <Typography variant="body2" color="text.secondary">
              TNL Booking System is your premier platform for managing and participating in TruckersMP events. 
              Experience seamless slot booking and event management.
            </Typography>
          </Grid>
          
          
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Connect With Us
            </Typography>
            <Box display="flex" gap={2}>
              <SocialIcon>
                <YouTube />
              </SocialIcon>
             
              <SocialIcon>
                <InstagramIcon />
              </SocialIcon>
              <SocialIcon>
                <DiscordIcon />
              </SocialIcon>
            </Box>
          </Grid>
        </Grid>
        
        <Box mt={4} pt={2} borderTop="1px solid" borderColor="divider">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} TNL Booking System. All rights reserved.
          </Typography>
        </Box>
      </Container>
      <BrandText>TNL</BrandText>
    </StyledFooter>
  );
};

export default Footer; 