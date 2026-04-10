"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

const getStoredToken = () => {
  const token = (localStorage.getItem(TOKEN_KEY) || "").trim();
  if (!token || token === "null" || token === "undefined") {
    return null;
  }
  return token;
};

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const finishLoading = () => {
      if (isMounted) {
        setLoading(false);
      }
    };

    // Check for token in URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      localStorage.setItem(TOKEN_KEY, tokenFromUrl);
      // Clean up the URL by removing the token
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = getStoredToken();
    const cachedUser = getStoredUser();

    if (token && cachedUser) {
      setUser(cachedUser);
    }

    if (!token && cachedUser) {
      localStorage.removeItem(USER_KEY);
      setUser(null);
    }

    if (token) {
      const loadingGuard = window.setTimeout(() => {
        finishLoading();
      }, 10000);

      const fetchUser = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000,
          });
          const fetchedUser = response.data.user;
          if (isMounted) {
            setUser(fetchedUser);
          }
          localStorage.setItem(USER_KEY, JSON.stringify(fetchedUser));
        } catch (error) {
          console.error("Failed to fetch user", error);
          if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            if (isMounted) {
              setUser(null);
            }
          }
        } finally {
          window.clearTimeout(loadingGuard);
          finishLoading();
        }
      };
      fetchUser();

      return () => {
        isMounted = false;
        window.clearTimeout(loadingGuard);
      };
    } else {
      if (isMounted) {
        setUser(null);
      }
      finishLoading();

      return () => {
        isMounted = false;
      };
    }
  }, []);

  const login = () => {
    window.location.href = "/login";
  };

  const loginWithGithub = () => {
    window.location.href = `${backendUrl}/api/auth/github`;
  };

  const loginWithCredentials = async ({ username, password }) => {
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
  };

  const registerWithCredentials = async ({ username, password }) => {
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
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGithub,
        loginWithCredentials,
        registerWithCredentials,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
