import axiosInstance from '../utils/axios';

export async function listAdminTrucks(params = {}) {
  const { data } = await axiosInstance.get('/trucks/admin/list', { params });
  return data;
}

export async function createAdminTruck(body) {
  const { data } = await axiosInstance.post('/trucks/admin', body);
  return data;
}

export async function updateAdminTruck(itemId, body) {
  const { data } = await axiosInstance.patch(`/trucks/admin/${encodeURIComponent(itemId)}`, body);
  return data;
}

export async function deleteAdminTruck(itemId) {
  const { data } = await axiosInstance.delete(`/trucks/admin/${encodeURIComponent(itemId)}`);
  return data;
}
