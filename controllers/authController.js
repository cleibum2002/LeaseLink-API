const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SuperSecureKey123!@#";

if (!JWT_SECRET) {
    console.error("🚨 ERROR: JWT_SECRET is missing! Check your .env file.");
    process.exit(1);  // Stop server if JWT_SECRET is missing
}

// REGISTER USER
exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        console.log("🔹 Incoming Request:", req.body); // ✅ Debug incoming data

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        console.log("🔹 Query Result:", result.rows); // ✅ Debug existing users

        if (result.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔹 Hashed Password:", hashedPassword); // ✅ Debug password hash

        const insertQuery = "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *";
        const values = [name, email, hashedPassword, role || "guest"];

        const insertResult = await db.query(insertQuery, values);
        console.log("🔹 Insert Result:", insertResult.rows[0]); // ✅ Debug insert response

        res.status(201).json({ message: "User registered successfully", user: insertResult.rows[0] });
    } catch (error) {
        console.error("❌ Database Error on Register:", error);
        res.status(500).json({ error: "Database error", details: error.message });
    }
};


// LOGIN USER
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ Ensure email is lowercase (PostgreSQL is case-sensitive)
        const [users] = await db.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);

        if (users.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = users.rows[0];

        // ✅ Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // ✅ Generate JWT token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};