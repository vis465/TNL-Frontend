import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import axiosInstance from '../../../utils/axios';

export default function ShowdownFeedAdmin() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await axiosInstance.get('/admin/showdown/feed', { params: { limit: 100 } });
    setItems(data.items || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const post = async () => {
    if (!message.trim()) return;
    await axiosInstance.post('/admin/showdown/feed', { message: message.trim() });
    setMessage('');
    await load();
  };

  const del = async (id) => {
    await axiosInstance.delete(`/admin/showdown/feed/${id}`);
    await load();
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Event feed</Typography>
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            fullWidth
            label="Broadcast message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={post} sx={{ minWidth: 120 }}>
            Post
          </Button>
        </Stack>
      </Paper>
      <Stack spacing={1}>
        {items.map((it) => (
          <Paper key={it._id} variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <div>
                <Typography variant="caption" color="text.secondary">
                  {it.createdAt ? new Date(it.createdAt).toLocaleString() : ''} · {it.source}
                </Typography>
                <Typography variant="body2">{it.message}</Typography>
              </div>
              <IconButton size="small" onClick={() => del(it._id)} aria-label="delete">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Stack>
  );
}
