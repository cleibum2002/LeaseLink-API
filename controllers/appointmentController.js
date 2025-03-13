const db = require("../config/database");


exports.getAllAppointments = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM appointments");
        res.json(rows);
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Database error" });
    }
};


exports.bookAppointment = async (req, res) => {
  console.log("🔹 Incoming request for booking:");
  console.log("🔹 req.user:", req.user); // ✅ Debugging log to check if JWT works

  // ✅ Check if req.user exists
  if (!req.user || !req.user.id) {
      console.error("🚨 req.user is undefined or missing 'id'!");
      return res.status(401).json({ error: "Unauthorized. Invalid token or missing user data." });
  }

  const guestId = req.user.id;  // ✅ Now safe to use
  const { propertyId, appointmentDate } = req.body;

  try {
      // ✅ Check if the appointment already exists
      const [existing] = await db.query(
          "SELECT * FROM appointments WHERE propertyId = ? AND appointmentDate = ?",
          [propertyId, appointmentDate]
      );

      if (existing.length > 0) {
          return res.status(400).json({ error: "This time slot is already booked." });
      }

      // ✅ Insert new appointment
      await db.query(
          "INSERT INTO appointments (propertyId, guestId, appointmentDate) VALUES (?, ?, ?)",
          [propertyId, guestId, appointmentDate]
      );

      console.log("✅ Appointment successfully booked!");
      res.status(201).json({ message: "Appointment booked successfully!" });
  } catch (error) {
      console.error("❌ Appointment Error:", error);
      res.status(500).json({ error: "Server error. Check logs." });
  }
};
