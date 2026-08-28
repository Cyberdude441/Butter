import jwt from "jsonwebtoken";

const requireAuth = (req, res, next) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    req.user = { role: "guest", fullName: "Operator" };
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "butter-freight-session-secret-change-this");
    return next();
  } catch {
    req.user = { role: "guest", fullName: "Operator" };
    return next();
  }
};

export default requireAuth;
