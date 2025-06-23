from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import json
import os
import re
from functools import wraps

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['SECRET_KEY'] = os.environ.get('JWT_SECRET', 'your-secret-key-here')

# Load products data
def load_products():
    try:
        with open('server/data/products.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Mock users database (in production, use a real database)
users_db = [
    {"id": "1", "username": "demo", "email": "demo@example.com", "password": "demo123"}
]

# Chat history storage (in production, use a real database)
chat_history = []

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = next((user for user in users_db if user['id'] == data['user_id']), None)
            
            if not current_user:
                return jsonify({'error': 'Invalid token'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Find user
        user = next((u for u in users_db if u['username'] == username and u['password'] == password), None)
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': user['id'],
            'username': user['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            }
        })
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists
        if any(u['username'] == username or u['email'] == email for u in users_db):
            return jsonify({'error': 'Username or email already exists'}), 409
        
        # Create new user
        new_user = {
            'id': str(len(users_db) + 1),
            'username': username,
            'email': email,
            'password': password  # In production, hash this password
        }
        users_db.append(new_user)
        
        # Generate JWT token
        token = jwt.encode({
            'user_id': new_user['id'],
            'username': new_user['username'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': new_user['id'],
                'username': new_user['username'],
                'email': new_user['email']
            }
        })
        
    except Exception as e:
        print(f"Register error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat', methods=['POST'])
@token_required
def chat(current_user):
    try:
        data = request.get_json()
        message = data.get('message')
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Store user message
        user_message = {
            'id': str(len(chat_history) + 1),
            'user_id': current_user['id'],
            'message': message,
            'is_bot': False,
            'timestamp': datetime.datetime.utcnow().isoformat()
        }
        chat_history.append(user_message)
        
        # Process message and generate bot response
        bot_response = process_user_message(message)
        
        bot_message = {
            'id': str(len(chat_history) + 1),
            'user_id': current_user['id'],
            'message': bot_response['message'],
            'is_bot': True,
            'timestamp': datetime.datetime.utcnow().isoformat(),
            'products': bot_response.get('products', [])
        }
        chat_history.append(bot_message)
        
        return jsonify(bot_message)
        
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat-history', methods=['GET'])
@token_required
def get_chat_history(current_user):
    try:
        user_history = [msg for msg in chat_history if msg['user_id'] == current_user['id']]
        return jsonify(user_history)
    except Exception as e:
        print(f"Chat history error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/chat-history', methods=['DELETE'])
@token_required
def clear_chat_history(current_user):
    try:
        global chat_history
        chat_history = [msg for msg in chat_history if msg['user_id'] != current_user['id']]
        return jsonify({'success': True})
    except Exception as e:
        print(f"Clear chat history error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        products = load_products()
        
        # Filter by query parameters
        category = request.args.get('category')
        max_price = request.args.get('maxPrice')
        min_rating = request.args.get('minRating')
        
        if category:
            products = [p for p in products if category.lower() in p['category'].lower()]
        
        if max_price:
            try:
                max_price = float(max_price)
                products = [p for p in products if p['price'] <= max_price]
            except ValueError:
                pass
        
        if min_rating:
            try:
                min_rating = float(min_rating)
                products = [p for p in products if p['rating'] >= min_rating]
            except ValueError:
                pass
        
        return jsonify(products)
        
    except Exception as e:
        print(f"Products error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def process_user_message(message):
    """Process user message and return bot response with products"""
    products = load_products()
    message_lower = message.lower()
    
    # Greeting patterns
    if any(word in message_lower for word in ['hello', 'hi', 'hey']):
        return {
            'message': "Hello! Welcome to our e-commerce store. I can help you find products. Try asking me something like 'show me phones under 50000' or 'find laptops'."
        }
    
    # Help patterns
    if 'help' in message_lower:
        return {
            'message': "I can help you find products! Here are some example queries:\n• 'Show me phones under 20000'\n• 'Find headphones'\n• 'Laptops with good rating'\n• 'Cheap earphones'\n• 'Gaming consoles'"
        }
    
    # Extract product category
    categories = {
        'mobiles': ['mobile', 'phone'],
        'headphones': ['headphone'],
        'earphones': ['earphone', 'earbud'],
        'laptops': ['laptop'],
        'tablets': ['tablet'],
        'smartwatches': ['smartwatch', 'watch'],
        'cameras': ['camera'],
        'gaming': ['gaming', 'console', 'playstation', 'xbox', 'nintendo']
    }
    
    matched_category = None
    for category, keywords in categories.items():
        if any(keyword in message_lower for keyword in keywords):
            matched_category = category
            break
    
    # Extract price range
    price_patterns = [
        r'under\s+(\d+)',
        r'below\s+(\d+)',
        r'less\s+than\s+(\d+)',
        r'(\d+)\s*k'
    ]
    
    max_price = float('inf')
    for pattern in price_patterns:
        match = re.search(pattern, message_lower)
        if match:
            price = int(match.group(1))
            if 'k' in pattern:
                price *= 1000
            max_price = price
            break
    
    # Filter products
    filtered_products = products.copy()
    
    if matched_category:
        if matched_category == 'mobiles':
            filtered_products = [p for p in filtered_products if 'mobile' in p['category'].lower()]
        elif matched_category == 'smartwatches':
            filtered_products = [p for p in filtered_products if 'smartwatch' in p['category'].lower()]
        else:
            filtered_products = [p for p in filtered_products if matched_category.rstrip('s') in p['category'].lower()]
    
    if max_price != float('inf'):
        filtered_products = [p for p in filtered_products if p['price'] <= max_price]
    
    # Sort by rating and limit results
    filtered_products = sorted(filtered_products, key=lambda x: x['rating'], reverse=True)[:6]
    
    if filtered_products:
        response_message = f"I found {len(filtered_products)} product{'s' if len(filtered_products) > 1 else ''}"
        
        if matched_category:
            response_message += f" in {matched_category}"
        
        if max_price != float('inf'):
            response_message += f" under ₹{max_price:,}"
        
        response_message += ". Here are the top results:"
        
        return {
            'message': response_message,
            'products': filtered_products
        }
    else:
        return {
            'message': "I couldn't find any products matching your criteria. Try searching for phones, laptops, headphones, tablets, smartwatches, cameras, or gaming products."
        }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
