import { createSlice } from "@reduxjs/toolkit";

export const assetsSlice = createSlice({
  name: "assets",
  initialState: null,
  reducers: {
    updateassetsActor: (state, action) => {
      // let targetProto = Object.getPrototypeOf(action.payload);
      // return Object.assign(Object.create(targetProto), action.payload);
      return action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateassetsActor } = assetsSlice.actions;
export default assetsSlice.reducer;
