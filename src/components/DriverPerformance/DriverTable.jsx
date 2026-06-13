import React, { useMemo, useState } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody, Avatar, Chip, Stack, Typography, TableSortLabel, Box,
} from '@mui/material';
import EfficiencyRing from './EfficiencyRing';

const RANK_COLORS = {
  Rookie: '#6366f1',
  Scout: '#3b82f6',
  Veteran: '#f59e0b',
  Elite: '#ec4899',
  Legend: '#dc2626',
};

function compare(a, b, key, dir) {
  const av = a[key];
  const bv = b[key];
  if (typeof av === 'string') {
    return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  }
  return dir === 'asc' ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0);
}

export default function DriverTable({ drivers = [] }) {
  const [sortKey, setSortKey] = useState('score');
  const [sortDir, setSortDir] = useState('desc');

  const rows = useMemo(() => {
    const enriched = drivers.map((d) => ({
      ...d,
      score: d.efficiency?.overall || 0,
      rankName: d.rank?.name || 'Rookie',
    }));
    return [...enriched].sort((a, b) => compare(a, b, sortKey, sortDir));
  }, [drivers, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (!drivers.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        No driver performance data yet.
      </Typography>
    );
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>
              <TableSortLabel active={sortKey === 'name'} direction={sortDir} onClick={() => handleSort('name')}>
                Driver
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">
              <TableSortLabel active={sortKey === 'score'} direction={sortDir} onClick={() => handleSort('score')}>
                Efficiency
              </TableSortLabel>
            </TableCell>
            <TableCell align="center">Speed</TableCell>
            <TableCell align="center">Fuel</TableCell>
            <TableCell align="center">On-time</TableCell>
            <TableCell>Level / XP</TableCell>
            <TableCell>Rank</TableCell>
            <TableCell align="right">
              <TableSortLabel active={sortKey === 'km'} direction={sortDir} onClick={() => handleSort('km')}>
                KM
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((d, i) => (
            <TableRow key={d._id || d.id} hover>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={d.avatar} sx={{ width: 32, height: 32 }}>{d.name?.[0]}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700} noWrap>{d.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{d.totalJobs || 0} jobs</Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell align="center">
                <Stack alignItems="center" spacing={0.5}>
                  <EfficiencyRing value={d.efficiency?.overall || 0} size={48} />
                  <Typography variant="caption" sx={{ color: d.efficiency?.rating?.color || 'text.secondary', fontWeight: 700 }}>
                    {d.efficiency?.rating?.rating || '—'}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell align="center">{Math.round(d.efficiency?.speedScore || 0)}</TableCell>
              <TableCell align="center">{Math.round(d.efficiency?.fuelScore || 0)}</TableCell>
              <TableCell align="center">{Math.round(d.efficiency?.onTimeScore || 0)}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={600}>Lv {d.level || 1} · {d.levelName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(d.xp || 0)} / {d.xpToNext || 100} XP
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={d.rankName}
                  sx={{ bgcolor: `${RANK_COLORS[d.rankName] || '#64748b'}22`, color: RANK_COLORS[d.rankName] || '#64748b', fontWeight: 700 }}
                />
              </TableCell>
              <TableCell align="right">{Math.round(d.km || 0).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
