import { configureStore } from "@reduxjs/toolkit";
import catalogReducer from "./catalogSlice";
import { catalogApi } from "./catalogApi";

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    [catalogApi.reducerPath]: catalogApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(catalogApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
