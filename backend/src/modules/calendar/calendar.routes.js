const express = require("express");
const router = express.Router();
const calendarController = require("./calendar.controller");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);
router.get("/", calendarController.getCalendarFeed);

module.exports = router;
