const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");

router.use(authenticate);

router.get("/analytics", authorize("admin", "manager"), productController.getProductAnalytics);
router.patch("/assign-to-lead", productController.assignProductsToLead);

router
  .route("/")
  .get(productController.getProducts)
  .post(authorize("admin"), productController.createProduct);

router
  .route("/:id")
  .patch(authorize("admin"), productController.updateProduct);

router.patch("/:id/toggle-status", authorize("admin"), productController.toggleProductStatus);

module.exports = router;
