import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper, CircularProgress } from "@mui/material";
import logo from "../Assets/zemalt-logo.png";
import "./login.css";
import { useAlert } from "../Components/Alert/AlertContext";
import { login } from "../DAL/auth";

const Login = ({ onLoginSuccess }) => {
  const { showAlert } = useAlert(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedPassword = localStorage.getItem("password");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
    }
  }, []);

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
      const formData = {
    email,
    password,
  };
    const response = await login(formData);
    const data = response; 

    if (response.status === 200 && data.user) {

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("modules", JSON.stringify(data.user.modules));

      showAlert("success", data.message || "Login successful!");
      onLoginSuccess(); // notify parent
    } else {
      showAlert("error", data.message || "Login failed.");
    }
  } catch (error) {
    console.error("Axios error:", error);
    if (error.response) {
      showAlert("error", error.response.data.message || "Invalid credentials.");
    } else if (error.request) {
      showAlert("error", "No response from the server.");
    } else {
      showAlert("error", error.message || "Unexpected error occurred.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <Box className="login">
      {loading && (
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            position: "absolute",
            top: "20px",
            color: "primary.main",
          }}
        />
      )}

      <Paper
        elevation={6}
        sx={{
          width: 350,
          p: 3,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Box component="form" onSubmit={handleLogin}>
          <Box
            component="img"
            src={logo}
            alt="digitalaura"
            sx={{
              width: "30%",
              display: "block",
              mx: "auto",
              my: 3,
            }}
          />

          <Typography variant="h5" gutterBottom>
            Admin Login
          </Typography>

          <TextField
            fullWidth
            type="email"
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1.2,
              borderRadius: "6px",
              backgroundColor: "var(--background-color)",
              "&:hover": {
                backgroundColor: "var(--background-color)",
                opacity: 0.9,
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
