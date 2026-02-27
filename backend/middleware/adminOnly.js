module.exports = (req, res, next) => {
  console.log("User from auth middleware:", req.user);

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};