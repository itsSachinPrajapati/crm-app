const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const adminOnly = require("../middleware/adminOnly");

router.get("/me", auth, userController.getMe);
router.put("/me", auth, userController.updateMe);
router.get("/team", auth, adminOnly, userController.getTeam);
router.post("/team", auth, adminOnly, userController.createEmployee);
router.put("/change-password", auth, userController.changePassword);
router.get("/", auth, userController.getWorkspaceUsers);

module.exports = router;