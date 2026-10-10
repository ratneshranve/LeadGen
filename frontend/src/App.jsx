import React from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AppRoutes } from "./routes/AppRoutes";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { panelFromPath, usePanelTheme } from "./hooks/usePanelTheme";
import "./App.css";

// Keeps <html data-panel> in step with the route so admin and sales screens
// (including their login pages) always render with their own theme.
const PanelThemeSync = () => {
  const { pathname } = useLocation();
  usePanelTheme(panelFromPath(pathname));
  return null;
};

function App() {
  return (
    <BrowserRouter>
      <PanelThemeSync />
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
