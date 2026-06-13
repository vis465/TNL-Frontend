import React from 'react';
import { Card, CardContent, Typography, Stack, Box, Button, Chip } from '@mui/material';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import { PowerupBadge, getPowerupDisplay } from './PowerupDisplay';

function Item({ item, onUse }) {
  const canUse = item.status === 'available' || item.status === 'active';
  const meta = getPowerupDisplay(item.type);
  return (
    <Box sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Stack spacing={0.25}>
          <PowerupBadge type={item.type} size={24} />
          <Typography variant="body2" color="text.secondary">
            {meta.description || `Value: ${item.value}`}{item.daysLeft != null ? ` • ${item.daysLeft} day(s) left` : ''}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={item.status} />
          {canUse && <Button size="small" variant="outlined" onClick={() => onUse(item)}>Use</Button>}
        </Stack>
      </Stack>
    </Box>
  );
}

export default function PowerupInventory({ inventory, onUse }) {
  const available = inventory?.available || [];
  const active = inventory?.active || [];
  const used = inventory?.used || [];
  const expired = inventory?.expired || [];

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <FlashOnOutlinedIcon color="warning" />
          <Typography variant="h6">Powerup Inventory</Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Claimed milestone rewards are applied immediately. This page lists your Powerups and their current state: "active" (time-limited), "used" (already consumed), or "expired". Active items show remaining time.
          </Typography>

          <Typography variant="subtitle2">Available ({available.length})</Typography>
          {available.length ? available.map((p) => <Item key={p._id} item={p} onUse={onUse} />) : <Typography variant="body2" color="text.secondary">No available powerups</Typography>}

          <Typography variant="subtitle2">Active ({active.length})</Typography>
          {active.length ? active.map((p) => <Item key={p._id} item={p} onUse={onUse} />) : <Typography variant="body2" color="text.secondary">No active powerups</Typography>}

          <Typography variant="subtitle2">Used ({used.length})</Typography>
          {used.length ? used.map((p) => <Item key={p._id} item={p} onUse={onUse} />) : <Typography variant="body2" color="text.secondary">No used powerups</Typography>}

          <Typography variant="subtitle2">Expired ({expired.length})</Typography>
          {expired.length ? expired.map((p) => <Item key={p._id} item={p} onUse={onUse} />) : <Typography variant="body2" color="text.secondary">No expired powerups</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}
