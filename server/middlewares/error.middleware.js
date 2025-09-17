const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
