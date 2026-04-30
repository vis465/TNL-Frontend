import React, { createContext, useContext, useMemo, useState } from 'react';
import { Box, Drawer, IconButton } from '@mui/material';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';

const SidebarContext = createContext(null);

export function SidebarProvider({
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  openMobile: controlledOpenMobile,
  onOpenMobileChange,
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalOpenMobile, setInternalOpenMobile] = useState(false);

  const open = typeof controlledOpen === 'boolean' ? controlledOpen : internalOpen;
  const setOpen = (next) => {
    if (typeof controlledOpen === 'boolean') onOpenChange?.(next);
    else setInternalOpen(next);
  };

  const openMobile = typeof controlledOpenMobile === 'boolean' ? controlledOpenMobile : internalOpenMobile;
  const setOpenMobile = (next) => {
    if (typeof controlledOpenMobile === 'boolean') onOpenMobileChange?.(next);
    else setInternalOpenMobile(next);
  };

  const value = useMemo(
    () => ({
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      toggleSidebar: () => setOpen(!open),
      state: open ? 'expanded' : 'collapsed',
    }),
    [open, openMobile]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

export function Sidebar({
  children,
  collapsible = 'icon',
  widthExpanded = 288,
  widthCollapsed = 72,
  mobileWidth = 320,
  sx,
}) {
  const { open, openMobile, setOpenMobile } = useSidebar();
  const width = collapsible === 'icon' ? (open ? widthExpanded : widthCollapsed) : widthExpanded;

  return (
    <>
      <Box
        component="aside"
        data-sidebar="sidebar"
        sx={{
          display: { xs: 'none', md: 'flex' },
          width,
          flexShrink: 0,
          flexDirection: 'column',
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          transition: (t) => t.transitions.create('width', { duration: t.transitions.duration.short }),
          ...sx,
        }}
      >
        {children}
      </Box>
      <Drawer
        anchor="left"
        open={openMobile}
        onClose={() => setOpenMobile(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: mobileWidth,
            maxWidth: '100vw',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {children}
      </Drawer>
    </>
  );
}

export function SidebarHeader({ children }) {
  return <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>{children}</Box>;
}

export function SidebarContent({ children }) {
  return <Box sx={{ flex: 1, overflow: 'auto' }}>{children}</Box>;
}

export function SidebarFooter({ children }) {
  return <Box sx={{ mt: 'auto', borderTop: 1, borderColor: 'divider' }}>{children}</Box>;
}

export function SidebarGroup({ children, sx }) {
  return <Box sx={sx}>{children}</Box>;
}

export function SidebarGroupLabel({ children }) {
  return <Box sx={{ px: 2, py: 1.25, fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em' }}>{children}</Box>;
}

export function SidebarMenu({ children }) {
  return <Box sx={{ px: 1, py: 0.25 }}>{children}</Box>;
}

export function SidebarMenuItem({ children }) {
  return <Box>{children}</Box>;
}

export function SidebarInset({ children }) {
  return <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>;
}

export function SidebarRail() {
  return null;
}

export function SidebarTrigger(props) {
  const { toggleSidebar } = useSidebar();
  return (
    <IconButton onClick={toggleSidebar} size="small" {...props}>
      <MenuOpenIcon fontSize="small" />
    </IconButton>
  );
}
