exports.validateProduct = (data) => {
  if (!data.name || !data.price) {
    return "Name and price required";
  }
  return null;
};
