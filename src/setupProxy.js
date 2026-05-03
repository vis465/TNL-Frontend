/**
 * CRA dev server does not proxy WebSocket upgrades via package.json "proxy".
 * Telemetry UI connects to ws://localhost:3000/ws/telemetry → forward to backend.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

const BACKEND = process.env.REACT_APP_DEV_PROXY_TARGET || 'http://127.0.0.1:5000';

module.exports = function proxy(app) {
  app.use(
    '/ws/telemetry',
    createProxyMiddleware({
      target: BACKEND,
      changeOrigin: true,
      ws: true,
      logLevel: 'silent',
    })
  );
};
