import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import axiosInstance from '../utils/axios';

const DriverPerformanceContext = createContext(null);

export function useDriverPerformance() {
  return useContext(DriverPerformanceContext);
}

function unwrapData(res) {
  if (res?.data?.data != null) return res.data.data;
  return res?.data ?? null;
}

export function DriverPerformanceProvider({ children, divisionId, publicSlug }) {
  const [state, setState] = useState({
    drivers: [],
    leaderboards: {},
    trends: {},
    perks: [],
    certifications: [],
    divisionProgress: 0,
    ranks: [],
    skillLevels: [],
    rankMilestones: [],
    loading: true,
  });
  const wsRef = useRef(null);

  const fetchSnapshot = useCallback(async () => {
    const endpoint = publicSlug
      ? `/divisions/public/${encodeURIComponent(publicSlug)}/performance`
      : divisionId
        ? `/divisions/${divisionId}/performance`
        : null;

    if (!endpoint) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    try {
      const perfRes = await axiosInstance
        .get(endpoint)
        .catch(() => ({ data: null }));

      const snapshot = unwrapData(perfRes) || {};

      setState({
        drivers: Array.isArray(snapshot.drivers) ? snapshot.drivers : [],
        leaderboards: snapshot.leaderboards || {},
        trends: snapshot.trends || {},
        perks: Array.isArray(snapshot.perks) ? snapshot.perks : [],
        certifications: Array.isArray(snapshot.certifications) ? snapshot.certifications : [],
        divisionProgress: Number(snapshot.divisionProgress) || 0,
        ranks: Array.isArray(snapshot.ranks) ? snapshot.ranks : [],
        skillLevels: Array.isArray(snapshot.skillLevels) ? snapshot.skillLevels : [],
        rankMilestones: Array.isArray(snapshot.rankMilestones) ? snapshot.rankMilestones : [],
        loading: false,
      });
    } catch (_) {
      setState((s) => ({ ...s, loading: false }));
    }
  }, [divisionId, publicSlug]);

  useEffect(() => {
    fetchSnapshot();
    const poll = setInterval(fetchSnapshot, 20_000);
    return () => {
      clearInterval(poll);
      try {
        if (wsRef.current) wsRef.current.close();
      } catch (_) {
        /* ignore */
      }
    };
  }, [fetchSnapshot]);

  const actions = { refresh: fetchSnapshot };

  return (
    <DriverPerformanceContext.Provider value={{ state, actions }}>
      {children}
    </DriverPerformanceContext.Provider>
  );
}

export default DriverPerformanceContext;
