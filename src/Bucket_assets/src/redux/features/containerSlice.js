import { createSlice } from "@reduxjs/toolkit";

export const containerSlice = createSlice({
  name: "containerActor",
  initialState: null,
  reducers: {
    updateContainerActor: (state, action) => {
      let targetProto = Object.getPrototypeOf(action.payload);
      return Object.assign(Object.create(targetProto), action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateContainerActor } = containerSlice.actions;
export default containerSlice.reducer;
