import axiosInstance from '../utils/axios';

export async function getTruckMarketplaceCatalog({ preferApi = false } = {}) {
  const { data } = await axiosInstance.get('/trucks/marketplace', {
    params: preferApi ? { source: 'api' } : undefined,
  });
  return data;
}

/**
 * Purchase a truck for the leader's division. Trucks are division-owned — an
 * individual user can no longer buy trucks.
 */
export async function purchaseDivisionTruck(divisionId, truckItemId, couponCode) {
  const { data } = await axiosInstance.post(
    `/divisions/${encodeURIComponent(divisionId)}/trucks/purchase`,
    { truckItemId, couponCode: couponCode || undefined }
  );
  return data;
}

export async function previewCoupon(code, truckItemId) {
  const { data } = await axiosInstance.post('/trucks/coupons/preview', {
    code,
    truckItemId,
  });
  return data;
}

/**
 * Legacy alias. Kept as a stub so older callers fail loudly — individual
 * purchases are no longer supported.
 */
export async function purchaseTruckModel() {
  throw new Error(
    'Individual truck purchase is disabled. Division leaders buy trucks via purchaseDivisionTruck(divisionId, truckItemId).'
  );
}
