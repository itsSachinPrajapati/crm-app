const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const clientController = require("../controllers/clientController");

router.post("/convert/:leadId", authMiddleware, clientController.convertLeadToClient);
router.get("/", authMiddleware, clientController.getAllClients);
router.get("/:id", authMiddleware, clientController.getClientById);
router.put("/:id", authMiddleware, clientController.updateClient);
router.delete("/:id", authMiddleware, clientController.deleteClient);

module.exports = router;