const express = require("express");
const router = express.Router();
const taskController = require("./task.controller");
const { authenticate } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/rbac.middleware");
const { checkOwnership } = require("../../middlewares/ownership.middleware");
const Task = require("../../models/Task.model");

router.use(authenticate);

router
  .route("/")
  .get(taskController.getTasks)
  .post(taskController.createTask);

router
  .route("/:id")
  .patch(checkOwnership(Task), taskController.updateTask)
  .delete(authorize("admin"), taskController.deleteTask);

router.patch("/:id/complete", checkOwnership(Task), taskController.completeTask);

module.exports = router;
