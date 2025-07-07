import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));

const TermsAndConditions = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: `By accessing and using our vehicle transportation services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.`,
    },
    {
      title: '2. Service Description',
      content: `We provide vehicle transportation services, including but not limited to:
        • Vehicle pickup and delivery
        • Long-distance transportation
        • Specialized vehicle handling
        • Real-time tracking services
        • Insurance coverage for transported vehicles`,
    },
    {
      title: '3. User Responsibilities',
      content: `As a user of our services, you agree to:
        • Provide accurate and complete information
        • Ensure your vehicle is properly prepared for transport
        • Maintain valid insurance coverage
        • Comply with all applicable laws and regulations
        • Pay all fees and charges in a timely manner`,
    },
    {
      title: '4. Booking and Cancellation',
      content: `Booking Policy:
        • All bookings must be made through our official channels
        • A valid payment method is required to secure bookings
        • Confirmation will be sent via email
        
        Cancellation Policy:
        • Cancellations made 48 hours before pickup: Full refund
        • Cancellations made 24-48 hours before pickup: 50% refund
        • Cancellations made less than 24 hours before pickup: No refund`,
    },
    {
      title: '5. Insurance and Liability',
      content: `Our insurance coverage includes:
        • Comprehensive damage protection
        • Theft protection
        • Third-party liability
        
        Exclusions:
        • Pre-existing damage
        • Mechanical failures
        • Acts of nature
        • Improper vehicle preparation`,
    },
    {
      title: '6. Privacy Policy',
      content: `We collect and process personal information in accordance with our Privacy Policy, including:
        • Contact information
        • Vehicle details
        • Payment information
        • Location data
        
        Your data is protected and will not be shared with third parties without consent.`,
    },
    {
      title: '7. Payment Terms',
      content: `Payment Information:
        • All prices are in the local currency
        • Payment is required at the time of booking
        • We accept major credit cards and bank transfers
        • Additional fees may apply for special services
        
        Refund Policy:
        • Refunds are processed within 5-7 business days
        • Processing fees may be deducted from refunds`,
    },
    {
      title: '8. Service Modifications',
      content: `We reserve the right to:
        • Modify or discontinue services
        • Update pricing
        • Change terms and conditions
        • Implement new features
        
        Users will be notified of significant changes via email.`,
    },
    {
      title: '9. Dispute Resolution',
      content: `In case of disputes:
        • Contact our customer service first
        • Mediation will be attempted
        • Legal action may be pursued if necessary
        • Jurisdiction will be determined by local laws`,
    },
    {
      title: '10. Contact Information',
      content: `For questions or concerns:
        • Email: legal@vtc.com
        • Phone: +1 (555) 123-4567
        • Address: 123 Transport Street, City, Country
        
        Business Hours: Monday - Friday, 9:00 AM - 6:00 PM`,
    },
  ];

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="md">
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Terms and Conditions
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography variant="body1" paragraph>
            Welcome to our Virtual Trucking Company. These Terms and Conditions govern your use of our services.
            Please read them carefully before using our platform.
          </Typography>

          {sections.map((section, index) => (
            <Section key={index}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ color: 'primary.main' }}>
                {section.title}
              </Typography>
              {section.content.includes('•') ? (
                <List>
                  {section.content.split('•').map((item, i) => (
                    item.trim() && (
                      <ListItem key={i} sx={{ display: 'list-item', pl: 2 }}>
                        <ListItemText primary={item.trim()} />
                      </ListItem>
                    )
                  ))}
                </List>
              ) : (
                <Typography variant="body1" paragraph>
                  {section.content}
                </Typography>
              )}
              {index < sections.length - 1 && <Divider sx={{ my: 2 }} />}
            </Section>
          ))}

          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 1,color:"black" }}>
            <Typography variant="body2" color="black">
              By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              If you have any questions, please contact our customer service team.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsAndConditions; 