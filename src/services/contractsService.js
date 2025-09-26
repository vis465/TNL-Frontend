import axiosInstance from '../utils/axios';

export async function listTemplates() {
  const { data } = await axiosInstance.get('/contracts/templates');
  return data;
}

export async function buyContract(templateId) {
  const { data } = await axiosInstance.post(`/contracts/buy/${templateId}`);
  return data;
}

export async function myContracts() {
  const { data } = await axiosInstance.get('/contracts/me');
  return data;
}

// Admin CRUD
export async function createTemplate(payload) {
  const { data } = await axiosInstance.post('/contracts/templates', payload);
  return data;
}

export async function updateTemplate(id, payload) {
  const { data } = await axiosInstance.put(`/contracts/templates/${id}`, payload);
  return data;
}

export async function deleteTemplate(id) {
  const { data } = await axiosInstance.delete(`/contracts/templates/${id}`);
  return data;
}

