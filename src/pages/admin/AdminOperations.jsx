import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import BuildOutlined from '@mui/icons-material/BuildOutlined';
import SpeedOutlined from '@mui/icons-material/SpeedOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import MagicPageShell from '../../components/magicui/MagicPageShell';

const TOOLS = [
  {
    to: '/admin/operations/fleet-odometer',
    title: 'Fleet odometer backfill',
    description:
      'Fix division truck odometer, deliveries, and blocked state from ledger rows, job replay, or purchase-age estimate.',
    Icon: SpeedOutlined,
  },
];

export default function AdminOperations() {
  return (
    <MagicPageShell title="Maintenance tools" subtitle="Safe data repairs — always preview before applying.">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        These tools mirror backend scripts. Pick one division when possible; use preview to see exactly what will change.
      </Typography>

      <Stack spacing={2}>
        {TOOLS.map((tool) => (
          <Card key={tool.to} variant="outlined">
            <CardActionArea component={RouterLink} to={tool.to}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <tool.Icon color="primary" />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {tool.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tool.description}
                    </Typography>
                  </Box>
                  <ChevronRightOutlined color="action" />
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 4 }} color="text.secondary">
        <BuildOutlined fontSize="small" />
        <Typography variant="caption">More maintenance wizards can be added here over time.</Typography>
      </Stack>
    </MagicPageShell>
  );
}
