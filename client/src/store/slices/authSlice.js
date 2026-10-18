import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('accessToken');
const userStr = localStorage.getItem('user');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userStr ? JSON.parse(userStr) : null,
    accessToken: token || null,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => { state.loading = true; state.error = null; },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearError: (state) => { state.error = null; },
  },
});

export const { loginStart, loginSuccess, loginFail, logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
