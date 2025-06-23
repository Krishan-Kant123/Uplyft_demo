import { type NextRequest, NextResponse } from "next/server"
import productsData from "@/data/products.json"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const maxPrice = searchParams.get("maxPrice")
    const minRating = searchParams.get("minRating")

    let filteredProducts = productsData

    if (category) {
      filteredProducts = filteredProducts.filter((product) =>
        product.category.toLowerCase().includes(category.toLowerCase()),
      )
    }

    if (maxPrice) {
      const price = Number.parseInt(maxPrice)
      filteredProducts = filteredProducts.filter((product) => product.price <= price)
    }

    if (minRating) {
      const rating = Number.parseFloat(minRating)
      filteredProducts = filteredProducts.filter((product) => product.rating >= rating)
    }

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
