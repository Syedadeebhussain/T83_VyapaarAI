exports.createOrder = (product, quantity) => {
  return {
    id: Date.now(),
    product,
    quantity,
    status: "pending",
  };
};
