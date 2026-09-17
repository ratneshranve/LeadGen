const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);

router.get("/analytics", authorize("admin", "manager"), categoryController.getCategoryAnalytics);

router
  .route("/")
  .get(categoryController.getCategories)
  .post(authorize("admin"), categoryController.createCategory);

router
  .route("/:id")
  .patch(authorize("admin"), categoryController.updateCategory);

router.patch("/:id/toggle-status", authorize("admin"), categoryController.toggleCategoryStatus);

module.exports = router;
