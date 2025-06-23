import productsData from "@/data/products.json"

export interface Product {
  id: number
  title: string
  category: string
  price: number
  rating: number
  stock: number
  description: string
  image_url: string
}

export interface ChatMessage {
  id: string
  userId: string
  message: string
  isBot: boolean
  timestamp: Date
  products?: Product[]
}

// In-memory chat history storage (in real app, use database)
const chatHistory: ChatMessage[] = []

export function processUserMessage(userId: string, message: string): ChatMessage {
  // Store user message
  const userMessage: ChatMessage = {
    id: Date.now().toString(),
    userId,
    message,
    isBot: false,
    timestamp: new Date(),
  }
  chatHistory.push(userMessage)

  // Process message and generate bot response
  const botResponse = generateBotResponse(message)
  const botMessage: ChatMessage = {
    id: (Date.now() + 1).toString(),
    userId,
    message: botResponse.message,
    isBot: true,
    timestamp: new Date(),
    products: botResponse.products,
  }
  chatHistory.push(botMessage)

  return botMessage
}

function generateBotResponse(message: string): { message: string; products?: Product[] } {
  const lowerMessage = message.toLowerCase()

  // Greeting patterns
  if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
    return {
      message:
        "Hello! Welcome to our e-commerce store. I can help you find products. Try asking me something like 'show me phones under 50000' or 'find laptops'.",
    }
  }

  // Help patterns
  if (lowerMessage.includes("help")) {
    return {
      message:
        "I can help you find products! Here are some example queries:\n• 'Show me phones under 20000'\n• 'Find headphones'\n• 'Laptops with good rating'\n• 'Cheap earphones'\n• 'Gaming consoles'",
    }
  }

  // Extract product category
  const categories = [
    "mobiles",
    "phones",
    "headphones",
    "earphones",
    "laptops",
    "tablets",
    "smartwatches",
    "watches",
    "cameras",
    "gaming",
  ]
  let matchedCategory = ""

  for (const category of categories) {
    if (lowerMessage.includes(category)) {
      matchedCategory = category
      break
    }
  }

  // Extract price range
  const priceMatch = lowerMessage.match(/under\s+(\d+)|below\s+(\d+)|less\s+than\s+(\d+)|(\d+)\s*k/i)
  let maxPrice = Number.POSITIVE_INFINITY

  if (priceMatch) {
    const price = Number.parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4])
    maxPrice = priceMatch[4] ? price * 1000 : price
  }

  // Filter products
  let filteredProducts = productsData as Product[]

  if (matchedCategory) {
    filteredProducts = filteredProducts.filter((product) => {
      const category = product.category.toLowerCase()
      if (matchedCategory === "phones" || matchedCategory === "mobiles") {
        return category.includes("mobile")
      }
      if (matchedCategory === "watches") {
        return category.includes("smartwatch")
      }
      return category.includes(matchedCategory)
    })
  }

  if (maxPrice !== Number.POSITIVE_INFINITY) {
    filteredProducts = filteredProducts.filter((product) => product.price <= maxPrice)
  }

  // Sort by rating and limit results
  filteredProducts = filteredProducts.sort((a, b) => b.rating - a.rating).slice(0, 6)

  if (filteredProducts.length > 0) {
    let responseMessage = `I found ${filteredProducts.length} product${filteredProducts.length > 1 ? "s" : ""}`

    if (matchedCategory) {
      responseMessage += ` in ${matchedCategory}`
    }

    if (maxPrice !== Number.POSITIVE_INFINITY) {
      responseMessage += ` under ₹${maxPrice.toLocaleString()}`
    }

    responseMessage += ". Here are the top results:"

    return {
      message: responseMessage,
      products: filteredProducts,
    }
  } else {
    return {
      message:
        "I couldn't find any products matching your criteria. Try searching for phones, laptops, headphones, tablets, smartwatches, cameras, or gaming products.",
    }
  }
}

export function getChatHistory(userId: string): ChatMessage[] {
  return chatHistory.filter((msg) => msg.userId === userId)
}

export function clearChatHistory(userId: string): void {
  const userMessages = chatHistory.filter((msg) => msg.userId !== userId)
  chatHistory.length = 0
  chatHistory.push(...userMessages)
}
