

from langdetect import detect, LangDetectException
from typing import Tuple


class LanguageDetector:
    """Detects input text language"""

    # Language code mapping
    LANGUAGE_MAP = {
        'en': 'English',
        'hi': 'Hindi',
        'ur': 'Urdu'
    }

    SUPPORTED_LANGUAGES = ['en', 'hi', 'ur']

    @staticmethod
    def detect_language(text: str) -> Tuple[str, bool]:
        """
        Detect language of input text

        Args:
            text (str): Input text to analyze

        Returns:
            Tuple[str, bool]: (language_name, is_english)
                - language_name: 'English', 'Hindi', 'Urdu', or 'Unknown'
                - is_english: True if language is English
        """
        if not text or len(text.strip()) == 0:
            return 'Unknown', False

        try:
            # Detect language code
            detected_code = detect(text)

            # Check if language is supported
            if detected_code not in LanguageDetector.SUPPORTED_LANGUAGES:
                return 'Unknown', False

            # Map code to language name
            language_name = LanguageDetector.LANGUAGE_MAP.get(
                detected_code, 'Unknown'
            )
            is_english = detected_code == 'en'

            return language_name, is_english

        except LangDetectException:
            # If detection fails, assume English
            return 'Unknown', False

    @staticmethod
    def is_english(text: str) -> bool:
        """
        Quick check if text is in English

        Args:
            text (str): Input text

        Returns:
            bool: True if English
        """
        _, is_eng = LanguageDetector.detect_language(text)
        return is_eng


# Example usage
if __name__ == '__main__':
    test_cases = [
        'Hello, how are you?',
        'Namaste, aap kaise ho?',
        'Assalamu alaikum, tum kaisa ho?',
        '2 kg rice chahiye',
        'What is the price?'
    ]

    detector = LanguageDetector()

    for text in test_cases:
        lang, is_eng = detector.detect_language(text)
        print(f'Text: "{text}"')
        print(f'Language: {lang}, Is English: {is_eng}')
        print()
