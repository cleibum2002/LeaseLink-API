const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Ensure this matches .env

exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(403).json({ error: "Access denied. No token provided." });
    }

    try {
        console.log("🔹 Received Token:", token);

        // Remove "Bearer " prefix before verifying
        const cleanedToken = token.replace("Bearer ", "");
        const decoded = jwt.verify(cleanedToken, JWT_SECRET);

        console.log("✅ Token Verified:", decoded);
        
        req.user = decoded;  // Attach decoded user data to request
        next();
    } catch (error) {
        console.error("🚨 JWT Verification Error:", error.message);
        res.status(401).json({ error: "Invalid token" });
    }
};
