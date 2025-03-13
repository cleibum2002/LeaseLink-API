const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/authMiddleware");  // ✅ Import JWT Middleware

router.get("/", appointmentController.getAllAppointments);
router.post("/", authMiddleware.verifyToken, appointmentController.bookAppointment);  // ✅ Add auth check

module.exports = router;
