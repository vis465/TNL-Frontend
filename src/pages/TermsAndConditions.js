import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Container,
  Paper,
  Link,
  IconButton,
  Stack,
  Alert,
  AlertTitle,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LinkIcon from '@mui/icons-material/Link';

 const termsData = [
    {
      id: 'introduction',
      title: '1. Introduction',
      content:` Welcome to Tamilnadu Logistics ("Company", "we", "our", or "us"). These Terms of Service ("Terms") govern your use of our websites, including tamilnadulogistics.in and events.tamilnadulogistics.in (collectively referred to as the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, please refrain from using the Service.`
    },
    {
      id: 'acceptance',
      title: '2. Acceptance of Terms',
      content:` By accessing and using our Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. These Terms apply to all visitors, users, and others who access or use the Service.`
    },
    {
      id: 'cookies',
      title: '3. Cookies and Tracking Technologies',
      content: `We use cookies and similar tracking technologies to enhance user experience and analyze traffic using services like Vercel Analytics. By using our website, you consent to the use of cookies in accordance with our Privacy Policy. You may disable cookies through your browser settings, though this may affect the functionality of our Service.`
    },
    {
      id: 'data-collection',
      title: '4. Data Collection and Privacy',
      content: `We collect certain personal information through our events portal (events.tamilnadulogistics.in), which is hosted on Vercel and utilizes Vercel Analytics. We may also use Google Forms to collect data for applications and event registrations. Your information is handled in accordance with our Privacy Policy and applicable data protection laws. Data collected is used solely for:

• Internal community management
• Event organization and participation  
• Communication with community members
• Service improvement and analytics`
    },
    {
      id: 'intellectual-property',
      title: '5. License & Intellectual Property',
      content: `Unless otherwise stated, Tamilnadu Logistics and/or its licensors own the intellectual property rights for all content on our websites. You may view and download materials for personal, non-commercial use only, subject to the following restrictions:

• You must not republish material from our sites without permission
• You must not sell, rent, or sub-license material
• You must not reproduce or redistribute content for commercial purposes
• You must not modify or create derivative works without authorization
• All downloads must retain copyright notices and attributions`
    },
    {
      id: 'user-content',
      title: '6. User-Generated Content',
      content: `When you submit content to our Service (including but not limited to comments, applications, or event submissions), you grant us a non-exclusive, royalty-free, worldwide license to use, modify, and display such content for the operation of our Service. You represent that you own or have necessary rights to submit such content.`
    },
    {
      id: 'hyperlinking',
      title: '7. Hyperlinking Policy',
      content: `The following organizations may link to our website without prior written approval:

• Government agencies and official bodies
• Search engines and web directories
• News organizations and media outlets
• Educational institutions
• Non-profit organizations with related purposes

External links must not be misleading and should fit within the appropriate context. Commercial entities wishing to link to our content should contact us for approval. We reserve the right to request removal of any links at our discretion.`
    },
    {
      id: 'prohibited-uses',
      title: '8. Prohibited Uses',
      content: `You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, or impair the Service. Prohibited activities include but are not limited to:

• Violating any applicable laws or regulations
• Transmitting harmful, offensive, or inappropriate content
• Attempting to gain unauthorized access to our systems
• Interfering with other users' experience
• Using automated systems to scrape or harvest data
• Impersonating others or providing false information`
    },
    {
      id: 'event-participation',
      title: '9. Event Participation & Community Guidelines',
      content:` Participation in our virtual convoys, events, and Discord server is subject to our community guidelines and TruckersMP rules. All participants must:

• Follow TruckersMP Terms of Service and rules
• Maintain respectful and professional conduct
• Comply with event-specific instructions and requirements
• Respect other community members and staff

Violations may result in warnings, temporary suspension, or permanent removal from our community and events.`
    },
    {
      id: 'content-liability',
      title: '10. Content Liability and Third-Party Links',
      content: `We are not responsible for content on third-party websites that link to us or that we link to. We do not endorse, monitor, or assume responsibility for third-party content. You access third-party sites at your own risk and subject to their terms and conditions.`
    },
    {
      id: 'service-availability',
      title: '11. Service Availability and Modifications',
      content:` We strive to maintain continuous service availability but do not guarantee uninterrupted access. We reserve the right to:

• Modify, suspend, or discontinue any part of the Service
• Update features, functionality, or content
• Perform maintenance and updates as needed
• Change these Terms with appropriate notice`
    },
    {
      id: 'account-management',
      title: '12. Account Management and Termination',
      content: `We reserve the right to suspend, terminate, or restrict access to our services for any user who:

• Violates these Terms or community guidelines
• Engages in abusive, disruptive, or harmful behavior
• Provides false or misleading information
• Attempts to circumvent security measures

Users may also voluntarily terminate their participation by contacting us or discontinuing use of the Service.`
    },
    {
      id: 'limitation-liability',
      title: '13. Limitation of Liability',
      content:` To the fullest extent permitted by applicable law:

• Our liability is limited to the maximum extent allowed by law
• We provide the Service "as is" without warranties of any kind
• We are not liable for indirect, incidental, or consequential damages
• Our total liability shall not exceed the amount you paid (if any) for the Service
• We do not guarantee the accuracy, completeness, or timeliness of information`
    },
    {
      id: 'indemnification',
      title: '14. Indemnification',
      content:` You agree to indemnify and hold harmless Tamilnadu Logistics, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.`
    },
    {
      id: 'governing-law',
      title: '15. Governing Law and Dispute Resolution',
      content:` These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the jurisdiction of courts in Tamil Nadu, India. We encourage resolving disputes through direct communication before pursuing legal action.`
    },
    {
      id: 'severability',
      title: '16. Severability',
      content: `If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions shall continue in full force and effect. Invalid provisions will be replaced with valid provisions that most closely reflect the original intent.`
    },
    {
      id: 'updates',
      title: '17. Updates and Modifications',
      content: `We may revise these Terms of Service at any time. Material changes will be communicated through:

• Email notifications to registered users
• Prominent notices on our website
• Updates to the "Last Updated" date

Your continued use of the Service after changes constitute acceptance of the updated Terms.`
    }
  ];



