const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("../controllers/requirementController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, controller.createRequirement);
router.get("/", auth, controller.getRequirements);
router.patch("/:id/status", auth, controller.updateRequirementStatus);
router.delete("/:id", auth, controller.deleteRequirement);
router.patch("/:id", auth, controller.updateRequirement);

module.exports = router;