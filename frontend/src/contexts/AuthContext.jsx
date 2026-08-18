import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser && storedUser !== "undefined") {
        let parsedUser = JSON.parse(storedUser);
        
        // Restore avatar from local extra profile data if missing
        if (!parsedUser.avatarUrl) {
          try {
            const extra = JSON.parse(localStorage.getItem("volleyreel_profile_extra") || "{}");
            if (extra && extra.avatarUrl) {
              parsedUser.avatarUrl = extra.avatarUrl;
              // Save it back to the user object so it persists
              localStorage.setItem("user", JSON.stringify(parsedUser));
            }
          } catch (e) {
            console.error("Failed to parse extra profile data during init", e);
          }
        }
        
        setUser(parsedUser);
      }
    } catch (err) {
      console.error("Error reading user from localStorage:", err);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    let finalUserData = { ...userData };
    
    // Try to restore avatar from local extra profile data if backend didn't provide one
    if (!finalUserData.avatarUrl) {
      try {
        const extra = JSON.parse(localStorage.getItem("volleyreel_profile_extra") || "{}");
        if (extra && extra.avatarUrl) {
          finalUserData.avatarUrl = extra.avatarUrl;
        }
      } catch (e) {
        console.error("Failed to parse extra profile data during login", e);
      }
    }

    localStorage.setItem("user", JSON.stringify(finalUserData));
    setUser(finalUserData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updatedUser = user ? { ...user, ...updatedData } : updatedData;
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};