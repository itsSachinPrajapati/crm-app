const express = require("express");
const router = express.Router({ mergeParams: true });

const milestoneController = require("../controllers/milestoneController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, milestoneController.createMilestone);
router.get("/", authMiddleware, milestoneController.getMilestones);
router.patch("/:id/status", authMiddleware, milestoneController.updateMilestoneStatus);
router.delete("/:id", authMiddleware, milestoneController.deleteMilestone);
router.put("/:id", authMiddleware, milestoneController.deleteMilestone);

module.exports = router;