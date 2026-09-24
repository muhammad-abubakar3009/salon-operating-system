const jwt = require("jsonwebtoken");
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No Token Provided" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No Token Provided" });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decode;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or Expired token" });
  }
}

module.exports = authMiddleware;
