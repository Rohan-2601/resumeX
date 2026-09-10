import jwt from "jsonwebtoken";

export const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL ERROR: JWT_SECRET environment variable is not defined.");
  }
  return process.env.JWT_SECRET;
};

export const buildToken = (userId) => {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });
};
