import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MagicPageShell from '../../components/magicui/MagicPageShell';
import EventDetailsForm from '../../components/special-events/EventDetailsForm';
import RoutesManager from '../../components/special-events/RoutesManager';
import RouteSlotsPanel from '../../components/special-events/RouteSlotsPanel';
import RequestInbox from '../../components/special-events/RequestInbox';
import {
  useSpecialEventDetail,
  EMPTY_EVENT_FORM,
} from '../../hooks/useSpecialEvent';

const STEPS = ['Details', 'Routes', 'Slots', 'Requests'];

export default function SpecialEventWorkspace() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const isNew = eventId === 'new';
  const resolvedEventId = isNew ? null : eventId;

  const {
    data,
    loading,
    error,
    setError,
    fetchDetail,
    createEvent,
    updateEvent,
    upsertRouteSlots,
    deleteSlot,
    approveRequest,
    rejectRequest,
    deleteApprovedRequest,
  } = useSpecialEventDetail(resolvedEventId);

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(EMPTY_EVENT_FORM);
  const [saved, setSaved] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isNew) {
      setError('');
      setSaved(false);
      return;
    }
    fetchDetail();
  }, [isNew, fetchDetail, setError]);

  useEffect(() => {
    if (data?.event) {
      const e = data.event;
      setForm({
        truckersmpId: e.truckersmpId || '',
        title: e.title || '',
        description: e.description || '',
        startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
        endtime: e.endtime ? new Date(e.endtime).toISOString().split('T')[0] : '',
        server: e.server || '',
        meetingPoint: e.meetingPoint || '',
        departurePoint: e.departurePoint || '',
        arrivalPoint: e.arrivalPoint || '',
        banner: e.banner || '',
        map: e.map || '',
        voiceLink: e.voiceLink || '',
        externalLink: e.externalLink || '',
        rule: e.rule || '',
        dlcs: e.dlcs || [],
        url: e.url || '',
        maxVtcPerSlot: e.maxVtcPerSlot ?? 1,
        approvalRequired: e.approvalRequired ?? true,
        routes: e.routes || [],
      });
      setSaved(true);
    }
  }, [data]);

  const handleSaveDetails = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = {
      ...form,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      endtime: form.endtime ? new Date(form.endtime) : undefined,
    };
    try {
      if (isNew) {
        const created = await createEvent(payload);
        setSuccess('Event created. You can now add routes.');
        navigate(`/admin/special-events/${created.truckersmpId}`, { replace: true });
        setActiveStep(1);
      } else {
        await updateEvent(resolvedEventId, payload);
        setSuccess('Event details saved.');
        await fetchDetail();
        if (activeStep === 0) setActiveStep(1);
      }
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRoutes = useCallback(
    async (routes) => {
      if (!resolvedEventId) {
        throw new Error('Save event details before adding routes');
      }
      const payload = {
        ...form,
        routes,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endtime: form.endtime ? new Date(form.endtime) : undefined,
      };
      await updateEvent(resolvedEventId, payload);
      setForm((f) => ({ ...f, routes }));
      await fetchDetail();
    },
    [form, resolvedEventId, updateEvent, fetchDetail]
  );

  const handleUpsertSlots = async (routeName, slots) => {
    await upsertRouteSlots(resolvedEventId, routeName, slots);
    await fetchDetail();
  };

  const handleDeleteSlot = async (slotId) => {
    await deleteSlot(resolvedEventId, slotId);
    await fetchDetail();
  };

  const handleApprove = async (requestId, body) => {
    await approveRequest(resolvedEventId, requestId, body);
    await fetchDetail();
  };

  const handleReject = async (requestId, body) => {
    await rejectRequest(resolvedEventId, requestId, body);
    await fetchDetail();
  };

  const handleDeleteApproved = async (requestId) => {
    await deleteApprovedRequest(resolvedEventId, requestId);
    await fetchDetail();
  };

  const routes = form.routes || [];
  const routeSlots = data?.routeSlots || {};
  const routeRequests = data?.routeRequests || {};
  const pendingCount = Object.values(routeRequests)
    .flat()
    .filter((r) => r.status === 'pending').length;

  if (!isNew && loading && !data) {
    return (
      <MagicPageShell title="Special event">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </MagicPageShell>
    );
  }

  return (
    <MagicPageShell
      title={isNew ? 'New special event' : form.title || 'Special event'}
      subtitle={isNew ? 'Import TMP ID → save → configure routes and slots' : `TMP ID: ${resolvedEventId}`}
    >
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/special-events" underline="hover" color="inherit">
          Special events
        </Link>
        <Typography color="text.primary">{isNew ? 'New' : form.title}</Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBackIcon />}
        component={RouterLink}
        to="/admin/special-events"
        sx={{ mb: 2 }}
        size="small"
      >
        Back to list
      </Button>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label, idx) => (
          <Step key={label} completed={idx < activeStep}>
            <StepLabel
              onClick={() => {
                if (idx === 0 || saved) setActiveStep(idx);
              }}
              sx={{ cursor: idx === 0 || saved ? 'pointer' : 'default' }}
            >
              {label}
              {label === 'Requests' && pendingCount > 0 && ` (${pendingCount})`}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Tabs value={activeStep} onChange={(_, v) => (v === 0 || saved) && setActiveStep(v)} sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Tab key={label} label={label === 'Requests' && pendingCount > 0 ? `${label} (${pendingCount})` : label} />
        ))}
      </Tabs>

      {activeStep === 0 && (
        <EventDetailsForm
          form={form}
          onChange={setForm}
          onSave={handleSaveDetails}
          saving={saving}
          isNew={isNew}
          saved={saved}
          error={error}
          success={success}
        />
      )}

      {activeStep === 1 && (
        <RoutesManager
          routes={routes}
          routeSlots={routeSlots}
          onSaveRoutes={handleSaveRoutes}
          disabled={!saved}
        />
      )}

      {activeStep === 2 && (
        <RouteSlotsPanel
          routes={routes}
          routeSlots={routeSlots}
          onUpsertSlots={handleUpsertSlots}
          onDeleteSlot={handleDeleteSlot}
          disabled={!saved || routes.length === 0}
        />
      )}

      {activeStep === 3 && (
        <RequestInbox
          routeRequests={routeRequests}
          routes={routes}
          routeSlots={routeSlots}
          onApprove={handleApprove}
          onReject={handleReject}
          onDeleteApproved={handleDeleteApproved}
        />
      )}
    </MagicPageShell>
  );
}
