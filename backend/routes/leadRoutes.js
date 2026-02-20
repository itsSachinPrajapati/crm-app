const express = require("express");
const router = express.Router();

const leadController = require("../controllers/leadController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, leadController.createLead);
router.get("/", authMiddleware, leadController.getLeads);
router.put("/:id", authMiddleware, leadController.updateLead);
router.delete("/:id", authMiddleware, leadController.deleteLead);
router.get("/:id", authMiddleware, leadController.getLeadById);

module.exports = router;
