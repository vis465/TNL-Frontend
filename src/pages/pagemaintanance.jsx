import React from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Player } from '@lottiefiles/react-lottie-player';

// If you want to use Lottie, install lottie-react: npm install lottie-react

// Example Lottie animation URL (replace with your own if desired)
const lottieUrl = 'https://assets10.lottiefiles.com/packages/lf20_j1adxtyb.json';

const CenteredBox = styled(Box)({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    
});

export default function PageMaintenance() {
    return (
        <CenteredBox>
            <Container maxWidth="sm" sx={{ textAlign: 'center', py: 4 }}>
                <Player
                    autoplay
                    loop
                    src={lottieUrl}
                    style={{ height: '220px', width: '220px', margin: '0 auto' }}
                />
                <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3 }}>
                    Site Under Maintenance
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    We&apos;re currently working on this page to improve your experience.<br />
                    Please check back after some time.
                </Typography>
                
            </Container>
        </CenteredBox>
    );
}