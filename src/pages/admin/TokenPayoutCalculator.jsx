import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import MagicPageShell from '../../components/magicui/MagicPageShell';
import { getTokenPreview } from '../../services/adminOpsService';

export default function TokenPayoutCalculator() {
  const [searchParams] = useSearchParams();
  const [jobID, setJobID] = useState(searchParams.get('jobID') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const runPreview = async () => {
    if (!jobID.trim()) return;
    setLoading(true);
    setError('');
    try {
      setResult(await getTokenPreview(jobID.trim()));
    } catch (e) {
      setError(e?.response?.data?.message || 'Preview failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('jobID')) runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MagicPageShell title="Token payout calculator" subtitle="Read-only deduction breakdown for any job ID.">
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/operations" underline="hover" color="inherit">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ArrowBackOutlined fontSize="small" />
            <span>Maintenance tools</span>
          </Stack>
        </Link>
        <Typography color="text.primary">Token calculator</Typography>
      </Breadcrumbs>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Job ID"
              value={jobID}
              onChange={(e) => setJobID(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runPreview()}
              fullWidth
            />
            <Button variant="contained" startIcon={<SearchOutlined />} onClick={runPreview} disabled={loading}>
              Preview
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box sx={{ py: 4, textAlign: 'center' }}><CircularProgress /></Box>}

      {result && !loading && (
        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography fontWeight={700}>Job #{result.jobID}</Typography>
              <Typography variant="body2" color="text.secondary">
                Source: {result.source} · Status: {result.job?.status} · Revenue: {result.job?.revenue}
              </Typography>
              {result.rider && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Rider: {result.rider.name} (TH {result.rider.truckershubId})
                  {result.division ? ` · ${result.division.name}` : ''}
                </Typography>
              )}
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Pipeline flags: stats={String(result.pipelineFlags?.statsApplied)} progression={String(result.pipelineFlags?.progressionApplied)}
              </Typography>
            </CardContent>
          </Card>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>Token / deduction breakdown</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box component="pre" sx={{ m: 0, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, fontSize: 12, overflow: 'auto' }}>
                {JSON.stringify(result.tokenPreview, null, 2)}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Stack>
      )}
    </MagicPageShell>
  );
}
