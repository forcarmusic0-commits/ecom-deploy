// Wraps an async controller function so we don't need try/catch everywhere.
// Any thrown error/rejected promise is passed to Express's error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
