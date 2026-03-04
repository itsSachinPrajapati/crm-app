const express = require("express");
const router = express.Router({ mergeParams: true });

const milestoneController = require("../controllers/milestoneController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, milestoneController.createMilestone);
router.get("/", authMiddleware, milestoneController.getMilestones);
router.put("/:id", authMiddleware, milestoneController.updateMilestone);
router.delete("/:id", authMiddleware, milestoneController.deleteMilestone);

module.exports = router;