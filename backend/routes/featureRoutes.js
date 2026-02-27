const express = require("express");
const router = express.Router({ mergeParams: true });

const controller = require("../controllers/featureController");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, controller.createFeature);
router.get("/", auth, controller.getFeatures);
router.delete("/:id", auth, controller.deleteFeature);

module.exports = router;