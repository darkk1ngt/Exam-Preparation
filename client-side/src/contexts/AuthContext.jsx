import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = () => {
    return fetch("/api/authcheck", {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setIsLoggedIn(data.loggedIn))
      .catch(() => setIsLoggedIn(false));
  };

  useEffect(() => {
    checkAuthStatus().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, loading, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
