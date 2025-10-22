import React, { useEffect, useMemo, useState } from 'react';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate, adminListContractInstances } from '../services/contractsService';
import { Grid, Card, CardContent, CardActions, Typography, Button, TextField, Stack, IconButton, Chip, Divider, Alert, ToggleButton, ToggleButtonGroup, LinearProgress, Tooltip, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, Box, Tabs, Tab } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { fetchEts2Map } from '../utils/axios';
import { fetchCargos } from '../services/cargoService';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const emptyTemplate = {
  title: '', slug: '', description: '', priceTokens: 0, rewardTokens: 0, penaltyTokens: 0, deadlineDays: 7,
  // Use datetime-local format for better UX, will convert to Unix on save
  startAtLocal: '', endAtLocal: '',
  expiresAt: '', active: true,
  tasks: [ { order: 1, title: '', criteria: {} } ]
};

export default function AdminContracts() {
  const [templates, setTemplates] = useState([]);
  const [form, setForm] = useState(emptyTemplate);
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [cityOptions, setCityOptions] = useState([]);
  const [companyOptionsByCity, setCompanyOptionsByCity] = useState({});
  const [cargoOptions, setCargoOptions] = useState([]);
  const [instances, setInstances] = useState([]);
  const [instancesLoading, setInstancesLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [activeTab, setActiveTab] = useState(0);

  const load = async () => {
    try {
      const data = await listTemplates();
      setTemplates(data);
    } catch(e) { setErr(e.message || 'Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  const loadInstances = async (status) => {
    setInstancesLoading(true);
    try {
      const data = await adminListContractInstances(status);
      setInstances(Array.isArray(data) ? data : []);
    } catch(e) { /* surface errors in UI area */ }
    finally { setInstancesLoading(false); }
  };

  useEffect(() => { loadInstances(statusFilter); }, [statusFilter]);

  useEffect(() => {
    (async () => {
      try {
        const md = await fetchEts2Map();
        const cities = md?.mapData?.cities || [];
        setCityOptions(cities.map(c => c.name).filter(Boolean).sort());
        const byCity = {};
        for (const c of cities) byCity[c.name] = (c.companies||[]).map(co => co.name).filter(Boolean).sort();
        setCompanyOptionsByCity(byCity);
        
        // Load cargo options
        const cargos = await fetchCargos();
        setCargoOptions(cargos);
      } catch (_) {}
    })();
  }, []);

  const setTask = (idx, patch) => {
    const tasks = [...form.tasks];
    tasks[idx] = { ...tasks[idx], ...patch };
    setForm({ ...form, tasks });
  };

  const addTask = () => setForm({ ...form, tasks: [...form.tasks, { order: form.tasks.length+1, title: '', criteria: {} }] });
  const removeTask = (idx) => setForm({ ...form, tasks: form.tasks.filter((_,i)=>i!==idx) });

  // Helper function to convert local datetime to Unix seconds
  const localToUnixSeconds = (localDateTime) => {
    if (!localDateTime) return '';
    const date = new Date(localDateTime);
    return Math.floor(date.getTime() / 1000);
  };

  // Helper function to convert Unix seconds to local datetime format
  const unixToLocalDateTime = (unixSeconds) => {
    if (!unixSeconds) return '';
    const date = new Date(unixSeconds * 1000);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  const save = async () => {
    setMsg(''); setErr('');
    try {
      // Convert local datetime inputs to Unix seconds for backend
      const payload = {
        ...form,
        startAtUnix: localToUnixSeconds(form.startAtLocal),
        endAtUnix: localToUnixSeconds(form.endAtLocal)
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
      await load();
      setMsg('Saved');
    } catch(e) { setErr(e.message || 'Save failed'); }
  };

  const edit = (tpl) => {
    setEditingId(tpl._id);
    setForm({
      title: tpl.title, slug: tpl.slug, description: tpl.description || '', priceTokens: tpl.priceTokens, rewardTokens: tpl.rewardTokens, penaltyTokens: tpl.penaltyTokens, deadlineDays: tpl.deadlineDays,
      startAtLocal: tpl.startAt ? unixToLocalDateTime(Math.floor(new Date(tpl.startAt).getTime()/1000)) : '',
      endAtLocal: tpl.endAt ? unixToLocalDateTime(Math.floor(new Date(tpl.endAt).getTime()/1000)) : '',
      expiresAt: tpl.expiresAt ? tpl.expiresAt.slice(0,10) : '', active: !!tpl.active,
      tasks: (tpl.tasks||[]).map(t => ({ order: t.order, title: t.title, criteria: t.criteria || {} }))
    });
  };

  const del = async (id) => {
    setErr(''); setMsg('');
    try { await deleteTemplate(id); await load(); setMsg('Deleted'); } catch(e) { setErr(e.message || 'Delete failed'); }
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
              <Accordion key={idx} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                    <TextField label="#" value={t.order} onChange={e=>setTask(idx, { order: Number(e.target.value) })} size="small" sx={{ width: 80 }} />
                    <TextField label="Title" value={t.title} onChange={e=>setTask(idx, { title: e.target.value })} size="small" sx={{ flex: 1 }} />
                    <IconButton onClick={() => removeTask(idx)} size="small"><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {criteriaFields.map(([key, label]) => (
                      <Grid item xs={12} sm={6} key={key}>
                        {key === 'sourceCity' || key === 'destinationCity' ? (
                          <Autocomplete freeSolo options={cityOptions} value={(t.criteria||{})[key] || ''}
                            onInputChange={(_, v) => {
                              const criteria = { ...(t.criteria||{}), [key]: v };
                              setTask(idx, { criteria });
                            }}
                            renderInput={(params) => (<TextField {...params} label={label} size="small" fullWidth />)} />
                        ) : key === 'sourceCompany' ? (
                          <Autocomplete freeSolo options={companyOptionsByCity[(t.criteria||{}).sourceCity || ''] || []} value={(t.criteria||{})[key] || ''}
                            onInputChange={(_, v) => {
                              const criteria = { ...(t.criteria||{}), [key]: v };
                              setTask(idx, { criteria });
                            }}
                            renderInput={(params) => (<TextField {...params} label={label} size="small" fullWidth />)} />
                        ) : key === 'destinationCompany' ? (
                          <Autocomplete freeSolo options={companyOptionsByCity[(t.criteria||{}).destinationCity || ''] || []} value={(t.criteria||{})[key] || ''}
                            onInputChange={(_, v) => {
                              const criteria = { ...(t.criteria||{}), [key]: v };
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

  const renderProgressTab = () => (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Contracts Progress (Admin)</Typography>
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
        </Stack>
        {instancesLoading && <LinearProgress />}
        {!instancesLoading && instances.length === 0 && (
          <Alert severity="info">No contracts found for selected filter.</Alert>
        )}

        {!instancesLoading && instances.length > 0 && (
          <Stack spacing={1}>
            {instances.map((c) => {
              const tpl = c.templateId || {};
              const tasks = Array.isArray(tpl.tasks) ? tpl.tasks.slice().sort((a,b)=>a.order-b.order) : [];
              const progress = Array.isArray(c.progress) ? c.progress : [];
              const doneCount = progress.filter(p => p.status === 'done').length;
              const total = tasks.length || progress.length || 1;
              const pct = Math.round((doneCount / total) * 100);
              const riderName = c?.riderId?.tmpIngameName || c?.riderId?.name || c?.riderId?.steamName || c?.riderId?._id || 'Unknown Rider';
              return (
                <Card key={c._id} variant="outlined" sx={{ p: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack>
                        <Typography variant="subtitle1" fontWeight={700}>{tpl.title || 'Untitled Template'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rider: {riderName} • Status: {c.status} • Deadline: {c.deadlineAt ? new Date(c.deadlineAt).toLocaleString() : '-'}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 220 }}>
                        <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>{pct}%</Typography>
                        <LinearProgress variant="determinate" value={pct} sx={{ flex: 1 }} />
                      </Stack>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {tasks.map((t) => {
                        const p = progress.find(pr => pr.order === t.order);
                        const status = p?.status || 'pending';
                        const label = `#${t.order} ${t.title || ''}`.trim();
                        const color = status === 'done' ? 'success' : (status === 'pending' ? 'default' : 'warning');
                        const tip = status === 'done' && p?.matchedAt ? `Completed at ${new Date(p.matchedAt).toLocaleString()}` : (status);
                        return (
                          <Tooltip key={t.order} title={tip}>
                            <Chip size="small" label={label} color={color} variant={status === 'done' ? 'filled' : 'outlined'} />
                          </Tooltip>
                        );
                      })}
                      {tasks.length === 0 && (
                        progress.map((p) => (
                          <Chip size="small" key={p.order} label={`#${p.order} ${p.status}`} color={p.status === 'done' ? 'success' : 'default'} variant={p.status === 'done' ? 'filled' : 'outlined'} />
                        ))
                      )}
                    </Stack>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
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


