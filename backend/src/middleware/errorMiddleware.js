import { ZodError } from "zod";
import AppError from "../utils/AppError.js";

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedErrors = {};
    err.errors.forEach((e) => {
      // The path usually looks like ['body', 'username']
      const field = e.path.length > 1 ? e.path[e.path.length - 1] : e.path[0];
      formattedErrors[field] = e.message;
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // 2. Mongoose Bad ObjectId (CastError)
  if (err.name === "CastError") {
    const message = "Invalid resource ID";
    error = new AppError(message, 400);
  }

  // 3. Mongoose Duplicate Key Error
  if (err.code === 11000) {
    // Attempt to extract the field that caused the duplicate error
    const field = Object.keys(err.keyValue)[0];
    const message = field
      ? `A resource with that ${field} already exists`
      : "A resource with these values already exists";
    error = new AppError(message, 409);
  }

  // 4. Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    error = new AppError(message, 400);
  }

  // Final structured response
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  // Log non-operational errors safely on the server side
  if (!error.isOperational && statusCode === 500) {
    console.error("🔥 [UNEXPECTED ERROR]:", err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : message,
    ...(error.details && { details: error.details }),
  });
};

export default errorMiddleware;
