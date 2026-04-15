const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
 

app.use(cors());
app.use(express.json());

const SECRET = "CeEX3BEcCuvqf8KZeGn00VbL";

// Razorpay instance
const razorpay = new Razorpay({
  key_id: "rzp_test_SdFGfWICW2alZ9",
  key_secret: SECRET
});

// temporary database
let payments = [];


// Create order API
app.post("/create-order", async (req, res) => {
    const options = {
      amount: 10000,
      currency: "INR"
    };

    const order = await razorpay.orders.create(options);

    console.log("Order created:", order);

    res.json(order);

});


// Verify payment API
app.post("/verify-payment", (req, res) => {

  const razorpay_order_id = req.body.razorpay_order_id;
  const razorpay_payment_id = req.body.razorpay_payment_id;
  const razorpay_signature = req.body.razorpay_signature;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const hmac = crypto.createHmac("sha256", SECRET);
  hmac.update(body);
  const expectedSignature = hmac.digest("hex");

  if (expectedSignature === razorpay_signature) {

    payments.push({
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: "paid"
    });

    console.log("Payment saved:", payments);

    return res.json({ status: "success" });

  } else {

    return res.json({ status: "failed" });

  }

});


// start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
