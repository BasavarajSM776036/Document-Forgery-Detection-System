// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Load current user from localStorage (persistent login)
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);

  // ✅ Login function
  const login = (username, email = null) => {
    const loggedUser = {
      username: username.trim().toLowerCase(), // normalize for folder naming
      email: email || username,
    };
    setUser(loggedUser);
    setIsLoggedIn(true);
    localStorage.setItem("currentUser", JSON.stringify(loggedUser));
  };

  // ✅ Logout (clears user session)
  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("currentUser");
  };

  // ✅ Signup (stores locally)
  const signup = (username, password, email = null) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const normalized = username.trim().toLowerCase();

    if (users.find((u) => u.username === normalized)) {
      throw new Error("Username already exists");
    }

    users.push({ username: normalized, password, email: email || normalized });
    localStorage.setItem("users", JSON.stringify(users));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
