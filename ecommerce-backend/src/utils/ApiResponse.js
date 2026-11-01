// Consistent success response shape across the whole API
const sendResponse = (res, statusCode, message, data = null, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...extra,
  });
};

module.exports = sendResponse;
