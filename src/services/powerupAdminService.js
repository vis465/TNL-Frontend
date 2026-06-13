import axiosInstance from '../utils/axios';

export async function listPowerupConfigs() {
  const { data } = await axiosInstance.get('/powerups/admin/configs');
  return data?.configs || [];
}

export async function createPowerupConfig(payload) {
  const { data } = await axiosInstance.post('/powerups/admin/configs', payload);
  return data;
}

export async function updatePowerupConfig(id, payload) {
  const { data } = await axiosInstance.put(`/powerups/admin/configs/${id}`, payload);
  return data;
}

export async function deletePowerupConfig(id) {
  const { data } = await axiosInstance.delete(`/powerups/admin/configs/${id}`);
  return data;
}

export async function grantPowerup(payload) {
  const { data } = await axiosInstance.post('/powerups/admin/grant', payload);
  return data;
}
