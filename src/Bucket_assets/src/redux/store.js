import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./features/peopleSlice";
import overReducer from "./features/overViewSlice";
import bucketActor from "./features/bucketSlice";
import containerActor from "./features/containerSlice";
import agent from "./features/agentSlice";
import principal from "./features/principalSlice";
import assets from "./features/assetsSlice";
export default configureStore({
  reducer: {
    counter: counterReducer,
    overView: overReducer,
    bucketActor: bucketActor,
    assets: assets,
    containerActor: containerActor,
    agent: agent,
    principal: principal,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
