class ApiError extends Error {
  constructor(statusCode, message = "An unexpected error occurred", data = null, path = null, method = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.path = path;     // Added: The API Endpoint (e.g., /api/users)
    this.method = method; // Added: The HTTP Method (e.g., POST)
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }

  // Static helpers remain clean but now accept more info if needed
  static badRequest(msg, data, path, method) {
    return new ApiError(400, msg, data, path, method);
  }

  static notFound(msg = "Resource not found", path, method) {
    return new ApiError(404, msg, null, path, method);
  }
}

export default ApiError;