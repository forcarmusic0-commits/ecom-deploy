// Custom error class so controllers can throw errors with a status code
// e.g. throw new ApiError(404, "Product not found")
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
