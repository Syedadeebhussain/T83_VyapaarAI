export type Language = "hindi" | "english" | "urdu" | "unknown";
export type Intent =
  | "greeting"
  | "order"
  | "query"
  | "complaint"
  | "payment"
  | "spam"
  | "unknown";

interface NlpResult {
  language: Language;
  intent: Intent;
  isSpam: boolean;
  entities: Record<string, unknown>;
}

const HINDI_PATTERNS = [
  /[^\u0000-\u007F\u0080-\u00FF]/,
  /\b(namaste|namaskar|kaise|hai|hain|kya|mujhe|chahiye|order|nahi|haan|accha|theek|dhanyawad)\b/i,
];

const URDU_PATTERNS = [
  /[\u0600-\u06FF]/,
  /\b(salam|salaam|kiya|main|chahta|chahiye|mujhe)\b/i,
];

const GREETING_PATTERNS =
  /\b(hello|hi|hey|namaste|namaskar|salaam|salam|good morning|good evening|good afternoon|hii|helo)\b/i;

const ORDER_PATTERNS =
  /\b(order|buy|purchase|want|need|chahiye|lena|bhejo|bhej|deliver|delivery|send|ek|do|teen|char|panch|quantity)\b/i;

const COMPLAINT_PATTERNS =
  /\b(problem|issue|complaint|wrong|broken|damaged|not working|refund|cancel|worst|terrible|horrible|khraab|galat)\b/i;

const PAYMENT_PATTERNS =
  /\b(payment|pay|paid|paisa|rupee|rupees|rs|amount|bill|invoice|link|upi|gpay|phonepe|paytm)\b/i;

const QUERY_PATTERNS =
  /\b(price|cost|available|stock|timing|hours|when|where|how|what|which|kitna|kab|kahan|kya)\b/i;

const SPAM_PATTERNS =
  /\b(click here|free money|lottery|winner|prize|forex|crypto|invest|million|billion|casino|adult)\b/i;

const PRODUCT_PATTERN =
  /\b(\d+)\s*(kg|gram|gm|litre|ltr|piece|pcs|pack|packet|dozen|set|bottle|can)\s+([a-zA-Z\s]+)/gi;

export function detectLanguage(text: string): Language {
  for (const pattern of URDU_PATTERNS) {
    if (pattern.test(text)) return "urdu";
  }
  for (const pattern of HINDI_PATTERNS) {
    if (pattern.test(text)) return "hindi";
  }
  if (/[a-zA-Z]/.test(text)) return "english";
  return "unknown";
}

export function classifyIntent(text: string): Intent {
  const lower = text.toLowerCase();
  if (SPAM_PATTERNS.test(lower)) return "spam";
  if (GREETING_PATTERNS.test(lower)) return "greeting";
  if (COMPLAINT_PATTERNS.test(lower)) return "complaint";
  if (PAYMENT_PATTERNS.test(lower)) return "payment";
  if (ORDER_PATTERNS.test(lower)) return "order";
  if (QUERY_PATTERNS.test(lower)) return "query";
  return "unknown";
}

export function detectSpam(text: string): boolean {
  return SPAM_PATTERNS.test(text.toLowerCase());
}

export function extractEntities(text: string): Record<string, unknown> {
  const entities: Record<string, unknown> = {};
  const products: Array<{ quantity: string; unit: string; product: string }> = [];
  let match: RegExpExecArray | null;

  const productRegex = new RegExp(PRODUCT_PATTERN.source, PRODUCT_PATTERN.flags);
  while ((match = productRegex.exec(text)) !== null) {
    products.push({
      quantity: match[1],
      unit: match[2],
      product: match[3]?.trim() ?? "",
    });
  }

  if (products.length > 0) {
    entities.products = products;
  }

  const phoneMatch = text.match(/\b(\+91|91)?[6-9]\d{9}\b/);
  if (phoneMatch) {
    entities.phone = phoneMatch[0];
  }

  const amountMatch = text.match(/(?:rs\.?|rupee[s]?|₹)\s*(\d+(?:\.\d{1,2})?)/i);
  if (amountMatch) {
    entities.amount = parseFloat(amountMatch[1] ?? "0");
  }

  return entities;
}

export function processMessage(text: string): NlpResult {
  const language = detectLanguage(text);
  const intent = classifyIntent(text);
  const isSpam = detectSpam(text);
  const entities = extractEntities(text);

  return { language, intent, isSpam, entities };
}
