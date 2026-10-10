import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/admin-theme.css";
import "./styles/sales-theme.css";
import "./styles/signin.css";
import { applyPanelTheme, panelFromPath } from "./hooks/usePanelTheme";

// Pick the panel theme before the first paint so there's no flash of the
// other panel's colors; layouts keep it in sync while navigating.
applyPanelTheme(panelFromPath(window.location.pathname));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
