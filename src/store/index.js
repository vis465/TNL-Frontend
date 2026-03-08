import { configureStore } from '@reduxjs/toolkit';
import contractsReducer from './slices/contractsSlice';

export const store = configureStore({
  reducer: {
    contracts: contractsReducer,
  },
});
