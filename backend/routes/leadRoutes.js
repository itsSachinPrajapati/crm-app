const express = require("express");
const router = express.Router();

const leadController = require("../controllers/leadController");
const authMiddleware = require("../middleware/authMiddleware");
const leadNoteController = require("../controllers/leadNoteController")
router.get("/:id", authMiddleware, leadController.getLeadById);

router.post("/", authMiddleware, leadController.createLead);
router.get("/", authMiddleware, leadController.getLeads);

router.put("/:id", authMiddleware, leadController.updateLead);
router.delete("/:id", authMiddleware, leadController.deleteLead);
router.patch("/:id/status",authMiddleware,leadController.updateLeadStatus)
router.post("/:id/notes", authMiddleware, leadNoteController.addNote);
router.get("/:id/notes", authMiddleware, leadNoteController.getLeadNotes);
router.get("/notes", authMiddleware, leadNoteController.getAllNotes);
router.delete("/notes/:noteId", authMiddleware, leadNoteController.deleteNote);

module.exports = router;

