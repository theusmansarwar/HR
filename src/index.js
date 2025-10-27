import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./Pages/Login.jsx";
import { AlertProvider } from "./Components/Alert/AlertContext";

const AppWrapper = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setRole(user.role);
    }

    setCheckingAuth(false);
  }, []);

  const handleLoginSuccess = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(true);
    setRole(user?.role || null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole(null);
  };

  if (checkingAuth) {
    return null;
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (role === "HR") {
    return <App onLogout={handleLogout} role="HR" />;
  } else if (role === "Admin") {
    return <App onLogout={handleLogout} role="Admin" />;
  } else if (role === "Employee") {
    return <App onLogout={handleLogout} role="Employee" />;
  } else {
    return <App onLogout={handleLogout} role="Guest" />;
  }
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AlertProvider>
      <AppWrapper />
    </AlertProvider>
  </BrowserRouter>
);
