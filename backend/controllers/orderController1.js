const { createOrder } = require("../services/orderService");


exports.placeOrder = (req, res) => {
  const { product, quantity } = req.body;

  const order = createOrder(product, quantity);

  res.json({
    message: "Order placed successfully",
    order,
  });
};
