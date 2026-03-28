import axiosInstance from '../utils/axios';

export async function getTruckMarketplaceCatalog({ preferApi = false } = {}) {
  const { data } = await axiosInstance.get('/trucks/marketplace', {
    params: preferApi ? { source: 'api' } : undefined
  });
  return data;
}

export async function purchaseTruckModel(brandId, modelId) {
  const { data } = await axiosInstance.post('/trucks/purchase', { brandId, modelId });
  return data;
}
