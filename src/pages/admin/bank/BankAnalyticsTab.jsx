import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { getBankAnalyticsSummary } from '../../../services/bankService';
import LedgerFiltersBar, { filtersToParams } from './components/LedgerFiltersBar';
import { getBankDivisions, searchRiders } from '../../../services/bankService';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
}

const EMPTY_FILTERS = {
  kind: '', type: '', jobID: '', q: '', from: '', to: '', rider: null, riderId: '', division: null, divisionId: '',
};

export default function BankAnalyticsTab() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riderOptions, setRiderOptions] = useState([]);
  const [divisionOptions, setDivisionOptions] = useState([]);

  const load = useCallback(async (f = applied) => {
    setLoading(true);
    try {
      setSummary(await getBankAnalyticsSummary(f));
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [applied]);

  useEffect(() => { load(applied); }, [applied, load]);

  return (
    <Box>
      <LedgerFiltersBar
        filters={filters}
        onChange={setFilters}
        onApply={() => { setApplied(filtersToParams(filters)); }}
        onReset={() => { setFilters(EMPTY_FILTERS); setApplied({}); }}
        riderOptions={riderOptions}
        onRiderSearch={async (q) => { if (q?.length >= 2) setRiderOptions(await searchRiders(q, 10)); }}
        divisionOptions={divisionOptions}
        onDivisionSearch={async (q) => {
          const d = await getBankDivisions(q || undefined);
          setDivisionOptions(d.items || []);
        }}
      />

      {loading ? (
        <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>
      ) : summary ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              ['Total in', summary.totals?.in],
              ['Total out', summary.totals?.out],
              ['Net', summary.totals?.net],
              ['Job deductions', summary.totals?.jobDeductions],
              ['Division flows', summary.totals?.divisionFlows],
            ].map(([label, value]) => (
              <Grid item xs={12} sm={6} md={2.4} key={label}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="h6" fontWeight={700}>{formatCurrency(value)}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>By kind</Typography>
          <Grid container spacing={1}>
            {Object.entries(summary.byKind || {}).map(([kind, stats]) => (
              <Grid item xs={12} md={4} key={kind}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography fontWeight={600}>{kind}</Typography>
                    <Typography variant="body2">Credit: {formatCurrency(stats.credit)} ({stats.creditCount})</Typography>
                    <Typography variant="body2">Debit: {formatCurrency(stats.debit)} ({stats.debitCount})</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Typography color="text.secondary">No analytics data</Typography>
      )}
    </Box>
  );
}
