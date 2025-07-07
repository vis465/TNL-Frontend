import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import DiscordIcon from '@mui/icons-material/Chat';

const StyledFooter = styled('footer')(({ theme }) => ({
  // marginTop: '0.3vh',
  width: '100%',
  minHeight: '10vh',
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-evenly',
  alignItems: 'flex-end',
  padding: '5rem 2vw',
  position: 'relative',
  backgroundColor: 'transparent',
  zIndex: 500,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(
      rgba(0, 0, 0, 0) 5%,
      rgba(0, 0, 0, 0.3) 20%,
      rgba(0, 0, 0, 0.6) 30%,
      rgba(0, 0, 0, 0.8) 40%,
      rgba(0, 0, 0, 1) 50%,
      rgb(0, 0, 0)
    )`,
    zIndex: -7,
  },
}));

const Backdrop = styled(Box)(({ theme }) => ({
  zIndex: -5,
  position: 'absolute',
  inset: 0,
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  maskImage: `linear-gradient(
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.5) 10%,
    rgba(0, 0, 0, 0.8) 20%,
    rgba(0, 0, 0, 1) 30%,
    rgb(0, 0, 0)
  )`,
  WebkitMaskImage: `linear-gradient(
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.5) 10%,
    rgba(0, 0, 0, 0.8) 20%,
    rgba(0, 0, 0, 1) 30%,
    rgb(0, 0, 0)
  )`,
}));

const Column = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  padding: theme.spacing(3, 5),
  width: '28%',
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    padding: theme.spacing(3),
  },
}));

const SocialContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  gap: '1rem',
  marginTop: '1rem',
});

const Footer = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledFooter>
      <Column>
        <Typography variant="h5" fontWeight={500} gutterBottom>
          TNL Booking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Made with <span style={{ color: '#BA6573' }}>❤</span> by TNL Team
        </Typography>
        <SocialContainer>
          <IconButton component="a" href="https://www.youtube.com/channel/UCKkTkfbfe9R05ac34rRVWww" target="_blank" className="link">
            <YouTubeIcon />
          </IconButton>
          <IconButton component="a" href="https://www.instagram.com/tamilnadu_logistics" target="_blank" className="link">
            <InstagramIcon />
          </IconButton>
          <IconButton component="a" href="https://discord.gg/psPdZtSacg" target="_blank" className="link">
            <DiscordIcon />
          </IconButton>
        </SocialContainer>
        <Typography mt={2} variant="caption" color="#818181">
          © {new Date().getFullYear()} All Rights Reserved
        </Typography>
      </Column>

      <Column sx={{ backgroundColor: '#121212', borderRadius: '1rem' }}>
        <Typography component="a" href="https://www.tamilnadulogistics.in/Driver" style={{ color: 'inherit', textDecoration: 'none' }}>
          Apply as a Rider
        </Typography>
        <Typography component="a" href="https://www.truckersmp.com/vtc/70030" style={{ color: 'inherit', textDecoration: 'none' }}>
          Visit Truckers MP
        </Typography>
        <Typography component="a" href="https://www.tamilnadulogistics.in/terms-of-service" style={{ color: 'inherit', textDecoration: 'none' }}>
          Terms of service
        </Typography>
        <Typography component="a" href="https://www.tamilnadulogistics.in/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>
          privacy policy
        </Typography>
      </Column>

      <Backdrop />
      
    </StyledFooter>
  );
};

export default Footer;
