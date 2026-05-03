/**
 * Telemetry REST lives under REACT_APP_API_URL (e.g. https://api.../api/telemetry/…).
 * Avoids fetch('/api/telemetry/…') resolving to the SPA host in production.
 */

import API_CONFIG, { getAuthHeader } from '../config/api';

function telemetryUrl(subPath) {
  const base = String(API_CONFIG.baseURL || '').replace(/\/$/, '');
  const clean = String(subPath || '').replace(/^\//, '');
  return `${base}/telemetry/${clean}`;
}

/**
 * @param {string} subPath path after /telemetry/, e.g. 'status', 'drivers', 'drivers/:id'
 * @returns {Promise<any>} Parsed JSON body
 */
export async function getTelemetryJson(subPath) {
  const res = await fetch(telemetryUrl(subPath), {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const snippet = text.slice(0, 120).replace(/\s+/g, ' ');
    throw new Error(
      `Telemetry API returned non-JSON (${res.status}). ${snippet} — check REACT_APP_API_URL matches your backend.`
    );
  }

  if (!res.ok) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }

  return data;
}
