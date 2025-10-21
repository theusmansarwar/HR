import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import Login from "./Pages/Login.jsx";
import { AlertProvider } from "./Components/Alert/AlertContext";

// ✅ Define AppWrapper BEFORE rendering
const AppWrapper = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // ✅ new state for role

  useEffect(() => {
    // ✅ Check if token & user exist in localStorage
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      setIsLoggedIn(true);
      setRole(user.role); // ✅ store user role (like HR/Admin)
    }
  }, []);

  // ✅ Called when login succeeds
  const handleLoginSuccess = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setIsLoggedIn(true);
    setRole(user?.role || null);
  };

  // ✅ Called when logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setRole(null);
  };

  // ✅ Conditional rendering based on role
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ✅ Example: show different dashboards for each role
  if (role === "HR") {
    return <App onLogout={handleLogout} role="HR" />;
  } else if (role === "Admin") {
    return <App onLogout={handleLogout} role="Admin" />;
  } else if (role === "Employee") {
    return <App onLogout={handleLogout} role="Employee" />;
  } else {
    // Default fallback (in case no valid role)
    return <App onLogout={handleLogout} role="Guest" />;
  }
};

// ✅ Render main app
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AlertProvider>
      <AppWrapper />
    </AlertProvider>
  </BrowserRouter>
);
