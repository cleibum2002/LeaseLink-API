const properties = require("../controllers/propertyController").properties;

exports.verifyProperty = (req, res) => {
  const property = properties.find(p => p.id === parseInt(req.params.id));
  if (!property) return res.status(404).json({ error: "Property not found" });

  property.verified = true;
  res.json({ message: "Property verified", property });
};
