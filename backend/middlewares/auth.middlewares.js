import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token =
        req.cookies?.token || req.headers["authorization"]?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // if roles array given, check if user type allowed
      if (roles.length && !roles.includes(decoded.type)) {
        return res.status(403).json({ error: "Access denied" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
};
