import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LanguageIcon from '@mui/icons-material/Language';
// import DiscordIcon from '@mui/icons-material/Discord';
import axios from 'axios';

const PartnerCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const PartnerLogo = styled(CardMedia)(({ theme }) => ({
  height: 200,
  backgroundSize: 'contain',
  backgroundPosition: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
}));

const PartnerDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 800,
    width: '100%',
  },
}));

const Partners = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partners, setPartners] = useState([19885,64218,76045,79072,75200]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/vtc/partners`);
        setPartners(response.data);
      } catch (error) {
        console.error('Error fetching partners:', error);
        setError('Failed to load partners information');
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
  };

  const handleCloseDialog = () => {
    setSelectedPartner(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Our Partners
      </Typography>
      <Typography variant="h6" align="center" color="text.secondary" paragraph>
        Working together to build a stronger trucking community
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {partners.map((partner) => (
          <Grid item xs={12} sm={6} md={4} key={partner.id}>
            <PartnerCard>
              <CardActionArea onClick={() => handlePartnerClick(partner)}>
                <PartnerLogo
                  image={partner.logo || '/default-vtc-logo.png'}
                  alt={partner.name}
                />
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {partner.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    [{partner.tag}]
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalShippingIcon color="primary" />
                    <Typography variant="body2" color="text.secondary">
                      {partner.memberCount} Members
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={partner.game}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    {partner.recruitment && (
                      <Chip
                        label="Recruiting"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </PartnerCard>
          </Grid>
        ))}
      </Grid>

      {/* Partner Details Dialog */}
      <PartnerDialog
        open={Boolean(selectedPartner)}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedPartner && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={selectedPartner.logo}
                  alt={selectedPartner.name}
                  style={{ width: 48, height: 48, objectFit: 'contain' }}
                />
                <Typography variant="h5" component="div">
                  {selectedPartner.name} [{selectedPartner.tag}]
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Information
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedPartner.information || 'No information available.'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedPartner.requirements || 'No requirements specified.'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Rules
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedPartner.rules || 'No rules specified.'}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedPartner.website && (
                <Button
                  href={selectedPartner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<LanguageIcon />}
                >
                  Website
                </Button>
              )}
              {selectedPartner.discord && (
                <Button
                  href={selectedPartner.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  // startIcon={<DiscordIcon />}
                >
                  Discord
                </Button>
              )}
              <Button
                href={`https://truckersmp.com/vtc/${selectedPartner}`}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<LocalShippingIcon />}
              >
                TruckersMP Profile
              </Button>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </PartnerDialog>
    </Container>
  );
};

export default Partners; 