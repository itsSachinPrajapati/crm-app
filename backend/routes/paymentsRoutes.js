const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createPayment,
  getProjectPayments
} = require("../controllers/paymentsController");

// Create payment
router.post("/", authMiddleware, createPayment);

// Get payments for specific project
router.get("/project/:id", authMiddleware, getProjectPayments);

module.exports = router;