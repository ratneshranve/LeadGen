const express = require("express");
const router = express.Router();
const uploadController = require("./upload.controller");
const upload = require("../../middlewares/upload.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");

router.use(authenticate);

router.post("/image", upload.single("file"), uploadController.uploadImage);
router.post("/document", upload.single("file"), uploadController.uploadDocument);
router.delete("/", uploadController.deleteAsset);

module.exports = router;
