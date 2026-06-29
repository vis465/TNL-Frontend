import React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ClearOutlined from '@mui/icons-material/ClearOutlined';

const KIND_OPTIONS = [
  '',
  'job_deductions',
  'admin_deduction',
  'bonus_payout',
  'division_credit',
  'division_debit',
  'job',
  'job_tax',
  'adjustment',
  'bank_credit',
  'bank_debit',
];

export default function LedgerFiltersBar({
  filters,
  onChange,
  onApply,
  onReset,
  riderOptions = [],
  onRiderSearch,
  divisionOptions = [],
  onDivisionSearch,
  showDivision = true,
  showRider = true,
  showJobId = true,
}) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Type"
            value={filters.type || ''}
            onChange={(e) => set('type', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="debit">Debit</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            size="small"
            label="Kind"
            value={filters.kind || ''}
            onChange={(e) => set('kind', e.target.value)}
          >
            {KIND_OPTIONS.map((k) => (
              <MenuItem key={k || 'all'} value={k}>{k || 'All kinds'}</MenuItem>
            ))}
          </TextField>
        </Grid>
        {showJobId && (
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              size="small"
              label="Job ID"
              value={filters.jobID || ''}
              onChange={(e) => set('jobID', e.target.value)}
            />
          </Grid>
        )}
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Search text"
            value={filters.q || ''}
            onChange={(e) => set('q', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={filters.from || ''}
            onChange={(e) => set('from', e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={filters.to || ''}
            onChange={(e) => set('to', e.target.value)}
          />
        </Grid>
        {showRider && (
          <Grid item xs={12} md={4}>
            <Autocomplete
              size="small"
              options={riderOptions}
              getOptionLabel={(o) => `${o.name || o.tmpIngameName || 'Rider'} (${o.employeeID || o._id})`}
              value={filters.rider || null}
              onChange={(_, v) => {
                onChange({ ...filters, rider: v, riderId: v?._id || '' });
              }}
              onInputChange={(_, v) => onRiderSearch?.(v)}
              renderInput={(params) => <TextField {...params} label="Rider" />}
            />
          </Grid>
        )}
        {showDivision && (
          <Grid item xs={12} md={4}>
            <Autocomplete
              size="small"
              options={divisionOptions}
              getOptionLabel={(o) => o.name || ''}
              value={filters.division || null}
              onChange={(_, v) => {
                onChange({ ...filters, division: v, divisionId: v?._id || '' });
              }}
              onInputChange={(_, v) => onDivisionSearch?.(v)}
              renderInput={(params) => <TextField {...params} label="Division" />}
            />
          </Grid>
        )}
      </Grid>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" startIcon={<SearchOutlined />} onClick={onApply}>
          Apply filters
        </Button>
        <Button variant="outlined" startIcon={<ClearOutlined />} onClick={onReset}>
          Reset
        </Button>
      </Stack>
    </Box>
  );
}

export function filtersToParams(filters) {
  const params = {};
  if (filters.kind) params.kind = filters.kind;
  if (filters.type) params.type = filters.type;
  if (filters.jobID) params.jobID = filters.jobID;
  if (filters.q) params.q = filters.q;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;
  if (filters.riderId) params.riderId = filters.riderId;
  if (filters.divisionId) params.divisionId = filters.divisionId;
  return params;
}
