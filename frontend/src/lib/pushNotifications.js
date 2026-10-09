import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, deleteToken, isSupported } from "firebase/messaging";
import { apiClient } from "../api/client";

// Firebase web push (FCM). The backend (backend/src/services/fcm.service.js) sends to
// every device token stored on the user, so after login this registers the browser's
// token, and on logout removes it again.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const tokenStorageKey = (portal) => `leadflow_${portal}_fcm_token`;

const getMessagingIfSupported = async () => {
  if (!firebaseConfig.apiKey || !VAPID_KEY) {
    console.warn("[Push] Firebase web config missing (VITE_FIREBASE_*) - push notifications disabled.");
    return null;
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !(await isSupported())) {
    return null;
  }
  const app = getApps()[0] || initializeApp(firebaseConfig);
  return getMessaging(app);
};

/**
 * Ask for notification permission, get this browser's FCM token and register it
 * on the logged-in user of the given portal. Never throws - push is best-effort.
 */
export const enablePushNotifications = async (portal) => {
  try {
    const messaging = await getMessagingIfSupported();
    if (!messaging) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.info("[Push] Notification permission not granted.");
      return null;
    }

    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return null;

    await apiClient.post("/notifications/device-token", { deviceToken: token }, { portal });
    localStorage.setItem(tokenStorageKey(portal), token);
    return token;
  } catch (error) {
    console.warn("[Push] Could not enable push notifications:", error.message);
    return null;
  }
};

/**
 * Remove this browser's token from the user of the given portal (call before the
 * session tokens are cleared, since the request must be authenticated).
 */
export const disablePushNotifications = async (portal) => {
  const token = localStorage.getItem(tokenStorageKey(portal));
  if (!token) return;
  localStorage.removeItem(tokenStorageKey(portal));

  try {
    await apiClient.delete("/notifications/device-token", { portal, body: { deviceToken: token } });
  } catch (error) {
    console.warn("[Push] Could not remove device token:", error.message);
  }

  // Only drop the browser subscription when no other portal session still uses it
  const otherPortal = portal === "admin" ? "sales" : "admin";
  if (!localStorage.getItem(tokenStorageKey(otherPortal))) {
    try {
      const messaging = await getMessagingIfSupported();
      if (messaging) await deleteToken(messaging);
    } catch {
      /* best-effort */
    }
  }
};
