# VyapaarAI Chatbot Backend 🚀

A complete Node.js backend for WhatsApp-based AI chatbot with multi-language support, order management, and admin dashboard.

## ✨ Features

### 🤖 Chatbot Intelligence
- **Multi-Language Support**: English, Hindi, Urdu
- **Advanced Intent Detection**: Greeting, Product Enquiry, Price Enquiry, Place Order, Order Status
- **Smart Replies**: Context-aware responses in customer's language
- **Conversation History**: Full message tracking with timestamps

### 📦 Order Management
- **Automated Order Creation**: From chat interface
- **Payment Link Generation**: Unique payment links per order
- **Order Status Tracking**: PENDING, PAYMENT_SENT, PAID, COMPLETED
- **Customer Information**: Name, phone, items, pricing

### 📊 Admin Dashboard APIs
- **View All Orders**: Complete order list with filters
- **Conversation Management**: Access all customer conversations
- **Message History**: Track every message exchange
- **Dashboard Stats**: Real-time metrics and analytics

### 💳 Payment Integration Ready
- **Stub for Payment Gateway**: Ready for Razorpay/Stripe integration
- **Payment Status Tracking**: Pending, Verified, Failed
- **Payment Link Distribution**: Via WhatsApp messages

## 📁 Project Structure

```
vyapaarai-backend/
├── package.json              # Dependencies
├── .env                      # Environment variables
├── API_TESTING.md           # API testing guide
├── README.md                # This file
└── src/
    ├── server.js            # Express server setup
    ├── db.js               # MongoDB connection
    ├── models.js           # Mongoose schemas (Order, Message, Conversation)
    ├── language.js         # Multi-language NLP
    ├── payment.js          # Payment service
    ├── whatsapp.js         # WhatsApp integration stub
    ├── controllers.js      # Request handlers
    └── routes.js           # API routes
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or cloud)
- npm/yarn

### Installation

```bash
cd vyapaarai-backend
npm install
```

### Configuration

Update `.env`:
```env
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/vyapaarai
```

### Run Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

Server will be running at `http://localhost:4000`

## 📡 API Endpoints

### WhatsApp Webhook
```
POST /api/webhook/whatsapp

Request Body:
{
  "senderId": "919876543210",
  "senderName": "John Doe",
  "message": "Hello! I want to buy a product"
}

Response:
{
  "status": "ok",
  "intent": "PLACE_ORDER",
  "language": "ENGLISH",
  "reply": "Great! Let's create your order..."
}
```

### Orders Management
```
GET /api/orders                    # Get all orders
GET /api/orders/:orderId           # Get specific order
PATCH /api/orders/:orderId         # Update order status
```

### Conversations
```
GET /api/conversations             # Get all conversations
GET /api/conversations/:customerId # Get customer conversation
```

### Messages
```
GET /api/messages                  # Get all messages
GET /api/messages/:customerId      # Get customer messages
```

### Dashboard
```
GET /api/dashboard/stats           # Get dashboard statistics
```

## 🧪 Testing with Postman

### Test 1: English Greeting
```json
POST http://localhost:4000/api/webhook/whatsapp

{
  "senderId": "919876543210",
  "senderName": "John Doe",
  "message": "Hi there! What products do you have?"
}
```

### Test 2: Hindi Price Enquiry
```json
POST http://localhost:4000/api/webhook/whatsapp

{
  "senderId": "919876543211",
  "senderName": "राज",
  "message": "नमस्ते! कीमत क्या है?"
}
```

### Test 3: Urdu Order Placement
```json
POST http://localhost:4000/api/webhook/whatsapp

{
  "senderId": "919876543212",
  "senderName": "علی",
  "message": "مجھے ایک آرڈر دینا ہے"
}
```

### Test 4: Get Dashboard Stats
```
GET http://localhost:4000/api/dashboard/stats
```

## 🎯 Intent Detection

The chatbot recognizes these intents:

| Intent | English | Hindi | Urdu |
|--------|---------|-------|------|
| GREETING | hi, hello, hey | नमस्ते, हेलो | السلام, مرحبا |
| PRODUCT_ENQUIRY | product, show | प्रोडक्ट, दिखाओ | پروڈکٹ, دکھاؤ |
| PRICE_ENQUIRY | price, cost | कीमत, कितना | قیمت, کتنا |
| PLACE_ORDER | order, buy | ऑर्डर, खरीद | آرڈر, خریدنا |
| ORDER_STATUS | status, tracking | स्टेटस, कहाँ है | اسٹیٹس, کہاں ہے |

## 📚 Language Support

- **English**: Full keyword support
- **Hindi**: Devanagari script keywords
- **Urdu**: Urdu script keywords

Easily extend in `src/language.js`

## 💾 Database Schemas

### Order
```javascript
{
  customerId: String,
  customerName: String,
  customerPhone: String,
  items: [String],
  totalPrice: Number,
  status: String, // PENDING, PAYMENT_SENT, PAID, COMPLETED
  paymentLink: String,
  paymentId: String,
  paymentStatus: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  customerId: String,
  customerName: String,
  customerPhone: String,
  senderType: String, // CUSTOMER or BOT
  text: String,
  language: String, // ENGLISH, HINDI, URDU
  intent: String,
  createdAt: Date
}
```

### Conversation
```javascript
{
  customerId: String,
  customerName: String,
  customerPhone: String,
  messages: [Message],
  lastMessage: String,
  lastMessageTime: Date,
  status: String, // ACTIVE, CLOSED
  createdAt: Date
}
```

## 🔄 Next Steps - Integration

1. **WhatsApp API Integration**: Connect to Meta/Twilio WhatsApp API
2. **Payment Gateway**: Integrate Razorpay or Stripe
3. **Admin Dashboard Frontend**: React/Vue dashboard for order management
4. **Customer App**: Mobile app for order tracking
5. **Email/SMS Notifications**: Order status updates
6. **Analytics**: Advanced reporting and insights

## 🛠️ Configuration Examples

### MongoDB Cloud (Atlas)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vyapaarai
```

### Razorpay Integration (payment.js)
```javascript
// Add your Razorpay API key
const razorpay = require('razorpay');
const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
```

## 📊 Dashboard Example

Admin can see:
- Total orders, conversations, messages
- Pending and paid orders
- Today's orders count
- Customer conversation history
- Real-time message logs

## 🚨 Error Handling

All endpoints return proper HTTP status codes:
- `200`: Success
- `400`: Bad request
- `404`: Not found
- `500`: Server error

## 📝 Logging

Server logs:
- WhatsApp messages received
- Intent detection results
- Payment link generation
- Order creation
- All API requests

## 🔐 Security Notes

1. Add authentication for dashboard APIs
2. Validate all input in production
3. Use environment variables for secrets
4. Rate limiting on webhook endpoint
5. HTTPS only in production

## 🎓 Perfect For

- College mini-projects
- Viva demonstrations
- Chatbot prototypes
- E-commerce integration
- Customer support automation

## 📞 Support

For issues or questions:
1. Check `API_TESTING.md` for endpoint examples
2. Verify MongoDB connection
3. Check server logs for errors
4. Ensure all dependencies are installed

## 📄 License

Open source - Use freely for educational purposes

---

**Built with ❤️ for VyapaarAI** 🚀
