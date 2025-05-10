
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main entry point loading");

// Create root and render app
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("App rendered successfully");
  
} catch (error) {
  console.error("Failed to render application:", error);
  
  // Display error in the DOM if possible
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; text-align: center;">
        <h1>Application Error</h1>
        <p>${error instanceof Error ? error.message : "Unknown error"}</p>
      </div>
    `;
  }
}
