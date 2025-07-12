import { type NextRequest, NextResponse } from "next/server"
import { getBacktest } from "@/lib/backtest-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const backtest = await getBacktest(params.id)

    // Set headers for file download
    const headers = new Headers()
    headers.set("Content-Type", "application/json")
    headers.set("Content-Disposition", `attachment; filename="backtest-${params.id}.json"`)

    return new NextResponse(JSON.stringify(backtest, null, 2), {
      status: 200,
      headers,
    })
  } catch (error) {
    return NextResponse.json({ error: "Backtest not found" }, { status: 404 })
  }
}
