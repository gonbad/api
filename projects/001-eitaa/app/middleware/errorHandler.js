function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  const statusCode = err.statusCode || (err.message && err.message.includes('not found') ? 404 : 400);
  res.status(statusCode).json({
    statusCode,
    error: statusCode === 404 ? 'Not Found' : 'Bad Request',
    message: err.message || 'An unexpected error occurred',
  });
}

module.exports = {
  errorHandler,
};
