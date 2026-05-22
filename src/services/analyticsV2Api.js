import axiosInstance from '../utils/axios';

export async function fetchV2Summary(days = 30) {
  const { data } = await axiosInstance.get('/analytics/v2/summary', { params: { days } });
  return data;
}

export async function fetchV2Overview(days = 30) {
  const { data } = await axiosInstance.get('/analytics/v2/overview', { params: { days } });
  return data;
}

export async function fetchV2Operations(days = 30) {
  const { data } = await axiosInstance.get('/analytics/v2/operations', { params: { days } });
  return data;
}

export async function fetchV2Growth(days = 30) {
  const { data } = await axiosInstance.get('/analytics/v2/growth', { params: { days } });
  return data;
}

export async function fetchV2Fleet(days = 30) {
  const { data } = await axiosInstance.get('/analytics/v2/fleet', { params: { days } });
  return data;
}

export async function fetchV2Financial(days = 30) {
  const { data } = await axiosInstance.get('/analytics/v2/financial', { params: { days } });
  return data;
}
