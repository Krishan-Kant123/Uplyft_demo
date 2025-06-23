import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: string
  username: string
  email: string
}

// Mock users database
const users: User[] = [{ id: "1", username: "demo", email: "demo@example.com" }]

export function generateToken(user: User): string {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "24h",
  })
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = users.find((u) => u.id === decoded.userId)
    return user || null
  } catch {
    return null
  }
}

export function authenticateUser(username: string, password: string): User | null {
  // Simple authentication - in real app, hash passwords
  if (username === "demo" && password === "demo123") {
    return users[0]
  }
  return null
}

export function registerUser(username: string, email: string, password: string): User | null {
  // Check if user already exists
  if (users.find((u) => u.username === username || u.email === email)) {
    return null
  }

  const newUser: User = {
    id: (users.length + 1).toString(),
    username,
    email,
  }

  users.push(newUser)
  return newUser
}
