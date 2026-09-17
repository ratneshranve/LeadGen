const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const validate = require("../../middlewares/validate.middleware");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { createUserSchema, updateUserSchema } = require("./user.validation");

const upload = require("../../middlewares/upload.middleware");

router.use(authenticate);

router.patch("/avatar", upload.single("avatar"), userController.updateAvatar);
router.patch("/:id/avatar", upload.single("avatar"), userController.updateUserAvatarById);

router
  .route("/")
  .get(authorize("admin", "manager"), userController.getUsers)
  .post(authorize("admin"), validate(createUserSchema), userController.createUser);

router
  .route("/:id")
  .get(userController.getUserById)
  .patch(validate(updateUserSchema), userController.updateUser)
  .delete(authorize("admin"), userController.deleteUser);

router.patch("/:id/toggle-status", authorize("admin"), userController.toggleUserStatus);

module.exports = router;
