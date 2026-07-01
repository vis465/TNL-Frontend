import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';

function buildDefaultThankYou(hostVtcName, eventTitle) {
  const host = hostVtcName || 'the host VTC';
  const title = eventTitle || "today's event";
  return `💛 Thank you, ${host}. For inviting us to your ${title}. We look forward to convoying with you! - TAMILNADU LOGISTICS 💛`;
}

export default function ConvoyReminderDialog({ open, onClose, event, onPreview, onSend }) {
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!open || !event) return;
    setError('');
    setSuccess('');
    setPreview('');
    setThankYouMessage(buildDefaultThankYou(event.hostVtcName, event.title));
  }, [open, event]);

  useEffect(() => {
    if (!open || !event || !onPreview) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const result = await onPreview({ thankYouMessage });
        if (cancelled) return;
        setPreview(result.content || '');
        if (result.hostVtcName) {
          setThankYouMessage(buildDefaultThankYou(result.hostVtcName, event.title));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || 'Failed to generate preview');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, event, onPreview]);

  const handlePreview = async () => {
    if (!event) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await onPreview({ thankYouMessage });
      setPreview(result.content || '');
      if (result.hostVtcName) {
        setThankYouMessage(buildDefaultThankYou(result.hostVtcName, event.title));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!event) return;
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const result = await onSend({ thankYouMessage });
      setPreview(result.content || '');
      setSuccess(result.message || 'Discord reminder sent');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send Discord reminder');
    } finally {
      setSending(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Send Discord convoy reminder</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {event.sourceLabel} · {event.title}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <TextField
          label="Thank you message"
          value={thankYouMessage}
          onChange={(e) => setThankYouMessage(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          helperText="Shown at the bottom of the Discord message"
        />

        {preview && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Preview
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: 320,
                overflow: 'auto',
              }}
            >
              {preview}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handlePreview} disabled={loading || sending}>
          {loading ? <CircularProgress size={20} /> : 'Preview'}
        </Button>
        <Button
          variant="contained"
          startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <CampaignIcon />}
          onClick={handleSend}
          disabled={loading || sending}
        >
          Send to Discord
        </Button>
      </DialogActions>
    </Dialog>
  );
}
