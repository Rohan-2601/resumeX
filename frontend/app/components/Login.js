"use client";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return <p>Checking session...</p>;
  }

  if (user) {
    return (
      <>
        <p>Logged in as: {user.email || user.username || 'User'}</p>
        <button onClick={logout}>Logout</button>
      </>
    );
  }

  return <button onClick={login}>Login with GitHub</button>;
}
