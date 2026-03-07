// 📝 VYAPAARAI CHATBOT API - TESTING GUIDE
// Copy these commands to test all endpoints

// ========== TEST 1: GREETING MESSAGE (ENGLISH) ==========
POST http://localhost:4000/api/webhook/whatsapp
Content-Type: application/json

{
  "senderId": "919876543210",
  "senderName": "John Doe",
  "message": "Hello! I'm looking for products"
}

// Expected Response:
// {
//   "status": "ok",
//   "intent": "GREETING",
//   "language": "ENGLISH",
//   "reply": "Hello 👋 Welcome to VyapaarAI! How can I help you today?"
// }

// ========== TEST 2: HINDI MESSAGE ==========
POST http://localhost:4000/api/webhook/whatsapp
Content-Type: application/json

{
  "senderId": "919876543211",
  "senderName": "राज कुमार",
  "message": "नमस्ते! कीमत क्या है?"
}

// Expected Response:
// {
//   "status": "ok",
//   "intent": "PRICE_ENQUIRY",
//   "language": "HINDI",
//   "reply": "हमारे प्रोडक्ट ₹499 से शुरू होते हैं..."
// }

// ========== TEST 3: URDU MESSAGE ==========
POST http://localhost:4000/api/webhook/whatsapp
Content-Type: application/json

{
  "senderId": "919876543212",
  "senderName": "علی احمد",
  "message": "السلام! قیمت کتنی ہے؟"
}

// ========== TEST 4: PLACE ORDER ==========
POST http://localhost:4000/api/webhook/whatsapp
Content-Type: application/json

{
  "senderId": "919876543213",
  "senderName": "Priya Singh",
  "message": "I want to buy a product"
}

// Expected Response:
// {
//   "status": "ok",
//   "intent": "PLACE_ORDER",
//   "language": "ENGLISH",
//   "reply": "Great! Let's create your order...",
//   "orderId": "...",
//   "paymentLink": "https://pay.vyapaarai.com/link/..."
// }

// ========== TEST 5: GET ALL ORDERS (DASHBOARD) ==========
GET http://localhost:4000/api/orders

// Expected Response:
// {
//   "total": 1,
//   "orders": [
//     {
//       "_id": "...",
//       "customerId": "919876543213",
//       "customerName": "Priya Singh",
//       "status": "PENDING",
//       "paymentLink": "...",
//       "createdAt": "2026-02-18T..."
//     }
//   ]
// }

// ========== TEST 6: GET ALL CONVERSATIONS ==========
GET http://localhost:4000/api/conversations

// Expected Response:
// {
//   "total": 4,
//   "conversations": [
//     {
//       "_id": "...",
//       "customerId": "919876543213",
//       "customerName": "Priya Singh",
//       "lastMessage": "I want to buy a product",
//       "lastMessageTime": "2026-02-18T...",
//       "status": "ACTIVE"
//     }
//   ]
// }

// ========== TEST 7: GET CONVERSATION BY CUSTOMER ID ==========
GET http://localhost:4000/api/conversations/919876543213

// Expected Response:
// {
//   "_id": "...",
//   "customerId": "919876543213",
//   "customerName": "Priya Singh",
//   "messages": [...all messages from this customer...]
// }

// ========== TEST 8: GET CUSTOMER MESSAGES ==========
GET http://localhost:4000/api/messages/919876543213

// Expected Response:
// {
//   "customerId": "919876543213",
//   "total": 4,
//   "messages": [
//     {
//       "senderType": "CUSTOMER",
//       "text": "I want to buy a product",
//       "language": "ENGLISH",
//       "intent": "PLACE_ORDER",
//       "createdAt": "..."
//     },
//     {
//       "senderType": "BOT",
//       "text": "Great! Let's create your order...",
//       "createdAt": "..."
//     }
//   ]
// }

// ========== TEST 9: DASHBOARD STATS ==========
GET http://localhost:4000/api/dashboard/stats

// Expected Response:
// {
//   "stats": {
//     "totalOrders": 1,
//     "totalConversations": 4,
//     "totalMessages": 8,
//     "pendingOrders": 1,
//     "paidOrders": 0,
//     "todayOrders": 1
//   }
// }

// ========== TEST 10: UPDATE ORDER STATUS ==========
PATCH http://localhost:4000/api/orders/[ORDER_ID]
Content-Type: application/json

{
  "status": "COMPLETED"
}

// Expected Response:
// {
//   "_id": "...",
//   "customerId": "...",
//   "status": "COMPLETED",
//   "updatedAt": "2026-02-18T..."
// }

// ========== TEST 11: GET SPECIFIC ORDER ==========
GET http://localhost:4000/api/orders/[ORDER_ID]

// ========== TEST 12: GET ALL MESSAGES (ADMIN) ==========
GET http://localhost:4000/api/messages
