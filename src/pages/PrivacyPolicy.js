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
        Last updated: July 7, 2025
      </Typography>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 1. Definitions
        </SectionTitle>
        <StyledList>
          <StyledListItem><ListItemText primary="Personal Data: Information that identifies you, such as your name, email address, or Discord ID." /></StyledListItem>
          <StyledListItem><ListItemText primary="Usage Data: Technical data including IP address, browser information, and activity logs." /></StyledListItem>
          <StyledListItem><ListItemText primary="Cookies: Small text files used to store information on your device to enhance functionality and performance." /></StyledListItem>
          <StyledListItem><ListItemText primary="Service Providers: Trusted third-party vendors such as Vercel and Google that support our operations." /></StyledListItem>
          <StyledListItem><ListItemText primary="Device: Any device used to access our website, including computers, smartphones, and tablets." /></StyledListItem>
          <StyledListItem><ListItemText primary="Discord: Our exclusive platform for all community communication and support." /></StyledListItem>
        </StyledList>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 2. Information We Collect
        </SectionTitle>
        <Typography variant="body1" gutterBottom><strong>Personal Data</strong></Typography>
        <StyledList>
          <StyledListItem><ListItemText primary="Full name" /></StyledListItem>
          <StyledListItem><ListItemText primary="Email address" /></StyledListItem>
          <StyledListItem><ListItemText primary="Discord username or ID" /></StyledListItem>
          <StyledListItem><ListItemText primary="Google Forms responses (e.g., event registrations, feedback)" /></StyledListItem>
        </StyledList>
        <Typography variant="body1" gutterBottom sx={{ mt: 2 }}><strong>Usage Data</strong></Typography>
        <StyledList>
          <StyledListItem><ListItemText primary="IP address" /></StyledListItem>
          <StyledListItem><ListItemText primary="Browser type and version" /></StyledListItem>
          <StyledListItem><ListItemText primary="Pages visited, time spent, referrer URLs" /></StyledListItem>
          <StyledListItem><ListItemText primary="Device operating system and type" /></StyledListItem>
        </StyledList>
        <Typography variant="body1" gutterBottom sx={{ mt: 2 }}><strong>Cookies</strong>: We use cookies to support functionality and improve performance. You may disable cookies in your browser settings. However, doing so may affect usability of the website.</Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <ContactSupportIcon /> 3. Communication
        </SectionTitle>
        <Typography variant="body1">
          We use Discord as our exclusive platform for communication, announcements, and support. No other channels are officially used or endorsed for member interactions.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 4. Use of Collected Data
        </SectionTitle>
        <StyledList>
          <StyledListItem><ListItemText primary="To manage event participation and virtual convoy logistics" /></StyledListItem>
          <StyledListItem><ListItemText primary="To provide technical support and answer inquiries" /></StyledListItem>
          <StyledListItem><ListItemText primary="To improve our websites and service offerings" /></StyledListItem>
          <StyledListItem><ListItemText primary="To analyze website usage for performance improvements" /></StyledListItem>
          <StyledListItem><ListItemText primary="To comply with legal and regulatory obligations" /></StyledListItem>
        </StyledList>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 5. Data Security
        </SectionTitle>
        <Typography variant="body1">
          We take appropriate security measures including encrypted connections (HTTPS), limited internal access, and secure cloud infrastructure through Vercel and Google. While we take data protection seriously, no transmission over the internet can be guaranteed 100% secure.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 6. Data Sharing and Disclosure
        </SectionTitle>
        <StyledList>
          <StyledListItem><ListItemText primary="With service providers (e.g., Google, Vercel) to enable core functionality" /></StyledListItem>
          <StyledListItem><ListItemText primary="In response to legal requests or law enforcement requirements" /></StyledListItem>
          <StyledListItem><ListItemText primary="With your explicit consent for collaborative events or projects" /></StyledListItem>
        </StyledList>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Your personal data will not be sold or disclosed to unrelated third parties.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 7. Data Retention
        </SectionTitle>
        <StyledList>
          <StyledListItem><ListItemText primary="Event and participation data is stored for up to 12 months unless legally required otherwise" /></StyledListItem>
          <StyledListItem><ListItemText primary="Usage data may be retained based on Vercel Analytics default configurations" /></StyledListItem>
          <StyledListItem><ListItemText primary="Inactive user data may be deleted or anonymized after prolonged inactivity" /></StyledListItem>
        </StyledList>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 8. International Transfers
        </SectionTitle>
        <Typography variant="body1">
          Your data may be processed on servers located outside of your country of residence. By using our services, you consent to such transfers, provided adequate data protection safeguards are in place.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <GavelIcon /> 9. Your Rights
        </SectionTitle>
        <StyledList>
          <StyledListItem><ListItemText primary="Access the personal data we hold about you" /></StyledListItem>
          <StyledListItem><ListItemText primary="Request correction of inaccurate data" /></StyledListItem>
          <StyledListItem><ListItemText primary="Request deletion of your data (subject to legal constraints)" /></StyledListItem>
          <StyledListItem><ListItemText primary="Withdraw consent for data processing at any time" /></StyledListItem>
          <StyledListItem><ListItemText primary="Request a copy of your personal data (data portability)" /></StyledListItem>
        </StyledList>
        <Typography variant="body1" sx={{ mt: 1 }}>
          To exercise these rights, contact us via our official Discord or email. Verification may be required to process requests.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 10. Children's Privacy
        </SectionTitle>
        <Typography variant="body1">
          We do not knowingly collect data from children under the age of 13. If we become aware of such data collection, we will delete the information promptly.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <SecurityIcon /> 11. Third-Party Links
        </SectionTitle>
        <Typography variant="body1">
          Our websites may contain links to third-party platforms and services. We are not responsible for the content, privacy practices, or data handling of such external sites. Users are encouraged to review third-party privacy policies before interacting with them.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <GavelIcon /> 12. Changes to This Privacy Policy
        </SectionTitle>
        <Typography variant="body1">
          We may revise this Privacy Policy periodically. Any changes will be reflected on this page with an updated "Last Updated" date. Continued use of our services implies acceptance of the updated policy.
        </Typography>
      </PolicySection>

      <PolicySection>
        <SectionTitle variant="h5">
          <ContactSupportIcon /> 13. Contact Us
        </SectionTitle>
        <Typography variant="body1">
          If you have any questions about this Privacy Policy, please contact us via:
        </Typography>
        <ContactBox>
          <EmailIcon color="primary" />
          <Typography variant="body1">
            Email: <Link href="mailto:tamilnadulogisticstnl@gmail.com">tamilnadulogisticstnl@gmail.com</Link>
          </Typography>
        </ContactBox>
      </PolicySection>
    </Container>
  );
};

export default PrivacyPolicy;
