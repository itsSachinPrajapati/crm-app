const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createPayment,
  getProjectPayments,
  deletePayment
} = require("../controllers/paymentsController");

router.post("/", authMiddleware, createPayment);
router.get("/project/:id", authMiddleware, getProjectPayments);
router.delete("/:id", authMiddleware, deletePayment);

module.exports = router;