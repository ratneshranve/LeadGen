// Core fetch wrapper: base URL, auth header injection, and 401 -> refresh-token retry.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const TOKEN_KEYS = {
  admin: { access: "leadflow_admin_access_token", refresh: "leadflow_admin_refresh_token" },
  sales: { access: "leadflow_sales_access_token", refresh: "leadflow_sales_refresh_token" },
};

const getPortal = () => (window.location.pathname.startsWith("/sales") ? "sales" : "admin");

const getTokens = (portal = getPortal()) => {
  const keys = TOKEN_KEYS[portal];
  return {
    access: sessionStorage.getItem(keys.access) || localStorage.getItem(keys.access) || null,
    refresh: sessionStorage.getItem(keys.refresh) || localStorage.getItem(keys.refresh) || null,
  };
};

// persist=true also mirrors tokens into localStorage (Remember Me), matching the
// existing admin/salesUser storage behavior in AuthContext.
const setTokens = (portal, { accessToken, refreshToken }, persist = false) => {
  const keys = TOKEN_KEYS[portal];
  sessionStorage.setItem(keys.access, accessToken);
  sessionStorage.setItem(keys.refresh, refreshToken);
  if (persist) {
    localStorage.setItem(keys.access, accessToken);
    localStorage.setItem(keys.refresh, refreshToken);
  } else {
    localStorage.removeItem(keys.access);
    localStorage.removeItem(keys.refresh);
  }
};

const clearTokens = (portal) => {
  const keys = TOKEN_KEYS[portal];
  sessionStorage.removeItem(keys.access);
  sessionStorage.removeItem(keys.refresh);
  localStorage.removeItem(keys.access);
  localStorage.removeItem(keys.refresh);
};

// De-dupe concurrent refresh attempts per portal so a burst of 401s only refreshes once.
const refreshPromises = {};

const refreshAccessToken = async (portal) => {
  const { refresh } = getTokens(portal);
  if (!refresh) throw new Error("No refresh token available");

  if (!refreshPromises[portal]) {
    refreshPromises[portal] = fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          throw new Error(json?.message || "Session expired");
        }
        const wasPersisted = !!localStorage.getItem(TOKEN_KEYS[portal].access);
        setTokens(portal, json.data, wasPersisted);
        return json.data;
      })
      .finally(() => {
        delete refreshPromises[portal];
      });
  }

  return refreshPromises[portal];
};

/**
 * @param {string} path - e.g. "/leads" (appended to VITE_API_BASE_URL)
 * @param {object} opts
 */
async function apiRequest(path, opts = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    portal,
    auth = true,
    isFormData = false,
    _retry = true,
  } = opts;

  const activePortal = portal || getPortal();
  const finalHeaders = { ...headers };
  if (!isFormData) finalHeaders["Content-Type"] = "application/json";

  if (auth) {
    const { access } = getTokens(activePortal);
    if (access) finalHeaders["Authorization"] = `Bearer ${access}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  });

  const json = await response.json().catch(() => null);

  if (response.status === 401 && auth && _retry) {
    try {
      await refreshAccessToken(activePortal);
      return apiRequest(path, { ...opts, portal: activePortal, _retry: false });
    } catch {
      clearTokens(activePortal);
      window.dispatchEvent(new CustomEvent("leadflow:session-expired", { detail: { portal: activePortal } }));
      const err = new Error("Session expired. Please log in again.");
      err.status = 401;
      throw err;
    }
  }

  if (!response.ok || json?.success === false) {
    const err = new Error(json?.message || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.errors = json?.errors;
    throw err;
  }

  return json?.data;
}

export const apiClient = {
  get: (path, opts) => apiRequest(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => apiRequest(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => apiRequest(path, { ...opts, method: "PATCH", body }),
  put: (path, body, opts) => apiRequest(path, { ...opts, method: "PUT", body }),
  delete: (path, opts) => apiRequest(path, { ...opts, method: "DELETE" }),
};

export { API_BASE_URL, getPortal, getTokens, setTokens, clearTokens };
