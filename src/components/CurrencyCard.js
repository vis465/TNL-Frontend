import React from 'react';
import { Card, CardContent, Box, Typography, Stack } from '@mui/material';

export default function CurrencyCard({ data }) {
    console.log(data)
  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 180,
        borderRadius: 2,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,.05) 10px, rgba(255,255,255,.05) 20px)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Serial Numbers */}
    

      {/* Title */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: '#78350f',
            letterSpacing: 0.5,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            fontSize: '0.7rem',
            display: 'block',
          }}
        >
          TN LOGISTICS CURRENCY
        </Typography>
      </Box>

      {/* Center Logo */}
      <Box
        sx={{
          position: 'absolute',
          top: '35%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            width: 45,
            height: 45,
            borderRadius: '50%',
            bgcolor: 'rgba(254, 243, 199, 0.3)',
            backdropFilter: 'blur(4px)',
            border: '2px solid rgba(120, 53, 15, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 50 50" fill="none">
            <path d="M25 10 L35 25 L30 25 L30 40 L20 40 L20 25 L15 25 Z" fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
            <circle cx="25" cy="15" r="3" fill="#FF6B35"/>
            <path d="M20 30 L22 35 L28 35 L30 30" fill="#A0522D"/>
          </svg>
        </Box>
      </Box>

      {/* Denomination */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 12,
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(8px)',
            borderRadius: 1,
            px: 1,
            py: 0.25,
            border: '1px solid rgba(120, 53, 15, 0.3)',
          }}
        >
          
        </Box>
      </Box>

      <CardContent sx={{ position: 'relative', zIndex: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', pt: 8 }}>
        {/* Balance Display */}
        <Box
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            border: '1px solid rgba(251, 191, 36, 0.3)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#fef3c7',
              fontWeight: 500,
              letterSpacing: 1,
              fontSize: '0.65rem',
              display: 'block',
              mb: 0.5,
            }}
          >
            TOTAL BALANCE
          </Typography>
          <Typography
            variant="h2"
            fontWeight={700}
            sx={{
              color: Number(data?.wallet?.balance) < 0 ? '#fca5a5' : '#fef3c7',
              letterSpacing: -0.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.8)',
              lineHeight: 1,
            }}
          >
            {typeof data?.wallet?.balance === 'number'
              ? Number(data.wallet.balance).toLocaleString('en-IN')
              : '0'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#fcd34d',
              fontWeight: 700,
              letterSpacing: 1,
              fontSize: '1rem',
              mt: 0.5,
              display: 'block',
            }}
          >
            Roobai
          </Typography>
        </Box>
      </CardContent>

      {/* Holographic Effect */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top right, transparent, rgba(255,255,255,0.08), transparent)',
          pointerEvents: 'none',
          zIndex: 4,
        }}
      />

      {/* Border Effect */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          border: '1px solid rgba(120, 53, 15, 0.2)',
          borderRadius: 2,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </Card>
  );
}