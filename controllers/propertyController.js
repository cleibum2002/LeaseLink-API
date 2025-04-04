const db = require("../config/database");

exports.getAllProperties = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;

  try {
      // ✅ Fix: Proper SQL syntax for PostgreSQL
      const properties = await db.query(
          "SELECT * FROM properties WHERE verified = TRUE LIMIT $1 OFFSET $2",
          [limit, offset]
      );

      res.json(properties.rows);  // ✅ Use `.rows` for PostgreSQL results
  } catch (error) {
      console.error("❌ Database Error:", error);
      res.status(500).json({ error: "Database error" });
  }
};




exports.getPropertyById = async (req, res) => {
    const propertyId = parseInt(req.params.id);  // ✅ Ensure it's an integer

    try {
        // ✅ Corrected SQL Query (PostgreSQL syntax)
        const result = await db.query("SELECT * FROM properties WHERE id = $1", [propertyId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Property not found" });
        }

        res.json(result.rows[0]);  // ✅ Return the first matching property
    } catch (error) {
        console.error("❌ Error fetching property by ID:", error);
        res.status(500).json({ error: "Database error" });
    }
};



exports.createProperty = async (req, res) => {
  const { title, description, images, ownerId } = req.body;

  try {
      // ✅ Fix: Use PostgreSQL syntax
      const result = await db.query(
          "INSERT INTO properties (title, description, images, ownerId, verified) VALUES ($1, $2, $3, $4, FALSE) RETURNING *",
          [title, description, JSON.stringify(images), ownerId]
      );

      res.status(201).json(result.rows[0]);  // ✅ Return the newly created property
  } catch (error) {
      console.error("❌ Error creating property:", error);
      res.status(500).json({ error: "Database error" });
  }
};



exports.addComment = (req, res) => {
  const property = properties.find(p => p.id === parseInt(req.params.id));
  if (!property) return res.status(404).json({ error: "Property not found" });

  const comment = {
    id: property.comments.length + 1,
    userId: req.body.userId,
    text: req.body.text,
    date: new Date(),
  };
  property.comments.push(comment);
  res.status(201).json(comment);
};

// ✅ Verify Property (Admins Only)
exports.verifyProperty = async (req, res) => {
  const adminId = req.user.id;

  // ✅ Ensure only admins can verify properties
  if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
  }

  const { propertyId } = req.body;

  // ✅ Check if propertyId is provided
  if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required." });
  }

  try {
      const [property] = await db.query(
          "SELECT * FROM properties WHERE id = ?",
          [propertyId]
      );

      // ✅ Check if the property exists
      if (property.length === 0) {
          return res.status(404).json({ error: "Property not found." });
      }

      // ✅ Mark property as verified
      await db.query(
          "UPDATE properties SET verified = TRUE WHERE id = ?",
          [propertyId]
      );

      res.json({ message: "Property verified successfully!" });
  } catch (error) {
      console.error("❌ Verification Error:", error);
      res.status(500).json({ error: "Server error. Check logs." });
  }
};
