

import os
import pickle
import numpy as np
from typing import Optional, Dict
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


class IntentClassifier:
    """Classifies user message intent using TF-IDF + Logistic Regression"""

    INTENTS = ['GREETING', 'PRICE', 'ORDER', 'DELIVERY', 'PAYMENT', 'SCAM']

    def __init__(self, model_path: str = None):
        """
        Initialize intent classifier

        Args:
            model_path (str): Path to saved model pickle file
        """
        self.model_path = model_path or 'app/models/intent_model.pkl'
        self.model = None
        self._load_or_train_model()

    def _load_or_train_model(self):
        """Load existing model or train new one"""
        if os.path.exists(self.model_path):
            print(f'Loading model from {self.model_path}...')
            self._load_model()
        else:
            print('Model not found. Training new model...')
            self._train_model()

    def _train_model(self):
        """Train TF-IDF + Logistic Regression model"""
        try:
            # Load training data
            csv_path = 'data/training_data.csv'
            if not os.path.exists(csv_path):
                print(f'Warning: {csv_path} not found. Using minimal training.')
                self._create_minimal_model()
                return

            df = pd.read_csv(csv_path)
            X = df['text'].values
            y = df['intent'].values

            print(f'Training on {len(X)} examples with {len(set(y))} intents...')

            # Create pipeline: TF-IDF -> Logistic Regression
            self.model = Pipeline([
                ('tfidf', TfidfVectorizer(
                    lowercase=True,
                    max_features=500,
                    min_df=1,
                    max_df=1.0,
                    stop_words='english'
                )),
                ('classifier', LogisticRegression(
                    max_iter=200,
                    random_state=42,
                    multi_class='multinomial'
                ))
            ])

            # Train model
            self.model.fit(X, y)

            # Save model
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)

            print(f'Model trained and saved to {self.model_path}')

        except Exception as e:
            print(f'Error training model: {e}')
            self._create_minimal_model()

    def _create_minimal_model(self):
        """Create a minimal trained model for fallback"""
        X = [
            'hello', 'hi', 'thanks', 'goodbye',
            'price', 'cost', 'how much',
            'order', 'buy', 'need',
            'delivery', 'when', 'track',
            'payment', 'pay', 'card',
            'scam', 'fraud', 'spam'
        ]
        y = [
            'GREETING', 'GREETING', 'GREETING', 'GREETING',
            'PRICE', 'PRICE', 'PRICE',
            'ORDER', 'ORDER', 'ORDER',
            'DELIVERY', 'DELIVERY', 'DELIVERY',
            'PAYMENT', 'PAYMENT', 'PAYMENT',
            'SCAM', 'SCAM', 'SCAM'
        ]

        self.model = Pipeline([
            ('tfidf', TfidfVectorizer(lowercase=True, max_features=100)),
            ('classifier', LogisticRegression(max_iter=200, random_state=42))
        ])

        self.model.fit(X, y)
        print('Minimal model created')

    def _load_model(self):
        """Load model from pickle file"""
        try:
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            print(f'Model loaded successfully')
        except Exception as e:
            print(f'Error loading model: {e}. Training new model...')
            self._train_model()

    def classify(self, text: str) -> Dict[str, any]:
        """
        Classify message intent

        Args:
            text (str): Input text

        Returns:
            Dict with 'intent' and 'confidence'
        """
        if not text or len(text.strip()) == 0:
            return {
                'intent': None,
                'confidence': 0.0
            }

        try:
            # Predict intent
            intent = self.model.predict([text])[0]

            # Get confidence scores
            proba = self.model.predict_proba([text])[0]
            max_confidence = float(np.max(proba))

            return {
                'intent': intent,
                'confidence': round(max_confidence, 3)
            }

        except Exception as e:
            print(f'Classification error: {e}')
            return {
                'intent': None,
                'confidence': 0.0
            }

    def retrain(self, csv_path: str = 'data/training_data.csv'):
        """Retrain model with new data"""
        if os.path.exists(csv_path):
            self._train_model()
        else:
            print(f'Training file not found: {csv_path}')


# Example usage
if __name__ == '__main__':
    classifier = IntentClassifier()

    test_cases = [
        'hello how are you',
        'what is the price of rice',
        'I want to order 2 kg wheat',
        'when will my delivery arrive',
        'how to make payment',
        'this is a scam'
    ]

    for text in test_cases:
        result = classifier.classify(text)
        print(f'Text: "{text}"')
        print(f'Intent: {result["intent"]} (confidence: {result["confidence"]})')
        print()
