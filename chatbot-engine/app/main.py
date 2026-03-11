"""
MAIN CHATBOT ENGINE
===================

Orchestrates all chatbot services:
1. Language detection
2. Translation
3. Intent classification
4. Entity extraction
5. Response generation

Single point of entry for chatbot operations.
"""

from services.language import LanguageDetector
from services.translation import TranslationService
from services.intent import IntentClassifier
from services.entity import EntityExtractor
from services.response import ResponseGenerator


class ChatbotEngine:
    """Main chatbot orchestrator"""

    def __init__(self):
        """Initialize all services"""
        print('Initializing Chatbot Engine...')

        self.language_detector = LanguageDetector()
        self.translator = TranslationService()
        self.intent_classifier = IntentClassifier()
        self.entity_extractor = EntityExtractor()
        self.response_generator = ResponseGenerator()

        print('Chatbot Engine ready!')

    def process_message(self, user_message: str) -> dict:
        """
        Process user message through entire pipeline

        Args:
            user_message (str): Raw user input

        Returns:
            dict: Comprehensive response with all pipeline outputs
        """
        # Step 1: Detect language
        detected_language, is_english = self.language_detector.detect_language(user_message)

        # Step 2: Translate to English
        english_text = user_message
        if not is_english:
            english_text = self.translator.translate(user_message, detected_language)

        # Step 3: Classify intent
        intent_result = self.intent_classifier.classify(english_text)
        intent = intent_result['intent']
        confidence = intent_result['confidence']

        # Step 4: Extract entities
        entities = self.entity_extractor.extract_entities(english_text)

        # Step 5: Generate response
        reply = self.response_generator.generate_response(
            intent=intent,
            entities=entities,
            confidence=confidence
        )

        quick_replies = self.response_generator.get_quick_responses(intent)

        # Return comprehensive result
        return {
            'user_message': user_message,
            'language': detected_language,
            'translated_text': english_text,
            'intent': intent,
            'confidence': confidence,
            'entities': entities,
            'reply': reply,
            'quick_replies': quick_replies
        }


# Example usage
if __name__ == '__main__':
    engine = ChatbotEngine()

    test_messages = [
        'hello, how are you?',
        '2 kg rice chahiye',
        'Namaste, rice ki keemat kya hai?',
        'When will my order arrive?',
        'How to pay?',
        'This is spam message'
    ]

    print('\n' + '=' * 60)
    print('TESTING CHATBOT ENGINE')
    print('=' * 60 + '\n')

    for msg in test_messages:
        print(f'User: {msg}')
        result = engine.process_message(msg)

        print(f'Language: {result["language"]}')
        print(f'Translated: {result["translated_text"]}')
        print(f'Intent: {result["intent"]} (confidence: {result["confidence"]})')
        print(f'Entities: {result["entities"]}')
        print(f'Bot: {result["reply"]}')
        print(f'Quick replies: {result["quick_replies"]}')
        print('-' * 60 + '\n')
