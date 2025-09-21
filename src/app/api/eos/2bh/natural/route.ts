import { NextResponse } from 'next/server'
// Reuse existing EOS helpers (server-side only)
// JS modules are fine to import in TS routes in Next.js
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { getNaturalColor } from '../../../../../../services/eos/imagery.js'

// 2BH center coordinates
const CENTER = { lat: 0.5143, lng: 35.2698 }

function makeSquareGeometry(center: { lat: number; lng: number }, halfDeg = 0.01) {
  const { lat, lng } = center
  const minLng = lng - halfDeg
  const maxLng = lng + halfDeg
  const minLat = lat - halfDeg
  const maxLat = lat + halfDeg
  return {
    type: 'Polygon',
    coordinates: [[
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat]
    ]]
  }
}

function extractImageUrl(result: any): string | null {
  if (!result) return null
  const candidates = [
    result?.result_url,
    result?.url,
    result?.image_url,
    result?.image?.url,
    result?.download_url,
    result?.files?.[0]?.url,
    result?.data?.url
  ]
  return candidates.find(Boolean) || null
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const viewId = searchParams.get('view_id')
    const px = Number(searchParams.get('px') || '10')

    if (!viewId) {
      return NextResponse.json({
        success: false,
        message: 'Missing view_id. Use EOS Search API to find a suitable view_id for 2BH and pass ?view_id=...'
      }, { status: 400 })
    }

    const geometry = makeSquareGeometry(CENTER, 0.01)
    const result = await getNaturalColor(viewId, geometry, px)
    const imageUrl = extractImageUrl(result)

    return NextResponse.json({ success: true, imageUrl, raw: result })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to fetch natural color' }, { status: 500 })
  }
}


