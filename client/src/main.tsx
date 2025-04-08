// Ensure React is imported first
import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from './context/AuthContext';
import { FeatureFlagProvider } from './context/FeatureFlagContext';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        // Log error but don't break the app
        console.warn('Service Worker registration failed:', error);
      });
  });
}

// Wait for DOM to be fully loaded
const renderApp = () => {
  const container = document.getElementById("root");
  if (!container) {
    console.error("Root element not found!");
    return;
  }

  // Create root and render app
  const root = createRoot(container);
  root.render(
  // <React.StrictMode> {/* Temporarily removed for debugging Firebase redirect */}
    <AuthProvider>
      <FeatureFlagProvider>
        <App />
      </FeatureFlagProvider>
    </AuthProvider>
  // </React.StrictMode>
  );
};

// Ensure DOM is ready before rendering
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderApp);
} else {
  renderApp();
}
