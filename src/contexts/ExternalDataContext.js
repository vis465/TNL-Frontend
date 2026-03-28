import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchEts2Map } from '../utils/axios';
import { fetchCargos } from '../services/cargoService';

const ExternalDataContext = createContext();

export const useExternalData = () => {
  const context = useContext(ExternalDataContext);
  if (!context) {
    throw new Error('useExternalData must be used within an ExternalDataProvider');
  }
  return context;
};

export const ExternalDataProvider = ({ children }) => {
  const [mapData, setMapData] = useState({ cities: [] });
  const [cityOptions, setCityOptions] = useState([]);
  const [companyOptionsByCity, setCompanyOptionsByCity] = useState({});
  const [cargoOptions, setCargoOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastMapFetch, setLastMapFetch] = useState(null);
  const [lastCargoFetch, setLastCargoFetch] = useState(null);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isMapCacheValid = () => {
    if (!lastMapFetch) return false;
    return Date.now() - lastMapFetch < CACHE_DURATION;
  };

  const isCargoCacheValid = () => {
    if (!lastCargoFetch) return false;
    return Date.now() - lastCargoFetch < CACHE_DURATION;
  };

  const loadMapData = async (forceRefresh = false) => {
    if (!forceRefresh && isMapCacheValid() && cityOptions.length > 0) return;

    try {
      setLoading(true);
      setError(null);

      // Load map data
      const md = await fetchEts2Map();
      const cities = md?.mapData?.cities || [];
      setMapData({ cities });

      // Store city options with both name and id
      const cityOpts = cities
        .filter(c => c.name && c.id)
        .map(c => ({ name: c.name, id: c.id }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setCityOptions(cityOpts);

      // Store company options by city
      const byCity = {};
      cities.forEach(c => {
        if (c.name && c.companies) {
          byCity[c.name] = c.companies
            .filter(co => co.name && co.id)
            .map(co => ({ name: co.name, id: co.id }))
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      setCompanyOptionsByCity(byCity);

      setLastMapFetch(Date.now());
    } catch (err) {
      console.error('Error loading map external data:', err);
      setError(err.message || 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const loadCargoData = async (forceRefresh = false) => {
    if (!forceRefresh && isCargoCacheValid() && cargoOptions.length > 0) return;

    try {
      setLoading(true);
      setError(null);

      const cargos = await fetchCargos();
      setCargoOptions(cargos);
      setLastCargoFetch(Date.now());
    } catch (err) {
      console.error('Error loading cargo options:', err);
      setError(err.message || 'Failed to load cargo options');
    } finally {
      setLoading(false);
    }
  };

  // Loads both (kept for backward compatibility with `refreshData`)
  const loadExternalData = async (forceRefresh = false) => {
    await loadMapData(forceRefresh);
    await loadCargoData(forceRefresh);
  };

  const refreshData = () => {
    return loadExternalData(true);
  };

  // Lazy entry point so we don't call the cargo API on every page load.
  const ensureCargoOptions = async () => {
    await loadCargoData(false);
  };

  const getCityById = useCallback((id) => {
    return cityOptions.find(city => city.id === id);
  }, [cityOptions]);

  const getCompanyById = useCallback((cityName, companyId) => {
    const companies = companyOptionsByCity[cityName] || [];
    return companies.find(company => company.id === companyId);
  }, [companyOptionsByCity]);

  const getCitiesByGame = useCallback((gameId) => {
    return mapData.cities.filter(city => city.game === gameId);
  }, [mapData.cities]);

  const getCompaniesByCity = useCallback((cityName) => {
    return companyOptionsByCity[cityName] || [];
  }, [companyOptionsByCity]);

  // Load data on mount
  useEffect(() => {
    // Cargo is lazy-loaded on demand.
    loadMapData(false);
  }, []);

  const value = useMemo(() => ({
    // Data
    mapData,
    cityOptions,
    companyOptionsByCity,
    cargoOptions,
    
    // State
    loading,
    error,
    lastMapFetch,
    lastCargoFetch,
    
    // Actions
    loadExternalData,
    ensureCargoOptions,
    refreshData,
    
    // Utilities
    getCityById,
    getCompanyById,
    getCitiesByGame,
    getCompaniesByCity,
    isCacheValid: isMapCacheValid
  }), [
    mapData,
    cityOptions,
    companyOptionsByCity,
    cargoOptions,
    loading,
    error,
    lastMapFetch,
    lastCargoFetch,
    getCityById,
    getCompanyById,
    getCitiesByGame,
    getCompaniesByCity,
    ensureCargoOptions
  ]);

  return (
    <ExternalDataContext.Provider value={value}>
      {children}
    </ExternalDataContext.Provider>
  );
};

export default ExternalDataContext;
