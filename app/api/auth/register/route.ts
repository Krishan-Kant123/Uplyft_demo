import { type NextRequest, NextResponse } from "next/server"
import { registerUser, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const user = registerUser(username, email, password)

    if (!user) {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 })
    }

    const token = generateToken(user)

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Register API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
