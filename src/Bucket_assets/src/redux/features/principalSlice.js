import { createSlice } from "@reduxjs/toolkit";
export const principalSlice = createSlice({
  name: "principal",
  initialState: {
    value: "",
  },
  reducers: {
    updatePrincipal: (state, action) => {
      state.value = action.payload;
    },
  },
});
export const { updatePrincipal } = principalSlice.actions;
export default principalSlice.reducer;
