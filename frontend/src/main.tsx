import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createTheme, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Toaster } from "react-hot-toast";
import axios from "axios";
axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "/_/backend/api/v1"
    : "http://localhost:5000/api/v1");
axios.defaults.timeout = Number(import.meta.env.VITE_API_TIMEOUT || 30000);
axios.defaults.withCredentials = true;
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#9c27b0", // deep purple
    },
    secondary: {
      main: "#00bcd4", // teal
    },
    background: {
      default: "#131313",
      paper: "#1e1e1e",
    },
  },
  typography: {
    fontFamily: "Work Sans, Arial, sans-serif",
    button: {
      textTransform: "none",
      letterSpacing: 0,
    },
  },
});
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Toaster position="top-right" />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
