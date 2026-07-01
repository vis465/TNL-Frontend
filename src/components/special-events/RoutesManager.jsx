import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  IconButton,
  Alert,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RouteIcon from '@mui/icons-material/Route';

const DEFAULT_ROUTE = { name: '', description: '', color: '#1976d2' };

export default function RoutesManager({ routes, routeSlots, onSaveRoutes, disabled }) {
  const [draft, setDraft] = useState(DEFAULT_ROUTE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const routeHasAllocations = (routeName) => {
    const slots = routeSlots?.[routeName] || [];
    return slots.some((s) => (s.allocatedVtcs || 0) > 0);
  };

  const handleAdd = async () => {
    if (!draft.name.trim()) {
      setError('Route name is required');
      return;
    }
    if (routes.some((r) => r.name === draft.name.trim())) {
      setError('A route with this name already exists');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSaveRoutes([...routes, { ...draft, name: draft.name.trim() }]);
      setDraft(DEFAULT_ROUTE);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add route');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (routeHasAllocations(deleteTarget.name)) {
      setError(`Cannot delete route "${deleteTarget.name}" — it has allocated slots`);
      setDeleteTarget(null);
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSaveRoutes(routes.filter((r) => r.name !== deleteTarget.name));
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove route');
    } finally {
      setSaving(false);
    }
  };

  if (disabled) {
    return (
      <Alert severity="info">
        Save the event details first (TMP ID import → save) before adding routes.
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Routes are saved immediately when you add or remove them.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {routes.length === 0 && (
          <Alert severity="warning">Add at least one route before configuring slots.</Alert>
        )}
        {routes.map((route) => {
          const slotCount = (routeSlots?.[route.name] || []).length;
          const allocated = (routeSlots?.[route.name] || []).reduce(
            (sum, s) => sum + (s.allocatedVtcs || 0),
            0
          );
          return (
            <Card key={route.name} variant="outlined">
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: route.color || '#1976d2',
                    flexShrink: 0,
                  }}
                />
                <RouteIcon color="action" />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {route.name}
                  </Typography>
                  {route.description && (
                    <Typography variant="body2" color="text.secondary">
                      {route.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {slotCount} slot{slotCount !== 1 ? 's' : ''} · {allocated} allocation{allocated !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <IconButton
                  color="error"
                  onClick={() => setDeleteTarget(route)}
                  disabled={saving || routeHasAllocations(route.name)}
                  title={
                    routeHasAllocations(route.name)
                      ? 'Cannot delete route with allocated slots'
                      : 'Delete route'
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Add route
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <TextField
              label="Route name *"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              size="small"
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Description"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              size="small"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Color"
              type="color"
              value={draft.color}
              onChange={(e) => setDraft((d) => ({ ...d, color: e.target.value }))}
              size="small"
              sx={{ width: 80 }}
            />
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
              onClick={handleAdd}
              disabled={saving}
            >
              Add route
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete route?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Remove route &quot;{deleteTarget?.name}&quot;? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={saving}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
