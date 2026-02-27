const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("../controllers/activityController");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, controller.getProjectActivity);

module.exports = router;