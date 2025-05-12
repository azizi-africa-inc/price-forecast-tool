import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Forward the request to your FastAPI backend
    // const apiUrl = process.env.BACKEND_URL || "/api"
    const apiUrl = "https://price-prediction.aziziafrica.com"
    console.log("API URL:", apiUrl)
    const response = await fetch(`${apiUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.detail || "Failed to fetch prediction" }, { status: response.status })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in prediction API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
