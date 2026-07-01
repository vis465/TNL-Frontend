import { useState, useCallback } from 'react';
import axiosInstance from '../utils/axios';

export function useSpecialEventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/special-events');
      setEvents(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load special events';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    await axiosInstance.delete(`/special-events/${eventId}`);
    setEvents((prev) => prev.filter((e) => e.truckersmpId !== eventId));
  }, []);

  return { events, loading, error, fetchEvents, deleteEvent, setError };
}

export function useSpecialEventDetail(eventId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    if (!eventId || eventId === 'new') return null;
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.get(`/special-events/${eventId}`);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load event';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const createEvent = useCallback(async (payload) => {
    const { data } = await axiosInstance.post('/special-events', payload);
    return data;
  }, []);

  const updateEvent = useCallback(async (id, payload) => {
    const { data } = await axiosInstance.put(`/special-events/${id}`, payload);
    return data;
  }, []);

  const upsertRouteSlots = useCallback(async (id, routeName, slots) => {
    const { data } = await axiosInstance.put(
      `/special-events/${id}/routes/${encodeURIComponent(routeName)}/slots`,
      { slots }
    );
    return data;
  }, []);

  const patchSlot = useCallback(async (id, slotId, updates) => {
    const { data } = await axiosInstance.patch(
      `/special-events/${id}/slots/${slotId}`,
      updates
    );
    return data;
  }, []);

  const deleteSlot = useCallback(async (id, slotId) => {
    const { data } = await axiosInstance.delete(`/special-events/${id}/slots/${slotId}`);
    return data;
  }, []);

  const approveRequest = useCallback(async (id, requestId, body) => {
    const { data } = await axiosInstance.patch(
      `/special-events/${id}/requests/${requestId}/approve`,
      body
    );
    return data;
  }, []);

  const rejectRequest = useCallback(async (id, requestId, body) => {
    const { data } = await axiosInstance.patch(
      `/special-events/${id}/requests/${requestId}/reject`,
      body
    );
    return data;
  }, []);

  const deleteApprovedRequest = useCallback(async (id, requestId) => {
    const { data } = await axiosInstance.delete(
      `/special-events/${id}/requests/${requestId}`
    );
    return data;
  }, []);

  return {
    data,
    loading,
    error,
    setError,
    setData,
    fetchDetail,
    createEvent,
    updateEvent,
    upsertRouteSlots,
    patchSlot,
    deleteSlot,
    approveRequest,
    rejectRequest,
    deleteApprovedRequest,
  };
}

export async function fetchTruckersMPEvent(eventId) {
  const { data } = await axiosInstance.get(`/events/${eventId}`);
  const startDate = data.starttime
    ? new Date(data.starttime).toISOString().split('T')[0]
    : '';
  const endDate = data.endtime
    ? new Date(data.endtime).toISOString().split('T')[0]
    : '';
  return {
    truckersmpId: data.truckersmpId,
    title: data.title,
    description: data.description,
    startDate,
    endtime: endDate,
    server: data.server,
    meetingPoint: data.meetingPoint,
    departurePoint: data.departurePoint,
    arrivalPoint: data.arrivalPoint,
    banner: data.banner,
    map: data.map,
    voiceLink: data.voiceLink,
    externalLink: data.externalLink,
    rule: data.rule,
    dlcs: data.dlcs || [],
    url: data.url,
  };
}

export const EMPTY_EVENT_FORM = {
  truckersmpId: '',
  title: '',
  description: '',
  startDate: '',
  endtime: '',
  server: '',
  meetingPoint: '',
  departurePoint: '',
  arrivalPoint: '',
  banner: '',
  map: '',
  voiceLink: '',
  externalLink: '',
  rule: '',
  dlcs: [],
  url: '',
  maxVtcPerSlot: 1,
  approvalRequired: true,
  routes: [],
};
