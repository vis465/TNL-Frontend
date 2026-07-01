import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  InputAdornment,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import { useAuth } from '../../contexts/AuthContext';
import {
  ADMIN_HUB_MAP,
  getAllSearchableItems,
  getNavItemByPath,
  scoreNavSearch,
  userCanSeeNavItem,
} from '../../config/adminNavigation';
import { getAdminRecents } from '../../utils/adminNavStorage';

function PaletteRow({ item, onSelect, secondary }) {
  const Icon = item.Icon;
  return (
    <ListItemButton onClick={() => onSelect(item.to)} sx={{ borderRadius: 1, mx: 0.5 }}>
      <ListItemIcon sx={{ minWidth: 40 }}>
        <Icon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={item.label || item.title}
        secondary={secondary}
        primaryTypographyProps={{ fontWeight: 600 }}
        secondaryTypographyProps={{ noWrap: true }}
      />
      {item.hub && ADMIN_HUB_MAP[item.hub] && (
        <Chip size="small" label={ADMIN_HUB_MAP[item.hub].label} variant="outlined" sx={{ ml: 1 }} />
      )}
    </ListItemButton>
  );
}

export default function AdminCommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const [query, setQuery] = useState('');

  const searchable = useMemo(() => getAllSearchableItems(role), [role]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) {
      return getAdminRecents()
        .map((path) => getNavItemByPath(path) || searchable.find((i) => i.to === path))
        .filter((item) => item && userCanSeeNavItem(role, item.roles));
    }
    return searchable
      .map((item) => ({ item, score: scoreNavSearch(item, q) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 14)
      .map(({ item }) => item);
  }, [query, role, searchable]);

  const handleSelect = useCallback(
    (to) => {
      onClose();
      setQuery('');
      navigate(to);
    },
    [navigate, onClose],
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, mt: '10vh', alignSelf: 'flex-start' } }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search admin pages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && results[0]) handleSelect(results[0].to);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {query.trim() ? 'Matching pages' : 'Recent pages'} · ↑↓ navigate · Enter open · Esc close
          </Typography>
        </Box>
        <Divider />
        <List dense sx={{ maxHeight: 360, overflow: 'auto', py: 1 }}>
          {!results.length && (
            <Box sx={{ px: 2, py: 3 }}>
              <Typography color="text.secondary" variant="body2">
                {query.trim() ? 'No matching pages for your role.' : 'No recent admin pages yet.'}
              </Typography>
            </Box>
          )}
          {results.map((item) => (
            <PaletteRow
              key={item.id || item.to}
              item={item}
              onSelect={handleSelect}
              secondary={
                !query.trim() ? (
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    <HistoryOutlined sx={{ fontSize: 14 }} /> Recent
                  </Box>
                ) : (
                  item.description
                )
              }
            />
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}
