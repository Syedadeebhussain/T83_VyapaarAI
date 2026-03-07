// Language detection and translation mappings
export const detectLanguage = (text) => {
  // Simple language detection based on script and keywords
  const hindiKeywords = ["नमस्ते", "आप", "क्या", "कीमत", "कितना", "भेजो", "ऑर्डर", "स्टेटस", "अच्छा", "धन्यवाद", "जी", "हाँ"];
  const urduKeywords = ["السلام", "آپ", "کیا", "قیمت", "کتنا", "بھیجو", "آرڈر", "اسٹیٹس", "اچھا", "شکریہ", "جی", "ہاں", "مہربانی"];

  const hindiScore = hindiKeywords.filter(keyword => text.includes(keyword)).length;
  const urduScore = urduKeywords.filter(keyword => text.includes(keyword)).length;

  if (hindiScore > urduScore && hindiScore > 0) return "HINDI";
  if (urduScore > hindiScore && urduScore > 0) return "URDU";
  return "ENGLISH";
};

// Multi-language keyword mapping
const keywords = {
  GREETING: {
    ENGLISH: ["hi", "hello", "hey", "hiya", "greetings", "namaste"],
    HINDI: ["नमस्ते", "हेलो", "अरे", "सलाम", "नमस्कार"],
    URDU: ["السلام", "مرحبا", "سلام", "ہیلو", "آداب"]
  },
  PRODUCT_ENQUIRY: {
    ENGLISH: ["product", "what do you", "what products", "show", "available", "catalog", "menu"],
    HINDI: ["प्रोडक्ट", "क्या है", "क्या देते हो", "कौन सा", "दिखाओ", "मेनू"],
    URDU: ["پروڈکٹ", "کیا ہے", "کیا دیتے ہو", "دکھاؤ", "منو"]
  },
  PRICE_ENQUIRY: {
    ENGLISH: ["price", "cost", "how much", "rate", "expensive", "charges", "fee"],
    HINDI: ["कीमत", "कितना", "दाम", "भाव", "मूल्य", "खर्च"],
    URDU: ["قیمت", "کتنا", "دام", "رقم", "کرائے"]
  },
  PLACE_ORDER: {
    ENGLISH: ["order", "buy", "purchase", "want to buy", "give me", "send me", "i want"],
    HINDI: ["ऑर्डर", "खरीद", "दे", "भेज", "मुझे चाहिए", "लेना है"],
    URDU: ["آرڈر", "خریدنا", "دے", "بھیج", "مجھے چاہیے"]
  },
  ORDER_STATUS: {
    ENGLISH: ["status", "order status", "where is", "tracking", "delivered", "when will", "update"],
    HINDI: ["स्टेटस", "कहाँ है", "ट्रैकिंग", "कब आएगा", "अपडेट"],
    URDU: ["اسٹیٹس", "کہاں ہے", "کب آئے گا", "ترتیب"]
  },
  PAYMENT: {
    ENGLISH: ["payment", "pay", "transaction", "link", "upi", "card"],
    HINDI: ["भुगतान", "पेमेंट", "ट्रांजेक्शन", "लिंक"],
    URDU: ["ادائیگی", "پیمنٹ", "لنک"]
  }
};

export const detectIntent = (text, language = "ENGLISH") => {
  text = text.toLowerCase().trim();

  // Check each intent's keywords for the detected language
  for (const [intent, langKeywords] of Object.entries(keywords)) {
    const relevantKeywords = langKeywords[language] || langKeywords.ENGLISH;
    const matchCount = relevantKeywords.filter(keyword => text.includes(keyword.toLowerCase())).length;

    if (matchCount > 0) {
      return intent;
    }
  }

  return "UNKNOWN";
};

// Generate contextual replies based on language and intent
export const generateReply = (intent, language = "ENGLISH") => {
  const replies = {
    GREETING: {
      ENGLISH: "Hello 👋 Welcome to VyapaarAI! How can I help you today?",
      HINDI: "नमस्ते 👋 VyapaarAI में आपका स्वागत है! मैं आपकी कैसे मदद कर सकता हूँ?",
      URDU: "السلام علیکم 👋 VyapaarAI میں خوش آمدید! میں آپ کی کیسے مدد کر سکتا ہوں؟"
    },
    PRODUCT_ENQUIRY: {
      ENGLISH: "We offer premium products across multiple categories. You can ask about prices, place orders, or check order status. What would you like?",
      HINDI: "हम कई श्रेणियों में प्रीमियम प्रोडक्ट ऑफर करते हैं। आप कीमत पूछ सकते हैं, ऑर्डर दे सकते हैं। क्या चाहेंगे?",
      URDU: "ہم متعدد اقسام میں پریمیم مصنوعات پیش کرتے ہیں۔ آپ قیمت پوچھ سکتے ہیں، آرڈر دے سکتے ہیں۔ کیا چاہیں گے؟"
    },
    PRICE_ENQUIRY: {
      ENGLISH: "Our products start from ₹499. Let me know which product interests you, and I can give you the exact price.",
      HINDI: "हमारे प्रोडक्ट ₹499 से शुरू होते हैं। बताइए कौन सा प्रोडक्ट चाहिए, मैं सटीक कीमत दूंगा।",
      URDU: "ہماری مصنوعات ₹499 سے شروع ہوتی ہیں۔ بتائیں کون سی چیز چاہیے، میں صحیح قیمت دوں گا۔"
    },
    PLACE_ORDER: {
      ENGLISH: "Great! Let's create your order. Please reply with: Your Name, Phone Number, and Product Name.",
      HINDI: "शानदार! आपका ऑर्डर बना देते हैं। कृपया अपना नाम, फोन नंबर और प्रोडक्ट का नाम बताएं।",
      URDU: "بہترین! آپ کا آرڈر بناتے ہیں۔ براہ کرم اپنا نام، فون نمبر اور پروڈکٹ کا نام بتائیں۔"
    },
    ORDER_STATUS: {
      ENGLISH: "To check your order status, please share your Order ID or Phone Number.",
      HINDI: "आपके ऑर्डर की स्टेटस जानने के लिए अपना ऑर्डर ID या फोन नंबर दें।",
      URDU: "اپنے آرڈر کی حالت جاننے کے لیے اپنا آرڈر ID یا فون نمبر دیں۔"
    },
    PAYMENT: {
      ENGLISH: "Payment link has been sent to your WhatsApp. Please click on it to complete payment.",
      HINDI: "आपके WhatsApp पर पेमेंट लिंक भेज दिया गया है। पेमेंट करने के लिए क्लिक करें।",
      URDU: "آپ کے WhatsApp پر ادائیگی کا لنک بھیج دیا گیا ہے۔ ادائیگی کے لیے کلک کریں۔"
    },
    UNKNOWN: {
      ENGLISH: "Sorry, I didn't quite understand that. 😅 Can you rephrase? You can ask about products, prices, place an order, or check order status.",
      HINDI: "माफ़ी चाहता हूँ, मैं समझ नहीं पाया। 😅 कृपया दोबारा पूछें। आप प्रोडक्ट, कीमत, ऑर्डर या स्टेटस के बारे में पूछ सकते हैं।",
      URDU: "معاف کریں، میں نے سمجھا نہیں۔ 😅 براہ کرم دوبارہ پوچھیں۔ آپ پروڈکٹ، قیمت، آرڈر یا حالت کے بارے میں پوچھ سکتے ہیں۔"
    }
  };

  return replies[intent]?.[language] || replies[intent]?.ENGLISH || replies.UNKNOWN.ENGLISH;
};
