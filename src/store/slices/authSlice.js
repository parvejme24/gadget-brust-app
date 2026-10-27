import { createSlice } from "@reduxjs/toolkit";

// the signed-in user; tokens live in tokenStorage

// the API calls it fullName; screens read user.name
const normalizeUser = (user) => (user ? { ...user, name: user.name || user.fullName || "" } : null);

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, ready: false },
  reducers: {
    sessionRestored: (state, action) => {
      state.user = normalizeUser(action.payload);
      state.ready = true;
    },
    signedIn: (state, action) => {
      state.user = normalizeUser(action.payload);
      state.ready = true;
    },
    signedOut: (state) => {
      state.user = null;
    },
  },
});

export const { sessionRestored, signedIn, signedOut } = authSlice.actions;
export default authSlice.reducer;
