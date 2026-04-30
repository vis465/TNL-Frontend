import React, { useEffect, useRef } from 'react';
import { animate, useInView, useMotionValue } from 'framer-motion';

export default function NumberTicker({
  value,
  startValue = 0,
  duration = 1.2,
  formatter = (v) => Math.round(v).toLocaleString(),
  style,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const mv = useMotionValue(startValue);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(mv, Number(value) || 0, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = formatter(latest);
      },
    });
    return () => controls.stop();
  }, [inView, mv, value, duration, formatter]);

  return (
    <span ref={ref} style={style}>
      {formatter(startValue)}
    </span>
  );
}
