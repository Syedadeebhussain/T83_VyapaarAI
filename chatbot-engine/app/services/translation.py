"""
TRANSLATION SERVICE
===================

Purpose: Translate Hindi/Urdu text to English

How it works:
1. Uses transformers library with MarianMT models
2. Lazy loads models on first use (saves memory)
3. Supports Hindi→English and Urdu→English translation
4. Caches loaded models for performance

Why MarianMT:
- Lightweight and fast
- Good accuracy for Indic languages
- Works offline (no API required)
"""

from typing import Optional


class TranslationService:
    """Handles text translation from Hindi/Urdu to English"""

    # Model names for translation
    MODELS = {
        'Hindi': 'Helsinki-NLP/Opus-MT-hi-en',
        'Urdu': 'Helsinki-NLP/Opus-MT-ur-en'
    }

    # Cache for loaded models and tokenizers
    _model_cache = {}
    _tokenizer_cache = {}

    @staticmethod
    def translate(text: str, source_language: str) -> str:
        """
        Translate text from Hindi/Urdu to English

        Args:
            text (str): Text to translate
            source_language (str): 'Hindi' or 'Urdu'

        Returns:
            str: Translated English text or original if unsupported language
        """
        if source_language == 'English' or source_language == 'Unknown':
            return text

        if source_language not in TranslationService.MODELS:
            return text

        try:
            # Import here to avoid loading if not needed
            from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

            model_name = TranslationService.MODELS[source_language]

            # Load tokenizer (with caching)
            if source_language not in TranslationService._tokenizer_cache:
                print(f'Loading tokenizer for {source_language}...')
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                TranslationService._tokenizer_cache[source_language] = tokenizer
            else:
                tokenizer = TranslationService._tokenizer_cache[source_language]

            # Load model (with caching)
            if source_language not in TranslationService._model_cache:
                print(f'Loading translation model for {source_language}...')
                model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
                TranslationService._model_cache[source_language] = model
            else:
                model = TranslationService._model_cache[source_language]

            # Tokenize input
            inputs = tokenizer(text, return_tensors='pt', max_length=512, truncation=True)

            # Generate translation
            translated = model.generate(**inputs, max_length=512)

            # Decode output
            translated_text = tokenizer.decode(translated[0], skip_special_tokens=True)

            return translated_text

        except Exception as e:
            print(f'Translation error: {e}')
            return text


# Example usage
if __name__ == '__main__':
    test_cases = [
        ('Hindi', '2 kg rice chahiye'),
        ('Hindi', 'Rice ki keemat kya hai?'),
        ('Urdu', 'Mujhe 5 kg ata chahiye'),
        ('English', 'I want 2 kg rice'),
    ]

    translator = TranslationService()

    for lang, text in test_cases:
        translated = translator.translate(text, lang)
        print(f'Language: {lang}')
        print(f'Original: {text}')
        print(f'Translated: {translated}')
        print()
