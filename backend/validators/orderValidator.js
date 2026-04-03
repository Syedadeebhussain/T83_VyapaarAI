exports.validateOrder = (data) => {
  if (!data.product || !data.quantity) {
    return "Product and quantity required";
  }
  return null;
};
