import { type NextRequest, NextResponse } from "next/server"
import { saveBacktest, getBacktest, isValidBacktestData } from "@/lib/backtest-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`📥 GET request for backtest ID: ${params.id}`)
    const backtest = await getBacktest(params.id)
    return NextResponse.json(backtest)
  } catch (error) {
    console.error(`❌ Error getting backtest ${params.id}:`, error)
    return NextResponse.json({ error: "Backtest not found" }, { status: 404 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`📥 POST request for backtest ID: ${params.id}`)
    console.log(`🔗 Full URL: ${request.url}`)

    const body = await request.json()
    console.log(`📊 Data size: ${JSON.stringify(body).length} characters`)

    // Validate the backtest data
    if (!isValidBacktestData(body)) {
      console.log("❌ Invalid data structure")
      return NextResponse.json(
        {
          error: "Invalid backtest data format",
          details: "Los datos no tienen la estructura requerida",
        },
        { status: 400 },
      )
    }

    console.log("✅ Data is valid, saving...")

    // Save the backtest data
    await saveBacktest(params.id, body)

    console.log(`✅ Backtest ${params.id} saved successfully`)

    return NextResponse.json({
      success: true,
      id: params.id,
      message: "Backtest guardado correctamente",
    })
  } catch (error) {
    console.error("❌ Detailed error saving backtest:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack available")

    return NextResponse.json(
      {
        error: "Failed to save backtest data",
        details: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Añadir OPTIONS para CORS si es necesario
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
