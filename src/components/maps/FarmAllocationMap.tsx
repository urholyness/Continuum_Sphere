'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Satellite, 
  Thermometer, 
  Droplets, 
  Leaf, 
  Activity,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Layers,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface FarmData {
  id: string
  name: string
  location: string
  crop: string
  variety: string
  acreage: number
  coordinates: { lat: number; lng: number }
  metrics: {
    ndvi: number
    soil_moisture: number
    temperature: number
    lastUpdated: string
  }
  realTimeData: boolean
  certifications: string[]
  riskScore: number
  estimatedReturn: number
  investorShare: string
}

interface FarmAllocationMapProps {
  farms: FarmData[]
  onFarmSelect?: (farm: FarmData) => void
  satelliteImages?: { [farmId: string]: string }
  satelliteErrors?: { [farmId: string]: string }
  timeLabel?: string
  initialSelectedFarmId?: string
}

export default function FarmAllocationMap({ farms, onFarmSelect, satelliteImages, satelliteErrors, timeLabel, initialSelectedFarmId }: FarmAllocationMapProps) {
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null)
  const [showSatellite, setShowSatellite] = useState(true)
  const [showNDVI, setShowNDVI] = useState(false)
  const [showWeather, setShowWeather] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Compute map bounds from provided farm coordinates (with safe padding)
  const bounds = (() => {
    if (!farms || farms.length === 0) {
      // East Africa fallback viewport
      return { minLat: -5, maxLat: 5, minLng: 33, maxLng: 41 }
    }
    let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
    for (const f of farms) {
      minLat = Math.min(minLat, f.coordinates.lat)
      maxLat = Math.max(maxLat, f.coordinates.lat)
      minLng = Math.min(minLng, f.coordinates.lng)
      maxLng = Math.max(maxLng, f.coordinates.lng)
    }
    // Handle degenerate bounds (single farm or identical coords) by adding small padding
    if (minLat === maxLat) { minLat -= 0.05; maxLat += 0.05 }
    if (minLng === maxLng) { minLng -= 0.05; maxLng += 0.05 }
    // Add 10% padding around bounds
    const latPad = (maxLat - minLat) * 0.1
    const lngPad = (maxLng - minLng) * 0.1
    return { minLat: minLat - latPad, maxLat: maxLat + latPad, minLng: minLng - lngPad, maxLng: maxLng + lngPad }
  })()

  // Normalize lat/lng to percentages within the map container
  const toPosition = (lat: number, lng: number) => {
    const x = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)
    const y = 1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)
    // Clamp with padding so markers never sit on the edge
    const pad = 0.05
    const clampedX = Math.max(pad, Math.min(1 - pad, x))
    const clampedY = Math.max(pad, Math.min(1 - pad, y))
    return {
      left: `${(clampedX * 100).toFixed(2)}%`,
      top: `${(clampedY * 100).toFixed(2)}%`
    }
  }

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // If provided, auto-select the initial farm on mount/update
  useEffect(() => {
    if (initialSelectedFarmId && farms?.length) {
      const found = farms.find(f => f.id === initialSelectedFarmId)
      if (found) setSelectedFarm(found)
    }
  }, [initialSelectedFarmId, farms])

  const handleFarmClick = (farm: FarmData) => {
    setSelectedFarm(farm)
    onFarmSelect?.(farm)
  }

  const refreshFarmData = async (farmId: string) => {
    setIsLoading(true)
    try {
      // Simulate API call to refresh farm data
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to refresh farm data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getNDVIColor = (ndvi: number) => {
    if (ndvi >= 0.7) return 'text-green-500'
    if (ndvi >= 0.5) return 'text-yellow-500'
    if (ndvi >= 0.3) return 'text-orange-500'
    return 'text-red-500'
  }

  const getRiskColor = (risk: number) => {
    if (risk <= 30) return 'text-green-500'
    if (risk <= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getNDVIOverlayStyle = (ndvi: number) => {
    // Map NDVI to green intensity
    const clamped = Math.max(0, Math.min(1, ndvi))
    const alpha = 0.25 + clamped * 0.35 // 0.25 - 0.6
    return { backgroundColor: `rgba(16, 185, 129, ${alpha.toFixed(2)})` } // emerald-500 with variable alpha
  }

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div className="relative w-full h-96 bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-lg overflow-hidden border border-[#DF8012]/20">
        {/* Map Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DF8012' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Satellite Image Background (selected farm) */}
        {showSatellite && selectedFarm && satelliteImages?.[selectedFarm.id] && (
          <img 
            src={satelliteImages[selectedFarm.id]}
            alt="Satellite background"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
        )}
        {/* East Africa basemap when no selected farm imagery */}
        {showSatellite && (!selectedFarm || !satelliteImages?.[selectedFarm?.id || '']) && (
          <img
            src={`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/19/30`}
            alt="East Africa basemap"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}

        {/* NDVI Overlay */}
        {showNDVI && selectedFarm && (
          <div className="absolute inset-0 mix-blend-multiply" style={getNDVIOverlayStyle(selectedFarm.metrics.ndvi)} />
        )}

        {/* Simplified: no draggable pins; selection handled by parent */}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-[#DF8012]/30 text-white hover:bg-[#DF8012]/20"
            onClick={() => setShowSatellite(!showSatellite)}
          >
            {showSatellite ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-[#DF8012]/30 text-white hover:bg-[#DF8012]/20"
            onClick={() => setShowNDVI(!showNDVI)}
          >
            <Layers className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-black/50 border-[#DF8012]/30 text-white hover:bg-[#DF8012]/20"
            onClick={() => setShowWeather(!showWeather)}
          >
            <Thermometer className="w-4 h-4" />
          </Button>
        </div>

        {/* Time Period Label */}
        {timeLabel && (
          <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded border border-white/10">
            {timeLabel}
          </div>
        )}

        {/* Error Badge */}
        {selectedFarm && satelliteErrors?.[selectedFarm.id] && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white text-xs px-3 py-1 rounded border border-white/10">
            {satelliteErrors[selectedFarm.id]}
          </div>
        )}

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs p-2 rounded">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>High NDVI (≥0.7)</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medium NDVI (0.5-0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Low NDVI (&lt;0.5)</span>
          </div>
        </div>

        {/* Weather Heads-up Display */}
        {showWeather && selectedFarm && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-2 rounded border border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-[#DF8012]" />
                <span>{selectedFarm.metrics.temperature}°C</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-[#DF8012]" />
                <span>{selectedFarm.metrics.soil_moisture}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Farm Details Panel */}
      <AnimatePresence>
        {selectedFarm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <Card className="bg-white/5 border-[#DF8012]/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#DF8012]" />
                    {selectedFarm.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refreshFarmData(selectedFarm.id)}
                      disabled={isLoading}
                      className="border-[#DF8012]/30 text-[#DF8012] hover:bg-[#DF8012]/10"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Badge 
                      variant="outline" 
                      className={`${selectedFarm.realTimeData ? 'border-green-500 text-green-500' : 'border-gray-500 text-gray-500'}`}
                    >
                      {selectedFarm.realTimeData ? 'Live Data' : 'Static Data'}
                    </Badge>
                  </div>
                </div>
                <p className="text-white/70 text-sm">{selectedFarm.location}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Farm Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#DF8012]">{selectedFarm.acreage} ha</div>
                    <div className="text-xs text-white/60">Acreage</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{selectedFarm.crop}</div>
                    <div className="text-xs text-white/60">Crop</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getRiskColor(selectedFarm.riskScore)}`}>
                      {selectedFarm.riskScore}%
                    </div>
                    <div className="text-xs text-white/60">Risk Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      ${selectedFarm.estimatedReturn.toLocaleString()}
                    </div>
                    <div className="text-xs text-white/60">Est. Return</div>
                  </div>
                </div>

                {/* Real-time Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* NDVI */}
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="h-4 w-4 text-[#DF8012]" />
                      <span className="text-sm font-medium text-white">Vegetation Health</span>
                    </div>
                    <div className={`text-2xl font-bold ${getNDVIColor(selectedFarm.metrics.ndvi)}`}>
                      {selectedFarm.metrics.ndvi}
                    </div>
                    <div className="text-xs text-white/60">NDVI Index</div>
                  </div>

                  {/* Temperature */}
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-4 w-4 text-[#DF8012]" />
                      <span className="text-sm font-medium text-white">Temperature</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {selectedFarm.metrics.temperature}°C
                    </div>
                    <div className="text-xs text-white/60">Current</div>
                  </div>

                  {/* Soil Moisture */}
                  <div className="bg-black/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="h-4 w-4 text-[#DF8012]" />
                      <span className="text-sm font-medium text-white">Soil Moisture</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {selectedFarm.metrics.soil_moisture}%
                    </div>
                    <div className="text-xs text-white/60">Current</div>
                  </div>
                </div>

                {/* Preview removed per request: imagery rendered on map tile only */}

                {/* Certifications */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFarm.certifications.map((cert, index) => (
                      <Badge key={index} variant="outline" className="border-[#DF8012]/30 text-[#DF8012]">
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {new Date(selectedFarm.metrics.lastUpdated).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Farm Selection Summary */}
      {!selectedFarm && (
        <div className="mt-6 text-center text-white/60">
          <p>Click on a farm marker to view detailed metrics and real-time data</p>
        </div>
      )}
    </div>
  )
}
