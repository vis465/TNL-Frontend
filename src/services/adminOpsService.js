import axiosInstance from '../utils/axios';

const ADMIN_OPS_BASE = '/admin';

export async function getTokenPreview(jobID) {
  const { data } = await axiosInstance.get(`/admin/job-tools/token-preview/${encodeURIComponent(jobID)}`);
  return data;
}

export async function inspectRider(params) {
  const { data } = await axiosInstance.get(`${ADMIN_OPS_BASE}/riders/inspect`, { params });
  return data;
}

export async function getRiderWalletTransactions(riderId, params = {}) {
  const { data } = await axiosInstance.get(`${ADMIN_OPS_BASE}/riders/${riderId}/wallet/transactions`, { params });
  return data;
}

export async function getCacheStatus() {
  const { data } = await axiosInstance.get(`${ADMIN_OPS_BASE}/cache/status`);
  return data;
}

export async function invalidateCache(body) {
  const { data } = await axiosInstance.post(`${ADMIN_OPS_BASE}/cache/invalidate`, body);
  return data;
}

export async function invalidateAttendanceCache(divisionId) {
  const { data } = await axiosInstance.post(`${ADMIN_OPS_BASE}/cache/invalidate-attendance`, { divisionId });
  return data;
}

export async function searchLedger(params = {}) {
  const { data } = await axiosInstance.get(`${ADMIN_OPS_BASE}/ledger/search`, { params });
  return data;
}
