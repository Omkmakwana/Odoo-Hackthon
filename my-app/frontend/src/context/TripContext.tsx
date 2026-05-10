"use client";

import { createContext, useContext } from 'react';

type TripContextValue = {
  activeTripId: string | null;
};

const TripContext = createContext<TripContextValue>({ activeTripId: null });

export function TripProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <TripContext.Provider value={{ activeTripId: null }}>{children}</TripContext.Provider>;
}

export function useTripContext() {
  return useContext(TripContext);
}
