import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import EmailOutlined from '@mui/icons-material/EmailOutlined';

function buildDiscordMessage({ divisionName, member, inactivityDays, fuelSummary }) {
  const name = member?.name || member?.username || 'there';
  const days = member?.daysSinceLastJob;
  const lastLine =
    days == null
      ? "We haven't seen a logged delivery from you yet."
      : `It's been about **${days} days** since your last delivery (inactive threshold: ${inactivityDays} days).`;
  const fuelLine = fuelSummary
    ? `Division fuel tank: **${fuelSummary.totalFuel} L** (~${fuelSummary.runwayDays != null ? `${fuelSummary.runwayDays} days` : '—'} at recent burn).`
    : '';
  return (
    `Hey **${name}** — checking in from **${divisionName}**.\n\n` +
    `${lastLine}\n` +
    (fuelLine ? `${fuelLine}\n` : '') +
    `\nWhen you're back on the road, log deliveries so the division stats stay current. Reply here if you need help.`
  );
}

function buildEmail({ divisionName, member, inactivityDays }) {
  const name = member?.name || member?.username || 'Member';
  const days = member?.daysSinceLastJob;
  const subject = encodeURIComponent(`Checking in — ${divisionName}`);
  const body = encodeURIComponent(
    `Hi ${name},\n\n` +
      `This is a friendly note from ${divisionName}. ` +
      (days == null
        ? "We haven't seen a logged delivery on your account yet."
        : `Your last logged delivery was about ${days} days ago (our inactivity threshold is ${inactivityDays} days).`) +
      `\n\nIf you're still active, please log your next delivery when you can. If you're taking a break, let your leader know so we can plan fuel and fleet usage.\n\nThanks,\n${divisionName} leadership`
  );
  return { subject, mailto: `mailto:?subject=${subject}&body=${body}` };
}

export default function MemberNudgeDialog({
  open,
  onClose,
  divisionName,
  inactivityDays = 14,
  inactiveMembers = [],
  fuelSummary = null,
}) {
  const [tab, setTab] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const [copied, setCopied] = useState(false);

  const member = useMemo(
    () => inactiveMembers.find((m) => String(m._id || m.riderId) === String(selectedId)) || inactiveMembers[0],
    [inactiveMembers, selectedId]
  );

  const discordText = member
    ? buildDiscordMessage({ divisionName, member, inactivityDays, fuelSummary })
    : '';
  const email = member ? buildEmail({ divisionName, member, inactivityDays }) : null;

  const copyDiscord = async () => {
    try {
      await navigator.clipboard.writeText(discordText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      setCopied(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nudge inactive members</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          Copy a message or open email — no wallet changes or automatic DMs are sent from the site.
        </Alert>
        {!inactiveMembers.length ? (
          <Typography color="text.secondary">No inactive members right now.</Typography>
        ) : (
          <>
            <TextField
              select
              fullWidth
              size="small"
              label="Member"
              value={String(selectedId || inactiveMembers[0]?._id || inactiveMembers[0]?.riderId || '')}
              onChange={(e) => setSelectedId(e.target.value)}
              sx={{ mb: 2 }}
            >
              {inactiveMembers.map((m) => (
                <MenuItem key={m._id || m.riderId} value={String(m._id || m.riderId)}>
                  {m.name || m.username} — {m.daysSinceLastJob != null ? `${m.daysSinceLastJob}d since job` : 'no jobs'}
                </MenuItem>
              ))}
            </TextField>
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
              <Tab label="Discord" />
              <Tab label="Email" />
            </Tabs>
            {tab === 0 && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {discordText}
              </Box>
            )}
            {tab === 1 && email && (
              <Typography variant="body2" color="text.secondary">
                Opens your mail client with a pre-filled subject and body for{' '}
                <strong>{member?.name || member?.username}</strong>. Add their email address before sending.
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {inactiveMembers.length > 0 && tab === 0 && (
          <Button startIcon={<ContentCopyOutlined />} variant="contained" onClick={copyDiscord}>
            {copied ? 'Copied' : 'Copy Discord message'}
          </Button>
        )}
        {inactiveMembers.length > 0 && tab === 1 && email && (
          <Button startIcon={<EmailOutlined />} variant="outlined" component="a" href={email.mailto}>
            Open email draft
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
