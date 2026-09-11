"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  const token = (localStorage.getItem(TOKEN_KEY) || "").trim();
  if (!token || token === "null" || token === "undefined") {
    return null;
  }
  return token;
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false); // For explicit actions
  const router = useRouter();

  // Axios interceptor for global 401 handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setUser(null);
          // Optional: redirect to login if we receive 401, unless we're already on login/register
          if (typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && !currentPath.includes('/register') && !currentPath.includes('/auth/callback') && currentPath !== '/') {
              router.replace("/login");
            }
          }
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const token = getStoredToken();
      const cachedUser = getStoredUser();

      if (token && cachedUser) {
        setUser(cachedUser);
      }

      if (!token) {
        if (cachedUser) {
          localStorage.removeItem(USER_KEY);
        }
        setUser(null);
        setIsInitializing(false);
        return;
      }

      // We have a token, fetch the latest user info
      try {
        const response = await axios.get(`${backendUrl}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 8000,
        });
        const fetchedUser = response.data.user;
        if (isMounted) {
          setUser(fetchedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser));
        }
      } catch (error) {
        console.error("Failed to fetch user on initialization", error);
        // Interceptor handles 401 and clearing
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = () => {
    router.push("/login");
  };

  const loginWithGithub = () => {
    window.location.href = `${backendUrl}/api/auth/github`;
  };

  const loginWithCredentials = async ({ username, password }) => {
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        username,
        password,
      });

      const token = response.data?.token;
      const loggedInUser = response.data?.user;

      if (!token || !loggedInUser) {
        throw new Error("Login response missing token or user");
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const exchangeOAuthCode = async (code) => {
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/exchange`, {
        code,
      });

      const token = response.data?.token;
      const loggedInUser = response.data?.user;

      if (!token || !loggedInUser) {
        throw new Error("Exchange response missing token or user");
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return loggedInUser;
    } finally {
      setLoading(false);
    }
  };

  const registerWithCredentials = async ({ username, password }) => {
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/auth/register`, {
        username,
        password,
      });

      const token = response.data?.token;
      const registeredUser = response.data?.user;

      if (!token || !registeredUser) {
        throw new Error("Register response missing token or user");
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(registeredUser));
      setUser(registeredUser);
      return registeredUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isInitializing,
        loading,
        login,
        loginWithGithub,
        loginWithCredentials,
        registerWithCredentials,
        exchangeOAuthCode,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

