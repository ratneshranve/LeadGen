const { initializeApp, cert } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const config = require("./env");
const logger = require("../src/utils/logger");

let firebaseApp = null;
let messaging = null;

const projectId = config.firebase.projectId;
const clientEmail = config.firebase.clientEmail;
const privateKey = config.firebase.privateKey
  ? config.firebase.privateKey.replace(/\\n/g, "\n")
  : null;

if (
  projectId &&
  clientEmail &&
  privateKey &&
  projectId !== "your_firebase_project_id"
) {
  try {
    firebaseApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    messaging = getMessaging(firebaseApp);
    logger.info(`✅ Firebase Admin SDK initialized successfully [Project: ${projectId}]`);
  } catch (error) {
    logger.error(`❌ Firebase SDK initialization failed: ${error.message}`);
  }
} else {
  logger.warn(
    "⚠️ Firebase credentials not fully configured in environment. FCM push notification service operating in fallback mode."
  );
}

module.exports = {
  firebaseApp,
  getMessagingInstance: () => messaging,
  isConfigured: () => Boolean(messaging),
};
