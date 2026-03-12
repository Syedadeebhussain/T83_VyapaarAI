from typing import Dict, Optional


class ResponseGenerator:
    """Generates chatbot responses based on intent and entities"""

    # Response templates for each intent
    TEMPLATES = {
        'GREETING': [
            'Hello! How can I help you today?',
            'Hi there! What can I do for you?',
            'Namaste! How may I assist you?'
        ],
        'PRICE': [
            'I can help you with pricing. Which product are you interested in?',
            'Sure! Let me check the price for {product}.',
            'The current price for {product} is available. Would you like to place an order?'
        ],
        'ORDER': [
            'Great! I can process your order for {quantity}kg {product}.',
            'Perfect! We have {product} in stock. Confirming order for {quantity} units.',
            'Your order for {quantity}kg {product} is being processed. You will receive a confirmation shortly.',
            'Order confirmed! {quantity}kg {product} will be delivered soon.'
        ],
        'DELIVERY': [
            'What is your order number? I can check the delivery status for you.',
            'Your order is being prepared and will be shipped soon.',
            'Delivery updates will be sent to you via WhatsApp shortly.'
        ],
        'PAYMENT': [
            'We accept multiple payment methods: UPI, Credit Card, Debit Card, and Bank Transfer.',
            'Payment can be made via: UPI (recommended), Cards, or Direct Bank Transfer.',
            'How would you like to pay? UPI is the fastest method.'
        ],
        'SCAM': [
            'This message appears suspicious. Please be cautious.',
            'This content looks like spam. We will report this.',
            'Alert: Please verify sender information before responding.'
        ],
        None: [
            'I did not understand that. Could you please rephrase?',
            'Can you say that again? I want to help you better.',
            'Sorry, I am not sure. Could you provide more details?'
        ]
    }

    @staticmethod
    def generate_response(
        intent: Optional[str],
        entities: Dict[str, Optional[str]] = None,
        confidence: float = 0.0
    ) -> str:
        """
        Generate response based on intent and entities

        Args:
            intent (str): Detected intent
            entities (Dict): Extracted entities (product, quantity)
            confidence (float): Classification confidence

        Returns:
            str: Generated response message
        """
        if entities is None:
            entities = {'product': None, 'quantity': None}

        # Handle low confidence
        if confidence < 0.3 and intent is not None:
            return ResponseGenerator.TEMPLATES[None][0]

        # Get template for intent
        templates = ResponseGenerator.TEMPLATES.get(intent, ResponseGenerator.TEMPLATES[None])

        # Select first template (can be randomized in production)
        template = templates[0]

        # Fill template with entities
        try:
            response = template.format(
                product=entities.get('product') or 'product',
                quantity=entities.get('quantity') or 'requested amount'
            )
        except KeyError:
            response = template

        return response

    @staticmethod
    def get_quick_responses(intent: Optional[str]) -> list:
        """
        Get suggested quick reply buttons for user

        Args:
            intent (str): Current intent

        Returns:
            list: Quick response options
        """
        quick_replies = {
            'GREETING': ['View products', 'Check price', 'Place order'],
            'PRICE': ['View all products', 'Place order', 'Need help?'],
            'ORDER': ['Proceed to payment', 'Check delivery', 'Need more?'],
            'DELIVERY': ['Check payment status', 'Contact support', 'Back'],
            'PAYMENT': ['Confirm payment', 'Use different method', 'Cancel order'],
            'SCAM': ['Report issue', 'Contact support', 'Block sender'],
            None: ['Start over', 'Speak with agent', 'Help']
        }

        return quick_replies.get(intent, quick_replies[None])


# Example usage
if __name__ == '__main__':
    test_cases = [
        {
            'intent': 'GREETING',
            'entities': {'product': None, 'quantity': None},
            'confidence': 0.9
        },
        {
            'intent': 'ORDER',
            'entities': {'product': 'rice', 'quantity': 2.0},
            'confidence': 0.95
        },
        {
            'intent': 'PRICE',
            'entities': {'product': 'wheat', 'quantity': None},
            'confidence': 0.88
        },
        {
            'intent': None,
            'entities': {'product': None, 'quantity': None},
            'confidence': 0.2
        },
    ]

    generator = ResponseGenerator()

    for test in test_cases:
        response = generator.generate_response(
            test['intent'],
            test['entities'],
            test['confidence']
        )
        quick_replies = generator.get_quick_responses(test['intent'])

        print(f'Intent: {test["intent"]} (confidence: {test["confidence"]})')
        print(f'Response: {response}')
        print(f'Quick replies: {quick_replies}')
        print()
