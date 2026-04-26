import axios from "../utils/axios";

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
