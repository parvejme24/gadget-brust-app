import { createSlice } from "@reduxjs/toolkit";

// the signed-in user; tokens live in tokenStorage
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, ready: false },
  reducers: {
    sessionRestored: (state, action) => {
      state.user = action.payload || null;
      state.ready = true;
    },
    signedIn: (state, action) => {
      state.user = action.payload;
      state.ready = true;
    },
    signedOut: (state) => {
      state.user = null;
    },
  },
});

export const { sessionRestored, signedIn, signedOut } = authSlice.actions;
export default authSlice.reducer;
