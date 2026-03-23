import ApiError from "./ApiError.js";

const errorHandler = (err, req, res, next) => {
  let { statusCode, message, data } = err;

  // If it's a generic error, default to 500
  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = err.message || "Internal Server Error";
  }

  // Build the response
  const response = {
    status: statusCode,
    message,
    //capture path and method from the request object automatically
    path: req.originalUrl || req.url, 
    method: req.method,
    ...(data && { data }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Log to EC2 console (PM2 logs)
  console.error(`[ERROR] ${response.method} ${response.path} >> ${statusCode}: ${message}`);

  res.status(statusCode).json(response);
};

export default errorHandler;