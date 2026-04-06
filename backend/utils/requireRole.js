const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = String(req.user.role || "").trim().toLowerCase();
    const normalizedRoles = allowedRoles.map((role) =>
      String(role).trim().toLowerCase()
    );

    if (!normalizedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  };
};

export default requireRole;