import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Stack, alpha
} from '@mui/material';
import { LocalShipping, VerifiedUser } from '@mui/icons-material';
import tnlLogo from '../img/tnllogo.jpg';

const font = "'Montserrat', sans-serif";

const T = {
  bg: '#09090B',
  surface: '#111113',
  surfaceAlt: '#0F0F11',
  surfaceHover: '#1A1A1D',
  border: 'rgba(255,255,255,0.06)',
  borderHover: 'rgba(255,255,255,0.1)',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  textFaint: '#3F3F46',
  accent: '#E4FF1A',
  accentDim: 'rgba(228,255,26,0.06)',
  gold: '#E2B93B',
  goldDim: 'rgba(226,185,59,0.08)',
  goldMid: 'rgba(226,185,59,0.18)',
  success: '#34D399',
  radius: '10px',
  radiusSm: '6px',
  radiusXs: '4px',
};

const sxCard = {
  bgcolor: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: T.radius,
  boxShadow: 'none',
  transition: 'border-color 0.2s ease',
  '&:hover': { borderColor: T.borderHover },
};

const LicenseCard = ({ userData, riderData }) => {
  const elementRef = useRef(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [memberData, setMemberData] = useState(null);

  const generateLicenseNumber = (employeeId) => {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TNL ${randomNum}-${employeeId}`;
  };

  useEffect(() => {
    if (userData || riderData) {
      const employeeId = riderData?.employeeID || userData?.user_id || userData?.id || '0000';
      setLicenseNumber(generateLicenseNumber(employeeId));
      setMemberData({
        ...userData,
        ...riderData,
        employeeID: riderData?.employeeID || userData?.user_id || userData?.id,
        joinDate: riderData?.createdAt || userData?.createdAt || new Date().toISOString(),
      });
    }
  }, [userData, riderData]);

  if (!memberData) {
    return (
      <Card sx={sxCard}>
        <CardContent sx={{ p: '20px !important' }}>
          <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
            <LocalShipping sx={{ fontSize: 28, color: T.textFaint }} />
            <Typography sx={{ fontFamily: font, fontSize: '0.8rem', color: T.textMuted, fontWeight: 500 }}>
              No user data available
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const joinYear = memberData.joinDate
    ? new Date(memberData.joinDate).getFullYear()
    : new Date().getFullYear();

  return (
    <Card sx={sxCard}>
      <CardContent sx={{ p: '20px !important' }}>
        {/* Section header */}
        <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 2.5 }}>
          <Box sx={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: T.goldDim, borderRadius: T.radiusSm, color: T.gold,
          }}>
            <VerifiedUser sx={{ fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontFamily: font, fontSize: '0.85rem', fontWeight: 700, color: T.text }}>
            TNL License
          </Typography>
        </Stack>

        {/* License card visual */}
        <Box
          ref={elementRef}
          sx={{
            width: '100%',
            maxWidth: 680,
            aspectRatio: '16 / 9',
            mx: 'auto',
            position: 'relative',
            borderRadius: '14px',
            overflow: 'hidden',
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(226,185,59,0.06) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 20%, rgba(226,185,59,0.04) 0%, transparent 50%),
              linear-gradient(160deg, #0C0C0E 0%, #111113 40%, #0E0E10 100%)
            `,
            border: `1.5px solid ${T.goldMid}`,
            boxShadow: `0 0 0 1px ${alpha(T.gold, 0.05)}, 0 20px 50px -12px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Background logo watermark */}
          <Box sx={{
            position: 'absolute', top: '50%', right: '-5%',
            transform: 'translateY(-50%)',
            width: '35%', height: '35%', opacity: 0.04, zIndex: 0,
          }}>
            <img src={tnlLogo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>

          {/* Top bar */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0,
            px: 3, pt: 2, pb: 1.5, zIndex: 2,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <Box>
              <Typography sx={{
                fontFamily: font, fontWeight: 800, fontSize: '0.95rem',
                color: T.gold, letterSpacing: '0.12em', textTransform: 'uppercase',
                lineHeight: 1.2,
              }}>
                Tamilnadu Logistics
              </Typography>
              <Typography sx={{
                fontFamily: font, fontSize: '0.7rem', fontWeight: 500,
                color: alpha(T.gold, 0.55), mt: 0.25,
              }}>
                ரௌத்திரம் பழகு
              </Typography>
            </Box>
            <Box sx={{
              width: 32, height: 22, borderRadius: '3px', overflow: 'hidden',
              border: `1px solid ${alpha('#fff', 0.12)}`, flexShrink: 0, mt: 0.25,
            }}>
              <img
                crossOrigin="anonymous" alt="IN"
                src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>

          {/* Main content area */}
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', pt: 8, px: 3, pb: 5, zIndex: 1,
          }}>
            {/* Avatar column */}
            <Box sx={{ flexShrink: 0, mr: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: 72, height: 88, borderRadius: '8px', overflow: 'hidden',
                border: `1.5px solid ${alpha(T.gold, 0.35)}`,
                bgcolor: '#0A0A0C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {riderData?.avatar ? (
                  <img
                    src={riderData.avatar} alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Typography sx={{
                    fontFamily: font, fontSize: '1.6rem', fontWeight: 800,
                    color: T.gold, opacity: 0.7,
                  }}>
                    {(memberData.username || memberData.name || 'U').charAt(0).toUpperCase()}
                  </Typography>
                )}
              </Box>
              <Box sx={{
                mt: 1, px: 1, py: 0.25, borderRadius: '3px',
                bgcolor: alpha(T.success, 0.12), border: `1px solid ${alpha(T.success, 0.25)}`,
                display: 'flex', alignItems: 'center', gap: 0.5,
              }}>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: T.success }} />
                <Typography sx={{
                  fontFamily: font, fontSize: '0.5rem', fontWeight: 700,
                  color: T.success, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Verified
                </Typography>
              </Box>
            </Box>

            {/* Details column */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{
                fontFamily: font, fontWeight: 700, fontSize: '1.35rem',
                color: T.text, lineHeight: 1.2, letterSpacing: '-0.01em', mb: 1.5,
              }} noWrap>
                {memberData.name || memberData.username || 'Member'}
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                <Box>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.5rem', fontWeight: 600,
                    color: T.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.25,
                  }}>
                    Role
                  </Typography>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.78rem', fontWeight: 600,
                    color: T.gold,
                  }}>
                    {userData?.role || 'Member'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.5rem', fontWeight: 600,
                    color: T.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.25,
                  }}>
                    Employee ID
                  </Typography>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.78rem', fontWeight: 600,
                    color: T.textSecondary,
                  }}>
                    {memberData.employeeID || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.5rem', fontWeight: 600,
                    color: T.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.25,
                  }}>
                    License No.
                  </Typography>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.78rem', fontWeight: 600,
                    color: T.textSecondary, letterSpacing: '0.03em',
                  }}>
                    {licenseNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.5rem', fontWeight: 600,
                    color: T.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 0.25,
                  }}>
                    Member Since
                  </Typography>
                  <Typography sx={{
                    fontFamily: font, fontSize: '0.78rem', fontWeight: 600,
                    color: T.textSecondary,
                  }}>
                    {joinYear}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Bottom bar */}
          <Box sx={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            px: 3, py: 1.5, zIndex: 2,
            borderTop: `1px solid ${alpha(T.gold, 0.08)}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <Typography sx={{
              fontFamily: font, fontSize: '0.55rem', fontWeight: 500,
              color: T.textFaint, letterSpacing: '0.04em',
            }}>
              Issued by TNL Administration
            </Typography>
            <Typography sx={{
              fontFamily: font, fontSize: '0.55rem', fontWeight: 600,
              color: alpha(T.gold, 0.4), letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Authorized Signatory
            </Typography>
          </Box>

          {/* Subtle horizontal line accent */}
          <Box sx={{
            position: 'absolute', bottom: 34, left: 24, right: 24,
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(T.gold, 0.1)}, transparent)`,
          }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LicenseCard;
