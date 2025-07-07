import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Link,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import SecurityIcon from '@mui/icons-material/Security';
import CookieIcon from '@mui/icons-material/Cookie';
import GavelIcon from '@mui/icons-material/Gavel';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const PolicySection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const StyledList = styled(List)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  '&::before': {
    content: '"•"',
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    display: 'inline-block',
    width: '1em',
    marginLeft: '-1em',
  },
}));

const ContactBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
}));

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Privacy Policy
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
        Last updated: {new Date().toLocaleDateString()}
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 4 }}>
        Tamilnadu Logistics ("we," "our," "us") respects your privacy. This Privacy Policy explains how we collect, use, and protect your data when you visit www.tamilnadulogistics.in.
      </Typography>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 1. Data We Collect
        </SectionTitle>
        <StyledList>
          <StyledListItem>
            <ListItemText primary="Name" />
          </StyledListItem>
          <StyledListItem>
            <ListItemText primary="Email Address" />
          </StyledListItem>
          <StyledListItem>
            <ListItemText primary="Other details provided voluntarily" />
          </StyledListItem>
        </StyledList>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 2. How We Use Your Data
        </SectionTitle>
        <StyledList>
          <StyledListItem>
            <ListItemText primary="To manage your participation in our Virtual Trucking Company." />
          </StyledListItem>
          <StyledListItem>
            <ListItemText primary="To improve our services." />
          </StyledListItem>
          <StyledListItem>
            <ListItemText primary="To communicate updates, events, or other announcements." />
          </StyledListItem>
        </StyledList>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 3. Third-Party Data Processing
        </SectionTitle>
        <Typography variant="body1" paragraph>
          Our Website is hosted on Google Sites. By using our Website, you may be subject to Google's terms and privacy policies.{' '}
          <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Review Google Sites' Privacy Policy
          </Link>.
        </Typography>
        <Typography variant="body1">
          We use Google Forms to collect your data. Google Forms operates under its own privacy and security policies.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <ContactSupportIcon /> 4. Contact and Communication
        </SectionTitle>
        <ContactBox>
          <EmailIcon color="primary" />
          <Typography variant="body1">
            Email: <Link href="mailto:tamilnadulogisticstnl@gmail.com">tamilnadulogisticstnl@gmail.com</Link>
          </Typography>
        </ContactBox>
        <ContactBox>
          <img src="/discord-icon.png" alt="Discord" style={{ width: 24, height: 24 }} />
          <Typography variant="body1">
            Discord: <Link href="https://discord.gg/your-discord-link" target="_blank" rel="noopener noreferrer">Join our Discord Server</Link>
          </Typography>
        </ContactBox>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 5. Data Sharing
        </SectionTitle>
        <Typography variant="body1">
          We do not sell or trade your data with any third parties.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 6. Data Retention
        </SectionTitle>
        <Typography variant="body1">
          Your data is stored securely and retained for as long as necessary to fulfill the purposes stated above or as required by law.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <GavelIcon /> 7. Your Rights (GDPR Compliance)
        </SectionTitle>
        <StyledList>
          <StyledListItem>
            <ListItemText primary="Access your data." />
          </StyledListItem>
          <StyledListItem>
            <ListItemText primary="Request correction or deletion of your data." />
          </StyledListItem>
          <StyledListItem>
            <ListItemText primary="Restrict or object to processing." />
          </StyledListItem>
          <StyledListItem>
            <ListItemText primary="Data portability." />
          </StyledListItem>
        </StyledList>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 8. Data Security
        </SectionTitle>
        <Typography variant="body1">
          We implement appropriate technical and organizational measures to secure your data against unauthorized access or disclosure.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <CookieIcon /> 9. Cookies
        </SectionTitle>
        <Typography variant="body1">
          We do not use custom cookies. However, Google Sites may implement cookies as part of its hosting platform. Please review{' '}
          <Link href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Sites' Privacy Policy
          </Link>{' '}
          for more details.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <GavelIcon /> 10. Changes to the Privacy Policy
        </SectionTitle>
        <Typography variant="body1">
          We may update this Privacy Policy occasionally. Changes will be reflected on this page with an updated effective date.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <GavelIcon /> 11. Governing Law
        </SectionTitle>
        <Typography variant="body1">
          This Privacy Policy is governed by and construed in accordance with the laws of India and the European Union.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <ContactSupportIcon /> 12. Contact Us
        </SectionTitle>
        <Typography variant="body1">
          For questions about this Privacy Policy or to exercise your rights, email us at{' '}
          <Link href="mailto:tamilnadulogisticstnl@gmail.com">tamilnadulogisticstnl@gmail.com</Link>.
        </Typography>
      </PolicySection>
    </Container>
  );
};

export default PrivacyPolicy; 