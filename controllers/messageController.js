const db = require("../config/database");

// SEND MESSAGE
exports.sendMessage = async (req, res) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id; // Get senderId from JWT token

    if (!receiverId || !content) {
        return res.status(400).json({ error: "Receiver ID and content are required." });
    }

    try {
        // ✅ Insert message into the database
        await db.query(
            "INSERT INTO messages (senderId, receiverId, content) VALUES (?, ?, ?)",
            [senderId, receiverId, content]
        );

        res.status(201).json({ message: "Message sent successfully!" });
    } catch (error) {
        console.error("❌ Message Error:", error);
        res.status(500).json({ error: "Server error. Check logs." });
    }
};

// GET ALL MESSAGES BETWEEN TWO USERS
exports.getMessages = async (req, res) => {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    try {
        const [messages] = await db.query(
            "SELECT * FROM messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ORDER BY timestamp ASC",
            [userId, otherUserId, otherUserId, userId]
        );

        // ✅ Format timestamps before sending the response
        const formattedMessages = messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp).toLocaleString("en-US", { timeZone: "Asia/Manila" })
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error("❌ Fetch Messages Error:", error);
        res.status(500).json({ error: "Database error" });
    }
};

