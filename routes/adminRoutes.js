const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Protect booking with authentication
router.get("/", appointmentController.getAllAppointments);
router.post("/", authMiddleware.verifyToken, appointmentController.bookAppointment);

module.exports = router;
