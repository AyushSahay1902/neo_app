import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css"; // Import your CSS if needed

// Get the root element
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create a root
const root = createRoot(rootElement);

// Render your App component
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
