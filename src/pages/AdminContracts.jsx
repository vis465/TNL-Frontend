import React, { useEffect, useState } from 'react';
import { listTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/contractsService';
import { Grid, Card, CardContent, CardActions, Typography, Button, TextField, Stack, IconButton, Chip, Divider, Alert } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { fetchEts2Map } from '../utils/axios';
import DeleteIcon from '@mui/icons-material/Delete';

const emptyTemplate = {
  title: '', slug: '', description: '', priceTokens: 0, rewardTokens: 0, penaltyTokens: 0, deadlineDays: 7, expiresAt: '', active: true,
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

  const load = async () => {
    try {
      const data = await listTemplates();
      setTemplates(data);
    } catch(e) { setErr(e.message || 'Failed to load'); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const md = await fetchEts2Map();
        const cities = md?.mapData?.cities || [];
        setCityOptions(cities.map(c => c.name).filter(Boolean).sort());
        const byCity = {};
        for (const c of cities) byCity[c.name] = (c.companies||[]).map(co => co.name).filter(Boolean).sort();
        setCompanyOptionsByCity(byCity);
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

  const save = async () => {
    setMsg(''); setErr('');
    try {
      if (editingId) {
        await updateTemplate(editingId, form);
      } else {
        await createTemplate(form);
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
      title: tpl.title, slug: tpl.slug, description: tpl.description || '', priceTokens: tpl.priceTokens, rewardTokens: tpl.rewardTokens, penaltyTokens: tpl.penaltyTokens, deadlineDays: tpl.deadlineDays, expiresAt: tpl.expiresAt ? tpl.expiresAt.slice(0,10) : '', active: !!tpl.active,
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

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {err && (<Grid item xs={12}><Alert severity="error">{err}</Alert></Grid>)}
      {msg && (<Grid item xs={12}><Alert severity="success">{msg}</Alert></Grid>)}
      <Grid item xs={12} md={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>{editingId ? 'Edit Contract Template' : 'Create Contract Template'}</Typography>
            <Stack spacing={1}>
              <TextField label="Title" value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} size="small" />
              <TextField label="Slug" value={form.slug} onChange={e=>setForm({ ...form, slug: e.target.value })} size="small" />
              <TextField label="Description" value={form.description} onChange={e=>setForm({ ...form, description: e.target.value })} size="small" />
              <Stack direction="row" spacing={1}>
                <TextField label="Price" value={form.priceTokens} onChange={e=>setForm({ ...form, priceTokens: Number(e.target.value) })} size="small" />
                <TextField label="Reward" value={form.rewardTokens} onChange={e=>setForm({ ...form, rewardTokens: Number(e.target.value) })} size="small" />
                <TextField label="Penalty" value={form.penaltyTokens} onChange={e=>setForm({ ...form, penaltyTokens: Number(e.target.value) })} size="small" />
                <TextField label="Deadline (days)" value={form.deadlineDays} onChange={e=>setForm({ ...form, deadlineDays: Number(e.target.value) })} size="small" />
              </Stack>
              <TextField label="Expires At (YYYY-MM-DD, optional)" value={form.expiresAt} onChange={e=>setForm({ ...form, expiresAt: e.target.value })} size="small" />

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1">Tasks</Typography>
              {form.tasks.map((t, idx) => (
                <Card key={idx} variant="outlined" sx={{ p: 1 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1}>
                      <TextField label="Order" value={t.order} onChange={e=>setTask(idx, { order: Number(e.target.value) })} size="small" sx={{ width: 100 }} />
                      <TextField label="Title" value={t.title} onChange={e=>setTask(idx, { title: e.target.value })} size="small" sx={{ flex: 1 }} />
                      <IconButton onClick={() => removeTask(idx)} size="small"><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
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
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {Object.entries(t.criteria).filter(([,v]) => v !== '' && v != null).map(([k,v]) => (
                          <Chip key={k} label={`${k}: ${v}`} />
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))}
              <Button onClick={addTask}>Add Task</Button>
            </Stack>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={save}>{editingId ? 'Update' : 'Create'}</Button>
            {editingId && <Button onClick={() => { setEditingId(null); setForm(emptyTemplate); }}>Cancel</Button>}
          </CardActions>
        </Card>
      </Grid>
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>Existing Templates</Typography>
            {templates.map(t => (
              <Card key={t._id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack>
                    <Typography variant="subtitle1" fontWeight={700}>{t.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{t.description}</Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                      <Chip label={`Price ${t.priceTokens}`} />
                      <Chip label={`Reward ${t.rewardTokens}`} color="success" />
                      <Chip label={`Penalty ${t.penaltyTokens}`} color="error" />
                      <Chip label={`Deadline ${t.deadlineDays} days`} />
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" onClick={() => edit(t)}>Edit</Button>
                    <IconButton color="error" size="small" onClick={() => del(t._id)}><DeleteIcon /></IconButton>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}


