import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET);

      req.user = decoded;
      console.log("Decoded user:", req.user);

      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
