import React, { useState, useEffect } from "react";
import LoginForm from "./components/login";
import EmergencyDashboard from "./components/EmergencyDashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div>
      {!token ? (
        <LoginForm onLogin={handleLogin} />
      ) : (
        <EmergencyDashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
