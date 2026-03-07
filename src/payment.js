// Payment service stub
// In production, integrate with Razorpay, Stripe, or your payment provider

export const generatePaymentLink = (orderId, amount, customerPhone) => {
  // Generate unique payment link
  const paymentId = `PAY_${orderId}_${Date.now()}`;
  
  // In production, this would be from your payment gateway
  const paymentLink = `https://pay.vyapaarai.com/link/${paymentId}?phone=${customerPhone}&amount=${amount}`;
  
  return {
    paymentId,
    paymentLink,
    expiresIn: "24h"
  };
};

export const verifyPayment = async (paymentId) => {
  // In production, verify with payment gateway API
  // For now, return mock data
  console.log(`Verifying payment: ${paymentId}`);
  return {
    status: "VERIFIED",
    amount: 499,
    transactionId: `TXN_${Date.now()}`
  };
};

export const sendPaymentLink = async (phone, paymentLink, amount) => {
  console.log(`💳 Payment link sent to ${phone}: ${paymentLink}`);
  console.log(`Amount: ₹${amount}`);
  // In production, send via WhatsApp API (Twilio, Meta API, etc.)
};
