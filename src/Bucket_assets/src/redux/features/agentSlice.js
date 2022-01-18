import { createSlice } from "@reduxjs/toolkit";

export const agentSlice = createSlice({
  name: "agent",
  initialState: null,
  reducers: {
    updateAgent: (state, action) => {
      // let targetProto = Object.getPrototypeOf(action.payload);
      // return Object.assign(Object.create(targetProto), action.payload);
      return action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateAgent } = agentSlice.actions;
export default agentSlice.reducer;
