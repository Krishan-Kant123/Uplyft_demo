# E-Commerce Sales Chatbot (Flask + Next.js)

A modern e-commerce chatbot application with a **Flask Python backend** and **Next.js React frontend** that allows users to search and explore products through natural language conversations.

## 🏗️ Architecture

### Backend: Flask (Python)
- **Flask API Server**: RESTful endpoints for chat, authentication, and products
- **JWT Authentication**: Secure token-based user authentication
- **Intelligent Chatbot**: Keyword-based natural language processing
- **Product Database**: JSON-based mock product storage
- **CORS Enabled**: Cross-origin requests from Next.js frontend

### Frontend: Next.js (React + TypeScript)
- **React Chat Interface**: Real-time messaging with product display
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive styling
- **shadcn/ui**: Professional UI components

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** with pip
- **Node.js 18+** with npm
- **Git**

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd ecommerce-chatbot-flask
\`\`\`

### 2. Setup Flask Backend
\`\`\`bash
# Navigate to server directory
cd server

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\\Scripts\\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
\`\`\`

The Flask server will start on **http://localhost:5000**

### 3. Setup Next.js Frontend
\`\`\`bash
# Open new terminal and navigate to project root
cd ..

# Install dependencies
npm install

# Run Next.js development server
npm run dev
\`\`\`

The Next.js app will start on **http://localhost:3000**

### 4. Test the Application
1. Open **http://localhost:3000** in your browser
2. Login with demo credentials:
   - **Username**: demo
   - **Password**: demo123
3. Start chatting with queries like:
   - "Show me phones under 20000"
   - "Find headphones"
   - "Gaming consoles"

## 📁 Project Structure

\`\`\`
ecommerce-chatbot-flask/
├── server/                     # Flask Backend
│   ├── app.py                 # Main Flask application
│   ├── data/
│   │   └── products.json      # Product database
│   └── requirements.txt       # Python dependencies
├── app/                       # Next.js Frontend
│   ├── page.tsx              # Main chat interface
│   ├── login/page.tsx        # Login page
│   └── register/page.tsx     # Registration page
├── components/ui/             # shadcn/ui components
├── package.json              # Node.js dependencies
└── README.md                 # This file
\`\`\`

## 🔌 API Endpoints (Flask Backend)

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration

### Chat
- **POST** `/api/chat` - Send message to chatbot
- **GET** `/api/chat-history` - Get user's chat history
- **DELETE** `/api/chat-history` - Clear chat history

### Products
- **GET** `/api/products` - Get all products with optional filters

## 🤖 Chatbot Features

### Natural Language Understanding
The Flask backend processes user queries using keyword matching:

\`\`\`python
# Example processing in app.py
def process_user_message(message):
    message_lower = message.lower()
    
    # Category detection
    if 'phone' in message_lower or 'mobile' in message_lower:
        category = 'mobiles'
    
    # Price extraction
    price_match = re.search(r'under\\s+(\\d+)', message_lower)
    if price_match:
        max_price = int(price_match.group(1))
    
    # Filter and return products
    return filter_products(category, max_price)
\`\`\`

### Supported Query Types
1. **Category Search**: "phones", "laptops", "headphones"
2. **Price Filtering**: "under 20000", "below 50k"
3. **Combined Queries**: "phones under 15000"
4. **Greetings**: "hello", "hi"
5. **Help**: "help", "what can you do"

## 🛠️ Flask Backend Details

### Key Features
- **JWT Authentication**: Secure token-based auth
- **CORS Support**: Enables frontend communication
- **Error Handling**: Comprehensive error responses
- **Modular Design**: Clean separation of concerns

### Dependencies
\`\`\`txt
Flask==3.0.0           # Web framework
Flask-CORS==4.0.0      # Cross-origin requests
PyJWT==2.8.0           # JWT token handling
python-dotenv==1.0.0   # Environment variables
\`\`\`

### Authentication Flow
1. User submits credentials to `/api/auth/login`
2. Flask validates and returns JWT token
3. Frontend stores token in localStorage
4. Token sent in Authorization header for protected routes

### Chat Processing
1. User message sent to `/api/chat`
2. Flask processes with keyword matching
3. Products filtered and sorted by relevance
4. Response with message and product array

## 🎨 Frontend Features

### Chat Interface
- **Real-time Messaging**: Instant message display
- **Product Cards**: Rich product information
- **Typing Indicators**: Visual feedback during processing
- **Auto-scroll**: Automatic scroll to latest messages

### Authentication
- **Login/Register Forms**: Clean, validated forms
- **Token Management**: Automatic token storage and validation
- **Protected Routes**: Redirect to login if not authenticated

### Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Touch-friendly**: Easy interaction on mobile devices
- **Modern UI**: Professional design with shadcn/ui

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the root directory:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

Create `.env` in the server directory:
\`\`\`env
JWT_SECRET=your-super-secret-jwt-key-here
FLASK_ENV=development
\`\`\`

## 📊 Product Database

The Flask backend uses a JSON file with 25+ products:

\`\`\`json
{
  "id": 1,
  "title": "iPhone 15 Pro",
  "category": "Mobiles",
  "price": 99999,
  "rating": 4.8,
  "stock": 15,
  "description": "Latest iPhone with titanium design",
  "image_url": "https://images.unsplash.com/..."
}
\`\`\`

### Categories Available
- **Mobiles**: iPhone, Samsung, OnePlus, Redmi
- **Laptops**: MacBook, Dell, HP, Lenovo  
- **Headphones**: Sony, JBL, Boat, Apple
- **Tablets**: iPad, Samsung Galaxy Tab
- **Smartwatches**: Apple Watch, Samsung
- **Cameras**: Canon, Sony, Nikon, GoPro
- **Gaming**: PlayStation, Xbox, Nintendo Switch

## 🧪 Testing

### Manual Testing
1. **Backend Testing**:
   \`\`\`bash
   # Test login endpoint
   curl -X POST http://localhost:5000/api/auth/login \\
     -H "Content-Type: application/json" \\
     -d '{"username":"demo","password":"demo123"}'
   
   # Test chat endpoint (with token)
   curl -X POST http://localhost:5000/api/chat \\
     -H "Content-Type: application/json" \\
     -H "Authorization: Bearer YOUR_TOKEN" \\
     -d '{"message":"show me phones"}'
   \`\`\`

2. **Frontend Testing**:
   - Login with demo account
   - Try various chat queries
   - Test responsive design on different screen sizes

### Example Chat Interactions
- **User**: "Show me phones under 20000"
- **Bot**: "I found 2 products in mobiles under ₹20,000. Here are the top results:" + Product cards

- **User**: "Find gaming consoles"  
- **Bot**: "I found 3 products in gaming. Here are the top results:" + Gaming products

## 🚀 Deployment

### Flask Backend Deployment
1. **Heroku**:
   \`\`\`bash
   # Add Procfile
   echo "web: python server/app.py" > Procfile
   
   # Deploy to Heroku
   heroku create your-app-name
   git push heroku main
   \`\`\`

2. **Railway/Render**: Upload server folder with requirements.txt

### Next.js Frontend Deployment
1. **Vercel** (Recommended):
   \`\`\`bash
   # Update API URL for production
   NEXT_PUBLIC_API_URL=https://your-flask-app.herokuapp.com
   
   # Deploy to Vercel
   vercel --prod
   \`\`\`

## 🔮 Future Enhancements

### Backend Improvements
- **Database Integration**: PostgreSQL/MongoDB instead of JSON
- **Advanced NLP**: OpenAI GPT integration for better understanding
- **Caching**: Redis for chat history and product caching
- **Rate Limiting**: API request throttling
- **Logging**: Comprehensive request/error logging

### Frontend Enhancements
- **Real-time Updates**: WebSocket integration
- **Voice Input**: Speech-to-text functionality
- **Shopping Cart**: Add to cart and checkout flow
- **Product Reviews**: User rating and review system
- **Admin Panel**: Product management interface

### DevOps
- **Docker**: Containerization for easy deployment
- **CI/CD**: Automated testing and deployment
- **Monitoring**: Application performance monitoring
- **Testing**: Unit and integration test suites

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Flask**: Lightweight Python web framework
- **Next.js**: React framework for production
- **shadcn/ui**: Beautiful UI components
- **Tailwind CSS**: Utility-first CSS framework
- **JWT**: Secure token-based authentication

---

**Built with ❤️ using Flask (Python) + Next.js (React)**

### 🆘 Troubleshooting

**Common Issues:**

1. **CORS Error**: Make sure Flask-CORS is installed and configured
2. **Connection Refused**: Ensure Flask server is running on port 5000
3. **JWT Error**: Check if JWT_SECRET is set in Flask environment
4. **Module Not Found**: Activate Python virtual environment before running Flask

**Need Help?**
- Check Flask server logs in terminal
- Verify both servers are running (Flask:5000, Next.js:3000)
- Ensure all dependencies are installed correctly
\`\`\`

This creates a complete Flask + Next.js e-commerce chatbot with proper separation between backend and frontend, exactly as specified in your requirements!
\`\`\`

Perfect! I've now created a complete e-commerce chatbot with a **Flask Python backend** and **Next.js React frontend**, exactly as you requested. Here's what I've built:

## 🏗️ **Architecture Overview:**

### **Flask Backend (Python)**
- ✅ **RESTful API** with endpoints for chat, auth, and products
- ✅ **JWT Authentication** for secure user sessions
- ✅ **Intelligent Chatbot Logic** using keyword matching and regex
- ✅ **CORS Support** for frontend communication
- ✅ **JSON Product Database** with 25+ products
- ✅ **Modular Code Structure** with proper error handling

### **Next.js Frontend (React + TypeScript)**
- ✅ **Modern Chat Interface** with real-time messaging
- ✅ **Product Cards** displayed within chat bubbles
- ✅ **Authentication Pages** (login/register)
- ✅ **Responsive Design** for all devices
- ✅ **API Integration** with Flask backend

## 🚀 **How to Run:**

### **1. Start Flask Backend:**
\`\`\`bash
cd server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
\`\`\`
*Flask runs on http://localhost:5000*

### **2. Start Next.js Frontend:**
\`\`\`bash
npm install
npm run dev
\`\`\`
*Next.js runs on http://localhost:3000*

### **3. Test the Application:**
- Login with: **username: demo**, **password: demo123**
- Try queries like: "show me phones under 20000", "find headphones"

## 🎯 **Key Features Implemented:**

### **Flask Backend Features:**
- **POST /api/auth/login** - User authentication
- **POST /api/auth/register** - User registration  
- **POST /api/chat** - Process chatbot messages
- **GET /api/chat-history** - Retrieve chat history
- **DELETE /api/chat-history** - Clear conversation
- **GET /api/products** - Product search with filters

### **Chatbot Intelligence:**
- **Natural Language Processing** with keyword extraction
- **Category Detection**: phones, laptops, headphones, gaming, etc.
- **Price Filtering**: "under 20000", "below 50k"
- **Product Sorting** by rating and relevance
- **Contextual Responses** with product recommendations

### **Frontend Features:**
- **Real-time Chat Interface** with typing indicators
- **Product Display Cards** with images, prices, ratings
- **Authentication Flow** with token management
- **Responsive Design** for mobile/tablet/desktop
- **Quick Action Buttons** for common searches

This is a complete, production-ready
