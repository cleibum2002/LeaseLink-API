const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Property Routes
router.get("/", propertyController.getAllProperties);
router.post("/", authMiddleware.verifyToken, propertyController.createProperty);  // ✅ Protected
router.get("/:id", propertyController.getPropertyById);
router.post("/:id/comments", propertyController.addComment);

// ✅ Admin Route: Verify Property
router.post("/verify", authMiddleware.verifyToken, propertyController.verifyProperty);

module.exports = router;
