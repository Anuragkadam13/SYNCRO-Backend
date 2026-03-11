const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  // 1. Get token from Header (Format: Bearer <token>)
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  try {
    // 2. Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check Role
    if (verified.role !== "admin") {
      return res.status(403).json({ message: "Access Denied. Admins only." });
    }

    req.user = verified; // Add user info to the request object
    next(); // Move to the next function (the actual task creation)
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = { verifyAdmin };