const TermsOfService = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
        {/* Header Section */}
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: '#fff', borderRadius: 3, mb: 4 }}>
          <Typography variant="h3" gutterBottom fontWeight={700}>Terms of Service</Typography>
          <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1}>
            <AccessTimeIcon fontSize="small" />
            <Typography variant="subtitle1">Last Updated: July 31, 2025</Typography>
          </Box>
          <Typography variant="body1">Please read these terms carefully before using our services</Typography>
        </Paper>

        {/* Important Notice */}
        <Alert severity="info" sx={{ mb: 4 }}>
          <AlertTitle>Notice</AlertTitle>
          By accessing and using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
        </Alert>

        {/* Accordion Sections */}
        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', mb: 6 }}>
          {termsData.map((section) => (
            <Accordion key={section.id} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">{section.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{section.content}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>

        {/* Contact Information */}
        <Paper elevation={2} sx={{ borderRadius: 2, p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={700} align="center">
            18. Contact Information
          </Typography>
          <Typography variant="body1" align="center" mb={3}>
            If you have any questions, concerns, or feedback regarding these Terms, please contact us:
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center" mb={3}>
            <Link href="mailto:tamilnadulogisticstnl@gmail.com" underline="none">
              <IconButton color="primary">
                <EmailIcon />
              </IconButton>
              tamilnadulogisticstnl@gmail.com
            </Link>

            <Link href="https://www.tamilnadulogistics.in" target="_blank" underline="none">
              <IconButton color="success">
                <LinkIcon />
              </IconButton>
              www.tamilnadulogistics.in
            </Link>

            <Link href="https://events.tamilnadulogistics.in" target="_blank" underline="none">
              <IconButton color="secondary">
                <CalendarTodayIcon />
              </IconButton>
              events.tamilnadulogistics.in
            </Link>
          </Stack>

          <Alert severity="warning">
            <AlertTitle>Important</AlertTitle>
            For urgent matters or specific inquiries about community participation, please include "Terms of Service" in your email subject line.
          </Alert>
        </Paper>

        {/* Footer */}
        <Box textAlign="center" mt={4}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="caption" color="text.secondary">
            This document was last updated on July 31, 2025, and supersedes all previous versions.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default TermsOfService;
