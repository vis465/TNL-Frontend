import axiosInstance from '../utils/axios';

export async function getBankBalance() {
  const { data } = await axiosInstance.get('/bank/balance');
  return data;
}

export async function getBankTransactions(page = 1, limit = 20) {
  const { data } = await axiosInstance.get('/bank/transactions', { params: { page, limit } });
  return data;
}

/** List divisions for bank ops (id, name, slug, walletBalance, …) */
export async function getBankDivisions(q) {
  const { data } = await axiosInstance.get('/bank/divisions', { params: q ? { q } : {} });
  return data;
}

/** Move funds from central bank → division wallet */
export async function bankCreditDivision(divisionId, payload) {
  const { data } = await axiosInstance.post(`/bank/division/${divisionId}/credit`, payload);
  return data;
}

/** Move funds from division wallet → central bank */
export async function bankDebitDivision(divisionId, payload) {
  const { data } = await axiosInstance.post(`/bank/division/${divisionId}/debit`, payload);
  return data;
}

export async function getDivisionWalletTransactions(divisionId, page = 1, limit = 20) {
  const { data } = await axiosInstance.get(`/bank/division/${divisionId}/transactions`, {
    params: { page, limit },
  });
  return data;
}

export async function bankBonus(amount, riderIds, reason, idempotencyKey) {
  const { data } = await axiosInstance.post('/bank/bonus', { amount, riderIds, reason, idempotencyKey });
  return data;
}

export async function searchRiders(q, limit = 10) {
  const { data } = await axiosInstance.get('/riders/search/q', { params: { q, limit } });
  return data?.items || [];
}

export async function bankDeduct(amount, riderIds, reason, idempotencyKey) {
  const { data } = await axiosInstance.post('/bank/deduct', { amount, riderIds, reason, idempotencyKey });
  return data;
}


