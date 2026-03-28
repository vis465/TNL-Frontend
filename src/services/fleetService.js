import axiosInstance from '../utils/axios';

export async function getOwnedTrucksFleet() {
  const { data } = await axiosInstance.get('/trucks/owned');
  return data;
}

export async function getFleetDeliveries(truckItemId, limit = 30) {
  const { data } = await axiosInstance.get(
    `/trucks/fleet/deliveries/${encodeURIComponent(truckItemId)}`,
    { params: { limit } }
  );
  return data;
}
