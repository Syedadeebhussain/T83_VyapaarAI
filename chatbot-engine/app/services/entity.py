
import re
from typing import Dict, Optional, List


class EntityExtractor:
    """Extracts entities (product, quantity) from messages"""

    # Common product names in India
    PRODUCTS = [
        'rice', 'wheat', 'flour', 'sugar', 'salt',
        'dal', 'lentils', 'beans', 'chickpeas',
        'oil', 'ghee', 'butter', 'milk',
        'spices', 'pepper', 'turmeric', 'cumin',
        'vegetables', 'onion', 'potato', 'tomato',
        'fruits', 'apple', 'mango', 'banana'
    ]

    # Quantity units
    UNITS = ['kg', 'gm', 'gram', 'gramme', 'litre', 'liter', 'ml', 'unit', 'units', 'pack', 'packs']

    @staticmethod
    def extract_quantity(text: str) -> Optional[float]:
        """
        Extract quantity from text

        Args:
            text (str): Input text

        Returns:
            float: Quantity number, or None if not found

        Examples:
            '2 kg rice' -> 2
            'five units' -> None (word number, not extracted)
            '0.5 litre milk' -> 0.5
        """
        # Pattern: number + optional decimal + optional unit
        pattern = r'(\d+\.?\d*)\s*(?:kg|gm|gram|litre|liter|ml|unit|units|pack|packs)?'

        matches = re.findall(pattern, text.lower())

        if matches:
            # Return first (most likely) quantity
            try:
                return float(matches[0])
            except (ValueError, IndexError):
                return None

        return None

    @staticmethod
    def extract_product(text: str) -> Optional[str]:
        """
        Extract product name from text

        Args:
            text (str): Input text

        Returns:
            str: Product name, or None if not found

        Examples:
            '2 kg rice' -> 'rice'
            'I want wheat' -> 'wheat'
            'Give me dal' -> 'dal'
        """
        text_lower = text.lower()

        # Check if any known product is mentioned
        for product in EntityExtractor.PRODUCTS:
            if product in text_lower:
                return product

        return None

    @staticmethod
    def extract_entities(text: str) -> Dict[str, Optional[str]]:
        """
        Extract all entities from message

        Args:
            text (str): Input message

        Returns:
            Dict with 'product' and 'quantity' keys

        Examples:
            '2 kg rice chahiye' -> {'product': 'rice', 'quantity': 2.0}
            'What is price' -> {'product': None, 'quantity': None}
        """
        product = EntityExtractor.extract_product(text)
        quantity = EntityExtractor.extract_quantity(text)

        return {
            'product': product,
            'quantity': quantity
        }

    @staticmethod
    def add_product(product_name: str):
        """
        Add new product to recognition list

        Args:
            product_name (str): Product to add
        """
        if product_name.lower() not in EntityExtractor.PRODUCTS:
            EntityExtractor.PRODUCTS.append(product_name.lower())

    @staticmethod
    def get_products() -> List[str]:
        """Get list of recognized products"""
        return EntityExtractor.PRODUCTS.copy()


# Example usage
if __name__ == '__main__':
    test_cases = [
        '2 kg rice chahiye',
        'I want 5 units wheat',
        '0.5 litre milk please',
        'What is the price',
        'Send me 3 packs of dal',
        'I need sugar'
    ]

    extractor = EntityExtractor()

    for text in test_cases:
        entities = extractor.extract_entities(text)
        print(f'Text: "{text}"')
        print(f'Entities: {entities}')
        print()
