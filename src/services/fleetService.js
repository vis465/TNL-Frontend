import axiosInstance from '../utils/axios';

/**
 * Returns `{ ownedTrucks, divisionId }`. `ownedTrucks` are the trucks owned
 * by the caller's division (empty when the caller is not in a division).
 */
export async function getOwnedTrucksFleet() {
  const { data } = await axiosInstance.get('/trucks/owned');
  return data;
}

/**
 * Recent deliveries accrued on a specific division truck (by DivisionTruck id).
 */
export async function getFleetDeliveries(divisionTruckId, limit = 30) {
  const { data } = await axiosInstance.get(
    `/trucks/fleet/deliveries/${encodeURIComponent(divisionTruckId)}`,
    { params: { limit } }
  );
  return data;
}

export async function getDivisionTrucks(divisionId) {
  const { data } = await axiosInstance.get(
    `/divisions/${encodeURIComponent(divisionId)}/trucks`
  );
  return data;
}

export async function payTruckMaintenance(divisionId, divisionTruckId) {
  const { data } = await axiosInstance.post(
    `/divisions/${encodeURIComponent(divisionId)}/trucks/${encodeURIComponent(divisionTruckId)}/maintain`
  );
  return data;
}
