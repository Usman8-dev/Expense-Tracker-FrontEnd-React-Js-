import { createContext, useContext, useState } from "react";
import { clearAllOfflineData } from "../apis/offlineQueue";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

/**
 * Cached API responses and the offline outbox are user-scoped: they must be
 * wiped on logout or the next account on this device could read them offline.
 */
function purgeOfflineData() {
  clearAllOfflineData();
  if (typeof caches !== "undefined") {
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith("api-")).map((key) => caches.delete(key))
        )
      )
      .catch(() => {});
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());

  const login = (userData, token) => {
    // Never carry another account's queued changes into this session.
    // Same user re-authenticating (expired token) keeps their pending work.
    const previous = readStoredUser();
    const sameUser =
      previous &&
      (previous._id === userData._id || previous.email === userData.email);
    if (!sameUser) purgeOfflineData();

    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    purgeOfflineData();
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
