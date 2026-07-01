import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import AllocationDialog from './AllocationDialog';

function RequestTable({ rows, onAllocate, emptyMessage }) {
  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>VTC</TableCell>
            <TableCell>Players</TableCell>
            <TableCell>Discord</TableCell>
            <TableCell>Requested</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((req) => (
            <TableRow key={req._id}>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {req.vtcName}
                </Typography>
                {req.vtcRole && (
                  <Typography variant="caption" color="text.secondary">
                    {req.vtcRole}
                  </Typography>
                )}
              </TableCell>
              <TableCell>{req.playercount}</TableCell>
              <TableCell>{req.discordUsername}</TableCell>
              <TableCell>
                {req.requestedAt
                  ? format(new Date(req.requestedAt), 'MMM d, yyyy HH:mm')
                  : '—'}
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AssignmentIcon />}
                  onClick={() => onAllocate(req)}
                >
                  Allocate
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function RequestInbox({
  routeRequests,
  routes,
  routeSlots,
  onApprove,
  onReject,
  onDeleteApproved,
}) {
  const [dialogRequest, setDialogRequest] = useState(null);

  const allRequests = Object.values(routeRequests || {}).flat();
  const pending = allRequests.filter((r) => r.status === 'pending');
  const approved = allRequests.filter((r) => r.status === 'approved');
  const rejected = allRequests.filter((r) => r.status === 'rejected');

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6">Pending requests</Typography>
        {pending.length > 0 && (
          <Chip label={pending.length} color="error" size="small" />
        )}
      </Box>

      {pending.length === 0 ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          No pending requests — inbox is clear.
        </Alert>
      ) : (
        <RequestTable
          rows={pending}
          onAllocate={setDialogRequest}
          emptyMessage="No pending requests"
        />
      )}

      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Approved ({approved.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {approved.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No approved requests yet.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>VTC</TableCell>
                    <TableCell>Route</TableCell>
                    <TableCell>Slot</TableCell>
                    <TableCell>Players</TableCell>
                    <TableCell align="right">Undo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {approved.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell>{req.vtcName}</TableCell>
                      <TableCell>{req.routeName || '—'}</TableCell>
                      <TableCell>
                        {req.allocatedSlotName || `#${req.allocatedSlotNumber}`}
                      </TableCell>
                      <TableCell>{req.playercount}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="error"
                          title="Remove approval"
                          onClick={() => onDeleteApproved(req._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Rejected ({rejected.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {rejected.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No rejected requests.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>VTC</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Rejected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rejected.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell>{req.vtcName}</TableCell>
                      <TableCell>{req.rejectionReason || '—'}</TableCell>
                      <TableCell>
                        {req.rejectedAt
                          ? format(new Date(req.rejectedAt), 'MMM d, yyyy')
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      <AllocationDialog
        open={Boolean(dialogRequest)}
        onClose={() => setDialogRequest(null)}
        request={dialogRequest}
        routes={routes}
        routeSlots={routeSlots}
        onApprove={onApprove}
        onReject={onReject}
      />
    </Box>
  );
}
