import axios from "../utils/axios";

const CARGO_API_URL = "https://hub.nexonlogistics.com/api/cargos";

export const fetchCargos = async () => {
  try {
    const response = await axios.get(CARGO_API_URL);
    if (response.data && response.data.success && response.data.cargos) {
      return [
        ...new Set(
          response.data.cargos.map((cargo) => cargo.cargoName).filter(Boolean)
        ),
      ].sort();
    }
    return [];
  } catch (error) {
    console.error("Error fetching cargos:", error);
    return [];
  }
};
