import { createSlice } from "@reduxjs/toolkit";

export const bucketSlice = createSlice({
  name: "bucketActor",
  initialState: null,
  reducers: {
    updateBucketActor: (state, action) => {
      let targetProto = Object.getPrototypeOf(action.payload);
      return Object.assign(Object.create(targetProto), action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateBucketActor } = bucketSlice.actions;
export default bucketSlice.reducer;
