import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Link,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const BookedSlots = ({ slots }) => {
  // Filter slots that have approved bookings
  const slotsWithApprovedBookings = slots.filter(slot =>
    slot.slots.some(s => s.booking?.status === 'approved')
  );

  return (
    <Card sx={{ mt: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, mb: 3 }}
        >
          Booked Slots Overview
        </Typography>

        {slotsWithApprovedBookings.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center">
            No approved slots yet.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {slotsWithApprovedBookings.map((slot) => (
              <Grid item xs={12} md={6} key={slot._id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ position: 'relative', width: { xs: '100%', sm: 200 }, height: { xs: 200, sm: '100%' } }}>
                      <CardMedia
                        component="img"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        image={slot.imageUrl}
                        alt={`Slot Image ${slot.imageNumber}`}
                      />
                      <Tooltip title="Open in new tab">
                        <IconButton
                          component="a"
                          href={slot.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,1)'
                            }
                          }}
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Slot Image #{slot.imageNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {slot.slots.filter(s => s.booking?.status === 'approved').length} approved slots
                        </Typography>
                        <Stack spacing={1}>
                          {slot.slots
                            .filter(s => s.booking?.status === 'approved')
                            .map((slotItem) => (
                              <Box
                                key={slotItem.number}
                                sx={{
                                  p: 2,
                                  bgcolor: 'background.default',
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Slot #{slotItem.number}
                                  </Typography>
                                  <Chip
                                    label="Approved"
                                    color="success"
                                    size="small"
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  <br />
                                  VTC: {slotItem.booking.vtcName}
                                </Typography>
                                {slotItem.booking.vtcLink && (
                                  <Link
                                    href={slotItem.booking.vtcLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="body2"
                                    color="secondary"
                                    sx={{ display: 'block', mt: 1 }}
                                  >
                                    View VTC Profile ↗
                                  </Link>
                                )}
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                  Approved on: {format(new Date(slotItem.booking.createdAt), 'PPp')}
                                </Typography>
                              </Box>
                            ))}
                        </Stack>
                      </CardContent>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default BookedSlots; 