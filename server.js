require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const db = require("./config/database");

// Import routes
const propertyRoutes = require("./routes/propertyRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const messageRoutes = require("./routes/messageRoutes");  // ✅ Only defined once
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/properties", propertyRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/messages", messageRoutes);  // ✅ Keep this one
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to LeaseLink API!");
});

// ✅ Check Database Connection Before Starting the Server
async function testDBConnection() {
    try {
        await db.query("SELECT 1");
        console.log("✅ Database connected successfully");

        // Start server after successful DB connection
        app.listen(port, () => {
            console.log(`🚀 LeaseLink backend running on port ${port}`);
        });

    } catch (err) {
        console.error("❌ Database connection failed:", err);
        process.exit(1);  // Exit process if DB fails
    }
}

// Handle 404 errors for unknown routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});


testDBConnection();
