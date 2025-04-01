import React from 'react'; // Import React
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// Wrap App with AuthProvider
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
