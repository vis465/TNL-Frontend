import axiosInstance from '../utils/axios';

export async function getBankBalance() {
  const { data } = await axiosInstance.get('/bank/balance');
  return data;
}

export async function getBankTransactions(page = 1, limit = 20) {
  const { data } = await axiosInstance.get(`/bank/transactions?page=${page}&limit=${limit}`);
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


