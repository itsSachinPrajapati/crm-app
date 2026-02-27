const express = require("express");
const router = express.Router({ mergeParams: true });

const memberController = require("../controllers/memberController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, memberController.getMembers);
router.post("/", authMiddleware, memberController.addMember);
router.patch("/:memberId", authMiddleware, memberController.updateMemberRole);
router.delete("/:memberId", authMiddleware, memberController.removeMember);

module.exports = router;