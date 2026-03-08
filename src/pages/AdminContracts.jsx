import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTemplate, updateTemplate, deleteTemplate } from '../services/contractsService';
import { fetchTemplates, fetchInstancesByStatus, invalidateTemplates, invalidateInstances } from '../store/slices/contractsSlice';
import { Grid, Card, CardContent, CardActions, Typography, Button, TextField, Stack, IconButton, Chip, Divider, Alert, ToggleButton, ToggleButtonGroup, LinearProgress, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Box, Tabs, Tab } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useExternalData } from '../contexts/ExternalDataContext';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const emptyTemplate = {
  title: '', slug: '', description: '', priceTokens: 0, rewardTokens: 0, penaltyTokens: 0, deadlineDays: 7,
  // Use datetime-local format for better UX, will convert to Unix on save
  startAtLocal: '', endAtLocal: '',
  expiresAt: '', active: true,
  tasks: [ { order: 1, title: '', criteria: {} } ]
};

export default function AdminContracts() {
  const dispatch = useDispatch();
  const {
    templates,
    templatesLoading,
    templatesError,
    instances: storeInstances,
    instancesStatus,
    instancesLoading,
    instancesError,
  } = useSelector((state) => state.contracts);

  const [form, setForm] = useState(emptyTemplate);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [activeTab, setActiveTab] = useState(0);
  const [expandedTaskIdx, setExpandedTaskIdx] = useState(0);
  const [progressVisibleCount, setProgressVisibleCount] = useState(40);
  const [progressSearch, setProgressSearch] = useState('');
  const [expandedProgressId, setExpandedProgressId] = useState(null);
  const PROGRESS_PAGE_SIZE = 40;

  const instances = useMemo(
    () => (instancesStatus === statusFilter && Array.isArray(storeInstances) ? storeInstances : []),
    [storeInstances, instancesStatus, statusFilter]
  );

  const { cityOptions, companyOptionsByCity, cargoOptions } = useExternalData();

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchInstancesByStatus(statusFilter));
  }, [dispatch, statusFilter]);

  useEffect(() => { setProgressVisibleCount(PROGRESS_PAGE_SIZE); }, [statusFilter]);
  useEffect(() => { setProgressVisibleCount(PROGRESS_PAGE_SIZE); }, [progressSearch]);

  useEffect(() => {
    if (templatesError) setErr(templatesError);
  }, [templatesError]);


  const setTask = (idx, patch) => {
    const tasks = [...form.tasks];
    tasks[idx] = { ...tasks[idx], ...patch };
    setForm({ ...form, tasks });
  };

  const addTask = () => setForm({ ...form, tasks: [...form.tasks, { order: form.tasks.length+1, title: '', criteria: {} }] });
  const removeTask = (idx) => {
    setForm({ ...form, tasks: form.tasks.filter((_, i) => i !== idx) });
    setExpandedTaskIdx((prev) => (prev === idx ? 0 : prev > idx ? prev - 1 : prev));
  };

  // Helper function to convert IST datetime to Unix seconds
  const istToUnixSeconds = (istDateTime) => {
    if (!istDateTime) return '';
    // Create date in IST timezone (UTC+5:30)
    const date = new Date(istDateTime + '+05:30');
    return Math.floor(date.getTime() / 1000);
  };

  // Helper function to convert Unix seconds to IST datetime format
  const unixToIstDateTime = (unixSeconds) => {
    if (!unixSeconds) return '';
    const date = new Date(unixSeconds * 1000);
    // Convert to IST (UTC+5:30)
    const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    return istDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  const save = async () => {
    setMsg(''); setErr('');
    try {
      // Convert IST datetime inputs to Unix seconds for backend
      const payload = {
        ...form,
        startAtUnix: istToUnixSeconds(form.startAtLocal),
        endAtUnix: istToUnixSeconds(form.endAtLocal)
      };
      // Remove local datetime fields from payload
      delete payload.startAtLocal;
      delete payload.endAtLocal;

      if (editingId) {
        await updateTemplate(editingId, payload);
      } else {
        await createTemplate(payload);
      }
      setForm(emptyTemplate);
      setEditingId(null);
      dispatch(invalidateTemplates());
      await dispatch(fetchTemplates()).unwrap().catch(() => {});
      setMsg('Saved');
    } catch(e) { setErr(e.message || 'Save failed'); }
  };

  const edit = (tpl) => {
    setEditingId(tpl._id);
    setExpandedTaskIdx(0);
    setForm({
      title: tpl.title, slug: tpl.slug, description: tpl.description || '', priceTokens: tpl.priceTokens, rewardTokens: tpl.rewardTokens, penaltyTokens: tpl.penaltyTokens, deadlineDays: tpl.deadlineDays,
      startAtLocal: tpl.startAt ? unixToIstDateTime(Math.floor(new Date(tpl.startAt).getTime()/1000)) : '',
      endAtLocal: tpl.endAt ? unixToIstDateTime(Math.floor(new Date(tpl.endAt).getTime()/1000)) : '',
      expiresAt: tpl.expiresAt ? tpl.expiresAt.slice(0,10) : '', active: !!tpl.active,
      tasks: (tpl.tasks||[]).map(t => ({ order: t.order, title: t.title, criteria: t.criteria || {} }))
    });
  };

  const del = async (id) => {
    setErr(''); setMsg('');
    try {
      await deleteTemplate(id);
      dispatch(invalidateTemplates());
      await dispatch(fetchTemplates()).unwrap().catch(() => {});
      setMsg('Deleted');
    } catch(e) { setErr(e.message || 'Delete failed'); }
  };

  const criteriaFields = [
    ['sourceCity','From'], ['sourceCompany','Source Company'], ['destinationCity','To'], ['destinationCompany','Destination Company'], ['cargoName','Cargo'],
    ['minDistance','Min Distance (km)'], ['maxDamagePct','Max Cargo Damage %'],
    ['maxTopSpeedKmh','Max Top Speed (km/h)'], ['minRevenue','Min Revenue'],
    ['minAvgSpeedKmh','Min Avg Speed'], ['maxAvgSpeedKmh','Max Avg Speed'],
    ['maxTruckDamagePercent','Max Truck Damage %'], ['maxTrailerDamagePercent','Max Trailer Damage %']
  ];

  const renderCreateEditTab = () => (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{editingId ? 'Edit Contract Template' : 'Create Contract Template'}</Typography>
            <FormControlLabel control={<Switch checked={!!form.active} onChange={(_, v)=>setForm({ ...form, active: v })} />} label="Active" />
          </Stack>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">Basic Info</Typography>
            <Stack spacing={1}>
              <TextField label="Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} size="small" fullWidth />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField label="Slug" value={form.slug} onChange={e=>setForm({ ...form, slug: e.target.value })} size="small" sx={{ flex: 1 }} />
                <TextField label="Deadline (days)" value={form.deadlineDays} onChange={e=>setForm({ ...form, deadlineDays: Number(e.target.value) })} size="small" sx={{ width: { xs: '100%', sm: 220 } }} />
              </Stack>
              <TextField label="Description" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} size="small" multiline minRows={2} />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">Pricing</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField label="Price" value={form.priceTokens} onChange={e=>setForm({ ...form, priceTokens: Number(e.target.value) })} size="small" sx={{ flex: 1 }} />
              <TextField label="Reward" value={form.rewardTokens} onChange={e=>setForm({ ...form, rewardTokens: Number(e.target.value) })} size="small" sx={{ flex: 1 }} />
              <TextField label="Penalty" value={form.penaltyTokens} onChange={e=>setForm({ ...form, penaltyTokens: Number(e.target.value) })} size="small" sx={{ flex: 1 }} />
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }} color="text.secondary">Availability</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField 
                label="Start Date & Time" 
                type="datetime-local"
                value={form.startAtLocal} 
                onChange={e=>setForm({ ...form, startAtLocal: e.target.value })} 
                size="small" 
                InputLabelProps={{ shrink: true }}
                helperText="Optional - when contract becomes available"
                sx={{ flex: 1 }}
              />
              <TextField 
                label="End Date & Time" 
                type="datetime-local"
                value={form.endAtLocal} 
                onChange={e=>setForm({ ...form, endAtLocal: e.target.value })} 
                size="small" 
                InputLabelProps={{ shrink: true }}
                helperText="When contract becomes unavailable"
                sx={{ flex: 1 }}
              />
            </Stack>
          </Box>

          <Divider sx={{ my: 1 }} />
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1">Tasks</Typography>
            <Button size="small" onClick={addTask}>Add Task</Button>
          </Stack>

          <Stack spacing={1}>
            {form.tasks.map((t, idx) => (
              <Accordion
                key={idx}
                disableGutters
                expanded={expandedTaskIdx === idx}
                onChange={(_, isExpanded) => setExpandedTaskIdx(isExpanded ? idx : -1)}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`task-${idx}`} id={`task-summary-${idx}`}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <TextField label="#" value={t.order} onChange={e=>setTask(idx, { order: Number(e.target.value) })} size="small" sx={{ width: 80 }} onClick={e => e.stopPropagation()} />
                    <TextField label="Title" value={t.title} onChange={e=>setTask(idx, { title: e.target.value })} size="small" sx={{ flex: 1 }} onClick={e => e.stopPropagation()} />
                    <IconButton onClick={(e) => { e.stopPropagation(); removeTask(idx); }} size="small"><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </AccordionSummary>
                {expandedTaskIdx === idx && (
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {criteriaFields.map(([key, label]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          {key === 'sourceCity' || key === 'destinationCity' ? (
                            <Autocomplete freeSolo options={cityOptions.map(city => city.name)} value={(t.criteria||{})[key] || ''}
                              onInputChange={(_, v) => {
                                const selectedCity = cityOptions.find(city => city.name === v);
                                const criteria = {
                                  ...(t.criteria||{}),
                                  [key]: v,
                                  [`${key}Id`]: selectedCity ? selectedCity.id : ''
                                };
                                setTask(idx, { criteria });
                              }}
                              renderInput={(params) => (<TextField {...params} label={label} size="small" fullWidth />)} />
                          ) : key === 'sourceCompany' ? (
                            <Autocomplete freeSolo options={(companyOptionsByCity[(t.criteria||{}).sourceCity || ''] || []).map(company => company.name)} value={(t.criteria||{})[key] || ''}
                              onInputChange={(_, v) => {
                                const selectedCompany = (companyOptionsByCity[(t.criteria||{}).sourceCity || ''] || []).find(company => company.name === v);
                                const criteria = {
                                  ...(t.criteria||{}),
                                  [key]: v,
                                  [`${key}Id`]: selectedCompany ? selectedCompany.id : ''
                                };
                                setTask(idx, { criteria });
                              }}
                              renderInput={(params) => (<TextField {...params} label={label} size="small" fullWidth />)} />
                          ) : key === 'destinationCompany' ? (
                            <Autocomplete freeSolo options={(companyOptionsByCity[(t.criteria||{}).destinationCity || ''] || []).map(company => company.name)} value={(t.criteria||{})[key] || ''}
                              onInputChange={(_, v) => {
                                const selectedCompany = (companyOptionsByCity[(t.criteria||{}).destinationCity || ''] || []).find(company => company.name === v);
                                const criteria = {
                                  ...(t.criteria||{}),
                                  [key]: v,
                                  [`${key}Id`]: selectedCompany ? selectedCompany.id : ''
                                };
                                setTask(idx, { criteria });
                              }}
                              renderInput={(params) => (<TextField {...params} label={label} size="small" fullWidth />)} />
                          ) : key === 'cargoName' ? (
                            <Autocomplete freeSolo options={cargoOptions} value={(t.criteria||{})[key] || ''}
                              onInputChange={(_, v) => {
                                const criteria = { ...(t.criteria||{}), [key]: v };
                                setTask(idx, { criteria });
                              }}
                              renderInput={(params) => (<TextField {...params} label={label} size="small" fullWidth />)} />
                          ) : (
                            <TextField label={label} value={(t.criteria||{})[key] || ''} onChange={e=>{
                              const criteria = { ...(t.criteria||{}), [key]: e.target.value };
                              const numKeys = ['minDistance','maxDamagePct','maxTopSpeedKmh','minRevenue','minAvgSpeedKmh','maxAvgSpeedKmh','maxTruckDamagePercent','maxTrailerDamagePercent'];
                              if (numKeys.includes(key)) criteria[key] = e.target.value === '' ? '' : Number(e.target.value);
                              setTask(idx, { criteria });
                            }} size="small" fullWidth />
                          )}
                        </Grid>
                      ))}
                    </Grid>
                    {t.criteria && (
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                        {Object.entries(t.criteria).filter(([,v]) => v !== '' && v != null).map(([k,v]) => (
                          <Chip key={k} label={`${k}: ${v}`} size="small" />
                        ))}
                      </Stack>
                    )}
                  </AccordionDetails>
                )}
              </Accordion>
            ))}
          </Stack>
        </Stack>
      </CardContent>
      <CardActions>
        <Button variant="contained" onClick={save}>{editingId ? 'Update' : 'Create'}</Button>
        {editingId && <Button onClick={() => { setEditingId(null); setForm(emptyTemplate); }}>Cancel</Button>}
      </CardActions>
    </Card>
  );

  const renderTemplatesTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Existing Templates</Typography>
        {templates.map(t => (
          <Card key={t._id} variant="outlined" sx={{ mb: 1, p: 1.5 }}>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={12} sm>
                <Stack spacing={0.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>{t.title}</Typography>
                    {!t.active && <Chip size="small" label="Inactive" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{t.description}</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                    <Chip size="small" label={`Price ${t.priceTokens}`} />
                    <Chip size="small" label={`Reward ${t.rewardTokens}`} color="success" />
                    <Chip size="small" label={`Penalty ${t.penaltyTokens}`} color="error" />
                    <Chip size="small" label={`Deadline ${t.deadlineDays} days`} />
                  </Stack>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={() => { edit(t); setActiveTab(0); }}>Edit</Button>
                  <IconButton color="error" size="small" onClick={() => del(t._id)}><DeleteIcon /></IconButton>
                </Stack>
              </Grid>
            </Grid>
          </Card>
        ))}
      </CardContent>
    </Card>
  );

  const filteredInstances = useMemo(() => {
    if (!progressSearch.trim()) return instances;
    const q = progressSearch.trim().toLowerCase();
    return instances.filter((c) => {
      const riderName = (c?.riderId?.tmpIngameName || c?.riderId?.name || c?.riderId?.steamName || '').toString().toLowerCase();
      const templateTitle = (c?.templateId?.title || '').toString().toLowerCase();
      return riderName.includes(q) || templateTitle.includes(q);
    });
  }, [instances, progressSearch]);

  const visibleInstances = useMemo(
    () => filteredInstances.slice(0, progressVisibleCount),
    [filteredInstances, progressVisibleCount]
  );
  const hasMoreProgress = filteredInstances.length > progressVisibleCount;

  const progressSummary = useMemo(() => ({
    count: instances.length,
    status: instancesStatus,
  }), [instances.length, instancesStatus]);

  const handleRefreshProgress = () => {
    dispatch(invalidateInstances(statusFilter));
    dispatch(fetchInstancesByStatus(statusFilter));
  };

  const renderProgressTab = () => (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
            <Typography variant="h6">Contracts Progress</Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <ToggleButtonGroup
                size="small"
                exclusive
                value={statusFilter}
                onChange={(_, v) => { if (v) setStatusFilter(v); }}
              >
                <ToggleButton value="active">Active</ToggleButton>
                <ToggleButton value="completed">Completed</ToggleButton>
                <ToggleButton value="failed">Failed</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
              </ToggleButtonGroup>
              <Button
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshProgress}
                disabled={instancesLoading}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ py: 1, px: 1.5, bgcolor: 'action.hover', borderRadius: 1 }} alignItems="center">
            <Typography variant="body2" color="text.secondary">Current filter:</Typography>
            <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
              {statusFilter} — {progressSummary.count} contract{progressSummary.count !== 1 ? 's' : ''}
            </Typography>
          </Stack>

          <TextField
            size="small"
            placeholder="Search by rider or template..."
            value={progressSearch}
            onChange={(e) => setProgressSearch(e.target.value)}
            sx={{ maxWidth: 320 }}
          />

          {instancesLoading && <LinearProgress />}
          {!instancesLoading && instances.length === 0 && (
            <Alert severity="info">No contracts found for the selected filter.</Alert>
          )}

          {!instancesLoading && instances.length > 0 && filteredInstances.length === 0 && (
            <Alert severity="info">No contracts match &quot;{progressSearch}&quot;.</Alert>
          )}

          {!instancesLoading && visibleInstances.length > 0 && (
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">
                Showing {visibleInstances.length} of {filteredInstances.length}
                {progressSearch.trim() ? ` (filtered from ${instances.length})` : ''}
              </Typography>
              {visibleInstances.map((c) => {
                const tpl = c.templateId || {};
                const tasks = Array.isArray(tpl.tasks) ? tpl.tasks.slice().sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
                const progress = Array.isArray(c.progress) ? c.progress : [];
                const doneCount = progress.filter(p => p.status === 'done').length;
                const total = Math.max(tasks.length, progress.length, 1);
                const pct = Math.round((doneCount / total) * 100);
                const riderName = c?.riderId?.tmpIngameName || c?.riderId?.name || c?.riderId?.steamName || c?.riderId?._id || 'Unknown Rider';
                const templateTitle = tpl.title || 'Untitled Template';
                const isExpanded = expandedProgressId === c._id;
                const statusColor = c.status === 'completed' ? 'success' : c.status === 'failed' ? 'error' : 'warning';

                return (
                  <Card key={c._id} variant="outlined" sx={{ overflow: 'hidden' }}>
                    <Accordion
                      expanded={isExpanded}
                      onChange={() => setExpandedProgressId(isExpanded ? null : c._id)}
                      disableGutters
                      sx={{ boxShadow: 'none', '&:before': { display: 'none' }, bgcolor: 'transparent' }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ py: 0.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ width: '100%', pr: 1 }}>
                          <Stack sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                              <Typography variant="subtitle1" fontWeight={600}>
                                {riderName}
                              </Typography>
                              <Chip label={c.status} size="small" color={statusColor} sx={{ textTransform: 'capitalize' }} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary">{templateTitle}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Purchased: {c.purchasedAt ? new Date(c.purchasedAt).toLocaleString() : '–'} · Deadline: {c.deadlineAt ? new Date(c.deadlineAt).toLocaleString() : '–'}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 200 }}>
                            <Typography variant="body2" fontWeight={500} sx={{ width: 44, textAlign: 'right' }}>{pct}%</Typography>
                            <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 8, borderRadius: 1 }} color={statusColor} />
                          </Stack>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Task progress</Typography>
                        <Stack spacing={0.5}>
                          {tasks.length > 0 ? tasks.map((task, idx) => {
                            const prog = progress.find(pr => pr.order === task.order) ?? progress[idx];
                            const done = prog?.status === 'done';
                            return (
                              <Stack key={task.order ?? idx} direction="row" alignItems="center" spacing={1}>
                                {done ? <CheckCircleIcon color="success" fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" color="disabled" />}
                                <Typography variant="body2" sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.secondary' : 'text.primary' }}>
                                  {task.order}. {task.title || `Task ${task.order}`}
                                </Typography>
                                {done && prog?.matchedAt && (
                                  <Typography variant="caption" color="text.secondary">
                                    · Matched {new Date(prog.matchedAt).toLocaleString()}
                                  </Typography>
                                )}
                              </Stack>
                            );
                          }) : progress.map((p, idx) => (
                            <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                              {p.status === 'done' ? <CheckCircleIcon color="success" fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" color="disabled" />}
                              <Typography variant="body2">Task {p.order ?? idx + 1}: {p.status}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                );
              })}
              {hasMoreProgress && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                  <Button variant="outlined" onClick={() => setProgressVisibleCount(prev => prev + PROGRESS_PAGE_SIZE)}>
                    Load more ({filteredInstances.length - progressVisibleCount} remaining)
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      {err && (<Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>)}
      {msg && (<Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>)}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="Create/Edit" />
          <Tab label="Templates" />
          <Tab label="Progress" />
        </Tabs>
      </Box>

      {activeTab === 0 && renderCreateEditTab()}
      {activeTab === 1 && renderTemplatesTab()}
      {activeTab === 2 && renderProgressTab()}
    </Box>
  );
}


