import { useCallback, useState } from 'react';
import AdminFeedback from './AdminFeedback';

export function useAdminFeedback() {
  const [feedback, setFeedback] = useState(null);

  const showSuccess = useCallback((message) => {
    setFeedback({ severity: 'success', message });
  }, []);

  const showError = useCallback((message) => {
    setFeedback({ severity: 'error', message });
  }, []);

  const showInfo = useCallback((message) => {
    setFeedback({ severity: 'info', message });
  }, []);

  const clear = useCallback(() => {
    setFeedback(null);
  }, []);

  const Feedback = useCallback(
    () => (
      <AdminFeedback
        open={Boolean(feedback?.message)}
        message={feedback?.message}
        severity={feedback?.severity || 'info'}
        onClose={clear}
      />
    ),
    [feedback, clear],
  );

  return { showSuccess, showError, showInfo, clear, feedback, Feedback };
}
