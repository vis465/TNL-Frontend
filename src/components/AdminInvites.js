import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Stack,
  Link,
  TextField,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { format } from 'date-fns';
import axiosInstance from '../utils/axios';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';

const AdminInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editSlotOpen, setEditSlotOpen] = useState(false);
  const [slotData, setSlotData] = useState({ slotImageUrl: '', slotNumber: '' });
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  const fetchInvites = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/invites/admin');
      setInvites(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching invites:', err);
      setError('Failed to fetch invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAction = async (inviteId, action) => {
    try {
      setActionLoading(true);
      await axiosInstance.post(`/invites/${inviteId}/${action}`);
      await fetchInvites(); // Refresh the list
      setSelectedInvite(null);
    } catch (err) {
      console.error(`Error ${action}ing invite:`, err);
      setError(`Failed to ${action} invitation`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSlot = (invite) => {
    setSelectedInvite(invite);
    setSlotData({
      slotImageUrl: invite.slotImageUrl || '',
      slotNumber: invite.slotNumber || ''
    });
    setEditSlotOpen(true);
  };

  const handleSlotUpdate = async () => {
    try {
      setEditError('');
      const response = await axiosInstance.put(
        `/invites/${selectedInvite._id}/update-slot`,
        slotData
      );
      
      // Update the invites list with the updated invite
      setInvites(invites.map(invite => 
        invite._id === selectedInvite._id ? response.data : invite
      ));
      
      setEditSuccess(true);
      setEditSlotOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update slot information');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleInviteClick = (invite) => {
    setSelectedInvite(invite);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage VTC Invitations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event Title</TableCell>
              <TableCell>VTC Name</TableCell>
              <TableCell>Game</TableCell>
              <TableCell>Meetup Time</TableCell>
              <TableCell>Departure Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invites.map((invite) => (
              <TableRow 
                key={invite._id}
                onClick={() => handleInviteClick(invite)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
              >
                <TableCell>{invite.eventTitle}</TableCell>
                <TableCell>{invite.vtcName}</TableCell>
                <TableCell>
                  <Chip 
                    label={invite.game} 
                    color={invite.game === 'ETS2' ? 'primary' : 'secondary'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {format(new Date(invite.Meetuptime), 'PPp')}
                </TableCell>
                <TableCell>
                  {format(new Date(invite.departureTime), 'PPp')}
                </TableCell>
                <TableCell>
                  <Chip
                    label={invite.status}
                    color={getStatusColor(invite.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {invite.status === 'approved' && (
                      <Tooltip title="Edit Slot Information">
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSlot(invite);
                          }}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {invite.status === 'pending' && (
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(invite._id, 'approve');
                          }}
                          disabled={actionLoading}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction(invite._id, 'reject');
                          }}
                          disabled={actionLoading}
                        >
                          Reject
                        </Button>
                      </Stack>
                    )}
                    {invite.status === 'approved' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAction(invite._id, 'cancel');
                        }}
                        disabled={actionLoading}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!selectedInvite}
        onClose={() => setSelectedInvite(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedInvite && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <Typography variant="h6">{selectedInvite.eventTitle}</Typography>
                <Chip 
                  label={selectedInvite.game} 
                  color={selectedInvite.game === 'ETS2' ? 'primary' : 'secondary'}
                />
                <Chip
                  label={selectedInvite.status}
                  color={getStatusColor(selectedInvite.status)}
                />
                {selectedInvite.status === 'approved' && selectedInvite.approvedByUsername && (
                  <Chip
                    icon={<PersonIcon />}
                    label={`Approved by ${selectedInvite.approvedByUsername}`}
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                <Typography>
                  <strong>VTC Name:</strong> {selectedInvite.vtcName}
                </Typography>
                <Typography>
                  <strong>Event Link:</strong>{' '}
                  <Link href={selectedInvite.eventLink} target="_blank" rel="noopener noreferrer">
                    {selectedInvite.eventLink}
                  </Link>
                </Typography>
                <Typography>
                  <strong>Meetup Time:</strong>{' '}
                  {format(new Date(selectedInvite.Meetuptime), 'PPp')}
                </Typography>
                <Typography>
                  <strong>Departure Time:</strong>{' '}
                  {format(new Date(selectedInvite.departureTime), 'PPp')}
                </Typography>
                {selectedInvite.dlcs && selectedInvite.dlcs.length > 0 && (
                  <>
                    <Typography>
                      <strong>Required DLCs:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedInvite.dlcs.map((dlc) => (
                        <Chip
                          key={dlc}
                          label={dlc}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}
                <Typography>
                  <strong>Invitation Text:</strong>
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {selectedInvite.invite_text}
                </Typography>

                {selectedInvite.status === 'approved' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Slot Information
                    </Typography>
                    {selectedInvite.slotNumber || selectedInvite.slotImageUrl ? (
                      <Stack spacing={2}>
                        {selectedInvite.slotNumber && (
                          <Typography>
                            <strong>Slot Number:</strong> {selectedInvite.slotNumber}
                          </Typography>
                        )}
                        {selectedInvite.slotImageUrl && (
                          <>
                            <Typography>
                              <strong>Slot Image:</strong>
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <img 
                                src={selectedInvite.slotImageUrl} 
                                alt="Slot preview" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '300px', 
                                  objectFit: 'contain',
                                  borderRadius: '4px',
                                  border: '1px solid #e0e0e0'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                                }}
                              />
                            </Box>
                          </>
                        )}
                      </Stack>
                    ) : (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        No slot information has been added yet. Click the edit button to add slot details.
                      </Alert>
                    )}
                  </Box>
                )}

                {selectedInvite.status === 'approved' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Approval Information
                    </Typography>
                    <Stack spacing={1}>
                      <Typography>
                        <strong>Approved by:</strong> {selectedInvite.approvedByUsername}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Approved on: {format(new Date(selectedInvite.updatedAt), 'PPp')}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              {selectedInvite.status === 'pending' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      handleAction(selectedInvite._id, 'approve');
                      setSelectedInvite(null);
                    }}
                    disabled={actionLoading}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      handleAction(selectedInvite._id, 'reject');
                      setSelectedInvite(null);
                    }}
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                </>
              )}
              {selectedInvite.status === 'approved' && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    handleAction(selectedInvite._id, 'cancel');
                    setSelectedInvite(null);
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
              )}
              <Button onClick={() => setSelectedInvite(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog 
        open={editSlotOpen} 
        onClose={() => setEditSlotOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Slot Information</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Slot Image URL"
              value={slotData.slotImageUrl}
              onChange={(e) => setSlotData(prev => ({ ...prev, slotImageUrl: e.target.value }))}
              fullWidth
              helperText="Enter the URL for the slot image"
            />
            <TextField
              label="Slot Number"
              type="number"
              value={slotData.slotNumber}
              onChange={(e) => setSlotData(prev => ({ ...prev, slotNumber: e.target.value }))}
              fullWidth
              helperText="Enter the slot number"
              InputProps={{ inputProps: { min: 0 } }}
            />
            {slotData.slotImageUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Image Preview:
                </Typography>
                <img 
                  src={slotData.slotImageUrl} 
                  alt="Slot preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200x100?text=Invalid+Image+URL';
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditSlotOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSlotUpdate} 
            variant="contained" 
            color="primary"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={editSuccess}
        autoHideDuration={6000}
        onClose={() => setEditSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setEditSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Slot information updated successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminInvites; 