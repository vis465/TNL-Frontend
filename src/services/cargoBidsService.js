import axiosInstance from '../utils/axios';

export async function getActiveSession() {
  const { data } = await axiosInstance.get('/cargo-bids/sessions/active');
  return data;
}

export async function getSession(id) {
  const { data } = await axiosInstance.get(`/cargo-bids/sessions/${id}`);
  return data;
}

export async function getLot(lotId) {
  const { data } = await axiosInstance.get(`/cargo-bids/lots/${lotId}`);
  return data;
}

export async function placeBid(lotId, amountTokens) {
  const { data } = await axiosInstance.post(`/cargo-bids/lots/${lotId}/bids`, { amountTokens });
  return data;
}

export async function getMyBids() {
  const { data } = await axiosInstance.get('/cargo-bids/me/bids');
  return data;
}

export async function getMyAwards() {
  const { data } = await axiosInstance.get('/cargo-bids/me/awards');
  return data;
}

export async function getMySummary() {
  const { data } = await axiosInstance.get('/cargo-bids/me/summary');
  return data;
}

// Admin
export async function adminGetConfig() {
  const { data } = await axiosInstance.get('/admin/cargo-bids/config');
  return data;
}

export async function adminPatchConfig(body) {
  const { data } = await axiosInstance.patch('/admin/cargo-bids/config', body);
  return data;
}

export async function adminListSessions(params) {
  const { data } = await axiosInstance.get('/admin/cargo-bids/sessions', { params });
  return data;
}

export async function adminGetSession(id) {
  const { data } = await axiosInstance.get(`/admin/cargo-bids/sessions/${id}`);
  return data;
}

export async function adminCreateSession(body) {
  const { data } = await axiosInstance.post('/admin/cargo-bids/sessions', body);
  return data;
}

export async function adminUpdateSession(id, body) {
  const { data } = await axiosInstance.patch(`/admin/cargo-bids/sessions/${id}`, body);
  return data;
}

export async function adminAddLot(sessionId, body) {
  const { data } = await axiosInstance.post(`/admin/cargo-bids/sessions/${sessionId}/lots`, body);
  return data;
}

export async function adminUpdateLot(lotId, body) {
  const { data } = await axiosInstance.patch(`/admin/cargo-bids/lots/${lotId}`, body);
  return data;
}

export async function adminDeleteLot(lotId) {
  const { data } = await axiosInstance.delete(`/admin/cargo-bids/lots/${lotId}`);
  return data;
}

export async function adminPublishSession(id, body) {
  const { data } = await axiosInstance.post(`/admin/cargo-bids/sessions/${id}/publish`, body || {});
  return data;
}

export async function adminCloseSession(id) {
  const { data } = await axiosInstance.post(`/admin/cargo-bids/sessions/${id}/close`);
  return data;
}

export async function adminSessionAnalytics(id) {
  const { data } = await axiosInstance.get(`/admin/cargo-bids/sessions/${id}/analytics`);
  return data;
}

export async function adminOverview() {
  const { data } = await axiosInstance.get('/admin/cargo-bids/overview');
  return data;
}

export async function adminSuggestBasePrice(cargoId, cargoName) {
  const { data } = await axiosInstance.get('/admin/cargo-bids/suggest-base-price', {
    params: { cargoId, cargoName },
  });
  return data;
}

export async function adminCargoCatalog(params) {
  const { data } = await axiosInstance.get('/admin/cargo-rates/cargo-catalog', { params });
  return data;
}
