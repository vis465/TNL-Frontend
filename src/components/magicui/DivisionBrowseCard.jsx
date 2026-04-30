import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import { motion, useReducedMotion } from 'framer-motion';

export default function DivisionBrowseCard({ division, stats, compact = false }) {
  const reduced = useReducedMotion();
  const MotionCard = reduced ? Card : motion(Card);
  const cardProps = reduced ? {} : { whileHover: { y: -5, scale: 1.01 }, transition: { duration: 0.2 } };

  return (
    <MotionCard variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} {...cardProps}>
      <CardActionArea component={RouterLink} to={`/divisions/${division.slug}`} sx={{ height: '100%' }}>
        <Box sx={{ width: '100%', aspectRatio: '1920 / 500', bgcolor: 'common.black', position: 'relative', overflow: 'hidden' }}>
          {division.bannerUrl ? (
            <Box component="img" src={division.bannerUrl} alt={`${division.name} banner`} sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          ) : (
            <Box sx={{ width: '100%', height: '100%', background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})` }} />
          )}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))' }} />
        </Box>

        <CardContent sx={{ pt: compact ? 2 : 3, position: 'relative' }}>
          <Avatar
            src={division.logoUrl || undefined}
            sx={{ width: compact ? 46 : 56, height: compact ? 46 : 56, border: '3px solid', borderColor: 'background.paper', mt: compact ? -6 : -7, boxShadow: 2 }}
          >
            {division.name?.[0]}
          </Avatar>
          <Typography variant={compact ? 'subtitle1' : 'h6'} fontWeight={700} sx={{ mt: 1 }}>
            {division.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">/{division.slug}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: compact ? 32 : 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {division.description || 'A division in our community.'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            <Chip size="small" icon={<GroupsOutlined sx={{ fontSize: 16 }} />} label={`${division.memberCount ?? 0}`} />
            {stats ? <Chip size="small" label={`${stats.totalJobs || 0} jobs`} variant="outlined" /> : null}
            <Chip size="small" label={`Tax ${division.taxPercent ?? 0}%`} variant="outlined" />
          </Stack>
        </CardContent>
      </CardActionArea>
    </MotionCard>
  );
}
