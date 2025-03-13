const db = require("../config/database");

exports.getAllProperties = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;  // Default limit = 10
  const offset = parseInt(req.query.offset) || 0;  // Default offset = 0

  try {
      const [properties] = await db.query(
          "SELECT * FROM properties WHERE verified = TRUE LIMIT ? OFFSET ?",
          [limit, offset]
      );
      res.json(properties);
  } catch (error) {
      res.status(500).json({ error: "Database error" });
  }
};



exports.getPropertyById = (req, res) => {
  const property = properties.find(p => p.id === parseInt(req.params.id));
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
};

exports.createProperty = (req, res) => {
  const newProperty = {
    id: properties.length + 1,
    title: req.body.title,
    description: req.body.description,
    images: req.body.images || [],
    ownerId: req.body.ownerId,
    verified: false,
    comments: [],
  };
  properties.push(newProperty);
  res.status(201).json(newProperty);
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
