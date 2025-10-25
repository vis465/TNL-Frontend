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
  const [lastFetch, setLastFetch] = useState(null);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isCacheValid = () => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  };

  const loadExternalData = async (forceRefresh = false) => {
    // Check if we have valid cached data
    if (!forceRefresh && isCacheValid() && cityOptions.length > 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load map data
      const md = await fetchEts2Map();
      const cities = md?.mapData?.cities || [];
      setMapData({ cities });

      // Store city options with both name and id - optimize with useMemo-like processing
      const cityOpts = cities
        .filter(c => c.name && c.id) // Filter out invalid entries first
        .map(c => ({ name: c.name, id: c.id }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setCityOptions(cityOpts);

      // Store company options by city - optimize processing
      const byCity = {};
      cities.forEach(c => {
        if (c.name && c.companies) {
          byCity[c.name] = c.companies
            .filter(co => co.name && co.id) // Filter out invalid entries first
            .map(co => ({ name: co.name, id: co.id }))
            .sort((a, b) => a.name.localeCompare(b.name));
        }
      });
      setCompanyOptionsByCity(byCity);

      // Load cargo options
      const cargos = await fetchCargos();
      setCargoOptions(cargos);

      setLastFetch(Date.now());
    } catch (err) {
      console.error('Error loading external data:', err);
      setError(err.message || 'Failed to load external data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    return loadExternalData(true);
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
    loadExternalData();
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
    lastFetch,
    
    // Actions
    loadExternalData,
    refreshData,
    
    // Utilities
    getCityById,
    getCompanyById,
    getCitiesByGame,
    getCompaniesByCity,
    isCacheValid
  }), [
    mapData,
    cityOptions,
    companyOptionsByCity,
    cargoOptions,
    loading,
    error,
    lastFetch,
    getCityById,
    getCompanyById,
    getCitiesByGame,
    getCompaniesByCity
  ]);

  return (
    <ExternalDataContext.Provider value={value}>
      {children}
    </ExternalDataContext.Provider>
  );
};

export default ExternalDataContext;
