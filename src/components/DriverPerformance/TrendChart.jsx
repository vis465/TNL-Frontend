import React from 'react';

export default function TrendChart({ data = [], height = 40, width = 280 }) {
  if (!data.length) {
    return (
      <BoxPlaceholder height={height}>No trend data yet</BoxPlaceholder>
    );
  }

  const w = width;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max === min ? 1 : max - min;
  const points = data.map((v, i) => {
    const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill="url(#trendFill)" points={fillPoints} />
      <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={points} strokeLinejoin="round" />
    </svg>
  );
}

function BoxPlaceholder({ height, children }) {
  return (
    <div style={{
      height,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#94a3b8',
      fontSize: 12,
      borderRadius: 8,
      background: 'rgba(148,163,184,0.08)',
    }}
    >
      {children}
    </div>
  );
}
