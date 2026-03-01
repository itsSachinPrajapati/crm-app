const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/summary", authMiddleware, dashboardController.getDashboardSummary);
router.get("/pipeline", authMiddleware, dashboardController.getLeadPipeline);
router.get("/revenue", authMiddleware, dashboardController.getRevenueOverview);
router.get("/recent", authMiddleware, dashboardController.getRecentData);
router.get("/full", authMiddleware, dashboardController.getFullDashboard);

module.exports = router;