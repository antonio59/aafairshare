import React from 'react'; // Import React
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Wrap App with AuthProvider
createRoot(document.getElementById("root")!).render(
  // <React.StrictMode> {/* Temporarily removed for debugging Firebase redirect */}
    <AuthProvider>
      <App />
    </AuthProvider>
  // </React.StrictMode>
);
