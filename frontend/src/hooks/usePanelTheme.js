import { useLayoutEffect } from "react";

const THEME_COLORS = {
  admin: "#031b45",
  sales: "#1b1a1d",
};

export const panelFromPath = (pathname = "") => (pathname.startsWith("/sales") ? "sales" : "admin");

// Applies a panel's design tokens (src/styles/tokens.css) by setting
// <html data-panel="admin|sales">, and syncs the mobile browser theme color.
export const applyPanelTheme = (panel) => {
  const root = document.documentElement;
  if (root.dataset.panel !== panel) root.dataset.panel = panel;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[panel] || THEME_COLORS.admin);
};

export const usePanelTheme = (panel) => {
  useLayoutEffect(() => {
    applyPanelTheme(panel);
  }, [panel]);
};
