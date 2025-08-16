import { createSlice } from '@reduxjs/toolkit';

// Get user info from localStorage to initialize the state, so the user stays logged in after a refresh.
const userInfo = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userInfo: userInfo,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  // Reducers are functions that define how the state can be updated.
  reducers: {
    // This action will be called when a user successfully logs in or registers.
    setCredentials(state, action) {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    // This action will be called when a user logs out.
    logout(state) {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
    },
  },
});

// Export the action creators to be used in our components
export const { setCredentials, logout } = authSlice.actions;

// Export the reducer to be added to our store
export default authSlice.reducer;