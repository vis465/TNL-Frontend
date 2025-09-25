import api from '../utils/axios';

const ridersService = {
  list: async () => {
    const { data } = await api.get('/riders');
    return data;
  },
  get: async (id) => {
    const { data } = await api.get(`/riders/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post('/riders', payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/riders/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/riders/${id}`);
    return data;
  },
  syncVtc: async (vtcId) => {
    const { data } = await api.post(`/riders/sync/vtc/${vtcId}`);
    return data;
  },
  register: async (payload) => {
    const { data } = await api.post('/riders/register', payload);
    return data;
  }
};

export default ridersService;


