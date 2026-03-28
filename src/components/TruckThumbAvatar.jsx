import React from 'react';
import Avatar from '@mui/material/Avatar';
import FireTruckOutlinedIcon from '@mui/icons-material/FireTruckOutlined';

/**
 * Rounded truck preview: image URL(s) with FireTruck fallback (same pattern as truck marketplace cards).
 */
export default function TruckThumbAvatar({
  image,
  bannerImage,
  brandLogo,
  sx = {}
}) {
  const src = [image, bannerImage, brandLogo].find(Boolean) || undefined;
  return (
    <Avatar
      variant="rounded"
      src={src}
      alt=""
      sx={{
        width: 72,
        height: 56,
        flexShrink: 0,
        bgcolor: 'action.hover',
        '& img': { objectFit: 'contain' },
        ...sx
      }}
    >
      <FireTruckOutlinedIcon sx={{ fontSize: 28 }} />
    </Avatar>
  );
}
