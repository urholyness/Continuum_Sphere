import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Natural color endpoint temporarily disabled for deployment. Use /api/eos/render.'
  }, { status: 501 })
}
