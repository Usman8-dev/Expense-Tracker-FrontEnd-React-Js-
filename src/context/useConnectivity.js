import { createContext, useContext } from "react";

/** Shared connectivity state (online + offline outbox) for the app. */
export const ConnectivityContext = createContext(null);

export function useConnectivity() {
  return useContext(ConnectivityContext);
}
