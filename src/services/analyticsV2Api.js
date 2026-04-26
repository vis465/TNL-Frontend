import axiosInstance from '../utils/axios';

export async function fetchV2Overview() {
  const { data } = await axiosInstance.get('/analytics/v2/overview');
  return data;
}

export async function fetchV2Operations() {
  const { data } = await axiosInstance.get('/analytics/v2/operations');
  return data;
}

export async function fetchV2Growth() {
  const { data } = await axiosInstance.get('/analytics/v2/growth');
  return data;
}

export async function fetchV2Fleet() {
  const { data } = await axiosInstance.get('/analytics/v2/fleet');
  return data;
}

export async function fetchV2Financial() {
  const { data } = await axiosInstance.get('/analytics/v2/financial');
  return data;
}
