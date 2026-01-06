import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Pagination,
  TextField,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Refresh,
  Email,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import axiosInstance from '../utils/axios';

export default function AdminUserApprovals() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(null);
  const [approvalDialog, setApprovalDialog] = useState({ open: false, user: null, action: null });
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/users/pending-approvals', {
        params: { page, limit },
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to fetch pending approvals' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const handleApproval = (user, approved) => {
    setApprovalDialog({ open: true, user, action: approved });
  };

  const confirmApproval = async () => {
    const { user, action } = approvalDialog;
    setApproving(user._id);
    try {
      await axiosInstance.patch(`/users/${user._id}/approval`, {
        approved: action,
      });
      setMessage({
        type: 'success',
        text: `User ${action ? 'approved' : 'rejected'} successfully. Email notification sent.`,
      });
      setApprovalDialog({ open: false, user: null, action: null });
      fetchPendingApprovals();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || `Failed to ${action ? 'approve' : 'reject'} user`,
      });
    } finally {
      setApproving(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          User Approvals
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchPendingApprovals}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {message.text && (
        <Alert
          severity={message.type}
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{ mb: 3 }}
        >
          {message.text}
        </Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Pending Approvals ({total})
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                select
                size="small"
                label="Per page"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                sx={{ width: 120 }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                shape="rounded"
                size="small"
              />
            </Stack>
          </Stack>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No pending approvals
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rider Info</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Person fontSize="small" color="action" />
                          <Typography variant="body2">{user.username}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Email fontSize="small" color="action" />
                          <Typography variant="body2">{user.email}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {user.riderId ? (
                          <Typography variant="body2" color="text.secondary">
                            {user.riderId.name || user.riderId.employeeID || 'N/A'}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No rider linked
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarToday fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(user.createdAt)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Pending"
                          color="warning"
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Approve User">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApproval(user, true)}
                              disabled={approving === user._id}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleApproval(user, false)}
                              disabled={approving === user._id}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Approval Confirmation Dialog */}
      <Dialog
        open={approvalDialog.open}
        onClose={() => setApprovalDialog({ open: false, user: null, action: null })}
      >
        <DialogTitle>
          {approvalDialog.action ? 'Approve User' : 'Reject User'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {approvalDialog.action ? 'approve' : 'reject'} the user{' '}
            <strong>{approvalDialog.user?.username}</strong> ({approvalDialog.user?.email})?
            {approvalDialog.action
              ? ' They will receive an approval email and be able to access the platform.'
              : ' They will receive a rejection email.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setApprovalDialog({ open: false, user: null, action: null })}
            disabled={approving}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmApproval}
            variant="contained"
            color={approvalDialog.action ? 'success' : 'error'}
            disabled={approving}
            startIcon={approving ? <CircularProgress size={16} /> : null}
          >
            {approvalDialog.action ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

