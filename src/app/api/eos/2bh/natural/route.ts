import { NextResponse } from 'next/server'

// Temporarily disabled to avoid bundling optional deps during Vercel build.
// Natural color will be provided via the Render API or via a server-side
// integration once axios/@aws-sdk are installed.
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Natural color endpoint is temporarily disabled for deployment. Use /api/eos/render for tiles.'
  }, { status: 501 })
}


