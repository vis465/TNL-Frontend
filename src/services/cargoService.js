import axios from "../utils/axios";

const ADMIN_CARGO_BASE = "/admin/cargo-rates";

/** Distinct cargo names from our jobs + rate table (see GET /api/cargos/names). */
export const fetchCargos = async () => {
  try {
    const { data } = await axios.get("/cargos/names");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching cargo names:", error);
    return [];
  }
};

/** POST /api/admin/cargo-rates/sync-catalog — pull Nexon cargo catalog into GameCargo. */
export const syncCatalog = async () => {
  const { data } = await axios.post(`${ADMIN_CARGO_BASE}/sync-catalog`);
  return data;
};

/** GET /api/admin/cargo-rates/catalog-meta — last sync time, count, weight bounds. */
export const getCatalogMeta = async () => {
  const { data } = await axios.get(`${ADMIN_CARGO_BASE}/catalog-meta`);
  return data;
};

/**
 * GET /api/admin/cargo-rates/cargo-catalog — paginated Nexon catalog with rate enrichment.
 * @param {{ q?, weightMin?, weightMax?, gameType?, division?, hasRate?, page?, limit?, sort? }} params
 */
export const listCatalog = async (params = {}) => {
  const { data } = await axios.get(`${ADMIN_CARGO_BASE}/cargo-catalog`, { params });
  return data;
};

/** GET /api/admin/cargo-rates/volume-preview */
export const getVolumePreview = async () => {
  const { data } = await axios.get(`${ADMIN_CARGO_BASE}/volume-preview`);
  return data;
};

/** POST /api/admin/cargo-rates/refresh */
export const refreshSupplySnapshot = async () => {
  const { data } = await axios.post(`${ADMIN_CARGO_BASE}/refresh`);
  return data;
};
