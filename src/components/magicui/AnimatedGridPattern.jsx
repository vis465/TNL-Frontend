import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedGridPattern({
  className = '',
  size = 32,
  lineColor = 'rgba(148,163,184,0.22)',
  glowColor = 'rgba(56,189,248,0.25)',
  squares = 18,
}) {
  const [ticks, setTicks] = useState(Array.from({ length: squares }, (_, i) => i));

  useEffect(() => {
    const id = setInterval(() => {
      setTicks((prev) => [...prev.slice(1), prev[0] + squares]);
    }, 1200);
    return () => clearInterval(id);
  }, [squares]);

  const cells = useMemo(
    () =>
      ticks.map((t) => ({
        id: t,
        x: ((t * 37) % 100),
        y: ((t * 53) % 100),
      })),
    [ticks]
  );

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        backgroundImage: `
          linear-gradient(to right, ${lineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    >
      {cells.map((cell) => (
        <motion.div
          key={cell.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 1.1, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: size - 2,
            height: size - 2,
            left: `${cell.x}%`,
            top: `${cell.y}%`,
            transform: 'translate(-50%, -50%)',
            borderRadius: 6,
            background: glowColor,
          }}
        />
      ))}
    </div>
  );
}
