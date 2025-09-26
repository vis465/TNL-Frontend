import axiosInstance from '../utils/axios';



export async function getMyWallet() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/wallet/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load wallet');
  return await res.json();
}

export async function purchase(amount, title, metadata, idempotencyKey) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/wallet/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ amount, title, metadata, idempotencyKey })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || 'Purchase failed');
  return data;
}


