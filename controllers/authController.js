const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key";

if (!JWT_SECRET) {
    console.error("🚨 ERROR: JWT_SECRET is missing! Check your .env file.");
    process.exit(1);  // Stop server if JWT_SECRET is missing
}

// REGISTER USER
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        // ✅ Check if the email already exists (Fixed for PostgreSQL)
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // ✅ Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Insert user (Fixed for PostgreSQL)
        await db.query(
            "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
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
        // ✅ Use PostgreSQL syntax
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = result.rows[0];

        // ✅ Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // ✅ Generate a new JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }  // ✅ Extends JWT expiration to 7 days
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("❌ Database Error on Login:", error);
        res.status(500).json({ error: "Server error. Check logs." });
    }
};