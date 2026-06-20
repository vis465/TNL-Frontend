import React from 'react';
import { Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Tabs, Tab, Box } from '@mui/material';

function BoardTable({ rows, scoreLabel = 'Score' }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Rank</TableCell>
          <TableCell>Driver</TableCell>
          <TableCell>{scoreLabel}</TableCell>
          <TableCell>Km</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length ? rows.map((r, i) => (
          <TableRow key={r._id || r.id || r.name || i}>
            <TableCell>{i + 1}</TableCell>
            <TableCell>
              <Avatar src={r.avatar} sx={{ width: 28, height: 28, display: 'inline-flex', verticalAlign: 'middle', mr: 1 }} />
              {r.name}
              {r.rankName ? ` (${r.rankName})` : ''}
            </TableCell>
            <TableCell>{Math.round(r.score || 0)}</TableCell>
            <TableCell>{Math.round(r.km || 0)}</TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={4}>
              <Typography variant="body2" color="text.secondary">No leaderboard data yet.</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default function Leaderboards({ boards = {}, ranks = [] }) {
  const [tab, setTab] = React.useState(0);

  const efficiencyRows = Array.isArray(boards.efficiency) ? boards.efficiency : [];
  const rankRows = Array.isArray(boards.ranks)
    ? boards.ranks
    : (Array.isArray(ranks) ? ranks.map((r) => ({
        _id: r.name,
        name: r.name,
        score: r.rankUpCount || 0,
        km: r.totalKm || 0,
        rankName: r.currentRank,
      })) : []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Leaderboards</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
          <Tab label="Efficiency" />
          <Tab label="KM Rank" />
        </Tabs>
        <Box>
          {tab === 0 && <BoardTable rows={efficiencyRows} scoreLabel="Efficiency" />}
          {tab === 1 && <BoardTable rows={rankRows} scoreLabel="Rank #" />}
        </Box>
      </CardContent>
    </Card>
  );
}
