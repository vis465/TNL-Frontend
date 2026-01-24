import React, { useState, useRef, useEffect } from 'react';
import imageToBase64 from 'image-to-base64/browser';
import domtoimage from 'dom-to-image-more';
import { toPng } from 'html-to-image';

import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
  Avatar,
  Autocomplete
} from '@mui/material';
import { Download, Refresh, Person, LocalShipping, VerifiedUser } from '@mui/icons-material';



import tnlLogo from '../img/tnllogo.jpg';
import axiosInstance from '../utils/axios';


const LicenseGenerator = () => {
    const elementRef = useRef(null);


  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [error, setError] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  const [Playerres,SetPlayerres]=useState({})
const toBase64 = async (url) => {
  const res = await fetch(url, { mode: 'cors' }); // or 'no-cors' if server blocks it
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};

  // Generate license number with TruckersMP ID
  const generateLicenseNumber = (truckersmpId) => {
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TNL ${randomNum}-${truckersmpId}`;
  };

  // Fetch team members for admin selection
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (memberData) {
      // Use license number from backend if available, otherwise generate locally
      if (memberData.licenseNumber) {
        setLicenseNumber(memberData.licenseNumber);
      } else {
        setLicenseNumber(generateLicenseNumber(memberData.user_id || selectedMemberId));
      }
    }
  }, [memberData, selectedMemberId]);

  const fetchMemberData = async () => {
    if (!selectedMemberId) {
      setError('Please select a team member');
      return;
    }

    setLoading(true);
    setError('');
    setMemberData(null);

    try {
      console.log('Sending memberId:', selectedMemberId);
      const response = await axiosInstance.post('/vtc/license', {
        memberId: selectedMemberId
      });

      console.log('License response:', response.data);

      if (response.data.error) {
        throw new Error(response.data.error || 'Member not found');
      }

      // Fetch player avatar from TruckersMP API
      try {
        const playerResponse = await axiosInstance.get(`/vtc/player/${response.data.response.user_id}`);
        console.log('Player response:', playerResponse.data);
        
        if (playerResponse.data && playerResponse.data.avatar) {
          setMemberData({
            ...response.data.response,
            avatar:await playerResponse.data.avatar,
            playerName: playerResponse.data.name
          });
          SetPlayerres(playerResponse)
        } else {
         console.log("else")
        }
      } catch (avatarError) {
        console.log('Could not fetch avatar, using fallback:', avatarError.message);
        setMemberData(response.data.response);
      }
    } catch (err) {
      console.error('Error in fetchMemberData:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 404) {
        setError('Member not found');
      } else {
        setError('Failed to fetch member data');
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      console.log('Fetching team members...');
      const response = await axiosInstance.get('/vtc/70030');
      console.log('Team response:', response.data);
      
      if (response.data && response.data.members) {
        
        setTeamMembers(response.data.members);
      } else if (response.data && response.data.response && response.data.response.members) {
        
        setTeamMembers(response.data.response.members);
      } else if (response.data && response.data.departments) {
        // If the data is organized by departments, flatten it
        const allMembers = Object.values(response.data.departments).flat();
        console.log('Found members in departments:', allMembers.length);
        setTeamMembers(allMembers);
      } else {
        console.log('No members found in response structure:', Object.keys(response.data || {}));
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError('Failed to fetch team members');
    } finally {
      setLoadingTeam(false);
    }
  };

 const htmlToImageConvert = () => {
  console.log("poda")
    toPng(elementRef.current, { cacheBust: false })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "my-image-name.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };


  const resetForm = () => {
    setSelectedMemberId('');
    setMemberData(null);
    setError('');
    setLicenseNumber('');
  };

  // Check if user is admin
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        TNL License Generator
      </Typography>

      <Grid container spacing={4}>
        {/* Input Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Generate Your License
            </Typography>
                         <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
               Select a team member to generate their official TNL license
             </Typography>

             {loadingTeam ? (
               <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                 <CircularProgress size={24} />
                 <Typography variant="body2" sx={{ ml: 1 }}>
                   Loading team members...
                 </Typography>
               </Box>
             ) : teamMembers.length === 0 ? (
               <Box sx={{ textAlign: 'center', mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                 <Typography variant="body2" color="text.secondary">
                   No team members found. Please check the console for debugging information.
                 </Typography>
                 <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                   Team members loaded: {teamMembers.length}
                 </Typography>
               </Box>
             ) : (
               <Autocomplete
                 fullWidth
                 options={teamMembers}
                 getOptionLabel={(option) => `${option.username} (${option.primaryRole || 'Member'})`}
                 value={teamMembers.find(member => member.id === selectedMemberId) || null}
                 onChange={(event, newValue) => {
                   setSelectedMemberId(newValue ? newValue.id : '');
                 }}
                 renderInput={(params) => (
                   <TextField
                     {...params}
                     label="Search Team Member"
                     placeholder="Type to search..."
                     variant="outlined"
                   />
                 )}
                 renderOption={(props, option) => (
                   <Box component="li" {...props}>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                       <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                         {option.username.charAt(0).toUpperCase()}
                       </Avatar>
                       <Box sx={{ flex: 1 }}>
                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
                           {option.username}
                         </Typography>
                         <Typography variant="caption" color="text.secondary">
                           {option.primaryRole || 'Member'}
                         </Typography>
                       </Box>
                                                <Chip 
                           label={option.primaryRole || 'Member'} 
                           size="small" 
                           sx={{ 
                             backgroundColor: 'rgba(255, 215, 0, 0.1)', 
                             color: '#ffd700',
                             fontSize: '0.7rem'
                           }} 
                         />
                     </Box>
                   </Box>
                 )}
                 filterOptions={(options, { inputValue }) => {
                   const searchTerm = inputValue.toLowerCase();
                   return options.filter(option => 
                     option.username.toLowerCase().includes(searchTerm) ||
                     (option.primaryRole && option.primaryRole.toLowerCase().includes(searchTerm))
                   );
                 }}
                 noOptionsText="No team members found"
                 loading={loadingTeam}
                 sx={{ mb: 2 }}
               />
             )}

                         <Button
               fullWidth
               variant="contained"
               onClick={fetchMemberData}
               disabled={loading || !selectedMemberId}
               startIcon={loading ? <CircularProgress size={20} /> : <Person />}
               sx={{ mb: 2 }}
             >
               {loading ? 'Generating...' : 'Generate License'}
             </Button>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

                         {memberData && (
               <Box>
                 <Divider sx={{ my: 2 }} />
                 <Typography variant="h6" gutterBottom>
                   License Information
                 </Typography>
                                    <Typography variant="body2">
                     <strong>Username:</strong> {memberData.username}
                   </Typography>
                   <Typography variant="body2">
                     <strong>Player Name:</strong> {memberData.playerName || 'N/A'}
                   </Typography>
                 <Typography variant="body2">
                   <strong>Role:</strong> {memberData.role || (memberData.roles && memberData.roles[0] ? memberData.roles[0].name : 'Member')}
                 </Typography>
                
                 <Typography variant="body2">
                   <strong>Generated:</strong> {new Date().toLocaleDateString()}
                 </Typography>
               </Box>
             )}
          </Paper>
        </Grid>

        {/* License Preview */}
     <Grid item xs={12} md={8}>
  <Paper elevation={3} sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Typography variant="h5">
        License Preview
      </Typography>
      {memberData && (
        <Button
          variant="outlined"
          onClick={resetForm}
          startIcon={<Refresh />}
        >
          Reset
        </Button>
      )}
    </Box>

    {!memberData ? (
      <div id='license-card'>
      <Card sx={{
        height: 280,
        display: 'flex',
         
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: 'white'
      }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <LocalShipping sx={{ fontSize: 80, color: '#666', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a team member to preview their license
          </Typography>
        </CardContent>
      </Card>
      </div>
    ) : (
     <Box>
        {/* License Card - ID Card Style */}
        
        <Box
          ref={elementRef}
          sx={{
            width: '100%',
            height: 380,
            background: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            border: '2px solid #ffd700',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
          }}
        >
          {/* Title Section - Top Center */}
          <Box sx={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            textAlign: 'center'
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{
                color: '#ffd700',
                fontWeight: 'bold',
                fontSize: '1.8rem',
                mb: 0.5
              }}>
                TAMILNADU LOGISTICS
              </Typography>
              <Typography variant="body2" sx={{
                color: '#ffd700',
                fontSize: '0.9rem',
                fontWeight: '500',
                opacity: 0.8,
                alignContent:'center',
                textAlign:'center'
              }}>
                ரௌத்திரம் பழகு
              </Typography>
            </Box>
          </Box>

          {/* India Flag - Top Right */}
          <Box sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Box sx={{
              width: 40,
              height: 28,
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: 'linear-gradient(to bottom, #ff9933 0%, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%, #138808 100%)'
            }}>
              {/* Chakra in center */}
             <img
             crossOrigin="anonymous"
  alt="United States"
  src="http://purecatamphetamine.github.io/country-flag-icons/3x2/IN.svg"/>
            </Box>
          </Box>

          {/* Background TNL Logo */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '-20%',
              transform: 'translateY(-50%)',
              width: '60%',
              height: '60%',
              opacity: 0.1,
              zIndex: 1
            }}
          >
            <img
              src={tnlLogo}
              alt="TNL Background"
             
            />
          </Box>

          {/* Left Section - Photo Area */}
          <Box sx={{
            flex: '0 0 120px',
            p: 2,
            pt: 8, // Add more top padding to account for title
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Photo Area */}
            <Box sx={{
              width: 100,
              height: 120,
              background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)',
              borderRadius: 2,
              border: '2px solid #ffd700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              overflow: 'hidden',
              position: 'relative'
            }}>
              {memberData.avatar ? (
                <img
                  src={memberData.avatar}
                  // crossOrigin="tnlsite"
                   
                  alt={`${memberData.username} avatar`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'fit',
                    borderRadius: '2px'
                  }}
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <Box sx={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
                display: memberData.avatar ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
                position: 'absolute'
              }}>
                <Typography variant="h4" sx={{
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '1.5rem'
                }}>
                  {memberData.username.charAt(0).toUpperCase()}
                </Typography>
              </Box>
            </Box>

            {/* Verification Badge */}
            <Box sx={{
              background: 'linear-gradient(135deg, #4caf50, #45a049)',
              color: '#fff',
              px: 2,
              py: 0.5,
              borderRadius: 1.5,
              fontWeight: '600',
              fontSize: '10px',
              border: '1px solid #fff',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              <Box sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#fff'
              }} />
              VERIFIED
            </Box>
          </Box>

          {/* Center Section - Personal Details */}
          <Box sx={{
            flex: 1,
            p: 2,
            pt: 8, // Add more top padding to account for title
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Header */}
         

            {/* Member Name */}
            <Typography variant="h3" sx={{
              color: '#fff',
              fontWeight: '600',
              fontSize: '2rem',
              mb: 1
            }}>
              {memberData.playerName || memberData.username}
            </Typography>

            {/* Role */}
            <Box sx={{
              background: 'rgba(255, 215, 0, 0.1)',
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid rgba(255, 215, 0, 0.3)',
              mb: 2,
              display: 'inline-block'
            }}>
              <Typography variant="body1" sx={{
                color: '#ffd700',
                fontWeight: '500',
                fontSize: '0.9rem'
              }}>
                {memberData.role || (memberData.roles && memberData.roles[0] ? memberData.roles[0].name : 'Member')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.8rem', mt: 0.5 }}>
                <strong>License Number:</strong> {licenseNumber || 'Generating...'}
              </Typography>
            </Box>

            {/* Member Since */}
            <Typography variant="body2" sx={{
              color: '#999',
              fontSize: '0.8rem'
            }}>
              Member since {memberData ? new Date(memberData.joinDate).toLocaleDateString() : 'N/A'}
            </Typography>
          </Box>

          {/* Right Section - Empty now, content moved */}
          <Box sx={{
            flex: '0 0 140px',
            position: 'relative',
            zIndex: 2
          }}>
            {/* This section is now empty as content has been moved */}
          </Box>

          {/* TNL Administration - Bottom Right (Signing Authority) */}
          <Box sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 3,
            textAlign: 'center'
          }}>
            <Box sx={{
             
             
              borderRadius: 1.5,
              
              textAlign: 'center',
              minWidth: 120
            }}>
              <Typography variant="caption" sx={{
                color: '#ffd700',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                display: 'block'
              }}>
                TNL ADMINISTRATION
              </Typography>
              <Typography variant="caption" sx={{
                color: '#ccc',
                fontSize: '0.6rem',
                display: 'block',
                mt: 0.5
              }}>
                Authorized Signatory
              </Typography>
            </Box>
          </Box>

          {/* Bottom Disclaimer */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 1,
            textAlign: 'center',
            background: 'rgba(0,0,0,0.8)',
            borderTop: '1px solid rgba(255, 215, 0, 0.2)',
            zIndex: 2
          }}>
            
          </Box>
        </Box>

        {/* Download Button */}
       <button onClick={htmlToImageConvert}>Download</button>
      </Box>
    )}
  </Paper>
</Grid>
      </Grid>
    </Container>
  );
};

export default LicenseGenerator;
