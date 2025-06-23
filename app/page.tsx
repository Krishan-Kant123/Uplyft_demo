"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, RotateCcw, LogOut, Star, ShoppingCart } from "lucide-react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface Product {
  id: number
  title: string
  category: string
  price: number
  rating: number
  stock: number
  description: string
  image_url: string
}

interface ChatMessage {
  id: string
  message: string
  is_bot: boolean
  timestamp: string
  products?: Product[]
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<{ username: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("token")
    const username = localStorage.getItem("username")

    if (!token || !username) {
      router.push("/login")
      return
    }

    setUser({ username })
    loadChatHistory()
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/chat-history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const history = await response.json()
        setMessages(history)

        // Add welcome message if no history
        if (history.length === 0) {
          setMessages([
            {
              id: "welcome",
              message:
                "Hello! Welcome to our e-commerce store. I can help you find products. Try asking me something like 'show me phones under 50000' or 'find laptops'.",
              is_bot: true,
              timestamp: new Date().toISOString(),
            },
          ])
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error)
      // Add welcome message on error
      setMessages([
        {
          id: "welcome",
          message:
            "Hello! Welcome to our e-commerce store. I can help you find products. Try asking me something like 'show me phones under 50000' or 'find laptops'.",
          is_bot: true,
          timestamp: new Date().toISOString(),
        },
      ])
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      is_bot: false,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      if (response.ok) {
        const botResponse = await response.json()
        setMessages((prev) => [...prev, botResponse])
      } else {
        throw new Error("Failed to get response")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message:
          "Sorry, I'm having trouble connecting to the server. Please make sure the Flask backend is running on port 5000.",
        is_bot: true,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const resetConversation = async () => {
    try {
      const token = localStorage.getItem("token")
      await fetch(`${API_BASE_URL}/api/chat-history`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setMessages([
        {
          id: "welcome",
          message:
            "Hello! Welcome to our e-commerce store. I can help you find products. Try asking me something like 'show me phones under 50000' or 'find laptops'.",
          is_bot: true,
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error("Failed to reset conversation:", error)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    router.push("/login")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">E-Commerce Assistant</h1>
            <p className="text-sm text-gray-500">Find products with AI help (Flask Backend)</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Welcome, {user.username}</span>
          <Button variant="outline" size="sm" onClick={resetConversation}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="w-4 h-4 mr-1" />
            Logout
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.is_bot ? "justify-start" : "justify-end"}`}>
            <div className={`flex max-w-4xl ${message.is_bot ? "flex-row" : "flex-row-reverse"}`}>
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className={message.is_bot ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}>
                  {message.is_bot ? "AI" : "U"}
                </AvatarFallback>
              </Avatar>

              <div className={`mx-3 ${message.is_bot ? "max-w-3xl" : "max-w-md"}`}>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.is_bot ? "bg-white border border-gray-200" : "bg-blue-600 text-white"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </div>

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {message.products.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <img
                            src={product.image_url || "/placeholder.svg"}
                            alt={product.title}
                            className="w-full h-32 object-cover rounded-md mb-3"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg?height=200&width=200"
                            }}
                          />
                          <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title}</h3>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>

                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span>{product.rating}</span>
                            </div>
                            <span>{product.stock} in stock</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-blue-600 text-white">AI</AvatarFallback>
              </Avatar>
              <div className="mx-3 bg-white border border-gray-200 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about products... (e.g., 'show me phones under 20000')"
            className="flex-1"
            disabled={isLoading}
          />
          <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage("Show me phones under 20000")}
            disabled={isLoading}
          >
            Phones under 20k
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInputMessage("Find headphones")} disabled={isLoading}>
            Headphones
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInputMessage("Show me laptops")} disabled={isLoading}>
            Laptops
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInputMessage("Gaming consoles")} disabled={isLoading}>
            Gaming
          </Button>
        </div>
      </div>
    </div>
  )
}
