"""
FASTAPI ROUTES
==============

Defines API endpoints for the chatbot:
- POST /chat - Process user message
- GET /health - Health check
- GET /intents - List available intents
- POST /train - Retrain classifier
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from main import ChatbotEngine

# Pydantic models for request/response
class ChatRequest(BaseModel):
    """Request body for /chat endpoint"""
    message: str

    class Config:
        example = {'message': '2 kg rice chahiye'}


class ChatResponse(BaseModel):
    """Response body from /chat endpoint"""
    user_message: str
    language: str
    translated_text: str
    intent: Optional[str]
    confidence: float
    entities: dict
    reply: str
    quick_replies: List[str]


class HealthResponse(BaseModel):
    """Response from /health endpoint"""
    status: str
    message: str


# Initialize FastAPI app
app = FastAPI(
    title='VyaparAI Chatbot Engine',
    description='AI Chatbot for WhatsApp Business Assistant',
    version='1.0.0'
)

# Initialize chatbot engine (global instance)
chatbot_engine = None


@app.on_event('startup')
async def startup_event():
    """Initialize chatbot engine on startup"""
    global chatbot_engine
    print('Starting chatbot engine...')
    chatbot_engine = ChatbotEngine()


@app.get('/health', response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint

    Returns:
        dict: Status and message
    """
    return {
        'status': 'healthy',
        'message': 'Chatbot engine is running'
    }


@app.post('/chat', response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process user message through chatbot

    Args:
        request (ChatRequest): Message from user

    Returns:
        ChatResponse: Processed message with intent, entities, and reply

    Raises:
        HTTPException: If message is empty or processing fails
    """
    try:
        # Validate input
        if not request.message or len(request.message.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail='Message cannot be empty'
            )

        if len(request.message) > 1000:
            raise HTTPException(
                status_code=400,
                detail='Message too long (max 1000 characters)'
            )

        # Process message
        result = chatbot_engine.process_message(request.message)

        return ChatResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Error processing message: {str(e)}'
        )


@app.get('/intents', response_model=dict)
async def get_intents():
    """
    Get list of available intents

    Returns:
        dict: List of intents
    """
    intents = chatbot_engine.intent_classifier.INTENTS
    return {
        'intents': intents,
        'total': len(intents)
    }


@app.get('/products', response_model=dict)
async def get_products():
    """
    Get list of recognized products

    Returns:
        dict: List of products
    """
    products = chatbot_engine.entity_extractor.get_products()
    return {
        'products': products,
        'total': len(products)
    }


@app.post('/products/add', response_model=dict)
async def add_product(product_name: str):
    """
    Add new product to recognition

    Args:
        product_name (str): Product name to add

    Returns:
        dict: Success message
    """
    if not product_name or len(product_name.strip()) == 0:
        raise HTTPException(
            status_code=400,
            detail='Product name cannot be empty'
        )

    chatbot_engine.entity_extractor.add_product(product_name)

    return {
        'success': True,
        'message': f'Product "{product_name}" added successfully'
    }


@app.post('/train', response_model=dict)
async def retrain_model():
    """
    Retrain intent classifier

    Returns:
        dict: Training status
    """
    try:
        chatbot_engine.intent_classifier.retrain()
        return {
            'success': True,
            'message': 'Model retrained successfully'
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Retraining failed: {str(e)}'
        )


@app.get('/', response_model=dict)
async def root():
    """Welcome message and API info"""
    return {
        'name': 'VyaparAI Chatbot Engine',
        'version': '1.0.0',
        'description': 'AI Chatbot for WhatsApp Business',
        'endpoints': {
            'POST /chat': 'Process user message',
            'GET /health': 'Health check',
            'GET /intents': 'List available intents',
            'GET /products': 'List recognized products',
            'POST /products/add': 'Add new product',
            'POST /train': 'Retrain intent classifier'
        }
    }
