module.exports = (req, res, next) => {
  if (req.user.userType !== "host") {
    return res.status(403).json({ message: "Access denied. Hosts only." });
  }
  next();
};