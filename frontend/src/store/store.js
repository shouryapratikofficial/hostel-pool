import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    // We are telling our store that the 'auth' piece of our state
    // will be managed by the authReducer we just created.
    auth: authReducer,
  },
  // This enables the Redux DevTools browser extension for easy debugging.
  devTools: true,
});