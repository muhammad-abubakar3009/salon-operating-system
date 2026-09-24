function requireOwner(req, res, next) {
  if (req.user.role !== "owner") {
    return res.status(403).json({ error: "Owners only" });
  }
  next();
}

module.exports = requireOwner;
