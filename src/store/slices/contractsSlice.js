import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { listTemplates, adminListContractInstances } from '../../services/contractsService';

const STALE_MS = 2 * 60 * 1000; // 2 minutes - use cache if fresher

// We store only ONE status's list at a time to avoid holding 4 large arrays (active, completed, failed, all).
// Switching filter fetches that status; cache is used if the same status was fetched recently.

export const fetchTemplates = createAsyncThunk(
  'contracts/fetchTemplates',
  async (_, { getState }) => {
    const { lastFetchedTemplates } = getState().contracts;
    if (lastFetchedTemplates && Date.now() - lastFetchedTemplates < STALE_MS) {
      return null; // use cache
    }
    return listTemplates();
  }
);

export const fetchInstancesByStatus = createAsyncThunk(
  'contracts/fetchInstancesByStatus',
  async (status, { getState }) => {
    const key = status || 'all';
    const { instancesStatus, instancesLastFetched } = getState().contracts;
    // Use cache only if we're re-requesting the same status and it's still fresh
    if (instancesStatus === key && instancesLastFetched && Date.now() - instancesLastFetched < STALE_MS) {
      return { status: key, data: null }; // use existing list
    }
    const data = await adminListContractInstances(status || undefined);
    return { status: key, data: Array.isArray(data) ? data : [] };
  }
);

const initialState = {
  templates: [],
  // Single list for the current filter only (avoids storing 4 huge arrays)
  instances: [],
  instancesStatus: null, // 'active' | 'completed' | 'failed' | 'all'
  instancesLastFetched: null,
  lastFetchedTemplates: null,
  templatesLoading: false,
  templatesError: null,
  instancesLoading: false,
  instancesError: null,
};

const contractsSlice = createSlice({
  name: 'contracts',
  initialState,
  reducers: {
    setTemplates: (state, { payload }) => {
      state.templates = payload;
      state.lastFetchedTemplates = Date.now();
    },
    setInstancesForStatus: (state, { payload }) => {
      const { status, data } = payload;
      state.instances = data ?? [];
      state.instancesStatus = status || 'all';
      state.instancesLastFetched = Date.now();
    },
    invalidateTemplates: (state) => {
      state.lastFetchedTemplates = null;
    },
    invalidateInstances: (state, { payload }) => {
      state.instancesLastFetched = null;
      if (payload && state.instancesStatus === payload) {
        state.instances = [];
        state.instancesStatus = null;
      } else if (!payload) {
        state.instances = [];
        state.instancesStatus = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Templates
      .addCase(fetchTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        if (action.payload != null) {
          state.templates = action.payload;
          state.lastFetchedTemplates = Date.now();
        }
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.error?.message || 'Failed to load templates';
      })
      // Instances by status
      .addCase(fetchInstancesByStatus.pending, (state) => {
        state.instancesLoading = true;
        state.instancesError = null;
      })
      .addCase(fetchInstancesByStatus.fulfilled, (state, action) => {
        state.instancesLoading = false;
        const { status, data } = action.payload;
        if (data != null) {
          state.instances = data;
          state.instancesStatus = status;
          state.instancesLastFetched = Date.now();
        }
      })
      .addCase(fetchInstancesByStatus.rejected, (state, action) => {
        state.instancesLoading = false;
        state.instancesError = action.error?.message || 'Failed to load instances';
      });
  },
});

export const {
  setTemplates,
  setInstancesForStatus,
  invalidateTemplates,
  invalidateInstances,
} = contractsSlice.actions;

export default contractsSlice.reducer;
