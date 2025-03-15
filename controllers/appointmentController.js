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
    console.log("🔹 req.user:", req.user); // ✅ Debugging log

    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized. Invalid token or missing user data." });
    }

    const guestId = req.user.id;  // ✅ Now safe to use
    const { propertyId, appointmentDate } = req.body;

    try {
        // ✅ Ensure the property exists
        const [property] = await db.query("SELECT * FROM properties WHERE id = $1", [propertyId]);

        if (property.rows.length === 0) {
            return res.status(404).json({ error: "Property not found." });
        }

        // ✅ Check if the appointment already exists
        const existing = await db.query(
            "SELECT * FROM appointments WHERE propertyId = $1 AND appointmentDate = $2",
            [propertyId, appointmentDate]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: "This time slot is already booked." });
        }

        // ✅ Insert new appointment
        await db.query(
            "INSERT INTO appointments (propertyId, guestId, appointmentDate) VALUES ($1, $2, $3)",
            [propertyId, guestId, appointmentDate]
        );

        res.status(201).json({ message: "Appointment booked successfully!" });
    } catch (error) {
        console.error("❌ Appointment Error:", error);
        res.status(500).json({ error: "Server error. Check logs." });
    }
};