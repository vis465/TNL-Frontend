import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ShowdownLayout from '../../../components/showdown/ShowdownLayout';

const linkSx = ({ isActive }) => ({
  fontWeight: isActive ? 700 : 500,
  color: isActive ? 'primary.main' : 'text.secondary',
});

export default function ShowdownAdminLayout() {
  return (
    <ShowdownLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Typography variant="h4">Showdown</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button component={NavLink} to="/admin/showdown" end sx={linkSx}>
              Dashboard
            </Button>
            <Button component={NavLink} to="/admin/showdown/cities" sx={linkSx}>
              City modifiers
            </Button>
            <Button component={NavLink} to="/admin/showdown/routes" sx={linkSx}>
              Route modifiers
            </Button>
            <Button component={NavLink} to="/admin/showdown/feed" sx={linkSx}>
              Feed
            </Button>
            <Button href="/showdown" target="_blank" rel="noreferrer" size="small" variant="outlined">
              Public hub
            </Button>
          </Stack>
        </Stack>
        <Outlet />
      </Container>
    </ShowdownLayout>
  );
}
