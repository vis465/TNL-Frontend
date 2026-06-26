export const ATTENDANCE_ENTRY_STATUS = {
  pending: { label: 'Awaiting HR review', color: 'warning', description: 'You checked in — waiting for HR approval before it counts toward your division.' },
  approved: { label: 'Approved', color: 'success', description: 'Counted toward your streak, division leaderboard, and attendance stats.' },
  rejected: { label: 'Not counted', color: 'error', description: 'This check-in was rejected and does not count.' },
};

export const EVENT_STATUS = {
  open: { label: 'Active', color: 'success' },
  closed: { label: 'Closed', color: 'default' },
  cancelled: { label: 'Cancelled', color: 'error' },
};

export function getMyAttendanceEntry(event, riderId) {
  if (!event?.attendanceEntries?.length) return null;

  if (riderId != null) {
    const id = String(riderId);
    const match = event.attendanceEntries.find((entry) => {
      const entryRiderId = entry?.riderId?._id ?? entry?.riderId;
      return entryRiderId != null && String(entryRiderId) === id;
    });
    if (match) return match;
  }

  if (event.attendanceEntries.length === 1) {
    return event.attendanceEntries[0];
  }

  return null;
}

export function getEntryStatusMeta(status) {
  if (!status) return null;
  return ATTENDANCE_ENTRY_STATUS[status] || { label: status, color: 'default', description: '' };
}

export function getEventStatusMeta(status) {
  if (!status) return { label: 'Unknown', color: 'default' };
  return EVENT_STATUS[status] || { label: status, color: 'default' };
}

export function describeMarkingAvailability(event) {
  const entry = getMyAttendanceEntry(event);
  if (entry) {
    const meta = getEntryStatusMeta(entry.status);
    return meta?.description || 'You already submitted attendance for this event.';
  }
  if (event?.status === 'cancelled') return 'This event was cancelled.';
  if (!event?.isAttendanceOpen) return 'The check-in window is closed.';
  if (event?.status !== 'open') return 'This event is no longer accepting check-ins.';
  return 'You can submit attendance for this event. It will count toward your division after HR approval.';
}
