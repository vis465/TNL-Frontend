import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import LocalAtmOutlined from '@mui/icons-material/LocalAtmOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import axiosInstance from '../utils/axios';

/**
 * Landing-page carousel that highlights active community divisions. Renders as
 * a single full-bleed rectangular slide with the division's banner as the
 * background, a bottom fade, and the logo + name aligned to the right.
 */
export default function DivisionsCarousel() {
  const [divisions, setDivisions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const autoplayRef = useRef(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [listRes, lbRes] = await Promise.all([
          axiosInstance.get('/divisions/public/list'),
          axiosInstance
            .get('/divisions/leaderboard/global', { params: { limit: 50 } })
            .catch(() => ({ data: { divisions: [] } })),
        ]);
        if (cancelled) return;
        setDivisions(listRes.data?.divisions || []);
        setLeaderboard(lbRes.data?.divisions || []);
      } catch (_e) {
        // Non-critical on the landing page
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statsByDivisionId = useMemo(() => {
    const map = new Map();
    (leaderboard || []).forEach((row) => {
      if (row.divisionId) map.set(String(row.divisionId), row);
    });
    return map;
  }, [leaderboard]);

  const items = divisions;
  const count = items.length;

  const goTo = useCallback(
    (next) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (count <= 1) return undefined;
    const start = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        if (!hoverRef.current) setIndex((i) => (i + 1) % count);
      }, 6500);
    };
    start();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [count]);

  if (loading) return null;
  if (!count) return null;

  return (
    <Box
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
      sx={{
        position: 'relative',
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        height: { xs: 320, sm: 380, md: 440, lg: 500 },
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {items.map((d, i) => {
        const stats = statsByDivisionId.get(String(d._id));
        const active = i === index;
        return (
          <Box
            key={d._id}
            component={RouterLink}
            to={`/divisions/${d.slug}`}
            aria-hidden={!active}
            tabIndex={active ? 0 : -1}
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: active ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              pointerEvents: active ? 'auto' : 'none',
              textDecoration: 'none',
              color: 'common.white',
              display: 'block',
              backgroundImage: d.bannerUrl ? `url(${d.bannerUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              background: d.bannerUrl
                ? undefined
                : (t) =>
                    `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})`,
            }}
          >
            {/* Ken-burns style slow zoom on the active slide */}
            {d.bannerUrl && (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${d.bannerUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 8s ease-out',
                }}
              />
            )}

            {/* Bottom + right fade for legibility */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.75) 100%), linear-gradient(270deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.0) 55%)',
              }}
            />

            {/* Right-aligned logo + name block */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                px: { xs: 3, sm: 6, md: 10 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'flex-start', sm: 'flex-start' },
                justifyContent: 'flex-end',
                pb: { xs: 3, sm: 5, md: 7 },
                textAlign: { xs: 'left', sm: 'right' },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: 'warning.light',
                  letterSpacing: 3,
                  fontWeight: 700,
                  mb: 1,
                  textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}
              >
                COMMUNITY DIVISION
              </Typography>
              <Stack
                direction={{ xs: 'row', sm: 'row' }}
                spacing={2}
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Avatar
                  src={d.logoUrl || undefined}
                  sx={{
                    width: { xs: 56, sm: 72, md: 88 },
                    height: { xs: 56, sm: 72, md: 88 },
                    border: '3px solid rgba(255,255,255,0.85)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
                    fontSize: { xs: 22, md: 32 },
                  }}
                >
                  {d.name?.[0]}
                </Avatar>
                <Box>
                  <Typography
                    variant="h3"
                    fontWeight={800}
                    sx={{
                      lineHeight: 1,
                      textShadow: '0 3px 12px rgba(0,0,0,0.7)',
                      fontSize: { xs: '1.85rem', sm: '2.4rem', md: '3rem' },
                    }}
                  >
                    {d.name}
                  </Typography>
                  
                </Box>
              </Stack>

              {d.description && (
                <Typography
                  variant="body1"
                  sx={{
                    maxWidth: 520,
                    opacity: 0.95,
                    mb: 2,
                    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {d.description}
                </Typography>
              )}

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
              >
                <Chip
                  size="small"
                  icon={<GroupsOutlined sx={{ fontSize: 16 }} />}
                  label={`${d.memberCount ?? 0} members`}
                  sx={{
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'common.white',
                    backdropFilter: 'blur(6px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                />
                {stats && (
                  <>
                    <Chip
                      size="small"
                      icon={<LocalAtmOutlined sx={{ fontSize: 16 }} />}
                      label={`${Math.round(stats.totalRevenue || 0).toLocaleString()} revenue`}
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'common.white',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.25)',
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<EmojiEventsOutlined sx={{ fontSize: 16 }} />}
                      label={`${stats.totalJobs || 0} jobs`}
                      sx={{
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'common.white',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.25)',
                      }}
                    />
                  </>
                )}
              </Stack>
            </Box>
          </Box>
        );
      })}

      {/* Prev / Next controls */}
      {count > 1 && (
        <>
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              prev();
            }}
            aria-label="Previous division"
            sx={{
              position: 'absolute',
              top: '50%',
              left: { xs: 8, md: 24 },
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.45)',
              color: 'common.white',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
              zIndex: 2,
            }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={(e) => {
              e.preventDefault();
              next();
            }}
            aria-label="Next division"
            sx={{
              position: 'absolute',
              top: '50%',
              right: { xs: 8, md: 24 },
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(0,0,0,0.45)',
              color: 'common.white',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
              zIndex: 2,
            }}
          >
            <ChevronRight />
          </IconButton>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
            }}
          >
            {items.map((d, i) => (
              <Box
                key={d._id}
                role="button"
                tabIndex={0}
                aria-label={`Go to slide ${i + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  goTo(i);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goTo(i);
                  }
                }}
                sx={{
                  width: i === index ? 28 : 10,
                  height: 6,
                  borderRadius: 3,
                  bgcolor:
                    i === index ? 'warning.main' : 'rgba(255,255,255,0.55)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'common.white' },
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
