const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Make sure JWT_SECRET comes from .env
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("🚨 ERROR: JWT_SECRET is missing! Check your .env file.");
    process.exit(1);  // Stop server if JWT_SECRET is missing
}

// REGISTER USER
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // Check if the email is already registered
        const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into database
        await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
            [name, email, hashedPassword, role || "guest"]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Database error" });
    }
};

// LOGIN USER
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = users[0];

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        console.log("🔹 Using JWT_SECRET:", JWT_SECRET); // ✅ Debugging line

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,  // ✅ Now this will always come from .env
            { expiresIn: process.env.JWT_EXPIRATION || "1h" }
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("❌ Database Error:", error);
        res.status(500).json({ error: "Database error" });
    }
};
