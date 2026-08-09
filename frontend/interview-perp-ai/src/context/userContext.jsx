import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // New state to track loading

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    // Security mitigation (partial — see Issue #78): sessionStorage limits token lifetime to the tab.
    // TODO: move to httpOnly cookies once backend supports it.
    const accessToken = sessionStorage.getItem("token");
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
        setUser(response.data);
      } catch (error) {
        console.error("User not authenticated", error);
        // Clear invalid token
        sessionStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);
  // The definitions for updateUser and clearUser are missing in the screenshot
  // but are used in the provider's value.
  const updateUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem("token", userData.token); //Save token
    setLoading(false);
  };
  const clearUser = () => {
    // Remove user-specific visit tracking key before clearing user state
    if (user?._id || user?.id) {
      localStorage.removeItem(`interview_prep_last_visit_${user._id || user.id}`);
    }
    setUser(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("greeting_shown");
    // Clear user-specific visit tracking so next login shows proper greeting
    // Remove all keys with the interview_prep_last_visit_ prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("interview_prep_last_visit_")) {
        localStorage.removeItem(key);
      }
    });
  };

  return (
    <UserContext.Provider value={{ user, loading, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;