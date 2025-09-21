import { NextResponse } from 'next/server'

function toXYZ(lat: number, lng: number, z: number) {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, z))
  const y = Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, z)
  )
  return { x, y }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lat = Number(url.searchParams.get('lat'))
    const lng = Number(url.searchParams.get('lng'))
    const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10)
    let index = (url.searchParams.get('index') || 'NDVI').toUpperCase()
    // Render API reliably supports NDVI here; coerce unsupported bands to NDVI
    if (index !== 'NDVI') index = 'NDVI'
    const z = Number(url.searchParams.get('z') || '10')
    // Optional explicit MGRS tile, default to 2BH area (36 N YF)
    const tile = url.searchParams.get('tile') || '36/N/YF'

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ success: false, message: 'lat and lng are required' }, { status: 400 })
    }

    const [year, month, day] = date.split('-')
    const apiKey = process.env.EOS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'EOS_API_KEY not configured' }, { status: 500 })
    }

    // Try requested zoom first, then fallbacks to improve chances of a valid tile
    const zoomCandidates = Array.from(new Set([z, 10, 9, 8, 11, 12].filter(n => Number.isFinite(n))))
    let lastError: string | undefined
    for (const zoom of zoomCandidates) {
      const { x, y } = toXYZ(lat, lng, zoom)
      const renderUrl = `https://api-connect.eos.com/api/render/S2/${tile}/${year}/${Number(month)}/${Number(day)}/0/${index}/${zoom}/${x}/${y}?api_key=${apiKey}`
      try {
        const resp = await fetch(renderUrl)
        if (resp.ok) {
          const contentType = resp.headers.get('content-type') || 'image/png'
          const arrayBuffer = await resp.arrayBuffer()
          return new NextResponse(arrayBuffer, { headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' } })
        } else {
          const text = await resp.text()
          console.error('EOS Render failed', { renderUrl, status: resp.status, text })
          lastError = `Render ${resp.status}: ${text}`
        }
      } catch (e: any) {
        console.error('EOS Render fetch error', { renderUrl, error: e?.message })
        lastError = e?.message
      }
    }

    return NextResponse.json({ success: false, message: lastError || 'Render failed' }, { status: 502 })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Render error' }, { status: 500 })
  }
}


