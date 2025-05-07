import React, { useState, useEffect } from "react";
import LoginForm from "./components/login";
import EmergencyDashboard from "./components/EmergencyDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = (newToken) => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-gray-800">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <EmergencyDashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
