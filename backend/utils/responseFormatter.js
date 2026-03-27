exports.successResponse = (data) => {
  return {
    success: true,
    data,
  };
};

exports.errorResponse = (message) => {
  return {
    success: false,
    message,
  };
};
