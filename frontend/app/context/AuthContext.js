"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      // Clean up the URL by removing the token
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("token");

    if (token) {
      const fetchUser = async () => {
        try {
          const response = await axios.get(`${backendUrl}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem("token");
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
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

    localStorage.setItem("token", token);
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

    localStorage.setItem("token", token);
    setUser(registeredUser);

    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
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
