import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import HistoryOutlined from '@mui/icons-material/HistoryOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import PaymentOutlined from '@mui/icons-material/PaymentOutlined';
import { AdminPageHeader, useAdminFeedback } from '../../../components/admin/primitives';
import { getBankBalance } from '../../../services/bankService';
import BankLedgerTab from './BankLedgerTab';
import BankLedgerSearchTab from './BankLedgerSearchTab';
import BankActionsTab from './BankActionsTab';
import BankAnalyticsTab from './BankAnalyticsTab';
import BankDivisionTab from './BankDivisionTab';
import TransactionDetailDrawer from './components/TransactionDetailDrawer';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
}

export default function AdminBank() {
  const { showSuccess, showError, Feedback } = useAdminFeedback();
  const [balance, setBalance] = useState(0);
  const [tab, setTab] = useState(0);
  const [selectedTx, setSelectedTx] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshBalance = useCallback(async () => {
    try {
      const b = await getBankBalance();
      setBalance(b.balance || 0);
    } catch {
      setBalance(0);
    }
  }, []);

  useEffect(() => { refreshBalance(); }, [refreshBalance]);

  const openDetail = (tx) => {
    setSelectedTx(tx);
    setDrawerOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <AdminPageHeader
          description="Ledger-first bank operations, cross-wallet search, and division flows."
          actions={(
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/admin/audit-logs?preset=bank_ops" variant="outlined" size="small">
                Audit: bank ops
              </Button>
              <Button variant="contained" startIcon={<RefreshOutlined />} onClick={refreshBalance}>
                Refresh balance
              </Button>
            </Stack>
          )}
          sx={{ mb: 3 }}
        />

        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary">Central bank balance</Typography>
            <Typography variant="h3" fontWeight={800}>{formatCurrency(balance)}</Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab icon={<HistoryOutlined />} iconPosition="start" label="Ledger" sx={{ textTransform: 'none' }} />
            <Tab icon={<SearchOutlined />} iconPosition="start" label="Cross-ledger search" sx={{ textTransform: 'none' }} />
            <Tab icon={<PaymentOutlined />} iconPosition="start" label="Actions" sx={{ textTransform: 'none' }} />
            <Tab icon={<AssessmentOutlined />} iconPosition="start" label="Analytics" sx={{ textTransform: 'none' }} />
            <Tab icon={<GroupsOutlined />} iconPosition="start" label="Division wallet" sx={{ textTransform: 'none' }} />
          </Tabs>
          <Box sx={{ p: 3 }}>
            {tab === 0 && <BankLedgerTab onOpenDetail={openDetail} />}
            {tab === 1 && <BankLedgerSearchTab onOpenDetail={openDetail} />}
            {tab === 2 && (
              <BankActionsTab
                onSuccess={(msg) => { showSuccess(msg); refreshBalance(); }}
                onError={showError}
              />
            )}
            {tab === 3 && <BankAnalyticsTab />}
            {tab === 4 && <BankDivisionTab onOpenDetail={openDetail} />}
          </Box>
        </Card>

        <TransactionDetailDrawer
          open={drawerOpen}
          transaction={selectedTx}
          onClose={() => setDrawerOpen(false)}
        />
        <Feedback />
      </Container>
    </Box>
  );
}
