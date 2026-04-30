import React, { useMemo, useState } from 'react';

/** Spotlight follows cursor; glow uses CSS variable --brand for rgb(255,255,0) theme */
export default function MagicCard({ children, className = '', style }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const glow = useMemo(
    () =>
      `radial-gradient(340px circle at ${pos.x}% ${pos.y}%, rgba(255,255,0,0.22), rgba(255,204,0,0.1) 40%, transparent 72%)`,
    [pos]
  );

  return (
    <div
      className={className}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPos({ x, y });
      }}
      style={{
        position: 'relative',
        borderRadius: 16,
        border: '1px solid rgba(255,255,0,0.22)',
        overflow: 'hidden',
        background: 'rgba(10,10,10,0.75)',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: glow,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
