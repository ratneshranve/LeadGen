const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", notificationController.getNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

router.post("/device-token", notificationController.registerDeviceToken);
router.delete("/device-token", notificationController.removeDeviceToken);

module.exports = router;
