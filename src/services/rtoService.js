import axiosInstance from '../utils/axios';

// Admin
export async function fetchAdminOffences() {
  const { data } = await axiosInstance.get('/admin/rto/offences');
  return data.items || [];
}

export async function createOffence(payload) {
  const { data } = await axiosInstance.post('/admin/rto/offences', payload);
  return data;
}

export async function updateOffence(id, payload) {
  const { data } = await axiosInstance.patch(`/admin/rto/offences/${id}`, payload);
  return data;
}

export async function deactivateOffence(id) {
  const { data } = await axiosInstance.delete(`/admin/rto/offences/${id}`);
  return data;
}

export async function fetchAdminChallans(params = {}) {
  const { data } = await axiosInstance.get('/admin/rto/challans', { params });
  return data.items || [];
}

export async function waiveChallan(id, reason) {
  const { data } = await axiosInstance.patch(`/admin/rto/challans/${id}/waive`, { reason });
  return data;
}

export async function cancelChallan(id, reason) {
  const { data } = await axiosInstance.patch(`/admin/rto/challans/${id}/cancel`, { reason });
  return data;
}

export async function reviewAppeal(id, decision, note) {
  const { data } = await axiosInstance.patch(`/admin/rto/challans/${id}/appeal`, { decision, note });
  return data;
}

export async function fetchRtoSettings() {
  const { data } = await axiosInstance.get('/admin/rto/settings');
  return data;
}

export async function updateRtoSettings(payload) {
  const { data } = await axiosInstance.patch('/admin/rto/settings', payload);
  return data;
}

export function exportChallansCsv(params = {}) {
  return axiosInstance.get('/admin/rto/challans/export', { params, responseType: 'blob' });
}

// RTO officer
export async function fetchActiveOffences() {
  const { data } = await axiosInstance.get('/rto/offences/active');
  return data.items || [];
}

export async function searchRiders(q) {
  const { data } = await axiosInstance.get('/rto/riders/search', { params: { q } });
  return data.items || [];
}

export async function fetchIssuedChallans(params = {}) {
  const { data } = await axiosInstance.get('/rto/challans', { params });
  return data.items || [];
}

export async function issueChallan(payload) {
  const { data } = await axiosInstance.post('/rto/challans', payload);
  return data;
}

// Rider
export async function fetchMyChallans() {
  const { data } = await axiosInstance.get('/me/rto/challans');
  return data;
}

export async function payMyChallan(id) {
  const { data } = await axiosInstance.post(`/me/rto/challans/${id}/pay`);
  return data;
}

export async function payAllMyChallans() {
  const { data } = await axiosInstance.post('/me/rto/challans/pay-all');
  return data;
}

export async function submitChallanAppeal(id, reason) {
  const { data } = await axiosInstance.post(`/me/rto/challans/${id}/appeal`, { reason });
  return data;
}

// Division
export async function fetchDivisionRtoChallans(divisionId) {
  const { data } = await axiosInstance.get(`/divisions/${divisionId}/rto/challans`);
  return data;
}

export async function payDivisionChallans(divisionId, challanIds, { amount, riderId } = {}) {
  const { data } = await axiosInstance.post(`/divisions/${divisionId}/rto/challans/pay`, {
    challanIds,
    amount,
    riderId,
  });
  return data;
}

export async function payDivisionRiderChallans(divisionId, riderId, { amount, challanIds } = {}) {
  const { data } = await axiosInstance.post(`/divisions/${divisionId}/rto/riders/${riderId}/pay`, {
    amount,
    challanIds,
  });
  return data;
}

export async function payAllDivisionChallans(divisionId) {
  const { data } = await axiosInstance.post(`/divisions/${divisionId}/rto/challans/pay-all`);
  return data;
}
