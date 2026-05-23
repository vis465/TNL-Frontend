export function formatGoalValue(key, value) {
  const n = Number(value) || 0;
  if (key === 'revenue') return n.toLocaleString();
  if (key === 'distanceKm') return `${n.toLocaleString()} km`;
  return n.toLocaleString();
}

export function goalProgressColor(percent, complete) {
  if (complete) return 'success';
  if (percent >= 75) return 'info';
  if (percent >= 40) return 'warning';
  return 'primary';
}
