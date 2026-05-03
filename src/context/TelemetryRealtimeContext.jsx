import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const TelemetryRealtimeContext = createContext(null);

const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

export function getTelemetryWebSocketUrl() {
  const explicit = process.env.REACT_APP_TELEMETRY_WS_URL;
  if (explicit) return explicit;
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/telemetry`;
}

/**
 * Single shared WebSocket for all /telemetry/* pages (proxied to backend in dev).
 */
export function TelemetryRealtimeProvider({ children }) {
  const [dashboardConnected, setDashboardConnected] = useState(false);
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const handlersRef = useRef(new Set());
  const wsRef = useRef(null);
  const attemptRef = useRef(0);
  const timerRef = useRef(null);
  const devWsErrorLoggedRef = useRef(false);

  const subscribe = useCallback((handler) => {
    handlersRef.current.add(handler);
    return () => handlersRef.current.delete(handler);
  }, []);

  useEffect(() => {
    let stopped = false;

    const connect = () => {
      if (stopped) return;
      const url = getTelemetryWebSocketUrl();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        attemptRef.current = 0;
        setReconnectAttempt(0);
        setDashboardConnected(true);
      };

      ws.onclose = () => {
        setDashboardConnected(false);
        wsRef.current = null;
        if (stopped) return;
        attemptRef.current += 1;
        setReconnectAttempt(attemptRef.current);
        const delay = Math.min(
          RECONNECT_MAX_MS,
          RECONNECT_BASE_MS * 2 ** Math.min(attemptRef.current - 1, 8)
        );
        timerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        if (process.env.NODE_ENV === 'development' && !devWsErrorLoggedRef.current) {
          devWsErrorLoggedRef.current = true;
          console.warn(
            '[Telemetry WS] If status stays offline: run backend on :5000, restart `npm start` (setupProxy), or set REACT_APP_TELEMETRY_WS_URL=ws://127.0.0.1:5000/ws/telemetry'
          );
        }
      };

      ws.onmessage = (event) => {
        let msg;
        try {
          msg = JSON.parse(event.data);
        } catch {
          return;
        }
        setLastMessageAt(new Date());
        handlersRef.current.forEach((fn) => {
          try {
            fn(msg);
          } catch (e) {
            console.error('[Telemetry WS] handler error:', e);
          }
        });
      };
    };

    connect();

    return () => {
      stopped = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      dashboardConnected,
      lastMessageAt,
      reconnectAttempt,
      subscribe,
    }),
    [dashboardConnected, lastMessageAt, reconnectAttempt, subscribe]
  );

  return (
    <TelemetryRealtimeContext.Provider value={value}>
      {children}
    </TelemetryRealtimeContext.Provider>
  );
}

export function useTelemetryRealtime() {
  const ctx = useContext(TelemetryRealtimeContext);
  if (!ctx) {
    throw new Error('useTelemetryRealtime must be used within TelemetryRealtimeProvider');
  }
  return ctx;
}

export function useTelemetryRealtimeOptional() {
  return useContext(TelemetryRealtimeContext);
}
