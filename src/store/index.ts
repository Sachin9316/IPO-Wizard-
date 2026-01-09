import { configureStore } from '@reduxjs/toolkit';
import { ipoApi } from '../services/ipoApi';

export const store = configureStore({
    reducer: {
        // Add the generated reducer as a specific top-level slice
        [ipoApi.reducerPath]: ipoApi.reducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(ipoApi.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
import { setupListeners } from '@reduxjs/toolkit/query';
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
