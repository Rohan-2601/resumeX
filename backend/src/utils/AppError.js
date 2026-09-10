class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguish from programmer errors
    
    // Capture stack trace (excluding the constructor call itself)
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
